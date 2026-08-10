-- Don Teófilo Amoblamientos — proyecto destacado de la Home
-- Correr manualmente en el SQL Editor del proyecto de Supabase (organización ADLA),
-- igual que 0001/0002.

alter table public.proyectos
  add column destacado_home boolean not null default false;

-- ---------- solo un proyecto destacado a la vez ----------
-- AFTER UPDATE/INSERT con WHEN (new.destacado_home = true): al marcar un proyecto,
-- desmarca cualquier otro que estuviera marcado. El WHEN evita loop infinito porque
-- las filas que este UPDATE desmarca quedan en false, no vuelven a cumplir la condición.
create or replace function public.proyectos_unset_other_destacado_home()
returns trigger as $$
begin
  update public.proyectos
  set destacado_home = false
  where id <> new.id and destacado_home = true;
  return new;
end;
$$ language plpgsql;

create trigger proyectos_destacado_home_trigger
after insert or update on public.proyectos
for each row
when (new.destacado_home = true)
execute function public.proyectos_unset_other_destacado_home();
