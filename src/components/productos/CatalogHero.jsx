import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue } from 'framer-motion';
import CornerMarks from '../primitives/CornerMarks';
import { useElementSize } from '../primitives/useElementSize';
import Alzado, { DRAW_S } from './Alzado';
import LaminaIndex from './LaminaIndex';
import PencilMark from './PencilMark';
import Rotulo from './Rotulo';
import { LAMINAS } from '../../data/alzados';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { ease, reducedTransition, useMotionSafe } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './CatalogHero.module.css';

/* ==========================================================================
   Hero de /productos: presenta, nunca filtra (la grilla solo cambia con la barra y el drawer).
   Recorre las láminas en loop: borrado 250ms + dibujo ~900ms (Alzado) + ~3s de permanencia.
   El timer arranca cuando una lámina EMPIEZA a dibujarse (onDrawStart): título, cajetín y
   acción se sincronizan con lo que de verdad se ve, no con cada click de una ráfaga.
   El ciclo corre siempre, sin control de pausa. Solo espera, sin indicador visual:
   fuera de viewport y con la pestaña oculta (rendimiento; sigue donde estaba), y con el
   puntero o el foco sobre la acción "Pedí…" (para que no cambie de mueble antes del click).
   ‹ ›, swipe e índice saltan de lámina y reinician el progreso, sin pausar.
   Reduced motion: sin autoplay; primera lámina y controles manuales con crossfade.
   ========================================================================== */

const N = LAMINAS.length;
const DWELL_S = 3;
const SWIPE_PX = 60;

