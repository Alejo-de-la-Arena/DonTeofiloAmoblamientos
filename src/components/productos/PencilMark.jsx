import { motion } from 'framer-motion';
import { ease, useMotionSafe } from '../../lib/motion';
import styles from './PencilMark.module.css';

/* Marca de lápiz de carpintero bajo una palabra: un trazo ancho y plano, levemente irregular,
   con una segunda pasada más fina y desfasada que le da textura. Todo sale del ancho de la
   palabra y de una semilla derivada de la palabra misma: la misma palabra da siempre el mismo
   trazo (nada aleatorio por render). */

const H = 14; // alto del SVG (px)
const OVER = 6; // el trazo se pasa un poco de la palabra, como a mano

// FNV-1a → mulberry32: PRNG determinístico a partir de la palabra.
function rng(word) {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) {
    h ^= word.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

// Curva suave por puntos irregulares: Q por cada punto, terminando en el punto medio siguiente.
function trazo(rand, { x0, x1, y, inclinacion, amplitud }) {
  const pasos = Math.max(3, Math.round((x1 - x0) / 26));
  const pts = Array.from({ length: pasos + 1 }, (_, i) => {
    const t = i / pasos;
    return [x0 + (x1 - x0) * t, y + inclinacion * t + (rand() * 2 - 1) * amplitud];
  });
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [mx, my] = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += ` Q ${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${f(last[0])} ${f(last[1])}`;
}

function pencilPaths(word, width) {
  const rand = rng(word);
  const inclinacion = (rand() * 2 - 1) * 1.6;
  const ancho = width + OVER * 2;
  return {
    ancho,
    principal: trazo(rand, { x0: 3, x1: ancho - 3 - rand() * 4, y: H / 2, inclinacion, amplitud: 0.9 }),
    pasada: trazo(rand, {
      x0: ancho * (0.06 + rand() * 0.08),
      x1: ancho * (0.82 + rand() * 0.1),
      y: H / 2 + 2.2,
      inclinacion: inclinacion * 0.7,
      amplitud: 0.7,
    }),
  };
}

/** delay: segundos hasta empezar a dibujar (la palabra ya entró). Se borra al salir. */
export default function PencilMark({ word, width, delay = 0.3, className = '' }) {
  const { reduce } = useMotionSafe();
  if (!(width > 0)) return null;
  const { ancho, principal, pasada } = pencilPaths(word, width);

  const draw = (extra, duration) =>
    reduce
      ? { initial: false, animate: { pathLength: 1 }, exit: { opacity: 0, transition: { duration: 0.15 } } }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1, transition: { duration, delay: delay + extra, ease: ease.softClose } },
          exit: { pathLength: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
        };

  return (
    <motion.svg
      className={`${styles.mark} ${className}`.trim()}
      width={ancho}
      height={H}
      viewBox={`0 0 ${ancho} ${H}`}
      style={{ left: -OVER }}
      aria-hidden="true"
      // El svg sale con los trazos (borrado + fundido): AnimatePresence espera a este exit.
      exit={{ opacity: 0, transition: { duration: 0.22, ease: 'linear' } }}
    >
      <motion.path d={principal} className={styles.principal} {...draw(0, 0.45)} />
      <motion.path d={pasada} className={styles.pasada} {...draw(0.12, 0.4)} />
    </motion.svg>
  );
}
