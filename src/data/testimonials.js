// Testimonios del Home.
//
// IMPORTANTE: los textos tienen que ser REALES y estar confirmados por cada cliente antes de
// publicar (cita, nombre y proyecto). Estos tres vienen del sitio anterior y no están
// verificados: confirmarlos o reemplazarlos.
//
// imagen: foto del proyecto de ese cliente ({ src, srcSet?, alt }). Si es null se usa la
//   imagen de la categoría (data/servicios.js).
// proyectoSlug: si el trabajo está publicado en /proyectos, linkea a su detalle.
export const TESTIMONIOS = [
  {
    id: 'maria-fernanda',
    cita: 'Transformaron nuestra cocina por completo. El nivel de detalle y la calidad de la madera superaron lo que imaginábamos.',
    nombre: 'María Fernanda G.',
    proyecto: 'Cocina completa',
    ubicacion: 'Palermo, CABA',
    categoria: 'Cocinas',
    imagen: null,
    proyectoSlug: null,
  },
  {
    id: 'julian',
    cita: 'Un placard hecho a medida que aprovecha cada centímetro. Puntuales, prolijos y con un acabado impecable.',
    nombre: 'Julián Ortega',
    proyecto: 'Placard y vestidor',
    ubicacion: 'Tandil',
    categoria: 'Placards',
    imagen: null,
    proyectoSlug: null,
  },
  {
    id: 'carla-diego',
    cita: 'Nos acompañaron desde la primera charla hasta la instalación. Se nota que aman lo que hacen.',
    nombre: 'Carla y Diego M.',
    proyecto: 'Diseño integral',
    ubicacion: 'Nordelta',
    categoria: 'Diseño integral',
    imagen: null,
    proyectoSlug: null,
  },
];
