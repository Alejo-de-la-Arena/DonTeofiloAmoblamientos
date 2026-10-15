// Lista canónica de categorías — usada tanto en el select del panel admin como en los
// pills de filtro de la página pública /productos. El material es texto libre (ver
// AdminProductoForm) — sus opciones de filtro se generan dinámicamente en Productos.jsx
// a partir de los valores que existan en la base.
export const CATEGORIAS = [
  'Cocinas',
  'Placards',
  'Vanitorys',
  'Aberturas',
  'Alacenas',
  'Diseño integral',
];

// Slug de URL de una categoría: "Diseño integral" → "diseno-integral". Es el valor de
// ?categoria= en /productos (Home → índice de servicios). Productos lo resuelve de vuelta
// a la categoría con categoriaFromSlug.
export function slugifyCategoria(categoria) {
  return categoria
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function categoriaFromSlug(slug) {
  return CATEGORIAS.find((c) => slugifyCategoria(c) === slug) ?? null;
}

// "Placards" → "un placard": para armar mensajes en primera persona ("Hola, busco un placard…").
const CATEGORIA_SINGULAR = {
  Cocinas: 'una cocina',
  Placards: 'un placard',
  Vanitorys: 'un vanitory',
  Aberturas: 'una abertura',
  Alacenas: 'una alacena',
  'Diseño integral': 'un diseño integral',
};

export function categoriaEnSingular(categoria) {
  return CATEGORIA_SINGULAR[categoria] ?? null;
}
