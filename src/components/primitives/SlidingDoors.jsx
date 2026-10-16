import { motion } from 'framer-motion';
import { doorOpen, dur, reducedTransition, useMotionSafe } from '../../lib/motion';
import styles from './SlidingDoors.module.css';

/**
 * Overlay de N puertas corredizas. `open` = puertas abiertas (overlay invisible, deja ver lo
 * de abajo); `open={false}` = puertas cerradas (tapan todo).
 *
 * Cada panel escala sobre su eje con transform-origin alternado según el índice: los pares
 * corren hacia un lado y los impares hacia el otro, como hojas de un placard. Stagger 60ms,
 * ease `door`. Con reduced motion: un único overlay que hace crossfade de opacidad.
 */
export default function SlidingDoors({
  open,
  panels = 3,
  axis = 'x',
  tone = 'madera',
  duration = dur.door,
  step,
  className = '',
  onOpenComplete,
  onCloseComplete,
}) {
  const { reduce } = useMotionSafe();
  const done = () => (open ? onOpenComplete?.() : onCloseComplete?.());
  const rootClass = `${styles.doors} ${styles[axis]} ${styles[tone]} ${open ? styles.isOpen : ''} ${className}`.trim();

  if (reduce) {
    return (
      <div className={rootClass} aria-hidden="true">
        <motion.div
          className={styles.fade}
          initial={false}
          animate={{ opacity: open ? 0 : 1 }}
          transition={reducedTransition}
          onAnimationComplete={done}
        />
      </div>
    );
  }

  const last = panels - 1;
  return (
    <div className={rootClass} aria-hidden="true">
      {Array.from({ length: panels }, (_, i) => {
        // Al abrir arranca el primer panel; al cerrar, el último — así la secuencia se lee
        // como un mismo gesto que va y vuelve.
        const order = open ? i : last - i;
        const origin = i % 2 === 0 ? 'start' : 'end';
        return (
          <motion.div
            key={i}
            className={`${styles.panel} ${styles[origin]}`}
            variants={doorOpen}
            custom={{ i: order, axis, duration, step }}
            initial={false}
            animate={open ? 'open' : 'closed'}
            onAnimationComplete={i === (open ? last : 0) ? done : undefined}
          />
        );
      })}
    </div>
  );
}
