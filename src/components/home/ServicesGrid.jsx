import { useScrollReveal } from '../../hooks/useScrollReveal';
import imgCocina from '../../assets/images/inicio/servicios/dtf-cocina-servicios.png';
import imgPlacard from '../../assets/images/inicio/servicios/dtf-placard-servicios.png';
import imgVanitorys from '../../assets/images/inicio/servicios/dtf-vanitorys-servicios.png';
import imgPuertas from '../../assets/images/inicio/servicios/dtf-puertas-servicios.png';
import imgAlacenas from '../../assets/images/inicio/servicios/dtf-alacenas-servicios.png';
import './ServicesGrid.css';

const SERVICES = [
  {
    img: 'product-img--1',
    image: imgCocina,
    title: 'Cocinas a medida',
    desc: 'Diseñamos y fabricamos cocinas completas adaptadas a tu espacio y estilo de vida. Materiales premium, terminaciones impecables.',
    delay: 0,
  },
  {
    img: 'product-img--2',
    image: imgPlacard,
    title: 'Placards e interiores',
    desc: 'Soluciones de guardado inteligentes. Diseño interior funcional con la calidez de la madera.',
    delay: 90,
  },
  {
    img: 'product-img--3',
    image: imgVanitorys,
    title: 'Vanitorys',
    desc: 'Muebles de baño que combinan diseño y resistencia. Cada pieza pensada para durar.',
    delay: 180,
  },
  {
    img: 'product-img--4',
    image: imgPuertas,
    title: 'Aberturas',
    desc: 'Puertas, ventanas y aberturas en madera maciza. Aislación, seguridad y estética.',
    delay: 0,
  },
  {
    img: 'product-img--5',
    image: imgAlacenas,
    title: 'Alacenas y vestidores',
    desc: 'Espacios de guardado diseñados al centímetro para aprovechar cada rincón.',
    delay: 90,
  },
  {
    img: 'product-img--6',
    image: imgCocina,
    title: 'Diseño integral',
    desc: 'Te acompañamos desde la idea hasta la instalación. Proyecto completo llave en mano.',
    delay: 180,
  },
];

function ProductCard({ img, image, title, desc, delay }) {
  const [ref, isVisible] = useScrollReveal(delay);
  return (
    <article ref={ref} className={`product-card${isVisible ? ' is-visible' : ''}`} data-reveal>
      <div className={`product-img ${img}`} style={{ '--service-img': `url(${image})` }}></div>
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
