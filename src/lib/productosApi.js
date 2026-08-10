import { supabase } from './supabaseClient';

const BUCKET = 'productos-imagenes';

export async function fetchProductosPublicos() {
  const { data, error } = await supabase.from('productos').select('*').eq('publicado', true);
  if (error) throw error;

  const rows = data || [];
  const withOrden = rows.filter((r) => r.orden != null).sort((a, b) => a.orden - b.orden);
  const withoutOrden = rows
    .filter((r) => r.orden == null)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return [...withOrden, ...withoutOrden];
}

export async function fetchProductosAdmin() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProductoById(id) {
  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
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
  const { data: producto, error: fetchErr } = await supabase
    .from('productos')
    .select('imagen_storage_path')
    .eq('id', id)
    .single();
  if (fetchErr) throw fetchErr;

  if (producto?.imagen_storage_path) {
    const { error: storageErr } = await supabase.storage
      .from(BUCKET)
      .remove([producto.imagen_storage_path]);
    if (storageErr) throw storageErr;
  }

  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// ---------- imagen única del producto (una por fila, con reemplazo) ----------
export async function uploadProductoImagen(productoId, file) {
  const path = `${productoId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
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
