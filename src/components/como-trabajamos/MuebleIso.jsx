import { useLayoutEffect, useRef } from 'react';
import { useAnimate } from 'framer-motion';
import { ease, useMotionSafe } from '../../lib/motion';
import { useElementSize } from '../primitives/useElementSize';
import { isoLayout } from '../../lib/iso';
import { BAJO_MESADA } from '../../data/muebleIso';
import styles from './MuebleIso.module.css';

// Secuencia (s, relativa a `delay`): at = arranque del grupo, step = escalonado dentro del grupo.
// Completa dura 1.8 s; la simple (sin divisiones ni tiradores) 1.4 s.
const SEQ = {
  casco: { at: 0, duration: 0.5, step: 0.03 },
  oculto: { at: 0.35, duration: 0.3 },
  divisiones: { at: 0.5, duration: 0.4, step: 0.04 },
  frentes: { at: 0.8, duration: 0.4, step: 0.06 },
  tiradores: { at: 1.15, duration: 0.2, step: 0.04 },
  cota: { at: 1.3, duration: 0.4 },
  'cota-op': { at: 1.5, duration: 0.2 },
  label: { at: 1.55, duration: 0.25 },
};
const SEQ_SIMPLE = { ...SEQ, frentes: { ...SEQ.frentes, at: 0.5 }, cota: { at: 0.9, duration: 0.4 }, 'cota-op': { at: 1.1, duration: 0.2 }, label: { at: 1.15, duration: 0.25 } };
// Se dibujan con pathLength; el resto entra por opacidad (el punteado usa stroke-dasharray, igual
// que pathLength, así que lo oculto no se puede "trazar").
const DRAWN = ['casco', 'divisiones', 'frentes', 'tiradores', 'cota'];
const FADED = ['oculto', 'cota-op', 'label'];

/**
 * Plano isométrico del bajo mesada, generado desde src/data/muebleIso.js y dibujado en los px
 * reales del contenedor.
 *   draw     'mount' (se dibuja al montar, después de `delay`) | 'none' (completo, sin intro)
 *   simple   sin divisiones ni tiradores (mobile)
 *   onDrawn  se llama al terminar el dibujo (para no repetirlo si el componente se remonta)
 */
export default function MuebleIso({ draw = 'mount', delay = 0, simple = false, onDrawn, className = '' }) {
  const def = BAJO_MESADA;
  const [scope, animate] = useAnimate();
  const { width, height } = useElementSize(scope);
  const { reduce } = useMotionSafe();
  const geo = isoLayout(def, width, height, { simple });
  const ready = !!geo;
  const animar = draw === 'mount' && !reduce;

  const onDrawnRef = useRef(onDrawn);
  onDrawnRef.current = onDrawn;

  // Mientras hay intro pendiente, cada trazo se renderiza con el atributo opacity="0" (el dibujo
  // nunca aparece completo por un frame). Tiene que ser ese atributo y no CSS: en SVG Framer anima
  // la opacidad como atributo de presentación, y cualquier regla CSS o style inline le gana.
  // Un resize no reinicia el dibujo (pathLength es relativo: sigue donde iba con el `d` nuevo).
  useLayoutEffect(() => {
    if (!ready || !animar) return;
    // Token de cancelación de esta corrida: la limpieza (desmontaje o cambio de variante) lo
    // invalida, y una corrida invalidada no avisa que terminó.
    const run = { vigente: true };
    const seq = simple ? SEQ_SIMPLE : SEQ;
    const all = [...scope.current.querySelectorAll('[data-g]')];
    const controls = [];
    const group = (g) => all.filter((el) => el.dataset.g === g);
    DRAWN.forEach((g) =>
      group(g).forEach((el, i) => {
        const at = delay + seq[g].at + i * (seq[g].step ?? 0);
        controls.push(
          animate(el, { pathLength: [0, 1], opacity: [0, 1] }, {
            pathLength: { duration: seq[g].duration, ease: ease.softClose, delay: at },
            opacity: { duration: 0.01, delay: at },
          })
        );
      })
    );
    FADED.forEach((g) => {
      const els = group(g);
      if (els.length) controls.push(animate(els, { opacity: [0, 1] }, { duration: seq[g].duration, ease: ease.settle, delay: delay + seq[g].at }));
    });
    Promise.all(controls).then(() => {
      if (run.vigente) onDrawnRef.current?.();
    });
    return () => {
      run.vigente = false;
      controls.forEach((c) => c.stop());
      // Cortado a mitad: todo a su estado final.
      const drawn = all.filter((el) => DRAWN.includes(el.dataset.g));
      if (drawn.length) animate(drawn, { pathLength: 1, opacity: 1 }, { duration: 0 });
      animate(all.filter((el) => !DRAWN.includes(el.dataset.g)), { opacity: 1 }, { duration: 0 });
    };
    // Solo al quedar listo o cambiar de variante; `delay` y un resize no redibujan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, animar, simple]);

  const hidden = animar ? 0 : undefined;
  const label = `Plano isométrico de ${def.descripcion} de ${def.ancho} por ${def.alto} por ${def.profundidad} milímetros`;

  return (
    <div
      ref={scope}
      className={`${styles.root} ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      {geo && (
        <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          {geo.trazos.map((t, i) => (
            <path key={`t${i}`} d={t.d} data-g={t.g} opacity={hidden} className={styles[t.g]} />
          ))}
          {geo.ext.map((d, i) => (
            <path key={`e${i}`} d={d} data-g="cota-op" opacity={hidden} className={styles.ext} />
          ))}
          {geo.cotas.map((c) => (
            <g key={c.key}>
              {c.segments.map((d, j) => (
                <path key={j} d={d} data-g="cota" opacity={hidden} className={styles.cota} />
              ))}
              {c.marks.map((d, j) => (
                <path key={`m${j}`} d={d} data-g="cota-op" opacity={hidden} className={styles.mark} />
              ))}
            </g>
          ))}
          {geo.cotas.map((c) => (
            <text
              key={`l${c.key}`}
              x={c.label.x}
              y={c.label.y}
              transform={`rotate(${c.label.angle} ${c.label.x} ${c.label.y})`}
              data-g="label"
              opacity={hidden}
              className={`${styles.label} tabular`}
            >
              {c.text}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}
