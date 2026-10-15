import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Cota from '../primitives/Cota';
import CornerMarks from '../primitives/CornerMarks';
import WhatsAppButton from '../primitives/WhatsAppButton';
import { useElementSize } from '../primitives/useElementSize';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import { dur, ease, useMotionSafe } from '../../lib/motion';
import styles from './CtaPlano.module.css';

// `slug` viaja a /contacto?tipo=… (el Prompt 05 lo lee); `label` va en el mensaje de WhatsApp.
// `mm`: medida representativa del tipo, solo para la cota decorativa bajo los chips.
const TIPOS = [
  { slug: 'cocina', label: 'Cocina', mm: 3200 },
  { slug: 'placard', label: 'Placard', mm: 2400 },
  { slug: 'vanitory', label: 'Vanitory', mm: 1200 },
  { slug: 'abertura', label: 'Abertura', mm: 2100 },
  { slug: 'otro', label: 'Otro', mm: null },
];
const MM_MAX = 3200; // la cota de 3200 mm ocupa todo el ancho de la fila de chips
const MM_OTRO = 1600; // "Otro": cota sin label, a media fila

const MM_POR_PX = 2; // escala de la hoja: 1px = 2 mm
const REGLA = 24; // espesor de las reglas (px); el origen de la hoja es su esquina interior
const PARALLAX = 10; // px de desplazamiento máximo de las reglas con el scroll (touch)
const SPRING = { stiffness: 700, damping: 50, mass: 0.4 }; // suave, sin lag perceptible
const aMm = (px) => Math.max(0, Math.round(((px - REGLA) * MM_POR_PX) / 10) * 10);

function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const onChange = () => setFine(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return fine;
}

/**
 * Regla CAD generada por código (como la cinta métrica): marca cada 10 mm, media cada 50 y
 * mayor con label cada 100. Un solo SVG con un path por tipo de marca; se regenera solo si
 * cambia el largo. `extra` agrega regla de más a cada lado para el parallax.
 */
function Regla({ largo, vertical, extra = 0 }) {
  if (!largo) return null;
  const total = largo + extra * 2;
  const paso = 10 / MM_POR_PX; // 5px = 10 mm
  const marcas = { menor: '', media: '', mayor: '' };
  const labels = [];
  for (let px = REGLA - Math.floor((REGLA + extra) / paso) * paso; px <= largo + extra; px += paso) {
    const mm = Math.round((px - REGLA) * MM_POR_PX);
    const tipo = mm % 100 === 0 ? 'mayor' : mm % 50 === 0 ? 'media' : 'menor';
    const len = tipo === 'mayor' ? 12 : tipo === 'media' ? 8 : 4;
    const a = px + extra;
    marcas[tipo] += vertical ? `M${REGLA} ${a}h${-len}` : `M${a} ${REGLA}v${-len}`;
    if (tipo === 'mayor' && mm > 0 && mm % 200 === 0) labels.push({ a, mm });
  }
  const w = vertical ? REGLA : total;
  const h = vertical ? total : REGLA;
  return (
    <svg
      className={styles.reglaSvg}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={vertical ? { top: -extra } : { left: -extra }}
      aria-hidden="true"
    >
      {Object.entries(marcas).map(([tipo, d]) => (
        <path key={tipo} d={d} className={styles[`marca_${tipo}`]} />
      ))}
      {labels.map(({ a, mm }) =>
        vertical ? (
          <text key={mm} x={REGLA - 14} y={a} transform={`rotate(-90 ${REGLA - 14} ${a})`} textAnchor="middle" className={`${styles.reglaNum} tabular`}>
            {mm}
          </text>
        ) : (
          <text key={mm} x={a} y={REGLA - 15} textAnchor="middle" className={`${styles.reglaNum} tabular`}>
            {mm}
          </text>
        )
      )}
    </svg>
  );
}

/** Cursor de medición (pointer fine): guías punteadas que siguen al puntero con un spring
 *  corto, y la coordenada en mm marcada en cada regla. El texto se escribe por ref. */
function Cursor({ sx, sy, opacity }) {
  const xRef = useRef(null);
  const yRef = useRef(null);
  useMotionValueEvent(sx, 'change', (v) => xRef.current && (xRef.current.textContent = `x ${aMm(v)}`));
  useMotionValueEvent(sy, 'change', (v) => yRef.current && (yRef.current.textContent = `y ${aMm(v)}`));

  return (
    <motion.div className={styles.cursor} style={{ opacity }} aria-hidden="true">
      <motion.span className={styles.guiaV} style={{ x: sx }} />
      <motion.span className={styles.guiaH} style={{ y: sy }} />
      <motion.span className={`${styles.coordX} tabular`} style={{ x: sx }} ref={xRef} />
      <motion.span className={`${styles.coordY} tabular`} style={{ y: sy }} ref={yRef} />
    </motion.div>
  );
}

/** CTA final del Home como hoja de plano: elegís el tipo, opcionalmente tu nombre, y se arma
 *  el mensaje de WhatsApp (o se pasa el tipo al formulario de Contacto). */
