import { supabase } from './supabaseClient';

const BUCKET = 'productos-imagenes';

function mapProducto(row) {
  const imagenes = (row.producto_imagenes || [])
    .slice()
    .sort((a, b) => a.orden - b.orden)
    .map((img) => img.url);
  return { ...row, imagenes };
}

export async function fetchProductosPublicos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*, producto_imagenes(id, url, storage_path, orden)')
    .eq('publicado', true);
  if (error) throw error;

  const rows = (data || []).map(mapProducto);
  const withOrden = rows.filter((r) => r.orden != null).sort((a, b) => a.orden - b.orden);
  const withoutOrden = rows
    .filter((r) => r.orden == null)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return [...withOrden, ...withoutOrden];
}

export async function fetchProductosAdmin() {
  const { data, error } = await supabase
    .from('productos')
    .select('*, producto_imagenes(id, url, storage_path, orden)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapProducto);
}

export async function fetchProductoById(id) {
  const { data, error } = await supabase
    .from('productos')
    .select('*, producto_imagenes(id, url, storage_path, orden)')
    .eq('id', id)
    .single();
  if (error) throw error;

  const imagenes = (data.producto_imagenes || []).slice().sort((a, b) => a.orden - b.orden);
  return { ...data, imagenes };
}

export async function createProducto(fields) {
  const { data, error } = await supabase.from('productos').insert(fields).select().single();
  if (error) throw error;
  return data;
}

export async function updateProducto(id, fields) {
  const { data, error } = await supabase
    .from('productos')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function togglePublicado(id, publicado) {
  const { error } = await supabase.from('productos').update({ publicado }).eq('id', id);
  if (error) throw error;
}

export async function deleteProducto(id) {
  const { data: imagenes, error: fetchErr } = await supabase
    .from('producto_imagenes')
    .select('storage_path')
    .eq('producto_id', id);
  if (fetchErr) throw fetchErr;

  const paths = (imagenes || []).map((i) => i.storage_path).filter(Boolean);
  if (paths.length > 0) {
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageErr) throw storageErr;
  }

  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadProductoImagen(productoId, file, orden) {
  const path = `${productoId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadErr) throw uploadErr;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from('producto_imagenes')
    .insert({ producto_id: productoId, url: urlData.publicUrl, storage_path: path, orden })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProductoImagen(imagenId, storagePath) {
  if (storagePath) {
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (storageErr) throw storageErr;
  }
  const { error } = await supabase.from('producto_imagenes').delete().eq('id', imagenId);
  if (error) throw error;
}

export async function reorderProductoImagenes(items) {
  const results = await Promise.all(
    items.map(({ id, orden }) => supabase.from('producto_imagenes').update({ orden }).eq('id', id))
  );
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}
