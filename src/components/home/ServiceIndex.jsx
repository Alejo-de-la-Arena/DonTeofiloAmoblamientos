import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import RevealImage from '../primitives/RevealImage';
import { drawerIn, dur, ease, reducedTransition, useMotionSafe } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { SERVICIOS } from '../../data/servicios';
import styles from './ServiceIndex.module.css';

const href = (s) => `/productos?categoria=${s.slug}`;
const SHOWN = 'inset(0% 0% 0% 0%)';
// Si el índice sube (fila de más abajo) la imagen se descubre de abajo hacia arriba; si baja,
// de arriba hacia abajo: acompaña la dirección en que se movió el puntero.
const FROM = { 1: 'inset(100% 0% 0% 0%)', [-1]: 'inset(0% 0% 100% 0%)' };

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.arrow} aria-hidden="true">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

/* ---------- desktop: lista + marco sticky ---------- */
function DesktopIndex() {
  const { reduce } = useMotionSafe();
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const [dir, setDir] = useState(1);

  function activate(i) {
    if (i === active) return;
    setPrev(active);
    setDir(i > active ? 1 : -1);
    setActive(i);
  }

  const current = SERVICIOS[active];

  return (
    <div className={styles.desktop}>
      {/* Al salir de la lista no se resetea: queda activa la última fila. */}
      <ol className={styles.list}>
        {SERVICIOS.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.id} className={styles.row}>
              <Link
                to={href(s)}
                className={`${styles.rowLink} ${on ? styles.on : ''}`}
                onMouseEnter={() => activate(i)}
                onFocus={() => activate(i)}
              >
                <motion.span
                  className={styles.rowInner}
                  initial={false}
                  animate={{ x: on && !reduce ? 8 : 0 }}
                  transition={{ duration: dur.md, ease: ease.softClose }}
                >
                  <span className={`${styles.num} tabular`}>{s.numero}</span>
                  <span className={styles.name}>{s.nombre}</span>
                  <span className={styles.desc}>{s.descripcion}</span>
                  <ArrowIcon />
                </motion.span>
                <motion.span
                  className={styles.rule}
                  initial={false}
                  animate={{ scaleX: on ? 1 : 0 }}
                  transition={reduce ? reducedTransition : { duration: dur.md, ease: ease.softClose }}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ol>

      <div className={styles.aside} aria-hidden="true">
        <div className={styles.frame}>
          {/* Capa de abajo: todas las imágenes montadas (quedan cargadas), visible solo la
              anterior. Arriba, la activa entra con clip-path en la dirección del movimiento. */}
          {SERVICIOS.map((s, i) => (
            <img
              key={s.id}
              className={`${styles.frameImg} ${i === prev ? styles.visible : ''}`}
              srcSet={s.imagen.srcSet}
              src={s.imagen.src}
              sizes="(min-width: 1440px) 520px, 36vw"
              alt=""
              loading="lazy"
              decoding="async"
            />
          ))}
          <motion.img
            key={current.id}
            className={`${styles.frameImg} ${styles.visible} ${styles.top}`}
            srcSet={current.imagen.srcSet}
            src={current.imagen.src}
            sizes="(min-width: 1440px) 520px, 36vw"
            alt=""
            decoding="async"
            initial={active === prev ? false : reduce ? { opacity: 0 } : { clipPath: FROM[dir] }}
            animate={reduce ? { opacity: 1, transition: reducedTransition } : { clipPath: SHOWN, transition: { duration: dur.lg, ease: ease.softClose } }}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- mobile: cajones que se abren solos con el scroll ---------- */
const GAP_MS = 120; // entre aperturas automáticas consecutivas
const BAND = '0px 0px -40% 0px'; // el encabezado cruza ~60% del viewport

const headerHeight = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;

// Descripción y link entran con drawerIn después de la altura y de la imagen.
const panelStagger = {
  hidden: {},
  show: { transition: { delayChildren: dur.md + 0.2, staggerChildren: 0.06 } },
};

function MobileItem({ s, isOpen, onToggle, onEnterBand, headRef, reduce }) {
  const { variants: safe } = useMotionSafe();
  const localRef = useRef(null);
  const inBand = useInView(localRef, { margin: BAND });
  const panelId = `servicio-panel-${s.id}`;
  const headId = `servicio-${s.id}`;

  useEffect(() => {
    if (inBand) onEnterBand();
  }, [inBand, onEnterBand]);

  const item = safe(drawerIn);
  return (
    <li className={styles.item}>
      <h3 className={styles.itemHead}>
        <button
          id={headId}
          ref={(el) => {
            localRef.current = el;
            headRef(el);
          }}
          type="button"
          className={styles.itemButton}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={`${styles.num} tabular`}>{s.numero}</span>
          <span className={styles.name}>{s.nombre}</span>
          <span className={`${styles.plus} ${isOpen ? styles.plusOpen : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headId}
            className={styles.panel}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={reduce ? { duration: 0 } : { duration: dur.md, ease: ease.softClose }}
          >
            <motion.div className={styles.panelInner} variants={panelStagger} initial="hidden" animate="show">
              {/* Se monta al abrir: se pide en ese momento (eager), con el aspect-ratio ya
                  reservado, así la altura final se conoce antes de que cargue. */}
              <RevealImage
                src={s.imagen.src}
                srcSet={s.imagen.srcSet}
                sizes="calc(100vw - 32px)"
                alt={s.alt}
                aspectRatio="4 / 3"
                direction="up"
                loading="eager"
                delay={reduce ? 0 : dur.md * 0.6}
              />
              <motion.p className={styles.panelDesc} variants={item}>
                {s.descripcion}
              </motion.p>
              <motion.div className={styles.panelLinkWrap} variants={item}>
                <Link to={href(s)} className={styles.panelLink}>
                  Ver {s.categoria.toLowerCase()}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/**
 * Cada cajón se abre solo cuando su encabezado cruza ~60% del viewport y queda abierto (nunca
 * se cierra uno de arriba: el contenido colapsaría sobre el punto de lectura). Las aperturas
 * automáticas van en cola, en orden y espaciadas, y nunca mueven el scroll. Si cuando le toca
 * el turno el encabezado ya quedó arriba del viewport (flick), se saltea sin marcarla: se
 * abre cuando vuelva a cruzar la banda.
 */
function MobileIndex() {
  const { reduce } = useMotionSafe();
  const [open, setOpen] = useState(() => new Set(reduce ? SERVICIOS.map((_, i) => i) : []));
  const headRefs = useRef([]);
  const fired = useRef(new Set()); // filas ya resueltas (abiertas solas o tocadas a mano)
  const queue = useRef(new Set());
  const timer = useRef(null);

  useEffect(() => {
    if (reduce) setOpen(new Set(SERVICIOS.map((_, i) => i)));
  }, [reduce]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const pump = useCallback(() => {
    timer.current = null;
    while (queue.current.size) {
      const i = Math.min(...queue.current);
      queue.current.delete(i);
      if (fired.current.has(i)) continue;
      const el = headRefs.current[i];
      if (!el || el.getBoundingClientRect().bottom <= headerHeight()) continue; // pasó de largo
      fired.current.add(i);
      setOpen((prev) => new Set(prev).add(i));
      if (queue.current.size) timer.current = setTimeout(pump, GAP_MS);
      return;
    }
  }, []);

  const enqueue = useCallback(
    (i) => {
      if (reduce || fired.current.has(i)) return;
      queue.current.add(i);
      if (!timer.current) timer.current = setTimeout(pump, 0);
    },
    [reduce, pump]
  );
  const enterHandlers = useMemo(() => SERVICIOS.map((_, i) => () => enqueue(i)), [enqueue]);

  // Solo en aperturas manuales: si el encabezado quedó fuera de vista, se lo trae de vuelta.
  function ensureVisible(i) {
    const el = headRefs.current[i];
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < headerHeight() || r.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function toggle(i) {
    fired.current.add(i);
    queue.current.delete(i);
    const opening = !open.has(i);
    setOpen((prev) => {
      const next = new Set(prev);
      if (opening) next.add(i);
      else next.delete(i);
      return next;
    });
    if (opening) requestAnimationFrame(() => ensureVisible(i));
  }

  return (
    <ol className={styles.accordion}>
      {SERVICIOS.map((s, i) => (
        <MobileItem
          key={s.id}
          s={s}
          isOpen={open.has(i)}
          onToggle={() => toggle(i)}
          onEnterBand={enterHandlers[i]}
          headRef={(el) => (headRefs.current[i] = el)}
          reduce={reduce}
        />
      ))}
    </ol>
  );
}

export default function ServiceIndex() {
  const isMobile = useIsMobile(1023);
  return (
    <section id="servicios" className={styles.section} aria-labelledby="servicios-title">
      <h2 id="servicios-title" className={styles.title}>
        Lo que hacemos en el taller
      </h2>
      {isMobile ? <MobileIndex /> : <DesktopIndex />}
    </section>
  );
}
