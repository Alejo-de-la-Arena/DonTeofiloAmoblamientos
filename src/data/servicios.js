import cocina from '../assets/images/inicio/servicios/dtf-cocina-servicios.png?w=480;720;960&format=webp&as=srcset';
import cocinaSrc from '../assets/images/inicio/servicios/dtf-cocina-servicios.png?w=720&format=webp';
import placard from '../assets/images/inicio/servicios/dtf-placard-servicios.png?w=480;720;960&format=webp&as=srcset';
import placardSrc from '../assets/images/inicio/servicios/dtf-placard-servicios.png?w=720&format=webp';
import vanitory from '../assets/images/inicio/servicios/dtf-vanitorys-servicios.png?w=480;720;960&format=webp&as=srcset';
import vanitorySrc from '../assets/images/inicio/servicios/dtf-vanitorys-servicios.png?w=720&format=webp';
import puertas from '../assets/images/inicio/servicios/dtf-puertas-servicios.png?w=480;720;960&format=webp&as=srcset';
import puertasSrc from '../assets/images/inicio/servicios/dtf-puertas-servicios.png?w=720&format=webp';
import alacenas from '../assets/images/inicio/servicios/dtf-alacenas-servicios.png?w=480;720;960&format=webp&as=srcset';
import alacenasSrc from '../assets/images/inicio/servicios/dtf-alacenas-servicios.png?w=720&format=webp';
import diseno from '../assets/images/inicio/servicios/dtf-diseno-integral.png?w=480;720;960&format=webp&as=srcset';
import disenoSrc from '../assets/images/inicio/servicios/dtf-diseno-integral.png?w=720&format=webp';
import { slugifyCategoria } from './productCategories';

// Índice de servicios del Home. `categoria` es el valor EXACTO de CATEGORIAS (la columna
// categoria de productos); `slug` sale de ahí y es el ?categoria= de /productos.
const raw = [
  {
    nombre: 'Cocinas a medida',
    categoria: 'Cocinas',
    descripcion: 'Cocinas completas, a la medida de tu espacio.',
    imagen: { srcSet: cocina, src: cocinaSrc },
    alt: 'Cocina a medida con muebles gris azulado, estantes de madera y mesada clara',
  },
  {
    nombre: 'Placards e interiores',
    categoria: 'Placards',
    descripcion: 'Guardado pensado módulo por módulo, con interiores a medida.',
    imagen: { srcSet: placard, src: placardSrc },
    alt: 'Placard a medida con puertas de vidrio y módulos de madera',
  },
  {
    nombre: 'Vanitorys',
    categoria: 'Vanitorys',
    descripcion: 'Muebles de baño resistentes a la humedad, hechos para durar.',
    imagen: { srcSet: vanitory, src: vanitorySrc },
    alt: 'Vanitory de madera con espejo redondo iluminado',
  },
  {
    nombre: 'Aberturas',
    categoria: 'Aberturas',
    descripcion: 'Puertas y aberturas en madera maciza, a la medida del vano.',
    imagen: { srcSet: puertas, src: puertasSrc },
    alt: 'Puerta corrediza de listones de madera',
  },
  {
    nombre: 'Alacenas y vestidores',
    categoria: 'Alacenas',
    descripcion: 'Espacios de guardado que aprovechan cada centímetro.',
    imagen: { srcSet: alacenas, src: alacenasSrc },
    alt: 'Alacenas a medida gris azulado alrededor de una ventana con marco de madera',
  },
  {
    nombre: 'Diseño integral',
    categoria: 'Diseño integral',
    descripcion: 'De la idea a la instalación: el proyecto completo, llave en mano.',
    imagen: { srcSet: diseno, src: disenoSrc },
    alt: 'Ambiente integrado con barra de madera maciza y banquetas',
  },
];

export const SERVICIOS = raw.map((s, i) => ({
  ...s,
  id: slugifyCategoria(s.categoria),
  slug: slugifyCategoria(s.categoria),
  numero: String(i + 1).padStart(2, '0'),
}));
