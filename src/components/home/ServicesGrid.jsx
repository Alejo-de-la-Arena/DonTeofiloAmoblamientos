import { useScrollReveal } from '../../hooks/useScrollReveal';
import imgCocina from '../../assets/images/inicio/servicios/dtf-cocina-servicios.png';
import imgCocinaWebp from '../../assets/images/inicio/servicios/dtf-cocina-servicios.png?w=400;600;830&format=webp&as=srcset';
import imgPlacard from '../../assets/images/inicio/servicios/dtf-placard-servicios.png';
import imgPlacardWebp from '../../assets/images/inicio/servicios/dtf-placard-servicios.png?w=400;600;830&format=webp&as=srcset';
import imgVanitorys from '../../assets/images/inicio/servicios/dtf-vanitorys-servicios.png';
import imgVanitorysWebp from '../../assets/images/inicio/servicios/dtf-vanitorys-servicios.png?w=400;600;830&format=webp&as=srcset';
import imgPuertas from '../../assets/images/inicio/servicios/dtf-puertas-servicios.png';
import imgPuertasWebp from '../../assets/images/inicio/servicios/dtf-puertas-servicios.png?w=400;600;830&format=webp&as=srcset';
import imgAlacenas from '../../assets/images/inicio/servicios/dtf-alacenas-servicios.png';
import imgAlacenasWebp from '../../assets/images/inicio/servicios/dtf-alacenas-servicios.png?w=400;600;830&format=webp&as=srcset';
import imgDiseno from '../../assets/images/inicio/servicios/dtf-diseno-integral.png';
import imgDisenoWebp from '../../assets/images/inicio/servicios/dtf-diseno-integral.png?w=400;600;830&format=webp&as=srcset';
import './ServicesGrid.css';

const SERVICES = [
  {
    img: 'product-img--1',
    image: imgCocina,
    imageWebp: imgCocinaWebp,
    title: 'Cocinas a medida',
    desc: 'Diseñamos y fabricamos cocinas completas adaptadas a tu espacio y estilo de vida. Materiales premium, terminaciones impecables.',
    delay: 0,
  },
  {
    img: 'product-img--2',
    image: imgPlacard,
    imageWebp: imgPlacardWebp,
    title: 'Placards e interiores',
    desc: 'Soluciones de guardado inteligentes. Diseño interior funcional con la calidez de la madera.',
    delay: 90,
  },
  {
    img: 'product-img--3',
    image: imgVanitorys,
    imageWebp: imgVanitorysWebp,
    title: 'Vanitorys',
    desc: 'Muebles de baño que combinan diseño y resistencia. Cada pieza pensada para durar.',
    delay: 180,
  },
  {
    img: 'product-img--4',
    image: imgPuertas,
    imageWebp: imgPuertasWebp,
    title: 'Aberturas',
    desc: 'Puertas, ventanas y aberturas en madera maciza. Aislación, seguridad y estética.',
    delay: 0,
  },
  {
    img: 'product-img--5',
    image: imgAlacenas,
    imageWebp: imgAlacenasWebp,
    title: 'Alacenas y vestidores',
    desc: 'Espacios de guardado diseñados al centímetro para aprovechar cada rincón.',
    delay: 90,
  },
  {
    img: 'product-img--6',
    image: imgDiseno,
    imageWebp: imgDisenoWebp,
    title: 'Diseño integral',
    desc: 'Te acompañamos desde la idea hasta la instalación. Proyecto completo llave en mano.',
    delay: 180,
  },
];

function ProductCard({ img, image, imageWebp, title, desc, delay }) {
  const [ref, isVisible] = useScrollReveal(delay);
  return (
    <article ref={ref} className={`product-card${isVisible ? ' is-visible' : ''}`} data-reveal>
      <div className={`product-img ${img}`}>
        <picture>
          <source srcSet={imageWebp} type="image/webp" sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw" />
          <img
            src={image}
            alt={title}
            sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
            loading="lazy"
          />
        </picture>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="product-link">Ver más →</span>
    </article>
  );
}

export default function ServicesGrid() {
  const [headRef, headVisible] = useScrollReveal(0);

  return (
    <section id="productos" className="products">
      <div ref={headRef} className={`section-head${headVisible ? ' is-visible' : ''}`} data-reveal>
        <div className="section-eyebrow">
          <span className="section-eyebrow-line"></span>
          <span>Nuestros servicios</span>
        </div>
        <h2 className="section-title">Lo que mejor hacemos</h2>
        <p className="section-lead">Cada proyecto es único, cada espacio merece lo mejor.</p>
      </div>

      <div className="products-grid">
        {SERVICES.map((service) => (
          <ProductCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
}
