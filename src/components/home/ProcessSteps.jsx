import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ProcessSteps.css';

const STEPS = [
  {
    num: '01',
    delay: 0,
    title: 'Nos contactás',
    desc: 'Contanos tu idea por WhatsApp o completá el formulario. Te respondemos en menos de 24hs.',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15.5v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1 2.7 2 2 0 0 1 3 .5h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7 8a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
      </svg>
    ),
  },
  {
    num: '02',
    delay: 100,
    title: 'Diseñamos juntos',
    desc: 'Visitamos tu espacio, tomamos medidas y te presentamos un diseño a medida con presupuesto detallado.',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12l10-10 10 10-10 10z" />
        <path d="M6 12h2M10 8v2M14 12h2M12 14v2" opacity=".7" />
      </svg>
    ),
  },
  {
    num: '03',
    delay: 200,
    title: 'Fabricamos',
    desc: 'Nuestro taller produce cada pieza con materiales seleccionados y control de calidad en cada etapa.',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h13l5 5-5 5H3z" />
        <path d="M3 7v10M7 7v10M11 7v10" opacity=".6" />
      </svg>
    ),
  },
  {
    num: '04',
    delay: 300,
    title: 'Instalamos',
    desc: 'Instalación profesional, limpieza y entrega. Tu espacio listo para disfrutar.',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V10l9-7 9 7v11z" />
        <path d="M9 21v-6h6v6" opacity=".7" />
      </svg>
    ),
  },
];

function ProcessRow({ num, delay, title, desc, icon, isLast }) {
  const [ref, isVisible] = useScrollReveal(delay);
  return (
    <div
      ref={ref}
      className={`process-row${isLast ? ' process-row--last' : ''}${isVisible ? ' is-visible' : ''}`}
      data-reveal
    >
      <div className="process-rail">
        <span className="process-rail-num">{num}</span>
        <div className="process-icon">{icon}</div>
      </div>
      <div className="process-content">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}

export default function ProcessSteps() {
  const [headRef, headVisible] = useScrollReveal(0);

  return (
    <section id="proceso" className="process">
      <div ref={headRef} className={`section-head${headVisible ? ' is-visible' : ''}`} data-reveal>
        <div className="section-eyebrow">
          <span className="section-eyebrow-line"></span>
          <span>El proceso</span>
        </div>
        <h2 className="section-title">Cómo trabajamos</h2>
        <p className="section-lead">Un proceso simple, transparente y sin sorpresas.</p>
      </div>

      <div className="process-list">
        {STEPS.map((step, idx) => (
          <ProcessRow key={step.num} {...step} isLast={idx === STEPS.length - 1} />
        ))}
      </div>
    </section>
  );
}
