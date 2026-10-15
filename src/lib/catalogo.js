// Helpers puros del catálogo (/productos): normalización de texto libre y opciones de filtro.

/** Clave de comparación: sin tildes, sin mayúsculas, sin espacios sobrantes. */
export function fold(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** `material` es texto libre: "Melamina, MDF laqueado" → ['Melamina', 'MDF laqueado']. */
export function splitMateriales(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map((m) => m.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Opciones del filtro de material: un valor por clave normalizada, rotulado con la grafía
 * más frecuente entre los productos (en empate, la primera que aparece).
 * → [{ value: 'melamina', label: 'Melamina' }, …] ordenado alfabéticamente.
 */
export function materialOptions(productos) {
  const groups = new Map();
  productos.forEach((p) => {
    splitMateriales(p.material).forEach((label) => {
      const key = fold(label);
      if (!groups.has(key)) groups.set(key, new Map());
      const variants = groups.get(key);
      variants.set(label, (variants.get(label) || 0) + 1);
    });
  });
  return [...groups]
    .map(([value, variants]) => {
      let label = '';
      let best = 0;
      variants.forEach((n, v) => {
        if (n > best) [label, best] = [v, n];
      });
      return { value, label };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

/** Materiales de un producto con la grafía canónica de las opciones (para los chips de la card). */
export function materialLabels(product, options) {
  const byKey = new Map(options.map((o) => [o.value, o.label]));
  return [...new Set(splitMateriales(product.material).map((m) => byKey.get(fold(m)) ?? m))];
}

export const tienePrecioVisible = (p) => p.mostrar_precio && p.precio != null;

const sinNombreAvisados = new Set();

/** Nombre a mostrar: `nombre` es not null en la base, pero puede venir vacío. */
export function nombreProducto(product) {
  const nombre = product.nombre?.trim();
  if (nombre) return nombre;
  if (import.meta.env.DEV && !sinNombreAvisados.has(product.id)) {
    sinNombreAvisados.add(product.id);
    console.warn(`[catálogo] El producto ${product.id} no tiene nombre: se muestra la categoría.`);
  }
  return product.categoria;
}
