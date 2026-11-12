-- =========================================================
-- Billetera de prueba (sin dinero real)
--  · recarga  (+)  el comprador agrega saldo
--  · pago     (−)  al crear un pedido
--  · reembolso(+)  si el pedido se cancela
--  · cobro    (+)  el productor recibe lo suyo cuando el pedido se entrega
-- Saldo = suma de los movimientos del usuario.
-- =========================================================
create type public.tipo_movimiento as enum ('recarga', 'pago', 'reembolso', 'cobro');

create table public.movimientos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles(id) on delete cascade,
  tipo public.tipo_movimiento not null,
  monto numeric(12,2) not null check (monto <> 0),
  pedido_id uuid references public.pedidos(id) on delete set null,
  metodo text check (metodo in ('Nequi', 'PSE', 'Tarjeta', 'Daviplata')),
  descripcion text,
  creado_en timestamptz not null default now()
);
create index movimientos_usuario_idx on public.movimientos(usuario_id, creado_en desc);
create index movimientos_pedido_idx on public.movimientos(pedido_id);

alter table public.movimientos enable row level security;
create policy "ver mis movimientos" on public.movimientos for select to authenticated
  using ((select auth.uid()) = usuario_id);
-- Sin políticas de insert/update: los movimientos solo los crean las funciones de abajo.

create or replace function public.saldo_de(p_usuario uuid)
returns numeric language sql stable security definer set search_path = '' as $$
  select coalesce(sum(monto), 0) from public.movimientos where usuario_id = p_usuario;
$$;

create or replace function public.pesos_txt(n numeric)
returns text language sql immutable set search_path = '' as $$
  select '$' || replace(to_char(n, 'FM999,999,999'), ',', '.');
$$;

create or replace function public.recargar_saldo(p_monto numeric, p_metodo text)
returns numeric language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if p_monto is null or p_monto < 1000 or p_monto > 2000000 then
    raise exception 'La recarga debe estar entre $1.000 y $2.000.000';
  end if;
  insert into public.movimientos (usuario_id, tipo, monto, metodo, descripcion)
  values (auth.uid(), 'recarga', round(p_monto), p_metodo, 'Recarga con ' || p_metodo);
  return public.saldo_de(auth.uid());
end; $$;

create or replace function public.resumen_billetera()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'saldo',     coalesce(sum(monto), 0),
    'recargado', coalesce(sum(monto) filter (where tipo = 'recarga'), 0),
    'gastado',   coalesce(-sum(monto) filter (where tipo in ('pago', 'reembolso')), 0),
    'recaudado', coalesce(sum(monto) filter (where tipo = 'cobro'), 0),
    'movimientos', count(*)
  ) from public.movimientos where usuario_id = auth.uid();
$$;

create or replace function public.crear_pedido(p_items jsonb, p_direccion text, p_notas text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_pedido uuid; v_item jsonb; v_prod public.productos%rowtype;
  v_cant numeric; v_total numeric := 0; v_saldo numeric;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'El carrito está vacío'; end if;
  if coalesce(trim(p_direccion), '') = '' then raise exception 'Escribe una dirección de entrega'; end if;

  -- Un pago a la vez por usuario: evita gastar el mismo saldo dos veces
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));

  insert into public.pedidos (comprador_id, direccion_entrega, notas)
  values (auth.uid(), p_direccion, p_notas) returning id into v_pedido;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cant := (v_item->>'cantidad')::numeric;
    if v_cant is null or v_cant <= 0 then raise exception 'Cantidad inválida'; end if;
    select * into v_prod from public.productos
      where id = (v_item->>'producto_id')::uuid and activo for update;
    if not found then raise exception 'Un producto ya no está disponible'; end if;
    if v_prod.productor_id = auth.uid() then
      raise exception 'No puedes comprar tus propios productos (%)', v_prod.nombre;
    end if;
    if v_prod.stock < v_cant then raise exception 'Solo quedan % de %', v_prod.stock, v_prod.nombre; end if;
    update public.productos set stock = stock - v_cant where id = v_prod.id;
    insert into public.pedido_items (pedido_id, producto_id, productor_id, nombre_producto, cantidad, precio_unitario)
    values (v_pedido, v_prod.id, v_prod.productor_id, v_prod.nombre, v_cant, v_prod.precio);
    v_total := v_total + v_cant * v_prod.precio;
  end loop;

  v_saldo := public.saldo_de(auth.uid());
  if v_saldo < v_total then
    raise exception 'Saldo insuficiente: tienes % y el pedido cuesta %. Recarga tu billetera.',
      public.pesos_txt(v_saldo), public.pesos_txt(v_total);
  end if;

  update public.pedidos set total = v_total where id = v_pedido;
  insert into public.movimientos (usuario_id, tipo, monto, pedido_id, descripcion)
  values (auth.uid(), 'pago', -v_total, v_pedido, 'Pago del pedido');
  return v_pedido;
