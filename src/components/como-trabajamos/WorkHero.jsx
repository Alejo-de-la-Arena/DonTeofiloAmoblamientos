import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import './WorkHero.css';

const copyVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } },
};

const easeDraw = [0.65, 0, 0.35, 1];

// Anatomía de una cota de plano técnico: líneas de extensión perpendiculares en los extremos,
// línea principal que se dibuja de punta a punta, marcas a 45° en cada extremo y una anotación
// que "corta" la línea (fondo sólido detrás del texto). `delay` escalona el orden de dibujado
// entre cotas — cada una arranca después de que la anterior ya se está dibujando, no en simultáneo.
function Cota({ orientation = 'horizontal', label, delay = 0, reduce, className = '' }) {
  const initial = reduce ? false : 'hidden';
  const lineVariants = {
    hidden: { scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 },
    show: {
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.32, delay: delay + 0.15, ease: easeDraw },
    },
  };
  const extVariants = {
    hidden: { opacity: 0, scaleX: orientation === 'vertical' ? 0 : 1, scaleY: orientation === 'horizontal' ? 0 : 1 },
    show: {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.15, delay, ease: easeDraw },
    },
  };
  const tickVariants = {
    hidden: { opacity: 0, scale: 0.4 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.12, delay: delay + 0.46 } },
  };
  const labelVariants = {
    hidden: { opacity: 0, y: orientation === 'horizontal' ? 5 : 0, x: orientation === 'vertical' ? 5 : 0 },
    show: { opacity: 1, y: 0, x: 0, transition: { duration: 0.25, delay: delay + 0.56 } },
  };

  return (
    <div className={`wh-cota wh-cota--${orientation} ${className}`} aria-hidden="true">
      <motion.span className="wh-cota-ext wh-cota-ext--start" initial={initial} animate="show" variants={extVariants} />
      <motion.span className="wh-cota-ext wh-cota-ext--end" initial={initial} animate="show" variants={extVariants} />
      <motion.span className="wh-cota-line" initial={initial} animate="show" variants={lineVariants} />
      {/* El span exterior fija posición + rotación 45° por CSS estático; Framer solo anima
          scale/opacity en el span interno — así no compiten por la propiedad `transform`. */}
      <span className="wh-cota-tick-pos wh-cota-tick-pos--start">
        <motion.span className="wh-cota-tick" initial={initial} animate="show" variants={tickVariants} />
      </span>
      <span className="wh-cota-tick-pos wh-cota-tick-pos--end">
        <motion.span className="wh-cota-tick" initial={initial} animate="show" variants={tickVariants} />
      </span>
      <span className="wh-cota-label-pos">
        <motion.span className="wh-cota-label" initial={initial} animate="show" variants={labelVariants}>
          {label}
        </motion.span>
      </span>
    </div>
  );
}

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
    show: { scaleY: 1, transition: { duration: 0.18, delay: delay + 0.15, ease: easeDraw } },
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
          <Cota orientation="horizontal" className="wh-cota-h1-mobile" label="A medida" delay={0.15} reduce={reduce} />

          <motion.div className="work-hero-copy" variants={copyVariants} initial={copyInitial} animate="show">
            <motion.div className="work-hero-eyebrow" variants={itemUp}>
              <span>Nuestro oficio</span>
            </motion.div>
            <div className="wh-title-wrap">
              <motion.h1 className="work-hero-title" variants={itemUp}>
                Cómo Trabajamos
              </motion.h1>
              <Cota orientation="horizontal" className="wh-cota-h2" label="2400 mm" delay={0.4} reduce={reduce} />
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
        <Cota orientation="horizontal" className="wh-cota-h1" label="Desde 2011" delay={0.2} reduce={reduce} />

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
            <Cota orientation="horizontal" className="wh-cota-h2" label="2400 mm" delay={0.45} reduce={reduce} />
          </div>

          <motion.p className="work-hero-lead" variants={itemUp}>
            Cada mueble empieza con una idea y termina con un detalle bien hecho.
          </motion.p>

          <Cota orientation="vertical" className="wh-cota-v1" label="Al milímetro" delay={0.7} reduce={reduce} />
        </motion.div>
      </div>
    </header>
  );
}
