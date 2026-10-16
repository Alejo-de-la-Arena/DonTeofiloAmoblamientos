import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, animate, motion, useInView, useMotionValue } from 'framer-motion';
import SlidingDoors from '../primitives/SlidingDoors';
import RevealLines from '../primitives/RevealLines';
import Cota from '../primitives/Cota';
import {
  drawerIn,
  dur,
  ease,
  reducedTransition,
  routeDoorsLeg,
  useMotionSafe,
} from '../../lib/motion';
import { useRouteEntry } from '../layout/routeEntry';
import { HERO_SLIDES } from '../../data/heroSlides';
import styles from './Hero.module.css';

const INTERVAL = 6; // segundos por slide
const MOBILE_MQ = '(max-width: 640px)';
const TITLE_LINES = ['Medimos dos veces,', 'cortamos una.'];
const count = HERO_SLIDES.length;
const pad = (n) => String(n).padStart(2, '0');

// Precarga la imagen del slide siguiente con el mismo srcset/sizes que va a usar el <picture>,
// así el navegador elige el mismo candidato y al cambiar ya está decodificada (sin flash).
// Nunca bloquea más de 2.5s: con red lenta el ciclo sigue igual.
function preload(slide) {
  return new Promise((resolve) => {
    const img = new Image();
    img.sizes = '100vw';
    img.srcset = window.matchMedia(MOBILE_MQ).matches ? slide.imagen.mobile : slide.imagen.desktop;
    img.src = slide.imagen.src;
    const timer = setTimeout(resolve, 2500);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    if (img.decode) img.decode().then(done, done);
    else img.onload = img.onerror = done;
  });
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

// Salida de la ficha: corta y en la dirección opuesta a la entrada.
const fichaV = {
  ...drawerIn,
  exit: (dir = 1) => ({
    opacity: 0,
    x: -14 * dir,
    transition: { duration: dur.xs, ease: ease.settle },
  }),
};

function Ficha({ slide, dir, reduce }) {
  const { variants: safe } = useMotionSafe();
  const rows = [
    ['Ubicación', slide.ubicacion],
    ['Material', slide.material],
  ].filter(([, v]) => v);

  return (
    <AnimatePresence mode="wait" initial={false} custom={dir}>
      <motion.div
        key={slide.id}
        className={styles.fichaBody}
        variants={safe(fichaV)}
        custom={dir}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <p className={styles.fichaCat}>{slide.categoria}</p>
        {rows.length > 0 && (
          <dl className={styles.fichaRows}>
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {slide.medida && (
          <Cota
            label={slide.medida}
            tone="light"
            draw={reduce ? 'none' : 'mount'}
            informative
            className={styles.fichaCota}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Hero() {
  const entry = useRouteEntry();
  const { reduce } = useMotionSafe();
  // Intro propia (puertas cerradas que abren) solo en la primera carga del documento. Si se
  // llegó por una transición de ruta, las puertas de ruta ya hicieron el reveal; al volver
  // con atrás/adelante (pop) no hay intro.
  const intro = entry === 'initial' && !reduce;
  const animated = entry !== 'pop' && !reduce;
  // Lo único que entra animado es el título, apenas empiezan a abrir las puertas. Bajada, CTA
  // y ficha están presentes desde el primer frame: la bajada es el LCP de la página y no
  // debe esperar a ninguna animación.
  const titleDelay = intro ? 0.2 : routeDoorsLeg + 0.05;

  const sectionRef = useRef(null);
  const fichaRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.25 });
  const pageVisible = usePageVisible();

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [doorsOpen, setDoorsOpen] = useState(!intro);
  const [switching, setSwitching] = useState(intro); // durante la intro no corre el autoplay
  const [userPaused, setUserPaused] = useState(false);
  const [fichaHold, setFichaHold] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const pendingIndex = useRef(0);
  const firstImage = useRef(true);
  const progress = useMotionValue(0);

  // Intro: el estado inicial se pinta con las puertas cerradas y en el frame siguiente abren.
  useEffect(() => {
    if (!intro) return;
    const raf = requestAnimationFrame(() => setDoorsOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [intro]);

  const goTo = useCallback(
    async (target, direction, manual) => {
      if (switching) return;
      const next = (target + count) % count;
      if (manual) setAnnounce(true);
      setDir(direction);
      firstImage.current = false;
      if (reduce) {
        setIndex(next); // crossfade corto vía AnimatePresence
        return;
      }
      setSwitching(true);
      progress.set(0);
      await preload(HERO_SLIDES[next]);
      pendingIndex.current = next;
      setDoorsOpen(false);
    },
    [switching, reduce, progress]
  );

  // Con las puertas cerradas se cambia la imagen; un frame después (ya montada) abren.
  const handleClosed = useCallback(() => {
    setIndex(pendingIndex.current);
    requestAnimationFrame(() => setDoorsOpen(true));
  }, []);
  const handleOpened = useCallback(() => setSwitching(false), []);

  // Autoplay: la línea de progreso es la fuente de verdad del intervalo. Al pausar se detiene
  // donde está y al reanudar sigue desde ahí.
  const running = !reduce && !userPaused && !fichaHold && inView && pageVisible && !switching;
  useEffect(() => {
    if (!running) return;
    const controls = animate(progress, 1, {
      duration: (1 - progress.get()) * INTERVAL,
      ease: 'linear',
      onComplete: () => goTo(index + 1, 1, false),
    });
    return () => controls.stop();
  }, [running, index, goTo, progress]);

  const slide = HERO_SLIDES[index];
  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      aria-roledescription="carrusel"
      aria-label="Trabajos a medida"
    >
      <div className={styles.media}>
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className={styles.picture}
            initial={reduce ? { opacity: 0 } : false}
            animate={{ opacity: 1, transition: reduce ? reducedTransition : { duration: 0 } }}
            exit={{ opacity: 0, transition: reduce ? reducedTransition : { duration: 0 } }}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${index + 1} de ${count}`}
          >
            <picture>
              <source
                media={MOBILE_MQ}
                srcSet={slide.imagen.mobile}
                sizes="100vw"
                type="image/webp"
              />
              <motion.img
                className={styles.img}
                srcSet={slide.imagen.desktop}
                sizes="100vw"
                src={slide.imagen.src}
                alt={slide.alt}
                decoding="async"
                {...(index === 0 && firstImage.current
                  ? { fetchpriority: 'high', loading: 'eager' }
                  : {})}
                initial={animated || !firstImage.current ? { scale: reduce ? 1 : 1.08 } : false}
                animate={{ scale: 1, transition: { duration: 1.2, ease: ease.softClose } }}
              />
            </picture>
          </motion.div>
        </AnimatePresence>
        <div className={styles.scrim} aria-hidden="true" />
        {!reduce && (
          <SlidingDoors
            open={doorsOpen}
            panels={3}
            tone="madera"
            onCloseComplete={handleClosed}
            onOpenComplete={handleOpened}
          />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.copy}>
          <RevealLines
            as="h1"
            lines={TITLE_LINES}
            draw={animated ? 'mount' : 'none'}
            delay={titleDelay}
            className={styles.title}
          />
          <p className={styles.lead}>
            Cocinas, placards, vanitorys y aberturas a medida, hechos en nuestro taller desde 2011.
          </p>
          <div className={styles.ctas}>
            <Link to="/contacto" className={styles.cta}>
              Pedí tu presupuesto
            </Link>
            <Link to="/proyectos" className={styles.link}>
              Ver proyectos
            </Link>
          </div>
        </div>

        <div
          ref={fichaRef}
          className={styles.ficha}
          onPointerEnter={() => setFichaHold(true)}
          onPointerLeave={() => setFichaHold(false)}
          onFocus={() => setFichaHold(true)}
          onBlur={(e) => {
            if (!fichaRef.current?.contains(e.relatedTarget)) setFichaHold(false);
          }}
        >
          <Ficha slide={slide} dir={dir} reduce={reduce} />

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.ctrl}
              onClick={() => goTo(index - 1, -1, true)}
              aria-label="Imagen anterior"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.ctrl}
              onClick={() => goTo(index + 1, 1, true)}
              aria-label="Imagen siguiente"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            {!reduce && (
              <button
                type="button"
                className={styles.ctrl}
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? 'Reanudar presentación' : 'Pausar presentación'}
              >
                {userPaused ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5l11 7-11 7z" className={styles.fill} />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 5v14M15 5v14" />
                  </svg>
                )}
              </button>
            )}
            <span className={`${styles.counter} tabular`} aria-hidden="true">
              {pad(index + 1)} / {pad(count)}
            </span>
            {!reduce && (
              <span className={styles.track} aria-hidden="true">
                <motion.span className={styles.fillLine} style={{ scaleX: progress }} />
              </span>
            )}
          </div>
          <p className="sr-only" aria-live={announce ? 'polite' : 'off'} aria-atomic="true">
            {`Imagen ${index + 1} de ${count}: ${slide.categoria}`}
          </p>
        </div>
      </div>
    </section>
  );
}
