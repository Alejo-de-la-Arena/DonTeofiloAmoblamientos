import { supabase } from './supabaseClient';

const BUCKET = 'proyectos-imagenes';

function withOrdenFallback(rows) {
  const withOrden = rows.filter((r) => r.orden != null).sort((a, b) => a.orden - b.orden);
  const withoutOrden = rows
    .filter((r) => r.orden == null)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return [...withOrden, ...withoutOrden];
}

function mapDetalle(row) {
  const galeria = (row.proyecto_imagenes || []).slice().sort((a, b) => a.orden - b.orden);
  const detalles = (row.proyecto_detalles || []).slice().sort((a, b) => a.orden - b.orden);
  return { ...row, galeria, detalles };
}

export async function fetchProyectosPublicos() {
  const { data, error } = await supabase.from('proyectos').select('*').eq('publicado', true);
  if (error) throw error;
  return withOrdenFallback(data || []);
}

export async function fetchProyectosAdmin() {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProyectoById(id) {
  const { data, error } = await supabase
    .from('proyectos')
    .select(
      '*, proyecto_imagenes(id, url, storage_path, alt, orden), proyecto_detalles(id, label, valor, orden)'
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapDetalle(data);
}

// Usado por la subpágina pública /proyectos/:slug. Devuelve null (no lanza) cuando el
// slug no existe o el proyecto no está publicado, para que la página renderice su propio
// estado "no encontrado" en vez de tratarlo como un error de red.
export async function fetchProyectoPorSlug(slug) {
  const { data, error } = await supabase
    .from('proyectos')
    .select(
      '*, proyecto_imagenes(id, url, storage_path, alt, orden), proyecto_detalles(id, label, valor, orden)'
    )
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapDetalle(data) : null;
}

export async function createProyecto(fields) {
  const { data, error } = await supabase.from('proyectos').insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateProyecto(id, fields) {
  const { data, error } = await supabase
    .from('proyectos')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function togglePublicado(id, publicado) {
  const { error } = await supabase.from('proyectos').update({ publicado }).eq('id', id);
  if (error) throw error;
}

export async function deleteProyecto(id) {
  const { data: imagenes, error: fetchErr } = await supabase
    .from('proyecto_imagenes')
    .select('storage_path')
    .eq('proyecto_id', id);
  if (fetchErr) throw fetchErr;

  const { data: proyecto, error: proyErr } = await supabase
    .from('proyectos')
    .select('imagen_antes_storage_path, imagen_despues_storage_path')
    .eq('id', id)
    .single();
  if (proyErr) throw proyErr;

  const paths = [
    ...(imagenes || []).map((i) => i.storage_path),
    proyecto?.imagen_antes_storage_path,
    proyecto?.imagen_despues_storage_path,
  ].filter(Boolean);

  if (paths.length > 0) {
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageErr) throw storageErr;
  }

  const { error } = await supabase.from('proyectos').delete().eq('id', id);
  if (error) throw error;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// ---------- imagen "antes" / "después" (una sola por campo, con reemplazo) ----------
export async function uploadProyectoPortada(proyectoId, file, field) {
  const path = `${proyectoId}/${field}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl, storage_path: path };
}

export async function removeStorageObject(storagePath) {
  if (!storagePath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw error;
}

// ---------- galería del proyecto terminado (multi-imagen, reordenable) ----------
export async function uploadProyectoImagen(proyectoId, file, orden) {
  const path = `${proyectoId}/galeria-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('proyecto_imagenes')
    .insert({ proyecto_id: proyectoId, url: urlData.publicUrl, storage_path: path, orden })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProyectoImagen(imagenId, storagePath) {
  if (storagePath) {
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (storageErr) throw storageErr;
  }
  const { error } = await supabase.from('proyecto_imagenes').delete().eq('id', imagenId);
  if (error) throw error;
}

export async function reorderProyectoImagenes(items) {
  const results = await Promise.all(
    items.map(({ id, orden }) => supabase.from('proyecto_imagenes').update({ orden }).eq('id', id))
  );
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

// ---------- ficha de detalles (label/valor extensible) ----------
export async function upsertDetalle(detalle) {
  // detalle.id presente → update; ausente → insert. Mismo helper para ambos casos porque
  // el editor de la ficha guarda filas nuevas y editadas indistintamente al enviar el form.
  if (detalle.id) {
    const { data, error } = await supabase
      .from('proyecto_detalles')
      .update({ label: detalle.label, valor: detalle.valor, orden: detalle.orden })
      .eq('id', detalle.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from('proyecto_detalles')
    .insert({
      proyecto_id: detalle.proyecto_id,
      label: detalle.label,
      valor: detalle.valor,
      orden: detalle.orden,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDetalle(id) {
  const { error } = await supabase.from('proyecto_detalles').delete().eq('id', id);
  if (error) throw error;
}
