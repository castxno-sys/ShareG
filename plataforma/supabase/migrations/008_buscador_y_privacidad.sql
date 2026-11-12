-- =========================================================
-- 008 · Buscador de vendedores y compradores + privacidad del teléfono
-- =========================================================
create extension if not exists unaccent with schema extensions;

-- Texto en minúsculas y sin tildes, para que "andres" encuentre "Andrés"
create or replace function public.normalizar(t text)
returns text language sql immutable parallel safe set search_path = '' as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(t, '')));
$$;

-- ----- Privacidad: el teléfono deja de ser público -----
revoke select on public.perfiles from anon, authenticated;
grant select (id, nombre, rol, vereda, sector, descripcion, avatar_url, creado_en)
  on public.perfiles to anon, authenticated;

-- Mi propio perfil completo (incluye teléfono)
create or replace function public.mi_perfil()
returns setof public.perfiles language sql stable security definer set search_path = '' as $$
  select * from public.perfiles where id = auth.uid();
$$;

-- Teléfonos de quienes le han hecho pedidos al productor que consulta (para coordinar la entrega)
create or replace function public.contactos_de_mis_pedidos()
returns table (comprador_id uuid, telefono text)
language sql stable security definer set search_path = '' as $$
  select distinct p.comprador_id, pf.telefono
  from public.pedido_items i
  join public.pedidos p on p.id = i.pedido_id
  join public.perfiles pf on pf.id = p.comprador_id
  where i.productor_id = auth.uid();
$$;

-- ----- Buscador de vendedores (público) -----
-- Busca en nombre, vereda, descripción y en los nombres de sus productos activos.
create or replace function public.buscar_productores(p_texto text default '', p_vereda text default null)
returns table (
  id uuid, nombre text, vereda text, descripcion text, creado_en timestamptz,
  productos_activos bigint, categorias text[], calificacion numeric, productos_coinciden text[]
) language sql stable set search_path = '' as $$
  with q as (select replace(replace(public.normalizar(trim(coalesce(p_texto, ''))), '%', ''), '_', '') as t)
  select pf.id, pf.nombre, pf.vereda, pf.descripcion, pf.creado_en,
    count(distinct p.id) as productos_activos,
    coalesce(array_agg(distinct c.icono || ' ' || c.nombre) filter (where c.id is not null), '{}') as categorias,
    coalesce(round(avg(r.calificacion)::numeric, 1), 0) as calificacion,
    coalesce(array_agg(distinct p.nombre) filter (where q.t <> '' and public.normalizar(p.nombre) like '%' || q.t || '%'), '{}') as productos_coinciden
  from public.perfiles pf
  cross join q
  left join public.productos p on p.productor_id = pf.id and p.activo
  left join public.categorias c on c.id = p.categoria_id
  left join public.resenas r on r.producto_id = p.id
  where pf.rol = 'productor'
    and (p_vereda is null or pf.vereda = p_vereda)
    and (q.t = ''
      or public.normalizar(pf.nombre) like '%' || q.t || '%'
      or public.normalizar(pf.vereda) like '%' || q.t || '%'
      or public.normalizar(pf.descripcion) like '%' || q.t || '%'
      or exists (select 1 from public.productos p2
                 where p2.productor_id = pf.id and p2.activo and public.normalizar(p2.nombre) like '%' || q.t || '%'))
  group by pf.id, q.t
  order by (q.t <> '' and public.normalizar(pf.nombre) like q.t || '%') desc, count(distinct p.id) desc, pf.nombre;
$$;

-- ----- Buscador de compradores (solo productores) -----
drop function if exists public.nuevos_compradores(int);
create or replace function public.nuevos_compradores(p_limite int default 20, p_texto text default null)
returns table (
  id uuid, nombre text, vereda text, creado_en timestamptz,
  pedidos bigint, compras_conmigo bigint, total_conmigo numeric, ultima_compra timestamptz
) language plpgsql stable security definer set search_path = '' as $$
declare v_t text := replace(replace(public.normalizar(trim(coalesce(p_texto, ''))), '%', ''), '_', '');
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
      and (v_t = '' or public.normalizar(pf.nombre) like '%' || v_t || '%' or public.normalizar(pf.vereda) like '%' || v_t || '%')
    order by pf.creado_en desc
    limit least(greatest(p_limite, 1), 100);
end; $$;

revoke execute on function public.mi_perfil() from public, anon;
revoke execute on function public.contactos_de_mis_pedidos() from public, anon;
revoke execute on function public.nuevos_compradores(int, text) from public, anon;
grant execute on function public.mi_perfil() to authenticated;
grant execute on function public.contactos_de_mis_pedidos() to authenticated;
grant execute on function public.nuevos_compradores(int, text) to authenticated;
grant execute on function public.buscar_productores(text, text) to anon, authenticated;
grant execute on function public.normalizar(text) to anon, authenticated;
