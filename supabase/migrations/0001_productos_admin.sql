-- Don Teófilo Amoblamientos — admin de productos
-- Correr manualmente en el SQL Editor del proyecto de Supabase (organización ADLA).

-- Extensiones necesarias
create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- ---------- tabla productos ----------
create table public.productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  categoria text not null,
  material text,
  precio numeric,
  mostrar_precio boolean not null default true,
  descripcion text,
  medidas text,
  destacado boolean not null default false,
  publicado boolean not null default false,
  orden integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index productos_publicado_idx on public.productos (publicado);
create index productos_categoria_idx on public.productos (categoria);

-- ---------- tabla producto_imagenes ----------
create table public.producto_imagenes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  url text not null,
  storage_path text not null,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index producto_imagenes_producto_id_idx on public.producto_imagenes (producto_id);

-- ---------- updated_at automático ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger productos_set_updated_at
before update on public.productos
for each row execute function public.set_updated_at();

-- ---------- slug automático a partir del nombre ----------
create or replace function public.slugify(txt text)
returns text as $$
  select trim(both '-' from regexp_replace(lower(unaccent(txt)), '[^a-z0-9]+', '-', 'g'));
$$ language sql immutable;

create or replace function public.productos_set_slug()
returns trigger as $$
declare
  base_slug text;
  candidate text;
begin
  base_slug := public.slugify(new.nombre);
  if base_slug is null or base_slug = '' then
    base_slug := 'producto';
  end if;
  candidate := base_slug;
  if exists (select 1 from public.productos where slug = candidate) then
    candidate := base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end if;
  new.slug := candidate;
  return new;
end;
$$ language plpgsql;

create trigger productos_set_slug_trigger
before insert on public.productos
for each row execute function public.productos_set_slug();

-- ---------- RLS: productos ----------
alter table public.productos enable row level security;

-- lectura pública: solo productos publicados
create policy "productos_select_public"
on public.productos for select
to anon, authenticated
using (publicado = true);

-- lectura completa (incluye borradores) para el panel admin
create policy "productos_select_authenticated_all"
on public.productos for select
to authenticated
using (true);

create policy "productos_insert_authenticated"
on public.productos for insert
to authenticated
with check (true);

create policy "productos_update_authenticated"
on public.productos for update
to authenticated
using (true) with check (true);

create policy "productos_delete_authenticated"
on public.productos for delete
to authenticated
using (true);

-- ---------- RLS: producto_imagenes ----------
alter table public.producto_imagenes enable row level security;

-- lectura pública: solo imágenes de productos publicados
create policy "producto_imagenes_select_public"
on public.producto_imagenes for select
to anon, authenticated
using (
  exists (
    select 1 from public.productos p
    where p.id = producto_imagenes.producto_id and p.publicado = true
  )
);

create policy "producto_imagenes_select_authenticated_all"
on public.producto_imagenes for select
to authenticated
using (true);

create policy "producto_imagenes_insert_authenticated"
on public.producto_imagenes for insert
to authenticated
with check (true);

create policy "producto_imagenes_update_authenticated"
on public.producto_imagenes for update
to authenticated
using (true) with check (true);

create policy "producto_imagenes_delete_authenticated"
on public.producto_imagenes for delete
to authenticated
using (true);

-- ---------- Storage bucket ----------
insert into storage.buckets (id, name, public)
values ('productos-imagenes', 'productos-imagenes', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

create policy "productos_imagenes_bucket_read_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'productos-imagenes');

create policy "productos_imagenes_bucket_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'productos-imagenes');

create policy "productos_imagenes_bucket_update_authenticated"
on storage.objects for update
to authenticated
using (bucket_id = 'productos-imagenes') with check (bucket_id = 'productos-imagenes');

create policy "productos_imagenes_bucket_delete_authenticated"
on storage.objects for delete
to authenticated
using (bucket_id = 'productos-imagenes');
