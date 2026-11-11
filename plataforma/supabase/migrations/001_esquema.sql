-- =========================================================
-- share.G · Esquema PostgreSQL (Supabase)
-- Ya está aplicado en el proyecto "shareg". Este archivo es
-- la copia de referencia por si necesitas recrear la base.
-- =========================================================
create type public.rol_usuario as enum ('productor','comprador','admin');
create type public.estado_pedido as enum ('pendiente','confirmado','enviado','entregado','cancelado');

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  rol public.rol_usuario not null default 'comprador',
  telefono text,
  vereda text default 'La Trinidad',
  sector text default 'San Francisco',
  descripcion text,
  avatar_url text,
  creado_en timestamptz not null default now()
);

create table public.categorias (
  id smallint generated always as identity primary key,
  nombre text not null unique,
  slug text not null unique,
  icono text not null default '🌱'
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  productor_id uuid not null references public.perfiles(id) on delete cascade,
  categoria_id smallint references public.categorias(id) on delete set null,
  nombre text not null check (char_length(nombre) between 2 and 80),
  descripcion text,
  precio numeric(12,2) not null check (precio >= 0),
  unidad text not null default 'kg',
  stock numeric(12,2) not null default 0 check (stock >= 0),
  imagen_url text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index productos_productor_idx on public.productos(productor_id);
create index productos_categoria_idx on public.productos(categoria_id);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  comprador_id uuid not null references public.perfiles(id) on delete cascade,
  estado public.estado_pedido not null default 'pendiente',
  total numeric(12,2) not null default 0,
  direccion_entrega text not null,
  notas text,
  creado_en timestamptz not null default now()
);
create index pedidos_comprador_idx on public.pedidos(comprador_id);

create table public.pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  productor_id uuid not null references public.perfiles(id) on delete cascade,
  nombre_producto text not null,
  cantidad numeric(12,2) not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null,
  subtotal numeric(12,2) generated always as (cantidad * precio_unitario) stored
);
create index pedido_items_pedido_idx on public.pedido_items(pedido_id);
create index pedido_items_productor_idx on public.pedido_items(productor_id);
create index pedido_items_producto_idx on public.pedido_items(producto_id);

create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  autor_id uuid not null references public.perfiles(id) on delete cascade,
  calificacion smallint not null check (calificacion between 1 and 5),
  comentario text,
  creado_en timestamptz not null default now(),
  unique (producto_id, autor_id)
);
create index resenas_autor_idx on public.resenas(autor_id);
