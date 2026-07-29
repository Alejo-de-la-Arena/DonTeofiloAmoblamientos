import BtnWhatsapp from '../ui/BtnWhatsapp';
import { WHATSAPP_URL } from '../../config/contact';
import './WorkCTA.css';

export default function WorkCTA() {
  return (
    <section className="work-cta">
      <div className="work-cta-bg" />
      <div className="work-cta-inner">
        <h2 className="work-cta-title">¿Querés que tu próximo proyecto empiece así?</h2>
        <p className="work-cta-sub">
          Contanos tu idea y te acompañamos en cada paso. Presupuesto sin compromiso.
        </p>
        <BtnWhatsapp href={WHATSAPP_URL}>Escribinos por WhatsApp</BtnWhatsapp>
      </div>
    </section>
  );
}
