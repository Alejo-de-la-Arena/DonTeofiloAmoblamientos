import { motion } from 'framer-motion';
import styles from './Rotulo.module.css';

const mmFormat = new Intl.NumberFormat('es-AR');
const medidas = (l) => `${mmFormat.format(l.ancho)} × ${mmFormat.format(l.alto)} mm`;

function Icon({ d }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/**
 * Rótulo de plano (cajetín) de la lámina que se está dibujando, con la línea de progreso del
 * ciclo y las flechas. `progress` es la MotionValue 0–1 del timer (null sin autoplay: sin
 * línea). `compact` (mobile): una sola línea "3/6 · nombre · medidas".
 * El texto es una región aria-live: "off" mientras el ciclo corre solo (no se anuncia cada
 * lámina), "polite" cuando se navega a mano (flechas, swipe o índice).
 */
export default function Rotulo({ lamina, n, total, progress, live, onPrev, onNext, compact = false }) {
  return (
    <div className={`${styles.rotulo} ${compact ? styles.compact : ''}`.trim()}>
      <div className={styles.texto} aria-live={live} aria-atomic="true">
        {compact ? (
          <p className={`${styles.linea} tabular`}>
            <span className="sr-only">Lámina </span>
            {n}/{total} · {lamina.nombre} · {medidas(lamina)}
          </p>
        ) : (
          <>
            <p className={`${styles.num} tabular`}>
              Lámina {n} de {total}
            </p>
            <p className={styles.nombre}>{lamina.nombre}</p>
            <p className={`${styles.medidas} tabular`}>{medidas(lamina)}</p>
          </>
        )}
      </div>

      <div className={styles.controles}>
        <span className={styles.pista} aria-hidden="true">
          {progress && <motion.span className={styles.progreso} style={{ scaleX: progress }} />}
        </span>
        <button type="button" className={styles.btn} onClick={onPrev} aria-label="Lámina anterior">
          <Icon d="M10 3.5 5.5 8l4.5 4.5" />
        </button>
        <button type="button" className={styles.btn} onClick={onNext} aria-label="Lámina siguiente">
          <Icon d="M6 3.5 10.5 8 6 12.5" />
        </button>
      </div>
    </div>
  );
}
