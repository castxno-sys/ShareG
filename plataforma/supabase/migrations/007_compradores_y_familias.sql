-- =========================================================
-- 007 · Nuevos compradores, estadísticas públicas y registro de productores
-- =========================================================

-- El registro ahora también guarda vereda y qué produce (si es productor)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_rol public.rol_usuario := 'comprador';
begin
  if new.raw_user_meta_data->>'rol' = 'productor' then v_rol := 'productor'; end if;
  insert into public.perfiles (id, nombre, rol, telefono, vereda, descripcion)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), split_part(new.email, '@', 1)),
    v_rol,
    new.raw_user_meta_data->>'telefono',
    coalesce(nullif(trim(new.raw_user_meta_data->>'vereda'), ''), 'La Trinidad'),
    nullif(trim(new.raw_user_meta_data->>'descripcion'), '')
  );
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Lista de compradores para el panel del productor (más recientes primero).
-- No expone correo ni teléfono; solo cuenta las compras hechas a quien consulta.
create or replace function public.nuevos_compradores(p_limite int default 20)
returns table (
  id uuid, nombre text, vereda text, creado_en timestamptz,
  pedidos bigint, compras_conmigo bigint, total_conmigo numeric, ultima_compra timestamptz
) language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.perfiles where perfiles.id = auth.uid() and rol in ('productor', 'admin')) then
    raise exception 'Solo los productores pueden ver esta lista';
  end if;
  return query
    select pf.id, pf.nombre, pf.vereda, pf.creado_en,
      (select count(*) from public.pedidos p where p.comprador_id = pf.id and p.estado <> 'cancelado'),
      (select count(distinct i.pedido_id) from public.pedido_items i join public.pedidos p on p.id = i.pedido_id
         where p.comprador_id = pf.id and i.productor_id = auth.uid() and p.estado <> 'cancelado'),
      (select coalesce(sum(i.subtotal), 0) from public.pedido_items i join public.pedidos p on p.id = i.pedido_id
         where p.comprador_id = pf.id and i.productor_id = auth.uid() and p.estado <> 'cancelado'),
      (select max(p.creado_en) from public.pedidos p where p.comprador_id = pf.id and p.estado <> 'cancelado')
    from public.perfiles pf
    where pf.rol = 'comprador'
    order by pf.creado_en desc
    limit least(greatest(p_limite, 1), 100);
end; $$;

-- Cifras públicas para la portada (solo nombres cortos de los compradores recientes)
create or replace function public.estadisticas_publicas()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'compradores', (select count(*) from public.perfiles where rol = 'comprador'),
    'productores', (select count(*) from public.perfiles where rol = 'productor'),
    'productos',   (select count(*) from public.productos where activo),
    'recientes', coalesce((select json_agg(r) from (
        select split_part(initcap(trim(nombre)), ' ', 1)
               || coalesce(' ' || left(nullif(split_part(initcap(trim(nombre)), ' ', 2), ''), 1) || '.', '') as nombre,
               creado_en
        from public.perfiles where rol = 'comprador'
        order by creado_en desc limit 6) r), '[]'::json)
  );
$$;

revoke execute on function public.nuevos_compradores(int) from public, anon;
grant execute on function public.nuevos_compradores(int) to authenticated;
grant execute on function public.estadisticas_publicas() to anon, authenticated;

-- Categoría nueva
insert into public.categorias (nombre, slug, icono) values ('Huevos', 'huevos', '🥚')
on conflict (slug) do nothing;

-- Familias productoras y compradores de ejemplo: se cargaron directamente en el proyecto
-- (Familia Garzón Rincón, Rosa Pulido, Hermanos Rincón, Asociación Agroecológica San Francisco,
--  Familia Moreno; compradores Laura, Andrés, Valentina y Camilo). Contraseña: ShareG2026!
