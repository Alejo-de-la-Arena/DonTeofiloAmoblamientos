-- Don Teófilo Amoblamientos — una sola imagen por producto
-- Correr manualmente en el SQL Editor del proyecto de Supabase (organización ADLA),
-- igual que las migraciones anteriores.

alter table public.productos
  add column imagen text,
  add column imagen_storage_path text;

-- Backfill: cada producto toma la imagen de menor `orden` (la portada actual en la
-- grilla/card) de su galería en producto_imagenes.
update public.productos p
set imagen = pi.url,
    imagen_storage_path = pi.storage_path
from (
  select distinct on (producto_id) producto_id, url, storage_path
  from public.producto_imagenes
  order by producto_id, orden asc
) pi
where pi.producto_id = p.id;

-- NOTA: a propósito esta migración NO borra producto_imagenes ni sus archivos de Storage.
-- Los productos que tenían más de una imagen cargada quedan con las imágenes sobrantes
-- todavía en la tabla/Storage, simplemente ya no se usan ni se muestran. Antes de
-- eliminarlas (tabla y archivos), confirmar con el cliente — recién ahí correr algo como:
--
--   -- 1) Storage: borrar los storage_path de producto_imagenes que NO sean la portada
--   --    (ver columna imagen_storage_path de productos) desde el dashboard o vía API.
--   -- 2) DB:
--   drop table public.producto_imagenes;
