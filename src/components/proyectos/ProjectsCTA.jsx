import BtnWhatsapp from '../ui/BtnWhatsapp';
import { WHATSAPP_URL } from '../../config/contact';
import './ProjectsCTA.css';

export default function ProjectsCTA() {
  return (
    <section className="proy-cta">
      <span className="proy-cta-mark" />
      <h2 className="proy-cta-title">¿Querés ver tu proyecto acá?</h2>
      <p className="proy-cta-text">
        El próximo caso de esta galería puede ser el tuyo. Contanos qué tenés en mente.
      </p>
      <BtnWhatsapp href={WHATSAPP_URL} className="btn-whatsapp--compact" iconSize={28}>
        Escribinos por WhatsApp
      </BtnWhatsapp>
    </section>
  );
}
