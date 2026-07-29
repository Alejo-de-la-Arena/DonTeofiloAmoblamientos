import { useEffect, useRef, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Testimonials.css';

export const testimonials = [
  {
    quote:
      'Transformaron nuestra cocina por completo. El nivel de detalle y la calidad de la madera superaron lo que imaginábamos.',
    name: 'María Fernanda G.',
    project: 'Cocina completa — Palermo, CABA',
  },
  {
    quote:
      'Un placard hecho a medida que aprovecha cada centímetro. Puntuales, prolijos y con un acabado impecable.',
    name: 'Julián Ortega',
    project: 'Placard y vestidor — Tandil',
  },
  {
    quote:
      'Nos acompañaron desde la primera charla hasta la instalación. Se nota que aman lo que hacen.',
    name: 'Carla y Diego M.',
    project: 'Diseño integral — Nordelta',
  },
];

export default function Testimonials() {
  const [headRef, headVisible] = useScrollReveal(0);
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const rafRef = useRef(null);

  function scrollToIndex(i) {
    const clamped = Math.max(0, Math.min(testimonials.length - 1, i));
    const card = cardRefs.current[clamped];
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cardRefs.current.forEach((card, idx) => {
          if (!card) return;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardCenter - trackCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closest = idx;
          }
        });
        setActive(closest);
      });
    }

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div
          ref={headRef}
          className={`section-head${headVisible ? ' is-visible' : ''}`}
          data-reveal
        >
          <div className="section-eyebrow">
            <span className="section-eyebrow-line"></span>
            <span>Testimonios</span>
          </div>
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
        </div>
      </div>

      <div className="testimonials-viewport">
        <div className="testimonials-track" ref={trackRef}>
          {testimonials.map((t, idx) => (
            <article
              className="testimonial-card"
              key={t.name}
              ref={(el) => (cardRefs.current[idx] = el)}
            >
              <span className="testimonial-card-mark">&ldquo;</span>
              <p className="testimonial-card-quote">{t.quote}</p>
              <div className="testimonial-card-footer">
                <div className="testimonial-card-stars">★★★★★</div>
                <div className="testimonial-card-name">{t.name}</div>
                <div className="testimonial-card-project">{t.project}</div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="testimonials-controls">
        <button className="t-arrow" aria-label="Anterior" onClick={() => scrollToIndex(active - 1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="t-dots">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              className={`t-dot${idx === active ? ' active' : ''}`}
              aria-label={`Testimonio ${idx + 1}`}
              onClick={() => scrollToIndex(idx)}
            ></button>
          ))}
        </div>
        <button className="t-arrow" aria-label="Siguiente" onClick={() => scrollToIndex(active + 1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="google-reviews">
        Google Reviews <span className="stars-inline">★★★★★</span> · 4,9 / 5
      </div>
    </section>
  );
}
