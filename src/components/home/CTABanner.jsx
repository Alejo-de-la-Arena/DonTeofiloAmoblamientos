import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import BtnWhatsapp from '../ui/BtnWhatsapp';
import { WHATSAPP_URL } from '../../config/contact';
import './CTABanner.css';

export default function CTABanner() {
  const [ref, isVisible] = useScrollReveal(0);

  return (
    <section id="contacto" className="cta">
      <div className="cta-bg"></div>
      <div className="cta-scrim"></div>
      <div ref={ref} className={`cta-inner${isVisible ? ' is-visible' : ''}`} data-reveal>
        <h2 className="cta-title">¿Tenés un proyecto en mente?</h2>
        <p className="cta-sub">
          Contanos tu idea y te ayudamos a hacerla realidad. Presupuesto sin compromiso.
        </p>
        <BtnWhatsapp href={WHATSAPP_URL}>Escribinos por WhatsApp</BtnWhatsapp>
        <div className="cta-alt">
          <Link to="/contacto">O completá el formulario de contacto →</Link>
        </div>
      </div>
    </section>
  );
}
