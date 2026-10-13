import { useState } from 'react';
import { motion, useMotionTemplate, useTransform } from 'framer-motion';
import { reducedTransition } from '../../lib/motion';
import PinnedSection from './PinnedSection';
import Cota from './Cota';
import styles from './BeforeAfterScroll.module.css';

// El wipe ocupa el tramo 0.15–0.85 del progreso: margen quieto al entrar y al salir del pin.
const WIPE = [0.15, 0.85];

function Wipe({ progress, antes, despues, medida, children }) {
  const hidden = useTransform(progress, WIPE, [100, 0]); // % recortado a la derecha del "después"
  const clipPath = useMotionTemplate`inset(0% ${hidden}% 0% 0%)`;
  // El divisor ocupa todo el escenario y se traslada como capa entera: un porcentaje de su
  // propio ancho = porcentaje del escenario. Solo transform, nunca `left`.
  const dividerX = useTransform(hidden, (v) => `${100 - v}%`);
  // Fuera del tramo del wipe el divisor quedaría pegado a un borde como una línea suelta.
  const dividerOpacity = useTransform(progress, [WIPE[0] - 0.05, WIPE[0] + 0.03, WIPE[1] - 0.03, WIPE[1] + 0.05], [0, 1, 1, 0]);
  const antesOpacity = useTransform(progress, [0.08, 0.3], [1, 0]);
  const despuesOpacity = useTransform(progress, [0.7, 0.9], [0, 1]);

  return (
    <div className={styles.stage}>
      <img className={styles.img} src={antes.src} srcSet={antes.srcSet} sizes={antes.sizes} alt={antes.alt} loading="lazy" decoding="async" />
      <motion.div className={styles.after} style={{ clipPath }}>
        <img className={styles.img} src={despues.src} srcSet={despues.srcSet} sizes={despues.sizes} alt={despues.alt} loading="lazy" decoding="async" />
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

      {children && <div className={styles.info}>{children}</div>}
    </div>
  );
}

// Reduced motion: sin pin ni wipe. Se muestra el "después" y un botón alterna con el "antes"
// mediante un crossfade corto.
function StaticCompare({ antes, despues, children }) {
  const [showAntes, setShowAntes] = useState(false);
  return (
    <div className={`${styles.stage} ${styles.static}`}>
      <img className={styles.img} src={despues.src} srcSet={despues.srcSet} sizes={despues.sizes} alt={despues.alt} loading="lazy" decoding="async" />
      <motion.div
        className={styles.after}
        initial={false}
        animate={{ opacity: showAntes ? 1 : 0 }}
        transition={reducedTransition}
        aria-hidden={!showAntes}
      >
        <img className={styles.img} src={antes.src} srcSet={antes.srcSet} sizes={antes.sizes} alt={antes.alt} loading="lazy" decoding="async" />
      </motion.div>
      <span className={`${styles.tag} ${styles.tagAntes}`}>{showAntes ? 'Antes' : 'Después'}</span>
      <button type="button" className={styles.toggle} aria-pressed={showAntes} onClick={() => setShowAntes((v) => !v)}>
        {showAntes ? 'Ver después' : 'Ver antes'}
      </button>
      {children && <div className={styles.info}>{children}</div>}
    </div>
  );
}

/**
 * Antes/después controlado por scroll, sobre PinnedSection. Sin drag: cero conflicto con el
 * scroll en mobile. (El slider arrastrable sigue existiendo en home/BeforeAfterSlider.)
 *
 * antes / despues: { src, alt, srcSet?, sizes? } · medida: label opcional de la cota del divisor ("2400 mm")
 * children: slot para la info del proyecto.
 */
export default function BeforeAfterScroll({
  antes,
  despues,
  medida,
  heightDesktop = '260vh',
  heightMobile = '200vh',
  className = '',
  children,
}) {
  return (
    <PinnedSection height={heightDesktop} heightMobile={heightMobile} className={className}>
      {(progress, { pinned }) =>
        pinned ? (
          <Wipe progress={progress} antes={antes} despues={despues} medida={medida}>
            {children}
          </Wipe>
        ) : (
          <StaticCompare antes={antes} despues={despues}>
            {children}
          </StaticCompare>
        )
      }
    </PinnedSection>
  );
}
