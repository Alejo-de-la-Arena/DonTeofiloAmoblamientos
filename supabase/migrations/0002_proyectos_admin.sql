-- Don Teófilo Amoblamientos — admin de proyectos
-- Correr manualmente en el SQL Editor del proyecto de Supabase (organización ADLA),
-- igual que 0001_productos_admin.sql.
--
-- NOTA: a diferencia de 0001, acá NO se incluye
--   alter table storage.objects enable row level security;
-- porque ya está habilitado en el proyecto y el rol del SQL Editor no es owner
-- (produce error 42501). Las policies de bucket funcionan sin esa línea.

-- Extensiones (ya deberían existir por 0001, repetir es inofensivo)
create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- ---------- tabla proyectos ----------
create table public.proyectos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  categoria text not null,
  descripcion text,
  resumen text,
  imagen_antes text,
  imagen_antes_storage_path text,
  imagen_despues text,
  imagen_despues_storage_path text,
  orden integer,
  publicado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index proyectos_publicado_idx on public.proyectos (publicado);
create index proyectos_categoria_idx on public.proyectos (categoria);

-- ---------- tabla proyecto_imagenes (galería del proyecto terminado) ----------
create table public.proyecto_imagenes (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  url text not null,
  storage_path text not null,
  alt text,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index proyecto_imagenes_proyecto_id_idx on public.proyecto_imagenes (proyecto_id);

-- ---------- tabla proyecto_detalles (campos extensibles: duración, ubicación, materiales, ...) ----------
create table public.proyecto_detalles (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references public.proyectos(id) on delete cascade,
  label text not null,
  valor text,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

create index proyecto_detalles_proyecto_id_idx on public.proyecto_detalles (proyecto_id);

-- ---------- updated_at automático (reusa la función ya creada en 0001) ----------
create trigger proyectos_set_updated_at
before update on public.proyectos
for each row execute function public.set_updated_at();

-- ---------- slug: respeta el valor provisto por el admin, autogenera si viene vacío ----------
-- A diferencia de productos_set_slug (que siempre sobreescribe), acá el form de admin
-- expone el slug como campo editable — así que el trigger solo normaliza/resuelve
-- colisiones, no impone el título como única fuente.
create or replace function public.proyectos_set_slug()
returns trigger as $$
declare
  base_slug text;
  candidate text;
begin
  if new.slug is not null and trim(new.slug) <> '' then
    base_slug := public.slugify(new.slug);
  else
    base_slug := public.slugify(new.titulo);
  end if;

  if base_slug is null or base_slug = '' then
    base_slug := 'proyecto';
  end if;

  candidate := base_slug;
  if exists (select 1 from public.proyectos where slug = candidate and id <> new.id) then
    candidate := base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end if;

  new.slug := candidate;
  return new;
end;
$$ language plpgsql;

create trigger proyectos_set_slug_trigger
before insert or update on public.proyectos
for each row execute function public.proyectos_set_slug();

-- ---------- RLS: proyectos ----------
alter table public.proyectos enable row level security;

create policy "proyectos_select_public"
on public.proyectos for select
to anon, authenticated
using (publicado = true);

create policy "proyectos_select_authenticated_all"
on public.proyectos for select
to authenticated
using (true);

create policy "proyectos_insert_authenticated"
on public.proyectos for insert
to authenticated
with check (true);

create policy "proyectos_update_authenticated"
on public.proyectos for update
to authenticated
using (true) with check (true);

create policy "proyectos_delete_authenticated"
on public.proyectos for delete
to authenticated
using (true);

-- ---------- RLS: proyecto_imagenes ----------
alter table public.proyecto_imagenes enable row level security;

create policy "proyecto_imagenes_select_public"
on public.proyecto_imagenes for select
to anon, authenticated
using (
  exists (
    select 1 from public.proyectos p
    where p.id = proyecto_imagenes.proyecto_id and p.publicado = true
  )
);

create policy "proyecto_imagenes_select_authenticated_all"
on public.proyecto_imagenes for select
to authenticated
using (true);

create policy "proyecto_imagenes_insert_authenticated"
on public.proyecto_imagenes for insert
to authenticated
with check (true);

create policy "proyecto_imagenes_update_authenticated"
on public.proyecto_imagenes for update
to authenticated
using (true) with check (true);

create policy "proyecto_imagenes_delete_authenticated"
on public.proyecto_imagenes for delete
to authenticated
using (true);

-- ---------- RLS: proyecto_detalles ----------
alter table public.proyecto_detalles enable row level security;

create policy "proyecto_detalles_select_public"
on public.proyecto_detalles for select
to anon, authenticated
using (
  exists (
    select 1 from public.proyectos p
    where p.id = proyecto_detalles.proyecto_id and p.publicado = true
  )
);

create policy "proyecto_detalles_select_authenticated_all"
on public.proyecto_detalles for select
to authenticated
using (true);

create policy "proyecto_detalles_insert_authenticated"
on public.proyecto_detalles for insert
to authenticated
with check (true);

create policy "proyecto_detalles_update_authenticated"
on public.proyecto_detalles for update
to authenticated
using (true) with check (true);

create policy "proyecto_detalles_delete_authenticated"
on public.proyecto_detalles for delete
to authenticated
using (true);

-- ---------- Storage bucket ----------
insert into storage.buckets (id, name, public)
values ('proyectos-imagenes', 'proyectos-imagenes', true)
on conflict (id) do nothing;

create policy "proyectos_imagenes_bucket_read_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'proyectos-imagenes');

create policy "proyectos_imagenes_bucket_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'proyectos-imagenes');

create policy "proyectos_imagenes_bucket_update_authenticated"
on storage.objects for update
to authenticated
using (bucket_id = 'proyectos-imagenes') with check (bucket_id = 'proyectos-imagenes');

create policy "proyectos_imagenes_bucket_delete_authenticated"
on storage.objects for delete
to authenticated
using (bucket_id = 'proyectos-imagenes');
