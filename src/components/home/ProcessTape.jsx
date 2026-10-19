import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { drawerIn, useMotionSafe } from '../../lib/motion';
import { useElementSize } from '../primitives/useElementSize';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './ProcessTape.module.css';

// La cinta se divide en 20 unidades: 4 tramos iguales de 5, uno por paso. Cada paso arranca en
// el inicio de su tramo (0, 25, 50 y 75% del ancho) y la cinta sigue hasta el 100%.
const UNIDADES = 20;
const TRAMO = 5; // unidades por tramo: una parada al inicio + 4 marcas menores

const PASOS = [
  { u: 0, titulo: 'Nos contactás', texto: 'Por WhatsApp o el formulario. Respondemos en menos de 24 h.' },
  { u: 5, titulo: 'Diseñamos juntos', texto: 'Medimos tu espacio y te pasamos diseño y presupuesto.' },
  { u: 10, titulo: 'Fabricamos', texto: 'Cada pieza se hace en nuestro taller, con control en cada etapa.' },
  { u: 15, titulo: 'Instalamos', texto: 'Instalamos, limpiamos y te entregamos el espacio listo.' },
];

// Cada paso aparece un poco antes de que la línea llegue a su parada: así ninguno depende de
// alcanzar exactamente 1.0 (coma flotante). El primero, apenas empieza a dibujarse.
const umbral = (u) => Math.max(0.02, u / UNIDADES - 0.03);

/* ==========================================================================
   Desktop: cinta horizontal en 4 columnas iguales, dibujada por scroll.
   ========================================================================== */

// Marcas de la cinta, generadas: una mayor en cada parada y menores equiespaciadas dentro de
// cada tramo. Sin marca en el extremo final: ahí no hay paso.
const MARCAS = Array.from({ length: UNIDADES }, (_, u) => ({ u, mayor: u % TRAMO === 0 }));

function CintaHorizontal({ largo, progress, hasta }) {
  // El centro de cada parada cae exactamente en el borde izquierdo de su columna.
  const pos = (u) => (u / UNIDADES) * largo;
  const base = 6;
  const on = (u) => (u <= hasta ? styles.on : styles.off);

  return (
    <svg className={styles.svg} width={largo} height={24} viewBox={`0 0 ${largo} 24`} aria-hidden="true">
      <motion.path d={`M 0 ${base} L ${largo} ${base}`} className={styles.base} style={{ pathLength: progress }} />
      {MARCAS.map(({ u, mayor }) => (
        <path
          key={u}
          d={`M ${pos(u)} ${base} L ${pos(u)} ${base + (mayor ? 16 : 8)}`}
          className={`${mayor ? styles.mayor : styles.menor} ${on(u)}`}
        />
      ))}
      {PASOS.map(({ u }) => (
        <circle key={u} cx={pos(u)} cy={base} r={4} className={`${styles.parada} ${on(u)}`} />
      ))}
    </svg>
  );
}