function usePageVisible() {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

/* ---------- título: "Cada [palabra] / empieza en un plano" ---------- */

const palabraV = {
  enter: { y: '100%' },
  show: { y: '0%', transition: { duration: 0.45, ease: ease.softClose } },
  exit: { y: '-100%', transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};
const palabraReducida = {
  enter: { opacity: 0 },
  show: { opacity: 1, transition: reducedTransition },
  exit: { opacity: 0, transition: reducedTransition },
};

function Palabra({ palabra, onMeasure, variants }) {
  const ref = useRef(null);
  const { width } = useElementSize(ref);
  useLayoutEffect(() => {
    if (width) onMeasure(width);
  }, [width, onMeasure]);
  return (
    <motion.span ref={ref} className={styles.palabra} variants={variants} initial="enter" animate="show" exit="exit">
      {palabra}
    </motion.span>
  );
}

function Titulo({ palabra }) {
  const { reduce } = useMotionSafe();
  const [ancho, setAncho] = useState(0);
  return (
    // El lector de pantalla lee siempre el texto estático; lo animado va aria-hidden, así no
    // se anuncia cada lámina.
    <h1 className={styles.title}>
      <span className="sr-only">Cada mueble empieza en un plano</span>
      <span aria-hidden="true">
        <span className={styles.linea1}>
          Cada{' '}
          <span className={styles.slot}>
            {/* Máscara: una sola línea de alto fijo; la palabra cambia sin mover la línea 2. */}
            <span className={styles.mascara}>
              <AnimatePresence initial={false}>
                <Palabra key={palabra} palabra={palabra} onMeasure={setAncho} variants={reduce ? palabraReducida : palabraV} />
              </AnimatePresence>
            </span>
            <AnimatePresence>
              <PencilMark key={palabra} word={palabra} width={ancho} className={styles.lapiz} />
            </AnimatePresence>
          </span>
        </span>
        <span className={styles.linea2}>empieza en un plano</span>
      </span>
    </h1>
  );
}

/* ---------- acción: siempre "Pedí [artículo] [mueble] a medida" → WhatsApp ---------- */

const accion = (lamina) => ({
  label: `Pedí ${lamina.pedido} a medida`,
  href: buildWhatsAppUrl({ tipo: `${lamina.categoria} a medida`, sinDatos: null }),
});

const Flecha = ({ d }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function CatalogHero() {
  const isMobile = useIsMobile(760);
  const { reduce } = useMotionSafe();
  const autoplay = !reduce;

  const heroRef = useRef(null);
  const inView = useInView(heroRef, { amount: 0.25 });
  const pageVisible = usePageVisible();

  const [target, setTarget] = useState(0); // lámina pedida
  const [shown, setShown] = useState(0); // lámina que se está dibujando
  const [holdAccion, setHoldAccion] = useState({ hover: false, focus: false });
  // El cajetín se anuncia solo cuando el cambio de lámina es manual; el ciclo automático no.
  const [live, setLive] = useState('off');

  const paused = !inView || !pageVisible || holdAccion.hover || holdAccion.focus;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Timer del ciclo: la misma MotionValue alimenta la línea de progreso del cajetín.
  // Nunca se crea una animación ya pausada (play() no la arranca de forma confiable): si la
  // lámina empieza con el ciclo en pausa, el arranque queda pendiente hasta reanudar.
  const progress = useMotionValue(0);
  const timer = useRef(null);
  const pending = useRef(false);
  const run = useCallback(() => {
    timer.current = animate(progress, 1, {
      duration: (DRAW_S + DWELL_S) * (1 - progress.get()),
      ease: 'linear',
      onComplete: () => {
        setLive('off');
        setTarget((t) => (t + 1) % N);
      },
    });
  }, [progress]);
  const startTimer = useCallback(() => {
    timer.current?.stop();
    timer.current = null;
    progress.set(0);
    if (!autoplay) return;
    pending.current = pausedRef.current;
    if (!pending.current) run();
  }, [autoplay, progress, run]);

  useEffect(() => {
    if (paused) {
      timer.current?.pause();
    } else if (pending.current) {
      pending.current = false;
      run();
    } else {
      timer.current?.play();
    }
  }, [paused, run]);
  useEffect(() => () => timer.current?.stop(), []);

  const onDrawStart = useCallback(
    (categoria) => {
      setShown(LAMINAS.findIndex((l) => l.categoria === categoria));
      startTimer();
    },
    [startTimer]
  );

  // Interacción manual (‹ ›, swipe, índice): salta y reinicia el progreso, sin pausar.
  const go = useCallback(
    (i) => {
      setLive('polite');
      const next = (i + N) % N;
      if (next === target) {
        startTimer();
        return;
      }
      timer.current?.stop();
      progress.set(0);
      setTarget(next);
    },
    [target, startTimer, progress]
  );

  const lamina = LAMINAS[shown];
  const act = accion(lamina);

  const rotulo = (
    <Rotulo
      lamina={lamina}
      n={shown + 1}
      total={N}
      progress={autoplay ? progress : null}
      live={live}
      compact={isMobile}
      onPrev={() => go(target - 1)}
      onNext={() => go(target + 1)}
    />
  );

  const fade = reduce ? reducedTransition : { duration: 0.15, ease: 'linear' };
  const accionEl = (
    <div
      className={styles.accion}
      onPointerEnter={() => setHoldAccion((h) => ({ ...h, hover: true }))}
      onPointerLeave={() => setHoldAccion((h) => ({ ...h, hover: false }))}
      onFocus={() => setHoldAccion((h) => ({ ...h, focus: true }))}
      onBlur={() => setHoldAccion((h) => ({ ...h, focus: false }))}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={act.label} className={styles.accionSlot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade}>
          <a className={styles.accionLink} href={act.href} target="_blank" rel="noopener noreferrer">
            {act.label}
            <Flecha d="M5 11 11 5M6 5h5v5" />
          </a>
        </motion.span>
      </AnimatePresence>
    </div>
  );

  return (
    <header ref={heroRef} className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <Titulo palabra={lamina.palabra} />
          <p className={styles.lead}>
            Cada pieza se fabrica a medida de tu espacio. Si no está acá, la diseñamos con vos.
          </p>
        </div>

        {!isMobile && accionEl}
        {!isMobile && (
          <div className={styles.index}>
            <LaminaIndex laminas={LAMINAS} active={target} onSelect={go} />
          </div>
        )}

        <motion.div
          className={styles.plano}
          role="group"
          aria-roledescription="lámina"
          aria-label={`${shown + 1} de ${N}: ${lamina.nombre}`}
          // Mobile: swipe horizontal sobre el alzado (el scroll vertical sigue siendo de la página).
          drag={isMobile ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.x <= -SWIPE_PX) go(target + 1);
            else if (info.offset.x >= SWIPE_PX) go(target - 1);
          }}
          style={isMobile ? { touchAction: 'pan-y' } : undefined}
        >
          <span className={styles.grilla} aria-hidden="true" />
          <CornerMarks size="18px" />
          <div className={styles.dibujo}>
            <Alzado categoria={LAMINAS[target].categoria} parciales={!isMobile} onDrawStart={onDrawStart} className={styles.alzado} />
          </div>
          {!isMobile && <div className={styles.rotuloDesktop}>{rotulo}</div>}
        </motion.div>

        {isMobile && <div className={styles.rotuloMobile}>{rotulo}</div>}
        {isMobile && accionEl}
      </div>
    </header>
  );
}
