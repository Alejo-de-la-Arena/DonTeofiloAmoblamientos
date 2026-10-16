import styles from './CornerMarks.module.css';

/**
 * Marcas de esquina de plano: escuadras en L en las esquinas del contenedor (que tiene que
 * ser position: relative). Decorativas, aria-hidden. Todavía duplicadas a mano en Contacto; al
 * migrar esa página, reemplazarlas por esta primitiva.
 *
 * corners: subconjunto de ['tl', 'tr', 'bl', 'br']
 * tone: 'ink' | 'accent' | 'light'
 * size / inset: largo de cada brazo y distancia al borde (cualquier longitud CSS)
 */
export default function CornerMarks({ corners = ['tl', 'tr', 'bl', 'br'], tone = 'ink', size = '22px', inset = '0px', className = '' }) {
  return (
    <span className={`${styles.marks} ${styles[tone]} ${className}`.trim()} style={{ '--cm-size': size, '--cm-inset': inset }} aria-hidden="true">
      {corners.map((c) => (
        <span key={c} className={`${styles.mark} ${styles[c]}`} />
      ))}
    </span>
  );
}
