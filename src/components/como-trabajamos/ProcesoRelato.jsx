import { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SlidingDoors from '../primitives/SlidingDoors';
import RevealImage from '../primitives/RevealImage';
import CornerMarks from '../primitives/CornerMarks';
import { drawerIn, useMotionSafe } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLineaDeLectura } from '../../hooks/useLineaDeLectura';
import img01 from '../../assets/images/como-trabajamos/01-nos-contactas.png?w=1200&format=jpg&quality=78';
import img01Jpg from '../../assets/images/como-trabajamos/01-nos-contactas.png?w=480;800;1200&format=jpg&quality=78&as=srcset';
import img01Webp from '../../assets/images/como-trabajamos/01-nos-contactas.png?w=480;800;1200&format=webp&as=srcset';
import img02 from '../../assets/images/como-trabajamos/02-diseniamos-juntos.png?w=1200&format=jpg&quality=78';
import img02Jpg from '../../assets/images/como-trabajamos/02-diseniamos-juntos.png?w=480;800;1200&format=jpg&quality=78&as=srcset';
import img02Webp from '../../assets/images/como-trabajamos/02-diseniamos-juntos.png?w=480;800;1200&format=webp&as=srcset';
import img03 from '../../assets/images/como-trabajamos/03-fabricamos.png?w=1200&format=jpg&quality=78';
import img03Jpg from '../../assets/images/como-trabajamos/03-fabricamos.png?w=480;800;1200&format=jpg&quality=78&as=srcset';
import img03Webp from '../../assets/images/como-trabajamos/03-fabricamos.png?w=480;800;1200&format=webp&as=srcset';
import img04 from '../../assets/images/como-trabajamos/04-instalamos.png?w=1200&format=jpg&quality=78';
import img04Jpg from '../../assets/images/como-trabajamos/04-instalamos.png?w=480;800;1200&format=jpg&quality=78&as=srcset';
import img04Webp from '../../assets/images/como-trabajamos/04-instalamos.png?w=480;800;1200&format=webp&as=srcset';
import styles from './ProcesoRelato.module.css';

/* ==========================================================================
   La vida de un mueble en 4 pasos. Desktop: texto a la izquierda, marco sticky a la derecha
   que cambia de foto con puertas corredizas, contador de mm y regla de progreso. Mobile:
   foto + texto por paso y una mini barra fija con el paso y los mm.

   FOTOS: para que el relato funcione de verdad, las 4 tendrían que ser DEL MISMO MUEBLE en sus
   4 etapas (la charla/el croquis, la medición y el plano, el taller, el mueble instalado), y
   fotos reales del taller de Don Teófilo. Las actuales son ilustrativas y de muebles distintos.
   `foco` es el object-position del recorte 4:5 del marco desktop (las fotos son 5:4).
   ========================================================================== */

const img = (src, jpg, webp) => ({ src, srcSet: jpg, sources: [{ srcSet: webp, type: 'image/webp' }] });

const STEPS = [
  {
    title: 'Nos contactás',
    desc: 'Todo arranca con una charla. Contanos qué necesitás por WhatsApp o con el formulario y te respondemos en menos de 24hs — sin vueltas ni compromiso.',
    subs: ['Primer contacto por WhatsApp o formulario', 'Charla para entender qué buscás y tu presupuesto', 'Coordinamos una visita si hace falta'],
    mm: 0,
    foco: '55% 50%',
    img: img(img01, img01Jpg, img01Webp),
    alt: 'Croquis de muebles en un cuaderno, junto a un celular y una cinta métrica',
  },
  {
    title: 'Diseñamos juntos',
    desc: 'Visitamos tu espacio, tomamos medidas reales y te presentamos un diseño a medida con un presupuesto detallado, ítem por ítem.',
    subs: ['Relevamiento y medición en el lugar', 'Propuesta de diseño con render o croquis', 'Presupuesto detallado y elección de materiales'],
    mm: 600,
    foco: '42% 50%',
    img: img(img02, img02Jpg, img02Webp),
    alt: 'Medición de una pared con cinta métrica, con planos y croquis sobre la mesa',
  },
  {
    title: 'Fabricamos',
    desc: 'En nuestro taller producimos cada pieza con materiales seleccionados y control de calidad en cada etapa. Te mantenemos al tanto del avance.',
    subs: ['Corte y armado en taller propio', 'Control de calidad en cada módulo', 'Herrajes y terminaciones premium'],
    mm: 1200,
    foco: '68% 50%',
    img: img(img03, img03Jpg, img03Webp),
    alt: 'Carpintero trabajando una pieza de madera con formón en el banco del taller',
  },
  {
    title: 'Instalamos',
    desc: 'Coordinamos la instalación en el día acordado, dejamos todo funcionando y limpio. Tu espacio queda listo para disfrutar el mismo día.',
    subs: ['Instalación profesional coordinada', 'Ajustes finos y limpieza final', 'Entrega y garantía por escrito'],
    mm: 2400,
    foco: '72% 50%',
    img: img(img04, img04Jpg, img04Webp),
    alt: 'Instalación de un mueble de placa con cajones en una casa',
  },
];
const VALORES = STEPS.map((s) => s.mm);
const TOTAL = STEPS.length;
const BARRA_ALTO = 44; // alto de la mini barra mobile (px), igual que en el CSS
const SIZES_FRAME = '(min-width: 1440px) 560px, 40vw';
const SIZES_STEP = '(min-width: 1024px) 45vw, calc(100vw - 32px)';

