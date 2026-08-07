import { useEffect, useRef } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import img01 from '../../assets/images/como-trabajamos/01-nos-contactas.png';
import img02 from '../../assets/images/como-trabajamos/02-diseniamos-juntos.png';
import img03 from '../../assets/images/como-trabajamos/03-fabricamos.png';
import img04 from '../../assets/images/como-trabajamos/04-instalamos.png';
import './ProcessTimeline.css';

const STEPS = [
  {
    n: '01',
    title: 'Nos contactás',
    desc: 'Todo arranca con una charla. Contanos qué necesitás por WhatsApp o con el formulario y te respondemos en menos de 24hs — sin vueltas ni compromiso.',
    subs: [
      'Primer contacto por WhatsApp o formulario',
      'Charla para entender qué buscás y tu presupuesto',
      'Coordinamos una visita si hace falta',
    ],
    img: img01,
    alt: 'Cliente conversando con el equipo de Don Teófilo para definir un mueble a medida',
  },
  {
    n: '02',
    title: 'Diseñamos juntos',
    desc: 'Visitamos tu espacio, tomamos medidas reales y te presentamos un diseño a medida con un presupuesto detallado, ítem por ítem.',
    subs: [
      'Relevamiento y medición en el lugar',
      'Propuesta de diseño con render o croquis',
      'Presupuesto detallado y elección de materiales',
    ],
    img: img02,
    alt: 'Relevamiento y diseño de un mueble a medida en el espacio del cliente',
  },
  {
    n: '03',
    title: 'Fabricamos',
    desc: 'En nuestro taller producimos cada pieza con materiales seleccionados y control de calidad en cada etapa. Te mantenemos al tanto del avance.',
    subs: [
      'Corte y armado en taller propio',
      'Control de calidad en cada módulo',
      'Herrajes y terminaciones premium',
    ],
    img: img03,
    alt: 'Carpintero fabricando un mueble a medida en el taller de Don Teófilo',
  },
  {
    n: '04',
    title: 'Instalamos',
    desc: 'Coordinamos la instalación en el día acordado, dejamos todo funcionando y limpio. Tu espacio queda listo para disfrutar el mismo día.',
    subs: [
      'Instalación profesional coordinada',
      'Ajustes finos y limpieza final',
      'Entrega y garantía por escrito',
    ],
    img: img04,
    alt: 'Instalación final de un mueble a medida en la casa del cliente',
  },
];

function StepRow({ step, isFirst, isLast }) {
  const [ref, isVisible] = useScrollReveal(0);

  return (
    <div
      ref={ref}
      data-reveal
      className={`work-step${isLast ? ' work-step--last' : ''}${isVisible ? ' is-visible' : ''}`}
    >
      {/* Tick + leader: la escala "mide" este punto y lo conecta con su anotación, misma lógica
          de llamada de detalle que el callout del hero, en versión horizontal y sin el círculo. */}
      <span className="work-step-callout" aria-hidden="true" />
      <div className="work-step-grid">
        <div className="work-step-text">
          <span className="work-step-label">Paso {step.n}</span>
          <h3 className="work-step-title">{step.title}</h3>
          <p className="work-step-desc">{step.desc}</p>
          <ul className="work-step-subs">
            {step.subs.map((s) => (
              <li key={s}>
                <span className="work-step-dash">—</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="work-step-frame">
          <img src={step.img} alt={step.alt} loading={isFirst ? 'eager' : 'lazy'} />
        </div>
      </div>
    </div>
  );
}

export default function ProcessTimeline() {
  const timelineRef = useRef(null);
  const lineRef = useRef(null);
  const ticksActiveRef = useRef(null);

  useEffect(() => {
    const tl = timelineRef.current;
    if (!tl) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      if (lineRef.current) lineRef.current.style.strokeDashoffset = '0';
      if (ticksActiveRef.current) ticksActiveRef.current.style.height = '100%';
      return;
    }

    let raf = null;
    let listening = false;

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const line = lineRef.current;
        const ticks = ticksActiveRef.current;
        if (!line || !ticks) return;
        const r = tl.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height + vh * 0.5;
        const prog = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / total));
        line.style.strokeDashoffset = String(1 - prog);
        ticks.style.height = `${prog * 100}%`;
      });
    }

    // El listener de scroll solo vive mientras la sección está cerca del viewport — evita
    // recalcular el progreso en cada scroll del resto de la página, no solo mientras se ve esto.
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !listening) {
          listening = true;
          window.addEventListener('scroll', onScroll, { passive: true });
          onScroll();
        } else if (!entry.isIntersecting && listening) {
          listening = false;
          window.removeEventListener('scroll', onScroll);
        }
      },
      { rootMargin: '200px 0px' }
    );
    sectionObserver.observe(tl);

    return () => {
      sectionObserver.disconnect();
      if (listening) window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="work-timeline-section">
      <div ref={timelineRef} className="work-timeline">
        <div className="work-timeline-ticks" aria-hidden="true" />
        <div ref={ticksActiveRef} className="work-timeline-ticks-active" aria-hidden="true" />
        <svg viewBox="0 0 4 1000" preserveAspectRatio="none" className="work-timeline-svg">
          <line x1="2" y1="0" x2="2" y2="1000" stroke="#E8E4DF" strokeWidth="1.5" />
          <line
            ref={lineRef}
            x1="2"
            y1="0"
            x2="2"
            y2="1000"
            stroke="#C4836A"
            strokeWidth="1.5"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </svg>
        {STEPS.map((step, i) => (
          <StepRow key={step.n} step={step} isFirst={i === 0} isLast={i === STEPS.length - 1} />
        ))}
      </div>
    </section>
  );
}
