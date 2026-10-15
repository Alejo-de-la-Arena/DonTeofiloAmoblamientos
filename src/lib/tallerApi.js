import { supabase } from './supabaseClient';

// Posts de "Del taller" (Home). Tabla public.taller_posts + bucket público `taller`.
// RLS: anon lee solo activo=true; authenticated hace todo.
const BUCKET = 'taller';
const MAX_HOME = 6;

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Filas viejas sin storage_path: la ruta se deriva de la URL pública
// (…/storage/v1/object/public/taller/<ruta>).
function storagePathOf(post) {
  if (post.storage_path) return post.storage_path;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = post.imagen_url?.indexOf(marker) ?? -1;
  return i >= 0 ? decodeURIComponent(post.imagen_url.slice(i + marker.length).split('?')[0]) : null;
}

const byOrden = (q) => q.order('orden', { ascending: true }).order('created_at', { ascending: false });

export async function fetchTallerPublico() {
  const { data, error } = await byOrden(
    supabase.from('taller_posts').select('id, imagen_url, alt, link_instagram, ancho, alto').eq('activo', true)
  ).limit(MAX_HOME);
  if (error) throw error;
  return data || [];
}

export async function fetchTallerAdmin() {
  const { data, error } = await byOrden(supabase.from('taller_posts').select('*'));
  if (error) throw error;
  return data || [];
}

// Sube la imagen y crea la fila. Si el insert falla, borra el archivo recién subido para no
// dejar huérfanos en el bucket.
export async function createTallerPost({ file, alt, link_instagram, orden, ancho, alto }) {
  const path = `${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadErr) throw uploadErr;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('taller_posts')
    .insert({ imagen_url: urlData.publicUrl, storage_path: path, alt, link_instagram: link_instagram || null, orden, ancho, alto })
    .select()
    .single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
  return data;
}

export async function updateTallerPost(id, fields) {
  const { error } = await supabase.from('taller_posts').update(fields).eq('id', id);
  if (error) throw error;
}

// Mismo orden que deleteProyecto: primero el archivo, después la fila.
export async function deleteTallerPost(post) {
  const path = storagePathOf(post);
  if (path) {
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove([path]);
    if (storageErr) throw storageErr;
  }
  const { error } = await supabase.from('taller_posts').delete().eq('id', post.id);
  if (error) throw error;
}
