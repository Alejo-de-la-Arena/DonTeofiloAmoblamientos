import WhatsAppButton from '../primitives/WhatsAppButton';
import Cota from '../primitives/Cota';
import { WHATSAPP_URL } from '../../config/contact';
import styles from './ProjectsCTA.module.css';

/**
 * Cierre de Proyectos (listado y detalle): una cota corta sobre el título, como una medida de
 * plano, y la acción por WhatsApp en paleta. El detalle pasa su propio texto y mensaje.
 */
export default function ProjectsCTA({
  titulo = '¿Querés ver tu proyecto acá?',
  texto = 'El próximo caso de esta galería puede ser el tuyo. Contanos qué tenés en mente.',
  href = WHATSAPP_URL,
  accion = 'Escribinos por WhatsApp',
}) {
  return (
    <section className={styles.cta} aria-labelledby="proyectos-cta-titulo">
      <Cota className={styles.cota} draw="view" />
      <h2 id="proyectos-cta-titulo" className={styles.title}>
        {titulo}
      </h2>
      {texto && <p className={styles.text}>{texto}</p>}
      <WhatsAppButton href={href} variant="primary">
        {accion}
      </WhatsAppButton>
    </section>
  );
}
