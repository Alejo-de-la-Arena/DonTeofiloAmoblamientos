import cocinaDesktop from '../assets/images/inicio/hero/dtf-cocina-hero-desktop.png?w=960;1440;1920&format=webp&as=srcset';
import cocinaMobile from '../assets/images/inicio/hero/dtf-cocina-hero-mobile.png?w=480;640;828&format=webp&as=srcset';
import cocinaSrc from '../assets/images/inicio/hero/dtf-cocina-hero-desktop.png?w=1440&format=webp';
import placardDesktop from '../assets/images/inicio/hero/dtf-placard-hero-desktop.png?w=960;1440;1920&format=webp&as=srcset';
import placardMobile from '../assets/images/inicio/hero/dtf-placard-hero-mobile.png?w=480;640;828&format=webp&as=srcset';
import placardSrc from '../assets/images/inicio/hero/dtf-placard-hero-desktop.png?w=1440&format=webp';
import banioDesktop from '../assets/images/inicio/hero/dtf-banio-hero-desktop.png?w=960;1440;1920&format=webp&as=srcset';
import banioMobile from '../assets/images/inicio/hero/dtf-banio-hero-mobile.png?w=480;640;828&format=webp&as=srcset';
import banioSrc from '../assets/images/inicio/hero/dtf-banio-hero-desktop.png?w=1440&format=webp';
import puertaDesktop from '../assets/images/inicio/hero/dtf-puerta-hero-desktop.png?w=960;1440;1920&format=webp&as=srcset';
import puertaMobile from '../assets/images/inicio/hero/dtf-puerta-hero-mobile.png?w=480;640;828&format=webp&as=srcset';
import puertaSrc from '../assets/images/inicio/hero/dtf-puerta-hero-desktop.png?w=1440&format=webp';

// Slides del hero del Home.
//
// TODO: migrar a Supabase (flag destacado_hero) y vincular cada slide a un proyecto REAL
// de la tabla proyectos, de donde salgan ubicación, material y medida.
//
// Regla: ningún dato inventado llega a producción. Los campos sin dato real van en null y
// la ficha técnica del hero renderiza solo los que tienen valor (sin categoría extra no hay
// nada que mostrar más que la categoría y los controles).
//
// imagen: srcset WebP por breakpoint (mobile = recorte vertical) + `src` de respaldo.
export const HERO_SLIDES = [
  {
    id: 'cocina',
    imagen: { desktop: cocinaDesktop, mobile: cocinaMobile, src: cocinaSrc },
    alt: 'Cocina con muebles de madera oscura, isla con mesada de mármol blanco y luces colgantes',
    categoria: 'Cocina',
    ubicacion: null,
    material: null,
    medida: null,
  },
  {
    id: 'placard',
    imagen: { desktop: placardDesktop, mobile: placardMobile, src: placardSrc },
    alt: 'Vestidor con módulos abiertos iluminados, cajoneras de madera y puertas espejadas',
    categoria: 'Placard',
    ubicacion: null,
    material: null,
    medida: null,
  },
  {
    id: 'vanitory',
    imagen: { desktop: banioDesktop, mobile: banioMobile, src: banioSrc },
    alt: 'Baño con vanitory suspendido de madera, mesada de piedra y espejo con luz perimetral',
    categoria: 'Vanitory',
    ubicacion: null,
    material: null,
    medida: null,
  },
  {
    id: 'abertura',
    imagen: { desktop: puertaDesktop, mobile: puertaMobile, src: puertaSrc },
    alt: 'Puerta pivotante de madera maciza en la entrada de una casa, junto a un paño de vidrio',
    categoria: 'Abertura',
    ubicacion: null,
    material: null,
    medida: null,
  },
];
