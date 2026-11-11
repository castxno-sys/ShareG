-- Un productor no puede comprar sus propios productos; valida dirección y cantidades.
-- (Reemplaza la función crear_pedido de 002_funciones_y_triggers.sql)
create or replace function public.crear_pedido(p_items jsonb, p_direccion text, p_notas text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_pedido uuid; v_item jsonb; v_prod public.productos%rowtype;
  v_cant numeric; v_total numeric := 0;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'El carrito está vacío'; end if;
  if coalesce(trim(p_direccion), '') = '' then raise exception 'Escribe una dirección de entrega'; end if;

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

  update public.pedidos set total = v_total where id = v_pedido;
  return v_pedido;
end; $$;
revoke execute on function public.crear_pedido(jsonb,text,text) from public, anon;
grant execute on function public.crear_pedido(jsonb,text,text) to authenticated;