end; $$;

create or replace function public.actualizar_estado_pedido(p_pedido uuid, p_estado public.estado_pedido)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_ped public.pedidos%rowtype;
  v_siguiente public.estado_pedido;
begin
  select * into v_ped from public.pedidos where id = p_pedido for update;
  if not found then raise exception 'Pedido no encontrado'; end if;
  if v_ped.estado in ('entregado', 'cancelado') then raise exception 'Este pedido ya está cerrado'; end if;

  if v_ped.comprador_id = auth.uid() then
    if p_estado <> 'cancelado' or v_ped.estado <> 'pendiente' then
      raise exception 'Solo puedes cancelar pedidos pendientes';
    end if;
  elsif public.es_productor_de_pedido(p_pedido) then
    v_siguiente := case v_ped.estado when 'pendiente' then 'confirmado'
                                     when 'confirmado' then 'enviado'
                                     when 'enviado' then 'entregado' end;
    if p_estado <> 'cancelado' and p_estado is distinct from v_siguiente then
      raise exception 'El pedido debe pasar de % a %', v_ped.estado, v_siguiente;
    end if;
  else
    raise exception 'No autorizado';
  end if;

  if p_estado = 'cancelado' then
    update public.productos p set stock = p.stock + i.cantidad
      from public.pedido_items i where i.pedido_id = p_pedido and i.producto_id = p.id;
    insert into public.movimientos (usuario_id, tipo, monto, pedido_id, descripcion)
      select v_ped.comprador_id, 'reembolso', -sum(m.monto), p_pedido, 'Reembolso por pedido cancelado'
      from public.movimientos m where m.pedido_id = p_pedido and m.tipo = 'pago'
      having sum(m.monto) < 0;
  elsif p_estado = 'entregado' then
    insert into public.movimientos (usuario_id, tipo, monto, pedido_id, descripcion)
      select i.productor_id, 'cobro', sum(i.subtotal), p_pedido, 'Venta entregada'
      from public.pedido_items i where i.pedido_id = p_pedido
      group by i.productor_id;
  end if;

  update public.pedidos set estado = p_estado where id = p_pedido;
end; $$;

create or replace function public.resumen_productor()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'productos_activos', (select count(*) from public.productos where productor_id = auth.uid() and activo),
    'pedidos', (select count(distinct pedido_id) from public.pedido_items where productor_id = auth.uid()),
    'ventas', (select coalesce(sum(i.subtotal), 0) from public.pedido_items i
                 join public.pedidos p on p.id = i.pedido_id
                 where i.productor_id = auth.uid() and p.estado <> 'cancelado'),
    'recaudado', (select coalesce(sum(monto), 0) from public.movimientos
                 where usuario_id = auth.uid() and tipo = 'cobro'),
    'por_cobrar', (select coalesce(sum(i.subtotal), 0) from public.pedido_items i
                 join public.pedidos p on p.id = i.pedido_id
                 where i.productor_id = auth.uid() and p.estado in ('pendiente', 'confirmado', 'enviado')),
    'pendientes', (select count(distinct i.pedido_id) from public.pedido_items i
                 join public.pedidos p on p.id = i.pedido_id
                 where i.productor_id = auth.uid() and p.estado = 'pendiente')
  );
$$;

revoke execute on function public.saldo_de(uuid) from public, anon, authenticated;
revoke execute on function public.recargar_saldo(numeric, text) from public, anon;
revoke execute on function public.resumen_billetera() from public, anon;
revoke execute on function public.crear_pedido(jsonb, text, text) from public, anon;
revoke execute on function public.actualizar_estado_pedido(uuid, public.estado_pedido) from public, anon;
revoke execute on function public.resumen_productor() from public, anon;
grant execute on function public.recargar_saldo(numeric, text) to authenticated;
grant execute on function public.resumen_billetera() to authenticated;
grant execute on function public.crear_pedido(jsonb, text, text) to authenticated;
grant execute on function public.actualizar_estado_pedido(uuid, public.estado_pedido) to authenticated;
grant execute on function public.resumen_productor() to authenticated;
revoke execute on function public.pesos_txt(numeric) from public, anon;
