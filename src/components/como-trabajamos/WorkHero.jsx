import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Cota from '../primitives/Cota';
import CornerMarks from '../primitives/CornerMarks';
import MuebleIso from './MuebleIso';
import { useRouteEntry } from '../layout/routeEntry';
import { ease, dur } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './WorkHero.module.css';

const copyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: dur.lg, ease: ease.softClose } },
};

// El mueble arranca sobre la cola de las cotas del hero: una sola secuencia que termina a los
// 3 s (desktop: 1.2 + 1.8) o 2.5 s (mobile: 1.1 + 1.4).
const ISO_DELAY = 1.2;
const ISO_DELAY_MOBILE = 1.1;

function Marks({ intro, ...props }) {
  return (
    <motion.span
      className={styles.marks}
      aria-hidden="true"
      initial={intro ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
    >
      <CornerMarks tone="accent" {...props} />
    </motion.span>
  );
}

function Callout({ delay = 0, intro }) {
  const variants = {
    hidden: { opacity: 0, scale: 0.6 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.25, delay } },
  };
  const leaderVariants = {
    hidden: { scaleY: 0 },
    show: { scaleY: 1, transition: { duration: 0.18, delay: delay + 0.15, ease: ease.door } },
  };
  const labelVariants = {
    hidden: { opacity: 0, y: 5 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, delay: delay + 0.35 } },
  };
  const initial = intro ? 'hidden' : false;

  return (
    <div className={styles.callout} aria-hidden="true">
      <motion.span className={styles.calloutCircle} initial={initial} animate="show" variants={variants}>
        1
      </motion.span>
      <motion.span className={styles.calloutLeader} initial={initial} animate="show" variants={leaderVariants} />
      <motion.span className={styles.calloutLabel} initial={initial} animate="show" variants={labelVariants}>
        A medida
      </motion.span>
    </div>
  );
}

export default function WorkHero() {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile(700);
  // Atrás/adelante del navegador: se vuelve a algo ya visto, sin intro (ver routeEntry.js).
  const entry = useRouteEntry();
  const intro = !reduce && entry !== 'pop';
  // Una vez dibujado, el mueble no se redibuja si el hero cambia de variante (resize).
  const [isoDrawn, setIsoDrawn] = useState(false);
  const isoDraw = intro && !isoDrawn ? 'mount' : 'none';
  const cotaDraw = intro ? 'mount' : 'none';
  const copyInitial = intro ? 'hidden' : false;
  const cota = { orientation: 'horizontal', draw: cotaDraw, tone: 'accent', ticks: 'both', labelClassName: styles.cotaLabel };

  if (isMobile) {
    return (
      <header className={styles.hero}>
        <div className={`${styles.grid} ${intro ? styles.gridIntro : ''}`} aria-hidden="true" />
        <Marks intro={intro} corners={['br']} size="16px" inset="0px 20px 22px 0px" />

        <div className={styles.inner}>
          <Cota {...cota} className={styles.cotaH1Mobile} label="A medida" delay={0.15} />

          <motion.div className={styles.copy} variants={copyVariants} initial={copyInitial} animate="show">
            <motion.div className={styles.eyebrow} variants={itemUp}>
              <span>Nuestro oficio</span>
            </motion.div>
            <div className={styles.titleWrap}>
              <motion.h1 className={styles.title} variants={itemUp}>
                Cómo trabajamos
              </motion.h1>
              <Cota {...cota} className={styles.cotaH2} label="2400 mm" delay={0.4} />
            </div>
            <motion.p className={styles.lead} variants={itemUp}>
              Cada mueble empieza con una idea y termina con un detalle bien hecho.
            </motion.p>
          </motion.div>

          <MuebleIso simple draw={isoDraw} delay={ISO_DELAY_MOBILE} onDrawn={() => setIsoDrawn(true)} className={styles.iso} />
        </div>
      </header>
    );
  }

  return (
    <header className={styles.hero}>
      <div className={`${styles.grid} ${intro ? styles.gridIntro : ''}`} aria-hidden="true" />

      {/* Las marcas de esquina y la cota H1 viven dentro de .inner (no de .hero) a propósito: es
          la misma caja que centra flexbox, así que quedan ancladas al bloque de texto sin
          importar la altura real del viewport. */}
      <div className={styles.inner}>
        <Marks intro={intro} corners={['tl', 'tr', 'br']} inset="-72px 0px" />
        <Cota {...cota} className={styles.cotaH1} label="Desde 2011" delay={0.2} />

        <div className={styles.layout}>
          <motion.div className={styles.copy} variants={copyVariants} initial={copyInitial} animate="show">
            <div className={styles.eyebrowWrap}>
              <motion.div className={styles.eyebrow} variants={itemUp}>
                <span>Nuestro oficio</span>
              </motion.div>
              <Callout delay={0.95} intro={intro} />
            </div>

            <div className={styles.titleWrap}>
              <motion.h1 className={styles.title} variants={itemUp}>
                Cómo trabajamos
              </motion.h1>
              <Cota {...cota} className={styles.cotaH2} label="2400 mm" delay={0.45} />
            </div>

            <motion.p className={styles.lead} variants={itemUp}>
              Cada mueble empieza con una idea y termina con un detalle bien hecho.
            </motion.p>

            <Cota {...cota} orientation="vertical" className={styles.cotaV1} label="Al milímetro" delay={0.7} />
          </motion.div>

          <MuebleIso draw={isoDraw} delay={ISO_DELAY} onDrawn={() => setIsoDrawn(true)} className={styles.iso} />
        </div>
      </div>
    </header>
  );
}
