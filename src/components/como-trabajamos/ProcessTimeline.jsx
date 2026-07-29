import { useEffect, useRef } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
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
    seed: 'dtf-paso-1',
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
    seed: 'dtf-paso-2',
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
    seed: 'dtf-paso-3',
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
    seed: 'dtf-paso-4',
  },
];

function StepRow({ step, index, isLast }) {
  const [ref, isVisible] = useScrollReveal(0);
  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      data-reveal
      className={`work-step${isLast ? ' work-step--last' : ''}${isVisible ? ' is-visible' : ''}`}
    >
      <div className="work-step-marker">{step.n}</div>
      <div className={`work-step-grid${isEven ? '' : ' work-step-grid--reverse'}`}>
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
        <div
          className="work-step-img"
          style={{ backgroundImage: `url(https://picsum.photos/seed/${step.seed}/700/560)` }}
        />
      </div>
    </div>
  );
}

export default function ProcessTimeline() {
  const timelineRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    let raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const tl = timelineRef.current;
        const line = lineRef.current;
        if (!tl || !line) return;
        const r = tl.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height + vh * 0.5;
        const prog = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / total));
        line.style.strokeDashoffset = String(1 - prog);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="work-timeline-section">
      <div ref={timelineRef} className="work-timeline">
        <svg viewBox="0 0 4 1000" preserveAspectRatio="none" className="work-timeline-svg">
          <line x1="2" y1="0" x2="2" y2="1000" stroke="#E8E4DF" strokeWidth="4" />
          <line
            ref={lineRef}
            x1="2"
            y1="0"
            x2="2"
            y2="1000"
            stroke="#C4836A"
            strokeWidth="4"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </svg>
        {STEPS.map((step, i) => (
          <StepRow key={step.n} step={step} index={i} isLast={i === STEPS.length - 1} />
        ))}
      </div>
    </section>
  );
}
