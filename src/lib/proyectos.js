// Helpers de presentación de proyectos, compartidos por el Home, el listado y el detalle.
// Ninguno inventa datos: si algo no existe, devuelven null y la UI no renderiza ese bloque.

const clean = (v) => (v == null ? '' : String(v).trim());

/** Valor del primer detalle cuyo label matchea `re` (solo si tiene valor). */
export const detalle = (p, re) => clean((p.detalles || []).find((d) => re.test(d.label) && clean(d.valor))?.valor) || null;

/** Detalles con valor, en orden. Los que vienen con valor vacío/null se omiten. */
export const detallesConValor = (p) => (p.detalles || []).filter((d) => clean(d.label) && clean(d.valor));

// "Baño Suite — San Isidro" → nombre "Baño Suite" + lugar "San Isidro". La ubicación de la
// ficha técnica tiene prioridad; si no existe, se usa la parte del título después del guion.
export function splitTitulo(p) {
  const [nombre, ...resto] = clean(p.titulo).split(/\s+[—–-]\s+/);
  return { nombre, ubicacion: detalle(p, /ubicaci/i) || resto.join(' — ') || null };
}

/** Texto corto para listados: el resumen, o si no hay, la descripción. */
export const bajada = (p) => clean(p.resumen) || clean(p.descripcion) || null;

// Una sola línea de qué se hizo: el resumen, o la primera oración de la descripción.
export function lineaDeTrabajo(p) {
  if (clean(p.resumen)) return clean(p.resumen);
  const desc = clean(p.descripcion);
  const first = desc.match(/^.+?[.!?](\s|$)/);
  return first ? first[0].trim() : desc || null;
}

/** "1 proyecto" / "4 proyectos". */
export const contarProyectos = (n) => `${n} ${n === 1 ? 'proyecto' : 'proyectos'}`;

/**
 * Proyecto que protagoniza el hero del listado. El Home ya pinea el destacado_home, así que
 * acá se excluye: el primero por `orden` (la lista ya viene ordenada) que tenga antes y después.
 * Sin ningún par → `{ proyecto: primero con "después", par: false }` (hero estático).
 */
export function proyectoDelHero(proyectos) {
  const conPar = proyectos.find((p) => p.imagen_antes && p.imagen_despues && !p.destacado_home);
  if (conPar) return { proyecto: conPar, par: true };
  const conDespues = proyectos.find((p) => p.imagen_despues);
  return { proyecto: conDespues || null, par: false };
}
