import { useReducedMotion } from 'framer-motion';

/* ==========================================================================
   Sistema de motion — "cierre suave"
   Las cosas entran como un cajón con herraje de cierre suave: arrancan rápido y frenan
   suave al final. Los reveals usan paneles que se deslizan como puertas corredizas.

   Reglas:
   - Solo se animan transform, opacity y clip-path. Nunca width/height/top/left
     (única excepción: height:auto en acordeones, vía Framer Motion).
   - Nada de fade-up genérico por sección: usar las primitivas de src/components/primitives.
   - Con prefers-reduced-motion: sin pins ni puertas; crossfades de opacidad ≤ 200ms o
     estados estáticos. Toda primitiva pasa por useMotionSafe().
   - Ningún componente hardcodea easings: se importan de acá (en CSS: --ease-* en tokens.css).
   ========================================================================== */

export const ease = {
  softClose: [0.16, 1, 0.3, 1], // entrada tipo cajón con cierre suave
  door: [0.65, 0, 0.35, 1], // paneles de puerta corrediza (in-out)
  settle: [0.33, 1, 0.68, 1], // micro-interacciones
};

export const dur = { xs: 0.18, sm: 0.32, md: 0.5, lg: 0.8, door: 0.7 };

export const stagger = { door: 0.06, line: 0.08 };

/** Transición entre rutas: cada tramo (cerrar / abrir) dura 280ms en total,
 *  incluido el escalonado de los paneles: 200ms + 2 × 40ms con 3 paneles. */
export const routeDoors = { panels: 3, duration: 0.2, step: 0.04 };
/** Duración total de un tramo de la transición de ruta (lo que tarda en abrir). */
export const routeDoorsLeg = routeDoors.duration + routeDoors.step * (routeDoors.panels - 1);

/** Transición única para todo lo que se resuelve con reduced motion. */
export const reducedTransition = { duration: 0.2, ease: 'linear' };

/* ---------- variants reutilizables ---------- */

/** Cajón: desplazamiento horizontal corto + cierre suave. `custom` = dirección (1 | -1). */
export const drawerIn = {
  hidden: (dir = 1) => ({ opacity: 0, x: 28 * dir }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: dur.md, ease: ease.softClose },
  },
};

/** Panel de puerta corrediza: 'closed' tapa, 'open' se recoge sobre su transform-origin.
 *  `custom` = { i (orden en la secuencia), axis: 'x' | 'y', duration, step }.
 *  Escalona `step` por panel (default 60ms). */
function doorState({ i = 0, axis = 'x', duration = dur.door, step = stagger.door } = {}, scale) {
  return {
    [axis === 'x' ? 'scaleX' : 'scaleY']: scale,
    transition: { duration, ease: ease.door, delay: i * step },
  };
}
export const doorOpen = {
  closed: (c) => doorState(c, 1),
  open: (c) => doorState(c, 0),
};

/** Línea de título enmascarada: el texto sube desde abajo de su máscara.
 *  `custom` = índice de línea, o { i, delay } para sumar un retardo base. */
export const lineMask = {
  hidden: { y: '100%' },
  show: (c = 0) => {
    const { i = 0, delay = 0 } = typeof c === 'number' ? { i: c } : c;
    return {
      y: '0%',
      transition: { duration: dur.lg, ease: ease.softClose, delay: delay + i * stagger.line },
    };
  },
};

/** Crossfade simple: la versión reducida de casi todo. */
export const crossfade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: reducedTransition },
};

/* ---------- reduced motion ---------- */

// Convierte un estado de variant en su versión reducida: se queda SOLO con la opacidad (si el
// estado no la define, queda en 1 = estático/visible) y con la transición corta. Transform y
// clip-path se descartan, así nada se desplaza ni se recorta.
function reduceState(state) {
  if (typeof state === 'function') return (...args) => reduceState(state(...args));
  if (!state || typeof state !== 'object') return state;
  return { opacity: state.opacity ?? 1, transition: reducedTransition };
}

export function reduceVariants(variants) {
  return Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, reduceState(v)]));
}

/**
 * Envuelve useReducedMotion(). Devuelve:
 *   reduce            → boolean
 *   variants(v)       → v tal cual, o su versión reducida (solo opacidad, ≤ 200ms)
 *   transition(t)     → t tal cual, o reducedTransition
 *   pick(full, lite)  → elige entre dos valores cualquiera
 */
export function useMotionSafe() {
  const reduce = !!useReducedMotion();
  return {
    reduce,
    variants: (v) => (reduce ? reduceVariants(v) : v),
    transition: (t) => (reduce ? reducedTransition : t),
    pick: (full, lite) => (reduce ? lite : full),
  };
}
