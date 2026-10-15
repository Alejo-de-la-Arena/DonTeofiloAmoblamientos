import { AnimatePresence, motion } from 'framer-motion';
import { dur, ease, useMotionSafe } from '../../lib/motion';
import styles from './AnimatedCount.module.css';

// Número que cambia con un crossfade vertical corto: el viejo sale hacia arriba, el nuevo
// entra desde abajo. Cifras tabulares para que el ancho no salte. El lector de pantalla lee
// solo el texto oculto (el par animado está aria-hidden, así no se anuncian dos números).
export default function AnimatedCount({ value }) {
  const { reduce } = useMotionSafe();
  const t = { duration: dur.xs, ease: ease.settle };

  return (
    <span className={styles.count}>
      <span className={`${styles.window} tabular`} aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.b
            key={value}
            className={styles.digit}
            initial={reduce ? false : { y: '60%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1, transition: t }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: '-60%', opacity: 0, transition: t }}
          >
            {value}
          </motion.b>
        </AnimatePresence>
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
