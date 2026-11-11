-- ===== Row Level Security =====
alter table public.perfiles enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.resenas enable row level security;

create policy "perfiles visibles" on public.perfiles for select using (true);
create policy "editar mi perfil" on public.perfiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "categorias visibles" on public.categorias for select using (true);

create policy "productos visibles" on public.productos for select
  using (activo or (select auth.uid()) = productor_id);
create policy "productor crea" on public.productos for insert to authenticated
  with check ((select auth.uid()) = productor_id
    and exists (select 1 from public.perfiles where id = (select auth.uid()) and rol in ('productor','admin')));
create policy "productor edita" on public.productos for update to authenticated
  using ((select auth.uid()) = productor_id) with check ((select auth.uid()) = productor_id);
create policy "productor elimina" on public.productos for delete to authenticated
  using ((select auth.uid()) = productor_id);

create policy "ver mis pedidos" on public.pedidos for select to authenticated
  using ((select auth.uid()) = comprador_id or public.es_productor_de_pedido(id));

create policy "ver items" on public.pedido_items for select to authenticated
  using ((select auth.uid()) = productor_id
    or exists (select 1 from public.pedidos p where p.id = pedido_id and p.comprador_id = (select auth.uid())));

create policy "resenas visibles" on public.resenas for select using (true);
create policy "crear resena" on public.resenas for insert to authenticated
  with check ((select auth.uid()) = autor_id);
create policy "borrar mi resena" on public.resenas for delete to authenticated
  using ((select auth.uid()) = autor_id);

-- ===== Storage: bucket público de imágenes =====
insert into storage.buckets (id, name, public) values ('productos','productos', true)
on conflict (id) do nothing;
create policy "subir imagenes propias" on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "borrar imagenes propias" on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and (storage.foldername(name))[1] = (select auth.uid())::text);
