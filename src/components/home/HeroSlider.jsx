import { useEffect, useRef, useState } from 'react';
import BtnPrimary from '../ui/BtnPrimary';
import BtnOutline from '../ui/BtnOutline';
import heroCocina from '../../assets/images/inicio/hero/dtf-cocina-hero.png';
import heroVestidor from '../../assets/images/inicio/hero/dtf-vestidor-hero.png';
import heroBanio from '../../assets/images/inicio/hero/dtf-banio-hero.png';
import heroPuerta from '../../assets/images/inicio/hero/dtf-puerta-hero.png';
import './HeroSlider.css';

const SLIDES_TEXT = [
  'Cocinas que inspiran',
  'Placards a tu medida',
  'Cada detalle importa',
  'Carpintería de autor',
];

const SLIDE_IMAGES = [heroCocina, heroVestidor, heroBanio, heroPuerta];

const DUR = 6500;

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const startRef = useRef(performance.now());
  const fillRefs = useRef([]);
  const rafRef = useRef(null);

  function goTo(i) {
    activeRef.current = i;
    startRef.current = performance.now();
    setActive(i);
  }

  useEffect(() => {
    function tick(now) {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / DUR);
      fillRefs.current.forEach((fill, idx) => {
        if (!fill) return;
        const pct = idx < activeRef.current ? 100 : idx === activeRef.current ? p * 100 : 0;
        fill.style.setProperty('--fill', pct + '%');
      });
      if (p >= 1) {
        goTo((activeRef.current + 1) % SLIDES_TEXT.length);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="top" className="hero">
      <div className="hero-slides">
        {SLIDES_TEXT.map((_, idx) => (
          <div
            key={idx}
            className={`hero-slide hero-slide--${idx}${idx === active ? ' active' : ''}`}
            style={{ '--slide-img': `url(${SLIDE_IMAGES[idx]})` }}
          />
        ))}
      </div>
      <div className="hero-scrim-x"></div>
      <div className="hero-scrim-y"></div>

      <div className="hero-content">
        <div className="hero-inner">
          <h1 className="hero-title">{SLIDES_TEXT[active]}</h1>
          <p className="hero-sub">
            Proyectos integrales de carpintería a medida. Cocinas, placards, vanitorys, aberturas y
            más.
          </p>
          <div className="hero-ctas">
            <BtnPrimary href="/productos">Ver Productos</BtnPrimary>
            <BtnOutline href="/proyectos">Conocé nuestro trabajo</BtnOutline>
          </div>
        </div>
      </div>

      <div className="hero-progress">
        {SLIDES_TEXT.map((_, idx) => (
          <button
            key={idx}
            className="hero-progress-seg"
            aria-label={`Slide ${idx + 1}`}
            onClick={() => goTo(idx)}
          >
            <div className="hero-progress-fill" ref={(el) => (fillRefs.current[idx] = el)}></div>
          </button>
        ))}
      </div>
    </section>
  );
}
