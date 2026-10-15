import CornerMarks from '../primitives/CornerMarks';
import WhatsAppButton from '../primitives/WhatsAppButton';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { categoriaEnSingular } from '../../data/productCategories';
import styles from './ProductCustomCard.module.css';

// Mensaje en primera persona con lo que la persona ya estaba buscando.
function mensaje(categoria, search) {
  const que = categoriaEnSingular(categoria);
  const q = search.trim();
  if (que && q) return `Hola, busco ${que} tipo "${q}". ¿Lo pueden diseñar a medida?`;
  if (que) return `Hola, busco ${que} a medida para mi espacio. ¿Me pasan info?`;
  if (q) return `Hola, busco "${q}". ¿Lo pueden diseñar a medida?`;
  return 'Hola, busco un mueble a medida que no está en el catálogo. ¿Me pasan info?';
}

/** Última celda fija de la grilla: hoja de plano en blanco, invitación a diseñar a medida. */
export default function ProductCustomCard({ categoria, search }) {
  return (
    <aside className={styles.card} aria-labelledby="catalogo-a-medida">
      <span className={styles.grid} aria-hidden="true" />
      <CornerMarks size="26px" />
      <div className={styles.body}>
        <h3 id="catalogo-a-medida" className={styles.title}>
          ¿No está lo que buscás?
        </h3>
        <p className={styles.lead}>Lo diseñamos a la medida de tu espacio</p>
        <WhatsAppButton variant="dark" href={buildWhatsAppUrl({ mensaje: mensaje(categoria, search) })}>
          Escribinos por WhatsApp
        </WhatsAppButton>
      </div>
    </aside>
  );
}
