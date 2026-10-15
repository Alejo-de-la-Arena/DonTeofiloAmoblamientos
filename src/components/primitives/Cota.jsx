import { useRef } from 'react';
import { motion, isMotionValue, useInView, useMotionValue, useTransform } from 'framer-motion';
import { dur, ease, useMotionSafe } from '../../lib/motion';
import { useElementSize } from './useElementSize';
import { cotaGeometry as geometry } from './cotaGeometry';
import styles from './Cota.module.css';

/**
 * Línea de medida de plano técnico: topes en los extremos, línea con un hueco para el label,
 * label en DM Sans tabular. El SVG se dimensiona en píxeles reales (ResizeObserver), así los
 * topes y las marcas nunca se estiran ni se deforman.
 *
 * draw: 'mount' | 'view' | 'none' | MotionValue<number 0–1> (para atarla al scroll)
 * ticks: 'perpendicular' (topes) | 'slash' (marcas a 45°) | 'both'
 * informative: true solo si el label es información real → role="img" + aria-label
 */
export default function Cota({
  orientation = 'horizontal',
  label,
  draw = 'view',
  tone = 'ink',
  labelPosition = 'center',
  ticks = 'perpendicular',
  delay = 0,
  informative = false,
  className = '',
  labelClassName = '',
}) {
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const { width, height } = useElementSize(rootRef);
  const labelSize = useElementSize(labelRef);
  const { reduce, variants: safe } = useMotionSafe();
  const inView = useInView(rootRef, { once: true, margin: '0px 0px -10% 0px' });

  const horizontal = orientation === 'horizontal';
  const length = horizontal ? width : height;
  const thickness = horizontal ? height : width;
  const labelLength = label ? labelSize.width : 0; // el label vertical rota 90°: su ancho es su largo

  // Hooks incondicionales: si `draw` no es un MotionValue, los transforms leen un valor fijo.
  const scrubbed = isMotionValue(draw) && !reduce;
  const fallback = useMotionValue(1);
  const progress = isMotionValue(draw) ? draw : fallback;
  const pathLength = useTransform(progress, [0, 0.7], [0, 1]);
  const lineOpacity = useTransform(progress, [0, 0.02], [0, 1]);
  const stopOpacity = useTransform(progress, [0.6, 0.8], [0, 1]);
  const labelOpacity = useTransform(progress, [0.75, 1], [0, 1]);

  const lineV = safe({
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: dur.lg, ease: ease.softClose, delay },
        opacity: { duration: 0.01, delay },
      },
    },
  });
  const stopV = safe({
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: dur.xs, ease: ease.settle, delay: delay + dur.lg * 0.55 } },
  });
  const labelV = safe({
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: dur.sm, ease: ease.settle, delay: delay + dur.lg * 0.75 } },
  });

  // Props de animación compartidas por cada pieza (salvo en modo scroll, que va por `style`).
  // Siempre con `animate` propio: si la cota vive dentro de un motion.* con variants, sin esto
  // heredaría la propagación de variants del padre y quedaría en un estado ajeno.
  let anim;
  if (scrubbed) anim = { initial: false, animate: false };
  else if (draw === 'none' || isMotionValue(draw)) anim = { initial: false, animate: 'show' };
  else if (draw === 'mount') anim = { initial: 'hidden', animate: 'show' };
  else anim = { initial: 'hidden', animate: inView ? 'show' : 'hidden' };

  const ready = length > 0 && thickness > 0;
  const geo = ready ? geometry({ length, thickness, labelLength, labelPosition, orientation }) : null;
  const showStops = ticks === 'perpendicular' || ticks === 'both';
  const showTicks = ticks === 'slash' || ticks === 'both';

  const a11y = informative && label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  return (
    <div
      ref={rootRef}
      className={`${styles.cota} ${styles[orientation]} ${styles[tone]} ${className}`.trim()}
      {...a11y}
    >
      {geo && (
        <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {geo.segments.map((d) => (
            <motion.path
              key={d}
              d={d}
              className={styles.line}
              variants={scrubbed ? undefined : lineV}
              {...anim}
              style={scrubbed ? { pathLength, opacity: lineOpacity } : undefined}
            />
          ))}
          {showStops &&
            geo.stops.map((d) => (
              <motion.path
                key={d}
                d={d}
                className={styles.stop}
                variants={scrubbed ? undefined : stopV}
                {...anim}
                style={scrubbed ? { opacity: stopOpacity } : undefined}
              />
            ))}
          {showTicks &&
            geo.ticks.map((d) => (
              <motion.path
                key={d}
                d={d}
                className={styles.tick}
                variants={scrubbed ? undefined : stopV}
                {...anim}
                style={scrubbed ? { opacity: stopOpacity } : undefined}
              />
            ))}
        </svg>
      )}
      {label && (
        // El span exterior fija posición + rotación por CSS; Framer solo anima la opacidad del
        // interno — así no compiten por `transform`. El interno es el que se mide.
        <span
          className={styles.labelPos}
          style={
            horizontal
              ? { left: geo ? geo.center : '50%', top: '50%' }
              : { top: geo ? geo.center : '50%', left: '50%' }
          }
          aria-hidden={informative ? true : undefined}
        >
          <motion.span
            ref={labelRef}
            className={`${styles.label} tabular ${labelClassName}`.trim()}
            variants={scrubbed ? undefined : labelV}
            {...(ready || scrubbed ? anim : { initial: draw === 'none' ? false : 'hidden', animate: draw === 'none' ? 'show' : 'hidden' })}
            style={scrubbed ? { opacity: labelOpacity } : undefined}
          >
            {label}
          </motion.span>
        </span>
      )}
    </div>
  );
}
