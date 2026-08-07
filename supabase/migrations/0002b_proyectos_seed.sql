-- Don Teófilo Amoblamientos — seed de proyectos existentes (migración desde src/data/mockProjects.js)
-- Correr manualmente en el SQL Editor DESPUÉS de 0002_proyectos_admin.sql.
-- Las imágenes siguen siendo los placeholders de picsum.photos que ya se usaban en el
-- frontend (no hay archivos reales para subir a Storage todavía) — por eso
-- imagen_antes_storage_path / imagen_despues_storage_path quedan en null: al día de hoy
-- no son objetos de nuestro bucket, así que no hay nada que borrar de Storage si se
-- reemplazan más adelante desde el admin.
--
-- El slug no se especifica: el trigger proyectos_set_slug_trigger lo autogenera desde
-- el título (ver 0002_proyectos_admin.sql).

-- 01 · Cocina Integral — Nordelta
with ins as (
  insert into public.proyectos
    (titulo, categoria, descripcion, imagen_antes, imagen_despues, orden, publicado)
  values (
    'Cocina Integral — Nordelta',
    'Cocinas',
    'Renovación completa de una cocina abierta al living. Reemplazamos los muebles existentes por un sistema de bajo y sobre mesada en roble claro, sumamos una isla con desayunador y una torre de columnas para horno y microondas.',
    'https://picsum.photos/seed/nordelta-antes/900/700',
    'https://picsum.photos/seed/nordelta-despues/900/700',
    1,
    true
  )
  returning id
)
insert into public.proyecto_detalles (proyecto_id, label, valor, orden)
select id, 'Duración', '5 semanas', 0 from ins
union all select id, 'Ubicación', 'Nordelta, BsAs', 1 from ins
union all select id, 'Materiales', 'Roble + cuarzo', 2 from ins;

-- 02 · Vestidor Principal — Tandil
with ins as (
  insert into public.proyectos
    (titulo, categoria, descripcion, imagen_antes, imagen_despues, orden, publicado)
  values (
    'Vestidor Principal — Tandil',
    'Placards',
    'Un vestidor walk-in diseñado al centímetro para un dormitorio en suite. Módulos abiertos y cerrados, isla central con cajonera de vidrio y una tira LED perimetral que ilumina cada estante.',
    'https://picsum.photos/seed/tandil-antes/900/700',
    'https://picsum.photos/seed/tandil-despues/900/700',
    2,
    true
  )
  returning id
)
insert into public.proyecto_detalles (proyecto_id, label, valor, orden)
select id, 'Duración', '4 semanas', 0 from ins
union all select id, 'Ubicación', 'Tandil', 1 from ins
union all select id, 'Materiales', 'Fresno + LED', 2 from ins;

-- 03 · Reforma Integral — Palermo
with ins as (
  insert into public.proyectos
    (titulo, categoria, descripcion, imagen_antes, imagen_despues, orden, publicado)
  values (
    'Reforma Integral — Palermo',
    'Diseño integral',
    'Proyecto llave en mano de un monoambiente: cocina lineal, placard corredizo, mueble de TV a medida y una biblioteca que separa el área de descanso. Todo pensado como un sistema coherente.',
    'https://picsum.photos/seed/palermo-antes/900/700',
    'https://picsum.photos/seed/palermo-despues/900/700',
    3,
    true
  )
  returning id
)
insert into public.proyecto_detalles (proyecto_id, label, valor, orden)
select id, 'Duración', '7 semanas', 0 from ins
union all select id, 'Ubicación', 'Palermo, CABA', 1 from ins
union all select id, 'Materiales', 'Melamina mixta', 2 from ins;

-- 04 · Baño Suite — San Isidro
with ins as (
  insert into public.proyectos
    (titulo, categoria, descripcion, imagen_antes, imagen_despues, orden, publicado)
  values (
    'Baño Suite — San Isidro',
    'Vanitorys',
    'Vanitory doble suspendido con mesada de cuarzo y frentes laqueados en tono arena. Sumamos un mueble columna espejado y estantería flotante de madera maciza para toallas.',
    'https://picsum.photos/seed/sanisidro-antes/900/700',
    'https://picsum.photos/seed/sanisidro-despues/900/700',
    4,
    true
  )
  returning id
)
insert into public.proyecto_detalles (proyecto_id, label, valor, orden)
select id, 'Duración', '3 semanas', 0 from ins
union all select id, 'Ubicación', 'San Isidro', 1 from ins
union all select id, 'Materiales', 'Laca + cuarzo', 2 from ins;

-- 05 · Cocina Office — Recoleta
with ins as (
  insert into public.proyectos
    (titulo, categoria, descripcion, imagen_antes, imagen_despues, orden, publicado)
  values (
    'Cocina Office — Recoleta',
    'Cocinas',
    'Cocina cerrada con office integrado. Aprovechamos toda la altura con alacenas hasta el techo y resolvimos un rincón difícil con una alacena esquinera de bandejas giratorias.',
    'https://picsum.photos/seed/recoleta-antes/900/700',
    'https://picsum.photos/seed/recoleta-despues/900/700',
    5,
    true
  )
  returning id
)
insert into public.proyecto_detalles (proyecto_id, label, valor, orden)
select id, 'Duración', '5 semanas', 0 from ins
union all select id, 'Ubicación', 'Recoleta, CABA', 1 from ins
union all select id, 'Materiales', 'Melamina grafito', 2 from ins;

-- 06 · Aberturas de Autor — Tigre
with ins as (
  insert into public.proyectos
    (titulo, categoria, descripcion, imagen_antes, imagen_despues, orden, publicado)
  values (
    'Aberturas de Autor — Tigre',
    'Aberturas',
    'Casa de fin de semana con carpintería completa en madera maciza: ventanales, puertas de acceso y postigones. Cada abertura se diseñó para maximizar la vista al río con la mejor aislación.',
    'https://picsum.photos/seed/tigre-antes/900/700',
    'https://picsum.photos/seed/tigre-despues/900/700',
    6,
    true
  )
  returning id
)
insert into public.proyecto_detalles (proyecto_id, label, valor, orden)
select id, 'Duración', '8 semanas', 0 from ins
union all select id, 'Ubicación', 'Tigre, BsAs', 1 from ins
union all select id, 'Materiales', 'Cedro macizo', 2 from ins;