export default function CtaPlano() {
  const id = useId();
  const [tipo, setTipo] = useState(null);
  const [nombre, setNombre] = useState('');
  const elegido = TIPOS.find((t) => t.slug === tipo);

  const waHref = buildWhatsAppUrl({ tipo: elegido?.label ?? 'Consulta general', nombre, sinDatos: null });
  const formHref = elegido ? `/contacto?tipo=${elegido.slug}` : '/contacto';

  const sectionRef = useRef(null);
  const { width, height } = useElementSize(sectionRef);
  const { reduce } = useMotionSafe();
  const fine = usePointerFine();
  const cursor = fine && !reduce;
  const touch = !fine && !reduce;

  // Cursor: posición cruda del puntero relativa a la sección; el Cursor la suaviza.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const guias = useMotionValue(0);
  const fade = (to) => animate(guias, to, { duration: dur.xs, ease: ease.settle });
  function onPointerMove(e) {
    if (!cursor || e.pointerType !== 'mouse') return;
    const r = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    px.set(x);
    py.set(y);
    if (guias.get() === 0 && !guias.isAnimating()) {
      // Al entrar, las guías aparecen donde está el puntero, sin viajar desde la última salida.
      sx.jump(x);
      sy.jump(y);
      fade(1);
    }
  }

  // Touch: las reglas se corren unos px con el scroll, y la grilla se dibuja una vez al entrar.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const shift = useTransform(scrollYProgress, [0, 1], [PARALLAX, -PARALLAX]);
  const enVista = useInView(sectionRef, { once: true, margin: '0px 0px -25% 0px' });

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby={`${id}-title`}
      onPointerMove={cursor ? onPointerMove : undefined}
      onPointerLeave={cursor ? () => fade(0) : undefined}
    >
      <div className={styles.grilla} aria-hidden="true" />
      {touch && (
        <motion.div
          className={styles.velo}
          aria-hidden="true"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: enVista ? 0 : 1 }}
          transition={{ duration: dur.lg + 0.3, ease: ease.softClose }}
        />
      )}

      <motion.div className={`${styles.regla} ${styles.reglaTop}`} style={touch ? { x: shift } : undefined} aria-hidden="true">
        <Regla largo={width} extra={touch ? PARALLAX : 0} />
      </motion.div>
      <motion.div className={`${styles.regla} ${styles.reglaLeft}`} style={touch ? { y: shift } : undefined} aria-hidden="true">
        <Regla largo={height} vertical extra={touch ? PARALLAX : 0} />
      </motion.div>
      <span className={styles.origen} aria-hidden="true" />
      {cursor && <Cursor sx={sx} sy={sy} opacity={guias} />}

      <div className={styles.sheet}>
        <CornerMarks tone="light" />

        <div className={styles.titleWrap}>
          <h2 id={`${id}-title`} className={styles.title}>
            Empecemos por las medidas
          </h2>
          <Cota tone="light" draw="view" className={styles.cota} />
        </div>
        <p className={styles.lead}>Elegí qué querés hacer y te armamos el mensaje. El presupuesto es sin compromiso.</p>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>¿Qué querés hacer?</legend>
          <div className={styles.chips}>
            {TIPOS.map((t) => (
              <label key={t.slug} className={styles.chip}>
                <input
                  type="radio"
                  name={`${id}-tipo`}
                  value={t.slug}
                  checked={tipo === t.slug}
                  onChange={() => setTipo(t.slug)}
                  className={styles.radio}
                />
                <span className={styles.chipFace}>{t.label}</span>
              </label>
            ))}
          </div>
          {/* Cota decorativa con una medida típica del tipo elegido. El alto está reservado
              siempre: elegir un chip no mueve nada. */}
          <div className={styles.chipCotaSlot} aria-hidden="true">
            {elegido && (
              <div className={styles.chipCota} style={{ width: `${((elegido.mm ?? MM_OTRO) / MM_MAX) * 100}%` }}>
                <Cota
                  key={elegido.slug}
                  tone="light"
                  draw={reduce ? 'none' : 'mount'}
                  label={elegido.mm ? `${elegido.mm} mm` : undefined}
                  labelPosition="start"
                />
              </div>
            )}
          </div>
        </fieldset>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Tu nombre (opcional)</span>
          <input type="text" autoComplete="given-name" value={nombre} onChange={(e) => setNombre(e.target.value)} className={styles.input} />
        </label>

        <div className={styles.actions}>
          <WhatsAppButton href={waHref} variant="paper">
            Armar mensaje por WhatsApp
          </WhatsAppButton>
          <Link to={formHref} className={styles.formLink}>
            Prefiero completar el formulario
          </Link>
        </div>
      </div>

      {/* Fin de la hoja: separa el CTA del footer (los dos son oscuros). */}
      <div className={styles.fin} aria-hidden="true">
        <Cota tone="light" draw={reduce ? 'none' : 'view'} label="fin de la hoja" ticks="both" />
      </div>
    </section>
  );
}
