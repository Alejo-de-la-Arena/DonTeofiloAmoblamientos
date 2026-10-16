import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Cota from '../primitives/Cota';
import { ROUTE_DISTANCE_KM } from '../../config/contact';
import { dur, ease, useMotionSafe } from '../../lib/motion';

export default function WorkshopRoute() {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, amount: 0.5 });
  const { reduce } = useMotionSafe();
  const show = visible || reduce;
  return (
    <div
      ref={ref}
      className="workshop-route"
      role="img"
      aria-label="Trabajamos en Buenos Aires y Tandil"
    >
      <svg viewBox="0 0 360 140" aria-hidden="true">
        <defs>
          <mask id="workshop-route-mask">
            <motion.path
              d="M30 36 C120 36 220 98 330 98"
              fill="none"
              stroke="white"
              strokeWidth="4"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: show ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : dur.lg, ease: ease.softClose }}
            />
          </mask>
        </defs>
        <path
          d="M30 36 C120 36 220 98 330 98"
          className="workshop-route-line"
          mask="url(#workshop-route-mask)"
        />
        <motion.g
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: dur.xs, delay: reduce ? 0 : dur.lg }}
        >
          <circle cx="30" cy="36" r="4" />
          <text x="24" y="18">
            Buenos Aires
          </text>
          <circle cx="330" cy="98" r="4" />
          <text x="336" y="126" textAnchor="end">
            Tandil
          </text>
        </motion.g>
      </svg>
      {show && (
        <Cota
          className="workshop-route-cota"
          label={'≈ ' + ROUTE_DISTANCE_KM + ' km'}
          draw={reduce ? 'none' : 'mount'}
          delay={reduce ? 0 : dur.lg + dur.xs}
        />
      )}
    </div>
  );
}
