import { motion, useReducedMotion } from 'framer-motion';
import Cota from '../primitives/Cota';
import { ease, dur } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import './WorkHero.css';

const copyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: dur.lg, ease: ease.softClose } },
};

function CornerMark({ position, delay = 0, reduce }) {
  const variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, delay } },
  };
  return (
    <motion.span
      className={`wh-corner wh-corner--${position}`}
      aria-hidden="true"
      initial={reduce ? false : 'hidden'}
      animate="show"
      variants={variants}
    />
  );
}

function Callout({ delay = 0, reduce }) {
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
  const initial = reduce ? false : 'hidden';

  return (
    <div className="wh-callout" aria-hidden="true">
      <motion.span className="wh-callout-circle" initial={initial} animate="show" variants={variants}>
        1
      </motion.span>
      <motion.span className="wh-callout-leader" initial={initial} animate="show" variants={leaderVariants} />
      <motion.span className="wh-callout-label" initial={initial} animate="show" variants={labelVariants}>
        A medida
      </motion.span>
    </div>
  );
}

export default function WorkHero() {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile(700);
  const copyInitial = reduce ? false : 'hidden';

  if (isMobile) {
    return (
      <header className="work-hero">
        <div className="wh-grid" aria-hidden="true" />
        <CornerMark position="br-mobile" delay={0.05} reduce={reduce} />

        <div className="work-hero-inner">
          <Cota orientation="horizontal" className="wh-cota-h1-mobile" label="A medida" delay={0.15} draw="mount" tone="accent" ticks="both" labelClassName="wh-cota-label" />

          <motion.div className="work-hero-copy" variants={copyVariants} initial={copyInitial} animate="show">
            <motion.div className="work-hero-eyebrow" variants={itemUp}>
              <span>Nuestro oficio</span>
            </motion.div>
            <div className="wh-title-wrap">
              <motion.h1 className="work-hero-title" variants={itemUp}>
                Cómo Trabajamos
              </motion.h1>
              <Cota orientation="horizontal" className="wh-cota-h2" label="2400 mm" delay={0.4} draw="mount" tone="accent" ticks="both" labelClassName="wh-cota-label" />
            </div>
            <motion.p className="work-hero-lead" variants={itemUp}>
              Cada mueble empieza con una idea y termina con un detalle bien hecho.
            </motion.p>
          </motion.div>
        </div>
      </header>
    );
  }

  return (
    <header className="work-hero">
      <div className="wh-grid" aria-hidden="true" />

      {/* Las marcas de esquina y la cota H1 viven dentro de .work-hero-inner (no de .work-hero)
          a propósito: es la misma caja que centra flexbox, así que quedan ancladas al bloque de
          texto sin importar la altura real del viewport — nunca se desalinean por overflow del
          padding, siempre están a N px del contenido, sea cual sea la altura de la pantalla. */}
      <div className="work-hero-inner">
        <CornerMark position="tl" delay={0.05} reduce={reduce} />
        <CornerMark position="tr" delay={0.1} reduce={reduce} />
        <CornerMark position="br" delay={0.15} reduce={reduce} />
        <Cota orientation="horizontal" className="wh-cota-h1" label="Desde 2011" delay={0.2} draw="mount" tone="accent" ticks="both" labelClassName="wh-cota-label" />

        <motion.div className="work-hero-copy" variants={copyVariants} initial={copyInitial} animate="show">
          <div className="wh-eyebrow-wrap">
            <motion.div className="work-hero-eyebrow" variants={itemUp}>
              <span>Nuestro oficio</span>
            </motion.div>
            <Callout delay={0.95} reduce={reduce} />
          </div>

          <div className="wh-title-wrap">
            <motion.h1 className="work-hero-title" variants={itemUp}>
              Cómo Trabajamos
            </motion.h1>
            <Cota orientation="horizontal" className="wh-cota-h2" label="2400 mm" delay={0.45} draw="mount" tone="accent" ticks="both" labelClassName="wh-cota-label" />
          </div>

          <motion.p className="work-hero-lead" variants={itemUp}>
            Cada mueble empieza con una idea y termina con un detalle bien hecho.
          </motion.p>

          <Cota orientation="vertical" className="wh-cota-v1" label="Al milímetro" delay={0.7} draw="mount" tone="accent" ticks="both" labelClassName="wh-cota-label" />
        </motion.div>
      </div>
    </header>
  );
}
