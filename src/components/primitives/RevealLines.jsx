import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { lineMask, useMotionSafe } from '../../lib/motion';
import styles from './RevealLines.module.css';

/**
 * Título con máscara por línea: cada línea sube de y:100% a 0 dentro de su propia máscara,
 * escalonadas 80ms. Las líneas se pasan explícitas (lines={["Cocinas que", "se arman acá"]}):
 * sin auto-split por JS, el corte es siempre el que se diseñó.
 *
 * Un único heading semántico (`as`). El lector de pantalla lee el texto completo de un
 * span visualmente oculto; las líneas animadas van aria-hidden.
 */
export default function RevealLines({
  lines,
  as: Tag = 'h2',
  draw = 'view',
  delay = 0,
  className = '',
  lineClassName = '',
  id,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const { variants: safe } = useMotionSafe();
  const variants = safe(lineMask);

  let animate = inView ? 'show' : 'hidden';
  if (draw === 'mount') animate = 'show';
  const initial = draw === 'none' ? false : 'hidden';

  return (
    <Tag ref={ref} id={id} className={`${styles.root} ${className}`.trim()}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, i) => (
        <span key={i} className={`${styles.line} ${lineClassName}`.trim()} aria-hidden="true">
          <motion.span
            className={styles.inner}
            variants={variants}
            custom={{ i, delay }}
            initial={initial}
            animate={draw === 'none' ? 'show' : animate}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
