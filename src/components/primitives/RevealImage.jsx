import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { dur, ease, useMotionSafe } from '../../lib/motion';
import styles from './RevealImage.module.css';

// Desde dónde se descubre la imagen: el lado opuesto arranca recortado al 100%.
const HIDDEN_CLIP = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
};
const SHOWN_CLIP = 'inset(0% 0% 0% 0%)';

/**
 * Imagen que se revela con clip-path al entrar en viewport, una sola vez, con un leve
 * scale 1.06 → 1 en la imagen interna. El contenedor reserva el aspect ratio (sin CLS).
 *
 * sources: [{ srcSet, media?, type? }] opcional → arma un <picture> (ej. mobile/desktop).
 * loading: 'lazy' (default: se pide a ~800px del viewport) | 'eager' (se pide al montar).
 */
export default function RevealImage({
  src,
  alt,
  sizes,
  srcSet,
  sources,
  loading = 'lazy',
  aspectRatio = '4 / 3',
  direction = 'up',
  delay = 0,
  className = '',
  imgClassName = '',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  // La carga diferida la decide el marco (sin recorte), no el loading="lazy" nativo: la imagen
  // vive dentro de una máscara con clip-path inset(…100%) + opacity 0, y Chrome no la considera
  // visible hasta que empieza el reveal (que entonces descubría un marco vacío).
  const near = useInView(ref, { once: true, margin: '0px 0px 800px 0px' });
  const load = loading === 'eager' || near;
  const { reduce, variants: safe } = useMotionSafe();

  const maskV = safe({
    hidden: { clipPath: HIDDEN_CLIP[direction] ?? HIDDEN_CLIP.up, opacity: 0 },
    show: {
      clipPath: SHOWN_CLIP,
      opacity: 1,
      transition: {
        clipPath: { duration: dur.lg + 0.2, ease: ease.softClose, delay },
        opacity: { duration: 0.01, delay },
      },
    },
  });
  const imgV = {
    hidden: { scale: 1.06 },
    show: { scale: 1, transition: { duration: dur.lg + 0.6, ease: ease.softClose, delay } },
  };
  const state = inView ? 'show' : 'hidden';

  const img = (
    <motion.img
      className={`${styles.img} ${imgClassName}`.trim()}
      src={load ? src : undefined}
      srcSet={load ? srcSet : undefined}
      sizes={sizes}
      alt={alt}
      decoding="async"
      variants={reduce ? undefined : imgV}
      initial={reduce ? false : 'hidden'}
      animate={reduce ? undefined : state}
    />
  );

  return (
    <div ref={ref} className={`${styles.frame} ${className}`.trim()} style={{ aspectRatio }}>
      <motion.div className={styles.mask} variants={maskV} initial="hidden" animate={state}>
        {sources?.length ? (
          <picture>
            {sources.map((s) => (
              <source key={s.srcSet} srcSet={load ? s.srcSet : undefined} media={s.media} type={s.type} />
            ))}
            {img}
          </picture>
        ) : (
          img
        )}
      </motion.div>
    </div>
  );
}
