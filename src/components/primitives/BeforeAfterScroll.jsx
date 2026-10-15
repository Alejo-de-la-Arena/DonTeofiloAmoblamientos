import { useState } from 'react';
import { motion, useMotionTemplate, useTransform } from 'framer-motion';
import { reducedTransition } from '../../lib/motion';
import PinnedSection from './PinnedSection';
import Cota from './Cota';
import styles from './BeforeAfterScroll.module.css';

// El wipe ocupa el tramo 0.15–0.85 del progreso: margen quieto al entrar y al salir del pin.
const WIPE = [0.15, 0.85];

const Img = ({ img }) => (
  <img className={styles.img} src={img.src} srcSet={img.srcSet} sizes={img.sizes} alt={img.alt} onError={img.onError} decoding="async" />
);

// Composición: 'full' = la imagen llena el escenario y la info flota encima (abajo);
// 'lamina' = la imagen es una lámina con márgenes y la info va al costado (desktop) o
// debajo (mobile), todo dentro del mismo sticky.
function Frame({ layout, isStatic, plate, head, info }) {
  if (layout === 'lamina') {
    return (
      <div className={`${styles.lamina} ${isStatic ? styles.laminaStatic : ''}`}>
        {head && <div className={styles.laminaHead}>{head}</div>}
        <div className={styles.plate}>{plate}</div>
        {info && <div className={styles.laminaInfo}>{info}</div>}
      </div>
    );
  }
  return (
    <div className={`${styles.stage} ${isStatic ? styles.static : ''}`}>
      {plate}
      {info && <div className={styles.info}>{info}</div>}
    </div>
  );
}

function Wipe({ progress, antes, despues, medida, layout, head, info }) {
  const hidden = useTransform(progress, WIPE, [100, 0]); // % recortado a la derecha del "después"
  const clipPath = useMotionTemplate`inset(0% ${hidden}% 0% 0%)`;
  // El divisor ocupa toda la lámina y se traslada como capa entera: un porcentaje de su
  // propio ancho = porcentaje de la lámina. Solo transform, nunca `left`.
  const dividerX = useTransform(hidden, (v) => `${100 - v}%`);
  // Fuera del tramo del wipe el divisor quedaría pegado a un borde como una línea suelta.
  const dividerOpacity = useTransform(progress, [WIPE[0] - 0.05, WIPE[0] + 0.03, WIPE[1] - 0.03, WIPE[1] + 0.05], [0, 1, 1, 0]);
  const antesOpacity = useTransform(progress, [0.08, 0.3], [1, 0]);
  const despuesOpacity = useTransform(progress, [0.7, 0.9], [0, 1]);

  const plate = (
    <>
      <Img img={antes} />
      <motion.div className={styles.after} style={{ clipPath }}>
        <Img img={despues} />
      </motion.div>
      <motion.div className={styles.divider} style={{ x: dividerX, opacity: dividerOpacity }} aria-hidden="true">
        <span className={styles.dividerLine} />
        {medida && <Cota orientation="vertical" tone="light" draw="none" label={medida} className={styles.dividerCota} />}
      </motion.div>
      <motion.span className={`${styles.tag} ${styles.tagAntes}`} style={{ opacity: antesOpacity }} aria-hidden="true">
        Antes
      </motion.span>
      <motion.span className={`${styles.tag} ${styles.tagDespues}`} style={{ opacity: despuesOpacity }} aria-hidden="true">
        Después
      </motion.span>
    </>
  );
  return <Frame layout={layout} plate={plate} head={head} info={info} />;
}

// Reduced motion: sin pin ni wipe. Se muestra el "después" y un botón alterna con el "antes"
// mediante un crossfade corto.
function StaticCompare({ antes, despues, layout, head, info }) {
  const [showAntes, setShowAntes] = useState(false);
  const plate = (
    <>
      <Img img={despues} />
      <motion.div
        className={styles.after}
        initial={false}
        animate={{ opacity: showAntes ? 1 : 0 }}
        transition={reducedTransition}
        aria-hidden={!showAntes}
      >
        <Img img={antes} />
      </motion.div>
      <span className={`${styles.tag} ${styles.tagAntes}`}>{showAntes ? 'Antes' : 'Después'}</span>
      <button type="button" className={styles.toggle} aria-pressed={showAntes} onClick={() => setShowAntes((v) => !v)}>
        {showAntes ? 'Ver después' : 'Ver antes'}
      </button>
    </>
  );
  return <Frame layout={layout} isStatic plate={plate} head={head} info={info} />;
}

/**
 * Antes/después controlado por scroll, sobre PinnedSection. Sin drag: cero conflicto con el
 * scroll en mobile. (El slider arrastrable sigue existiendo en home/BeforeAfterSlider.)
 *
 * antes / despues: { src, alt, srcSet?, sizes?, onError? }. Sin loading="lazy": la capa del
 *   "después" arranca recortada al 100% y el navegador puede no considerarla visible nunca; si
 *   hay que diferir la descarga, el que usa el componente pasa src recién cuando corresponde. · medida: label opcional de la cota del divisor
 * layout: 'full' (default) | 'lamina'
 * children: slot para la info del proyecto; nodo o función (progress, { pinned }) => nodo,
 *   para atar elementos (ej. una <Cota draw={progress}>) al avance del wipe.
 * head: (solo layout 'lamina') encabezado arriba de la lámina, dentro del sticky; nodo o
 *   función con la misma firma que children.
 */
export default function BeforeAfterScroll({
  antes,
  despues,
  medida,
  layout = 'full',
  heightDesktop = '260vh',
  heightMobile = '200vh',
  className = '',
  head,
  children,
  ...rest
}) {
  return (
    <PinnedSection height={heightDesktop} heightMobile={heightMobile} className={className} {...rest}>
      {(progress, { pinned }) => {
        const slot = (s) => (typeof s === 'function' ? s(progress, { pinned }) : s);
        const info = slot(children);
        const top = slot(head);
        return pinned ? (
          <Wipe progress={progress} antes={antes} despues={despues} medida={medida} layout={layout} head={top} info={info} />
        ) : (
          <StaticCompare antes={antes} despues={despues} layout={layout} head={top} info={info} />
        );
      }}
    </PinnedSection>
  );
}
