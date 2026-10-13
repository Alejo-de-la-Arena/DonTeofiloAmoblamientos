import WhatsAppButton from '../primitives/WhatsAppButton';
import './ProjectsCTA.css';

export default function ProjectsCTA() {
  return (
    <section className="proy-cta">
      <span className="proy-cta-mark" />
      <h2 className="proy-cta-title">¿Querés ver tu proyecto acá?</h2>
      <p className="proy-cta-text">
        El próximo caso de esta galería puede ser el tuyo. Contanos qué tenés en mente.
      </p>
      <WhatsAppButton variant="primary">Escribinos por WhatsApp</WhatsAppButton>
    </section>
  );
}