// El texto se escribe por ref: el contador cambia en cada frame de scroll sin re-render.
function useTextoMm(progreso) {
  const ref = useRef(null);
  const escribir = useCallback((v) => ref.current && (ref.current.textContent = `${Math.round(v)} mm`), []);
  useEffect(() => progreso.on('change', escribir), [progreso, escribir]);
  // Callback ref: escribe apenas el nodo existe (la mini barra se monta y desmonta).
  return useCallback(
    (node) => {
      ref.current = node;
      if (node) escribir(progreso.get());
    },
    [progreso, escribir]
  );
}

function Texto({ step, index, textRef, marcaRef, estado }) {
  return (
    <div className={`${styles.step} ${estado ? styles[estado] : ''}`}>
      <div ref={textRef} className={styles.text}>
        <span ref={marcaRef} className={styles.label}>
          Paso {index + 1}
        </span>
        <h2 className={styles.title}>{step.title}</h2>
        <p className={styles.desc}>{step.desc}</p>
        <ul className={styles.subs}>
          {step.subs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Picture({ step, sizes, eager, className, style }) {
  return (
    <picture>
      {step.img.sources.map((s) => (
        <source key={s.type} srcSet={s.srcSet} type={s.type} sizes={sizes} />
      ))}
      <img
        className={className}
        style={style}
        src={step.img.src}
        srcSet={step.img.srcSet}
        sizes={sizes}
        alt={step.alt}
        decoding="async"
        loading={eager ? 'eager' : 'lazy'}
      />
    </picture>
  );
}

/* ---------- desktop: marco sticky ---------- */

function Marco({ active, enVista, progreso }) {
  const mmRef = useTextoMm(progreso);
  const [shown, setShown] = useState(active);
  const [open, setOpen] = useState(true);
  const target = useRef(active);
  target.current = active;
  const busy = useRef(false);
  const enVistaRef = useRef(enVista);
  enVistaRef.current = enVista;

  // Sin cola: mientras las puertas se mueven, los cambios de paso solo actualizan el destino.
  // Al cerrarse se muestra el ÚLTIMO paso activo; si al abrirse ya es otro, un ciclo más.
  useEffect(() => {
    if (busy.current || active === shown) return;
    if (!enVistaRef.current) {
      setShown(active); // fuera de vista no hay nada que animar
      return;
    }
    busy.current = true;
    setOpen(false);
  }, [active, shown]);

  const onClosed = () => {
    setShown(target.current);
    setOpen(true);
  };
  const onOpened = () => {
    busy.current = false;
    if (target.current !== shown) {
      busy.current = true;
      setOpen(false);
    }
  };

  return (
    <div className={styles.frameCol}>
      <div className={styles.frame}>
        <CornerMarks tone="ink" size="18px" inset="-9px" />
        <div className={styles.frameImgs}>
          {STEPS.map((s, i) => (
            <Picture
              key={s.title}
              step={s}
              sizes={SIZES_FRAME}
              eager={i === 0}
              className={`${styles.frameImg} ${i === shown ? styles.frameImgOn : ''}`}
              style={{ objectPosition: s.foco }}
            />
          ))}
          <SlidingDoors open={open} panels={2} duration={0.34} step={0.05} onCloseComplete={onClosed} onOpenComplete={onOpened} />
        </div>
        <span className={styles.tabPaso}>
          Paso {shown + 1} de {TOTAL}
        </span>
        <span ref={mmRef} className={`${styles.tabMm} tabular`} aria-hidden="true" />
      </div>
    </div>
  );
}

function Regla({ marcas, relleno, active, estatica }) {
  if (!marcas) return null;
  return (
    <div className={styles.regla} style={{ top: marcas.top, height: marcas.height }} aria-hidden="true">
      <span className={styles.reglaBase} />
      <motion.span className={styles.reglaOn} style={estatica ? { scaleY: 1 } : { scaleY: relleno }} />
      {marcas.puntos.map((y, i) => (
        <span key={i} className={`${styles.reglaMarca} ${estatica || i <= active ? styles.reglaMarcaOn : ''}`} style={{ top: y }} />
      ))}
    </div>
  );
}

/* ---------- mobile: mini barra fija bajo el header ---------- */

function MiniBarra({ visible, active, progreso, reduce }) {
  const mmRef = useTextoMm(progreso);
  const fill = useRef(null);
  useEffect(() => {
    const set = (v) => fill.current && (fill.current.style.transform = `scaleX(${v / VALORES[VALORES.length - 1]})`);
    set(progreso.get());
    return progreso.on('change', set);
  }, [progreso, visible]);
  if (reduce) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className={styles.barra} variants={drawerIn} custom={-1} initial="hidden" animate="show" exit="hidden" aria-hidden="true">
          <span>
            Paso {active + 1} de {TOTAL}
          </span>
          <span ref={mmRef} className="tabular" />
          <span className={styles.barraLinea}>
            <span ref={fill} className={styles.barraFill} />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- sección ---------- */

export default function ProcesoRelato() {
  const { reduce } = useMotionSafe();
  const mobile = useIsMobile(1023);
  const pinned = !mobile && !reduce;
  const sectionRef = useRef(null);
  const textRefs = useMemo(() => STEPS.map(() => createRef()), []);
  const marcaRefs = useMemo(() => STEPS.map(() => createRef()), []);
  const { active, enVista, barra, progreso, relleno, marcas } = useLineaDeLectura({
    sectionRef,
    textRefs,
    marcaRefs: mobile ? undefined : marcaRefs,
    valores: VALORES,
    barraAlto: BARRA_ALTO,
  });

  const estado = (i) => (pinned ? (i === active ? 'activo' : 'inactivo') : null);

  return (
    <section className={`${styles.section} ${pinned ? styles.pinned : styles.flow}`} aria-label="Cómo trabajamos, paso a paso">
      <div ref={sectionRef} className={styles.inner}>
        {!mobile && <Regla marcas={marcas} relleno={relleno} active={active} estatica={reduce} />}
        <ol className={styles.steps}>
          {STEPS.map((s, i) => (
            <li key={s.title} className={styles.item}>
              {!pinned && (
                <div className={styles.media}>
                  {reduce ? (
                    <div className={styles.staticFrame}>
                      <Picture step={s} sizes={SIZES_STEP} eager={i === 0} className={styles.staticImg} />
                      <span className={styles.tabPaso}>
                        Paso {i + 1} de {TOTAL}
                      </span>
                      <span className={`${styles.tabMm} tabular`}>{s.mm} mm</span>
                    </div>
                  ) : (
                    <RevealImage
                      src={s.img.src}
                      srcSet={s.img.srcSet}
                      sources={s.img.sources}
                      sizes={SIZES_STEP}
                      alt={s.alt}
                      aspectRatio="4 / 3"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className={styles.reveal}
                    />
                  )}
                </div>
              )}
              <Texto step={s} index={i} textRef={textRefs[i]} marcaRef={marcaRefs[i]} estado={estado(i)} />
            </li>
          ))}
        </ol>
        {pinned && <Marco active={active} enVista={enVista} progreso={progreso} />}
      </div>
      {mobile && <MiniBarra visible={barra} active={active} progreso={progreso} reduce={reduce} />}
    </section>
  );
}
