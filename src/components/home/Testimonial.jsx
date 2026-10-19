import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import RevealImage from '../primitives/RevealImage';
import SlidingDoors from '../primitives/SlidingDoors';
import { drawerIn, dur, ease, useMotionSafe } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { TESTIMONIOS } from '../../data/testimonials';
import { SERVICIOS } from '../../data/servicios';
import { GOOGLE_RATING, GOOGLE_REVIEWS_URL } from '../../config/contact';
import styles from './Testimonial.module.css';

const total = TESTIMONIOS.length;
const SWIPE_PX = 60;
const SWIPE_VELOCITY = 400;

// Foto del proyecto del cliente o, si no hay, la de su categoría.
function imagenDe(t) {
  if (t.imagen) return t.imagen;
  const s = SERVICIOS.find((x) => x.categoria === t.categoria);
  return { src: s.imagen.src, srcSet: s.imagen.srcSet, alt: s.alt };
}

const citaV = {
  ...drawerIn,
  exit: (dir = 1) => ({ opacity: 0, x: -16 * dir, transition: { duration: dur.xs, ease: ease.settle } }),
};

function GoogleBadge() {
  if (!GOOGLE_REVIEWS_URL) return null;
  return (
    <a
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.badge}
      aria-label={GOOGLE_RATING != null ? `Reseñas en Google: ${String(GOOGLE_RATING).replace('.', ',')} de 5` : undefined}
    >
      {GOOGLE_RATING != null && (
        <>
          <span className={styles.stars} aria-hidden="true">
            ★★★★★
          </span>
          <span className={`${styles.rating} tabular`}>{String(GOOGLE_RATING).replace('.', ',')}</span>
        </>
      )}
      <span>Reseñas en Google</span>
    </a>
  );
}

export default function Testimonial() {
  const { reduce, variants: safe } = useMotionSafe();
  const isMobile = useIsMobile(1023);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [doorsOpen, setDoorsOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const pending = useRef(0);

  const t = TESTIMONIOS[index];
  const img = imagenDe(t);

  // Cambio: la foto se tapa con las puertas, se cambia y se abre; la cita cambia con un
  // crossfade + desplazamiento corto. Sin autoplay.
  function go(step) {
    if (busy) return;
    const next = (index + step + total) % total;
    setDir(step);
    if (reduce) {
      setIndex(next);
      return;
    }
    pending.current = next;
    setBusy(true);
    setDoorsOpen(false);
  }

  function handleClosed() {
    setIndex(pending.current);
    requestAnimationFrame(() => setDoorsOpen(true));
  }

  // Swipe en mobile: umbral de 60px o por velocidad. touch-action: pan-y deja libre el scroll
  // vertical; el drag solo toma el gesto horizontal.
  function handleDragEnd(_, info) {
    if (info.offset.x < -SWIPE_PX || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_PX || info.velocity.x > SWIPE_VELOCITY) go(-1);
  }
  const dragProps = isMobile
    ? { drag: 'x', dragConstraints: { left: 0, right: 0 }, dragElastic: 0.18, dragSnapToOrigin: true, onDragEnd: handleDragEnd }
    : {};

  return (
    <section className={styles.section} aria-labelledby="testimonio-title" aria-roledescription="carrusel">
      <div className={styles.head}>
        <h2 id="testimonio-title" className={styles.title}>
          Lo que dicen nuestros clientes
        </h2>
      </div>

      <motion.div className={styles.grid} style={{ touchAction: 'pan-y' }} {...dragProps}>
        <div className={styles.media}>
          <RevealImage src={img.src} srcSet={img.srcSet} sizes="(min-width: 1024px) 40vw, 100vw" alt={img.alt} aspectRatio="4 / 5" direction="up" />
          {!reduce && (
            <SlidingDoors open={doorsOpen} panels={3} tone="madera" duration={dur.sm} onCloseComplete={handleClosed} onOpenComplete={() => setBusy(false)} />
          )}
        </div>

        <div className={styles.body}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.figure key={t.id} className={styles.figure} variants={safe(citaV)} custom={dir} initial="hidden" animate="show" exit="exit">
              <blockquote className={styles.quote}>
                <p>{t.cita}</p>
              </blockquote>
              <figcaption className={styles.caption}>
                <span className={styles.name}>{t.nombre}</span>
                <span className={styles.meta}>
                  {t.proyecto}, {t.ubicacion}
                </span>
                {t.proyectoSlug && (
                  <Link to={`/proyectos/${t.proyectoSlug}`} className={styles.projectLink}>
                    Ver el proyecto
                  </Link>
                )}
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <div className={styles.controls}>
            <button type="button" className={styles.ctrl} onClick={() => go(-1)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              Anterior
            </button>
            <span className={`${styles.counter} tabular`} aria-live="polite">
              {index + 1} de {total}
            </span>
            <button type="button" className={styles.ctrl} onClick={() => go(1)}>
              Siguiente
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          <GoogleBadge />
        </div>
      </motion.div>
    </section>
  );
}
