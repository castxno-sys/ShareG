-- ===== Perfil automático al registrarse =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_rol public.rol_usuario := 'comprador';
begin
  if new.raw_user_meta_data->>'rol' = 'productor' then v_rol := 'productor'; end if;
  insert into public.perfiles (id, nombre, rol, telefono)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)), v_rol,
          new.raw_user_meta_data->>'telefono');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ===== Nadie puede cambiarse el rol desde la app =====
create or replace function public.bloquear_cambio_rol()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.rol is distinct from old.rol and current_user = 'authenticated' then
    raise exception 'No puedes cambiar tu rol';
  end if;
  return new;
end; $$;
create trigger perfiles_bloquear_rol before update on public.perfiles
  for each row execute function public.bloquear_cambio_rol();

-- ===== Fecha de actualización automática =====
create or replace function public.tocar_actualizado()
returns trigger language plpgsql set search_path = '' as $$
begin new.actualizado_en = now(); return new; end; $$;

create trigger productos_actualizado
  before update on public.productos
  for each row execute function public.tocar_actualizado();

-- ===== ¿El usuario es productor de algún ítem del pedido? =====
create or replace function public.es_productor_de_pedido(p_pedido uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.pedido_items
                 where pedido_id = p_pedido and productor_id = auth.uid());
$$;

-- ===== Crear pedido (transacción: valida y descuenta stock) =====
create or replace function public.crear_pedido(p_items jsonb, p_direccion text, p_notas text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_pedido uuid; v_item jsonb; v_prod public.productos%rowtype;
  v_cant numeric; v_total numeric := 0;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'El carrito está vacío'; end if;

  insert into public.pedidos (comprador_id, direccion_entrega, notas)
  values (auth.uid(), p_direccion, p_notas) returning id into v_pedido;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_cant := (v_item->>'cantidad')::numeric;
    select * into v_prod from public.productos
      where id = (v_item->>'producto_id')::uuid and activo for update;
    if not found then raise exception 'Producto no disponible'; end if;
    if v_prod.stock < v_cant then raise exception 'Stock insuficiente para %', v_prod.nombre; end if;
    update public.productos set stock = stock - v_cant where id = v_prod.id;
    insert into public.pedido_items (pedido_id, producto_id, productor_id, nombre_producto, cantidad, precio_unitario)
    values (v_pedido, v_prod.id, v_prod.productor_id, v_prod.nombre, v_cant, v_prod.precio);
    v_total := v_total + v_cant * v_prod.precio;
  end loop;

  update public.pedidos set total = v_total where id = v_pedido;
  return v_pedido;
end; $$;

-- ===== Cambiar estado de un pedido =====
create or replace function public.actualizar_estado_pedido(p_pedido uuid, p_estado public.estado_pedido)
returns void language plpgsql security definer set search_path = '' as $$
declare v_ped public.pedidos%rowtype;
begin
  select * into v_ped from public.pedidos where id = p_pedido;
  if not found then raise exception 'Pedido no encontrado'; end if;
  if v_ped.comprador_id = auth.uid() then
    if p_estado <> 'cancelado' or v_ped.estado <> 'pendiente' then
      raise exception 'Solo puedes cancelar pedidos pendientes';
    end if;
    update public.productos p set stock = p.stock + i.cantidad
      from public.pedido_items i where i.pedido_id = p_pedido and i.producto_id = p.id;
  elsif not public.es_productor_de_pedido(p_pedido) then
    raise exception 'No autorizado';
  end if;
  update public.pedidos set estado = p_estado where id = p_pedido;
end; $$;

-- ===== Estadísticas del panel del productor =====
create or replace function public.resumen_productor()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'productos_activos', (select count(*) from public.productos where productor_id = auth.uid() and activo),
    'pedidos', (select count(distinct pedido_id) from public.pedido_items where productor_id = auth.uid()),
    'ventas', (select coalesce(sum(i.subtotal),0) from public.pedido_items i
                 join public.pedidos p on p.id = i.pedido_id
                 where i.productor_id = auth.uid() and p.estado <> 'cancelado'),
    'pendientes', (select count(distinct i.pedido_id) from public.pedido_items i
                 join public.pedidos p on p.id = i.pedido_id
                 where i.productor_id = auth.uid() and p.estado = 'pendiente')
  );
$$;

-- ===== Vista del catálogo (con calificación promedio) =====
create view public.catalogo with (security_invoker = true) as
select p.*, c.nombre as categoria, c.slug as categoria_slug, c.icono as categoria_icono,
       pf.nombre as productor_nombre, pf.vereda as productor_vereda,
       coalesce(round(avg(r.calificacion)::numeric,1),0) as calificacion,
       count(r.id) as num_resenas
from public.productos p
left join public.categorias c on c.id = p.categoria_id
join public.perfiles pf on pf.id = p.productor_id
left join public.resenas r on r.producto_id = p.id
where p.activo
group by p.id, c.id, pf.id;

-- ===== Permisos de las funciones =====
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.crear_pedido(jsonb,text,text) from public, anon;
revoke execute on function public.actualizar_estado_pedido(uuid,public.estado_pedido) from public, anon;
revoke execute on function public.resumen_productor() from public, anon;
revoke execute on function public.es_productor_de_pedido(uuid) from public, anon;
grant execute on function public.crear_pedido(jsonb,text,text) to authenticated;
grant execute on function public.actualizar_estado_pedido(uuid,public.estado_pedido) to authenticated;
grant execute on function public.resumen_productor() to authenticated;
grant execute on function public.es_productor_de_pedido(uuid) to authenticated;
