// Datos mock — reemplazar por una consulta a Supabase cuando el portfolio esté cargado ahí.

function pic(seed, w, h) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export const PROYECTOS_FILTROS = ['Todos', 'Cocinas', 'Placards', 'Diseño integral'];

export const PROYECTOS = [
  {
    id: 1,
    num: '01',
    titulo: 'Cocina Integral — Nordelta',
    categoria: 'Cocinas',
    categoriaFiltro: 'Cocinas',
    ubicacion: 'Nordelta, BsAs',
    duracion: '5 semanas',
    materiales: 'Roble + cuarzo',
    descripcion:
      'Renovación completa de una cocina abierta al living. Reemplazamos los muebles existentes por un sistema de bajo y sobre mesada en roble claro, sumamos una isla con desayunador y una torre de columnas para horno y microondas.',
    factsTop: false,
    hasCta: true,
    ctaLabel: 'Ver más detalles',
    imagenAntes: pic('nordelta-antes', 900, 700),
    imagenDespues: pic('nordelta-despues', 900, 700),
  },
  {
    id: 2,
    num: '02',
    titulo: 'Vestidor Principal — Tandil',
    categoria: 'Placards',
    categoriaFiltro: 'Placards',
    ubicacion: 'Tandil',
    duracion: '4 semanas',
    materiales: 'Fresno + LED',
    descripcion:
      'Un vestidor walk-in diseñado al centímetro para un dormitorio en suite. Módulos abiertos y cerrados, isla central con cajonera de vidrio y una tira LED perimetral que ilumina cada estante.',
    factsTop: true,
    hasCta: true,
    ctaLabel: 'Conocé el proceso',
    imagenAntes: pic('tandil-antes', 900, 700),
    imagenDespues: pic('tandil-despues', 900, 700),
  },
  {
    id: 3,
    num: '03',
    titulo: 'Reforma Integral — Palermo',
    categoria: 'Diseño integral',
    categoriaFiltro: 'Diseño integral',
    ubicacion: 'Palermo, CABA',
    duracion: '7 semanas',
    materiales: 'Melamina mixta',
    descripcion:
      'Proyecto llave en mano de un monoambiente: cocina lineal, placard corredizo, mueble de TV a medida y una biblioteca que separa el área de descanso. Todo pensado como un sistema coherente.',
    factsTop: false,
    hasCta: false,
    ctaLabel: '',
    imagenAntes: pic('palermo-antes', 900, 700),
    imagenDespues: pic('palermo-despues', 900, 700),
  },
  {
    id: 4,
    num: '04',
    titulo: 'Baño Suite — San Isidro',
    categoria: 'Vanitorys',
    categoriaFiltro: 'Vanitorys',
    ubicacion: 'San Isidro',
    duracion: '3 semanas',
    materiales: 'Laca + cuarzo',
    descripcion:
      'Vanitory doble suspendido con mesada de cuarzo y frentes laqueados en tono arena. Sumamos un mueble columna espejado y estantería flotante de madera maciza para toallas.',
    factsTop: true,
    hasCta: true,
    ctaLabel: 'Ver más detalles',
    imagenAntes: pic('sanisidro-antes', 900, 700),
    imagenDespues: pic('sanisidro-despues', 900, 700),
  },
  {
    id: 5,
    num: '05',
    titulo: 'Cocina Office — Recoleta',
    categoria: 'Cocinas',
    categoriaFiltro: 'Cocinas',
    ubicacion: 'Recoleta, CABA',
    duracion: '5 semanas',
    materiales: 'Melamina grafito',
    descripcion:
      'Cocina cerrada con office integrado. Aprovechamos toda la altura con alacenas hasta el techo y resolvimos un rincón difícil con una alacena esquinera de bandejas giratorias.',
    factsTop: false,
    hasCta: true,
    ctaLabel: 'Conocé el proceso',
    imagenAntes: pic('recoleta-antes', 900, 700),
    imagenDespues: pic('recoleta-despues', 900, 700),
  },
  {
    id: 6,
    num: '06',
    titulo: 'Aberturas de Autor — Tigre',
    categoria: 'Aberturas',
    categoriaFiltro: 'Diseño integral',
    ubicacion: 'Tigre, BsAs',
    duracion: '8 semanas',
    materiales: 'Cedro macizo',
    descripcion:
      'Casa de fin de semana con carpintería completa en madera maciza: ventanales, puertas de acceso y postigones. Cada abertura se diseñó para maximizar la vista al río con la mejor aislación.',
    factsTop: true,
    hasCta: false,
    ctaLabel: '',
    imagenAntes: pic('tigre-antes', 900, 700),
    imagenDespues: pic('tigre-despues', 900, 700),
  },
];