function TapeHorizontal({ sectionRef }) {
  const rulerRef = useRef(null);
  const { reduce, variants: safe } = useMotionSafe();
  const { width } = useElementSize(rulerRef);

  // Atado solo al borde superior de la sección (no a su alto): con el top al 35% del
  // viewport la cinta está completa, en cualquier tamaño de pantalla.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 90%', 'start 35%'] });
  const lleno = useMotionValue(1);
  const progress = reduce ? lleno : scrollYProgress;

  // Re-render solo al cruzar una marca (o un umbral de paso).
  const medir = (v) => ({
    u: v >= umbral(UNIDADES) ? UNIDADES : v > 0.02 ? Math.floor(v * UNIDADES) : -1,
    shown: PASOS.filter((p) => v >= umbral(p.u)).length,
  });
  const [estado, setEstado] = useState(() => medir(scrollYProgress.get()));
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = medir(v);
    if (next.u !== estado.u || next.shown !== estado.shown) setEstado(next);
  });
  const hasta = reduce ? UNIDADES : estado.u;
  const shown = reduce ? PASOS.length : estado.shown;
  const variants = safe(drawerIn);

  return (
    <div className={styles.horizontal}>
      <div ref={rulerRef} className={styles.ruler}>
        {width > 0 && <CintaHorizontal largo={width} progress={progress} hasta={hasta} />}
      </div>
      <ol className={styles.steps}>
        {PASOS.map((p, i) => (
          <li key={p.u} className={styles.step}>
            <motion.div className={styles.stepBody} variants={variants} initial="hidden" animate={i < shown ? 'show' : 'hidden'}>
              <h3 className={styles.stepTitle}>{p.titulo}</h3>
              <p className={styles.stepText}>{p.texto}</p>
            </motion.div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ==========================================================================
   Mobile: filas equiespaciadas. Entre paradas, las mismas 4 marcas menores por tramo que en
   desktop, repartidas en el alto de la fila.
   ========================================================================== */

function Fila({ paso, siguiente, index, revealed, onReveal, reduce, variants }) {
  const bodyRef = useRef(null);
  // El ref está en un elemento que se renderiza siempre (no depende de datos ni de medidas),
  // así que el observer se crea en el primer render. amount 'all': el texto se revela entero
  // dentro del 85% superior del viewport, nunca a medio entrar.
  const inView = useInView(bodyRef, { once: true, margin: '0px 0px -15% 0px', amount: 'all' });
  useLayoutEffect(() => {
    if (inView) onReveal(index);
  }, [inView, index, onReveal]);

  const menores = siguiente ? TRAMO - 1 : 0;
  const tramoOn = siguiente && revealed > index + 1;
  const paradaOn = revealed > index;

  return (
    <li className={styles.fila}>
      <svg className={styles.tramo} aria-hidden="true">
        {Array.from({ length: menores }, (_, k) => {
          const y = `${((k + 1) / (menores + 1)) * 100}%`;
          return <line key={k} x1="6" x2="14" y1={y} y2={y} className={`${styles.menor} ${tramoOn ? styles.tenueOn : styles.tenue}`} />;
        })}
        <line x1="6" x2="22" y1="0" y2="0" className={`${styles.mayor} ${paradaOn ? styles.tenueOn : styles.tenue}`} />
        <circle cx="6" cy="0" r="4" className={`${styles.parada} ${paradaOn ? styles.tenueOn : styles.tenue}`} />
      </svg>
      <div ref={bodyRef} className={styles.filaBody}>
        <motion.div variants={variants} initial={reduce ? false : 'hidden'} animate={paradaOn ? 'show' : 'hidden'}>
          <h3 className={styles.stepTitle}>{paso.titulo}</h3>
          <p className={styles.stepText}>{paso.texto}</p>
        </motion.div>
      </div>
    </li>
  );
}

function TapeVertical() {
  const { reduce, variants: safe } = useMotionSafe();
  const listRef = useRef(null);
  // Cuántas filas están reveladas (siempre un prefijo: si un scroll rápido saltea filas, al
  // revelarse una se revelan también las de arriba, así la línea es continua).
  const [revealed, setRevealed] = useState(reduce ? PASOS.length : 0);
  const onReveal = useRef((i) => setRevealed((r) => Math.max(r, i + 1))).current;

  // Posición de cada parada (top de cada fila) para dibujar la línea hasta la última revelada.
  const [paradas, setParadas] = useState([]);
  useLayoutEffect(() => {
    const ol = listRef.current;
    const medir = () => setParadas([...ol.children].map((li) => li.offsetTop));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(ol);
    return () => ro.disconnect();
  }, []);

  const total = paradas.length ? paradas[paradas.length - 1] - paradas[0] : 0;
  const objetivo = reduce || revealed === PASOS.length ? 1 : revealed && total ? (paradas[revealed - 1] - paradas[0]) / total : 0;
  const escala = useSpring(objetivo, { stiffness: 120, damping: 24, restDelta: 0.001 });
  useLayoutEffect(() => {
    if (reduce) escala.jump(objetivo);
    else escala.set(objetivo);
  }, [objetivo, reduce, escala]);

  const variants = safe(drawerIn);
  return (
    <div className={styles.vertical}>
      {total > 0 && (
        <span className={styles.linea} style={{ top: paradas[0], height: total }} aria-hidden="true">
          <motion.span className={styles.lineaOn} style={{ scaleY: escala }} />
        </span>
      )}
      <ol ref={listRef} className={styles.filas}>
        {PASOS.map((p, i) => (
          <Fila
            key={p.u}
            paso={p}
            siguiente={PASOS[i + 1]}
            index={i}
            revealed={revealed}
            onReveal={onReveal}
            reduce={reduce}
            variants={variants}
          />
        ))}
      </ol>
    </div>
  );
}

export default function ProcessTape() {
  const sectionRef = useRef(null);
  const vertical = useIsMobile(767);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="proceso-title">
      <h2 id="proceso-title" className={styles.title}>
        Así trabajamos
      </h2>

      {vertical ? <TapeVertical /> : <TapeHorizontal sectionRef={sectionRef} />}

      <Link to="/como-trabajamos" className={styles.link}>
        Ver el proceso completo
      </Link>
    </section>
  );
}
