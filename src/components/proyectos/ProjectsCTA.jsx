import BtnWhatsapp from '../ui/BtnWhatsapp';
import { WHATSAPP_URL } from '../../config/contact';
import './ProjectsCTA.css';

export default function ProjectsCTA() {
  return (
    <section className="proy-cta">
      <div className="proy-cta-box">
        <span className="proy-cta-eyebrow">Don Teófilo · Portfolio</span>
        <h2 className="proy-cta-title">¿Querés ver tu proyecto acá?</h2>
        <p className="proy-cta-text">
          El próximo caso de esta galería puede ser el tuyo. Contanos qué tenés en mente.
        </p>
        <BtnWhatsapp href={WHATSAPP_URL}>Escribinos por WhatsApp</BtnWhatsapp>
      </div>
    </section>
  );
}
