import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, useInView, useMotionValue } from 'framer-motion';
import { ease, useMotionSafe } from '../../lib/motion';
import { useElementSize } from '../primitives/useElementSize';
import { cotaGeometry, LABEL_PAD } from '../primitives/cotaGeometry';
import { alzadoDe } from '../../data/alzados';
import styles from './Alzado.module.css';

/* ==========================================================================
   Alzado técnico generado desde src/data/alzados.js.

   Se dibuja en píxeles reales del contenedor (como <Cota>): la escala mm → px se calcula para
   el espacio disponible, así trazos, marcas y textos nunca se deforman. Cada tipo de módulo es
   una función pura que devuelve trazos { d, g }; `g` es el grupo de la secuencia de dibujo:
     contorno → modulos → detalles (+ ocultos, punteados) → cotas
   Lo oculto o proyectado va punteado como en un plano real; el punteado usa stroke-dasharray,
   así que esos trazos entran con opacidad en vez de con pathLength (que también lo usa).
   ========================================================================== */

const mmFormat = new Intl.NumberFormat('es-AR');
const fmt = (n) => `${mmFormat.format(Math.round(n))} mm`;

const COTA_T = 22; // espesor de una fila de cotas (px)
const COTA_GAP = 12; // del dibujo a la primera cota
const ROW_GAP = 4; // entre la fila de parciales y la del total
const CHAR_W = 6.9; // ancho medio de un carácter del label (10.5px, 600, tabular, +.06em)
const labelWidth = (text) => text.length * CHAR_W;

// Tiempos de la secuencia (s). Borrado rápido y todo junto; dibujo por grupos, ~900ms en total.
const ERASE = 0.25;
const SEQ = {
  contorno: { delay: 0, duration: 0.35 },
  modulos: { delay: 0.2, duration: 0.35 },
  detalles: { delay: 0.42, duration: 0.3 },
  oculto: { delay: 0.45, duration: 0.3 },
  cota: { delay: 0.58, duration: 0.32 },
  'cota-op': { delay: 0.72, duration: 0.18 },
  label: { delay: 0.66, duration: 0.24 },
};
const NUMBER = { delay: 0.58, duration: 0.32 };
const DRAWN = ['contorno', 'modulos', 'detalles', 'cota']; // pathLength; el resto, opacidad

/* ---------- trazado: mm → px ---------- */

const r = (v) => Math.round(v * 2) / 2;

function trazar(def, S, ox, oy) {
  const X = (mm) => r(ox + mm * S);
  const Y = (mm) => r(oy + mm * S);
  const out = [];
  const push = (g, d) => out.push({ g, d });
  const rect = (x, y, w, h, inset = 0) =>
    `M ${X(x) + inset} ${Y(y) + inset} H ${X(x + w) - inset} V ${Y(y + h) - inset} H ${X(x) + inset} Z`;
  const line = (x1, y1, x2, y2) => `M ${X(x1)} ${Y(y1)} L ${X(x2)} ${Y(y2)}`;
  const INSET = 1.5; // luz entre frentes contiguos (px): las hojas se leen como piezas separadas

  const tipos = {
    caja: (m) => push('contorno', rect(m.x, m.y, m.ancho, m.alto)),
    mesada: (m) => push('contorno', rect(m.x, m.y, m.ancho, m.alto)),
    zocalo: (m) => push('modulos', rect(m.x, m.y, m.ancho, m.alto, INSET)),
    tabla: (m) => push('modulos', rect(m.x, m.y, m.ancho, m.alto)),
    division: (m) => push('modulos', line(m.x, m.y, m.x + m.ancho, m.y)),

    'puertas-batientes': (m) => {
      const w = m.ancho / m.hojas;
      for (let i = 0; i < m.hojas; i++) {
        const x = m.x + i * w;
        push('modulos', rect(x, m.y, w, m.alto, INSET));
        // Las hojas abren hacia el centro del módulo: el tirador va del lado de la junta.
        const tiradorDer = m.hojas === 1 || i < m.hojas / 2;
        const borde = tiradorDer ? x + w - 45 : x + 45;
        if (m.tirador === 'horizontal') {
          const largo = Math.min(160, w * 0.3);
          const cx = x + w / 2;
          push('detalles', line(cx - largo / 2, m.y + m.alto - 60, cx + largo / 2, m.y + m.alto - 60));
        } else {
          const largo = Math.min(160, m.alto * 0.22);
          let y0 = m.y + 60; // bajo mesada: arriba
          if (m.abre === 'abajo') y0 = m.y + m.alto - 60 - largo; // alacena: abajo
          else if (m.alto > 1200) y0 = m.y + m.alto * 0.45 - largo / 2; // placard: a la altura de la mano
          push('detalles', line(borde, y0, borde, y0 + largo));
        }
        // Símbolo de apertura (convención de alzado): vértice en el lado de las bisagras.
        const bisagra = tiradorDer ? x : x + w;
        const libre = tiradorDer ? x + w : x;
        push('oculto', `M ${X(libre)} ${Y(m.y)} L ${X(bisagra)} ${Y(m.y + m.alto / 2)} L ${X(libre)} ${Y(m.y + m.alto)}`);
      }
    },

    'puertas-corredizas': (m) => {
      const s = m.solape;
      const w = (m.ancho + s * (m.hojas - 1)) / m.hojas;
      for (let i = 0; i < m.hojas; i++) {
        const x = m.x + i * (w - s);
        const adelante = i % 2 === 0;
        if (adelante) {
          push('modulos', rect(x, m.y, w, m.alto, INSET));
        } else {
          // La hoja de atrás: sus cantos quedan tapados por las de adelante → punteados.
          const a = i > 0 ? x + s : x;
          const b = i < m.hojas - 1 ? x + w - s : x + w;
          push('modulos', line(a, m.y + 4, b, m.y + 4));
          push('modulos', line(a, m.y + m.alto - 4, b, m.y + m.alto - 4));
          if (i > 0) push('oculto', line(x, m.y + 4, x, m.y + m.alto - 4));
          if (i < m.hojas - 1) push('oculto', line(x + w, m.y + 4, x + w, m.y + m.alto - 4));
        }
        // Tirador embutido: una ranura larga del lado visible.
        const tx = adelante ? (i === 0 ? x + w - s - 50 : x + s + 50) : x + w / 2;
        const largo = m.alto * 0.32;
        push('detalles', line(tx, m.y + m.alto * 0.4, tx, m.y + m.alto * 0.4 + largo));
      }
      // Sentido de deslizamiento sobre la hoja central.
      const cx = m.x + m.ancho / 2;
      const cy = m.y + m.alto * 0.2;
      const a = Math.min(220, w * 0.3);
      const p = 40;
      push(
        'detalles',
        `M ${X(cx - a)} ${Y(cy)} L ${X(cx + a)} ${Y(cy)} M ${X(cx - a + p)} ${Y(cy - p * 0.7)} L ${X(cx - a)} ${Y(cy)} L ${X(cx - a + p)} ${Y(cy + p * 0.7)} M ${X(cx + a - p)} ${Y(cy - p * 0.7)} L ${X(cx + a)} ${Y(cy)} L ${X(cx + a - p)} ${Y(cy + p * 0.7)}`
      );
    },

    cajones: (m) => {
      const h = m.alto / m.n;
      for (let i = 0; i < m.n; i++) {
        const y = m.y + i * h;
        push('modulos', rect(m.x, y, m.ancho, h, INSET));
        const largo = Math.min(200, m.ancho * 0.35);
        const cx = m.x + m.ancho / 2;
        push('detalles', line(cx - largo / 2, y + Math.min(80, h * 0.3), cx + largo / 2, y + Math.min(80, h * 0.3)));
      }
    },

    estantes: (m) => {
      for (let k = 1; k <= m.n; k++) {
        const y = m.y + (m.alto * k) / (m.n + 1);
        push('oculto', line(m.x + 18, y, m.x + m.ancho - 18, y));
      }
    },

    bacha: (m) => {
      // Bajo mesada: no se ve → punteada.
      const { x, y, ancho: w, alto: h } = m;
      push(
        'oculto',
        `M ${X(x)} ${Y(y)} L ${X(x)} ${Y(y + h * 0.5)} Q ${X(x)} ${Y(y + h)} ${X(x + w / 2)} ${Y(y + h)} Q ${X(x + w)} ${Y(y + h)} ${X(x + w)} ${Y(y + h * 0.5)} L ${X(x + w)} ${Y(y)}`
      );
      if (m.grifo) {
        const cx = x + w / 2;
        const top = y - 40; // cara superior de la mesada
        push(
          'detalles',
          `M ${X(cx - 30)} ${Y(top)} L ${X(cx - 30)} ${Y(top - 230)} Q ${X(cx - 30)} ${Y(top - 300)} ${X(cx + 40)} ${Y(top - 300)} L ${X(cx + 150)} ${Y(top - 300)} L ${X(cx + 150)} ${Y(top - 250)}`
        );
      }
    },

    marco: (m) => {
      const j = m.jamba;
      push('contorno', `M ${X(m.x)} ${Y(m.y + m.alto)} V ${Y(m.y)} H ${X(m.x + m.ancho)} V ${Y(m.y + m.alto)}`);
      push('modulos', `M ${X(m.x + j)} ${Y(m.y + m.alto)} V ${Y(m.y + j)} H ${X(m.x + m.ancho - j)} V ${Y(m.y + m.alto)}`);
    },

    'hoja-abertura': (m) => {
      const piso = m.y + m.alto;
      push('contorno', rect(m.x, m.y, m.ancho, m.alto - 10, INSET));
      // Tableros
      const p = 130;
      const mitad = m.y + (m.alto - 10) * 0.42;
      push('modulos', rect(m.x + p, m.y + p, m.ancho - 2 * p, mitad - m.y - p * 1.5));
      push('modulos', rect(m.x + p, mitad + p * 0.5, m.ancho - 2 * p, piso - 10 - p - mitad - p * 0.5));
      // Picaporte a 1000 del piso, del lado libre
      const izq = m.giro !== 'derecha';
      const hx = izq ? m.x + m.ancho - 70 : m.x + 70;
      const hy = piso - 1000;
      const rr = 28;
      push('detalles', `M ${X(hx - rr)} ${Y(hy)} A ${r(rr * S)} ${r(rr * S)} 0 1 0 ${X(hx + rr)} ${Y(hy)} A ${r(rr * S)} ${r(rr * S)} 0 1 0 ${X(hx - rr)} ${Y(hy)}`);
      push('detalles', line(hx, hy, izq ? hx - 140 : hx + 140, hy));
      // Arco de apertura (proyectado) desde la bisagra
      const bx = izq ? m.x : m.x + m.ancho;
      const fx = izq ? m.x + m.ancho : m.x;
      push('oculto', `M ${X(fx)} ${Y(piso)} A ${r(m.ancho * S)} ${r(m.ancho * S)} 0 0 ${izq ? 0 : 1} ${X(bx)} ${Y(piso - m.ancho)}`);
      push('oculto', line(bx, piso, bx, piso - m.ancho));
    },

    pared: (m) => {
      const losa = 110;
      push('contorno', line(m.x, m.y + losa, m.x + m.ancho, m.y + losa)); // cielorraso
      push('contorno', line(m.x, m.y + m.alto - losa, m.x + m.ancho, m.y + m.alto - losa)); // piso
      push('modulos', line(m.x, m.y + losa, m.x, m.y + m.alto - losa));
      push('modulos', line(m.x + m.ancho, m.y + losa, m.x + m.ancho, m.y + m.alto - losa));
      // Rayado de corte de las losas
      const paso = 140;
      let d = '';
      for (let x = m.x; x < m.x + m.ancho; x += paso) {
        d += `M ${X(x)} ${Y(m.y + losa)} L ${X(Math.min(x + losa, m.x + m.ancho))} ${Y(m.y + losa - Math.min(losa, m.x + m.ancho - x))} `;
        d += `M ${X(x)} ${Y(m.y + m.alto)} L ${X(Math.min(x + losa, m.x + m.ancho))} ${Y(m.y + m.alto - Math.min(losa, m.x + m.ancho - x))} `;
      }
      push('detalles', d.trim());
    },
  };

  def.modulos.forEach((m) => tipos[m.tipo]?.(m));
  return out;
}

/* ---------- cotas en px ---------- */

function cota({ x, y, length, orientation, label }) {
  const geo = cotaGeometry({ length, thickness: COTA_T, labelLength: label ? labelWidth(label) : 0, orientation });
  const t = (d) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, a, b) => `${r(+a + x)} ${r(+b + y)}`);
  const horizontal = orientation === 'horizontal';
  return {
    segments: geo.segments.map(t),
    marks: [...geo.stops, ...geo.ticks].map(t),
    label: horizontal ? { x: x + geo.center, y: y + COTA_T / 2 } : { x: x + COTA_T / 2, y: y + geo.center },
  };
}

function layout(def, w, h, parciales) {
  const conParciales = parciales && def.parciales?.length > 1;
  const padB = COTA_GAP + COTA_T + (conParciales ? COTA_T + ROW_GAP : 0);
  const padR = COTA_GAP + COTA_T;
  const S = Math.min((w - padR - 2) / def.ancho, (h - padB - 2) / def.alto);
  if (!(S > 0)) return null;
  const W = def.ancho * S;
  const H = def.alto * S;
  const ox = r((w - (W + padR)) / 2);
  const oy = r((h - (H + padB)) / 2);

  const trazos = trazar(def, S, ox, oy);
  const cotas = [];
  const ext = []; // líneas de referencia del dibujo a las cotas
  const bottom = oy + H;
  const right = ox + W;
  let rowY = bottom + COTA_GAP;

  if (conParciales) {
    let acc = 0;
    def.parciales.forEach((p) => {
      const x = ox + acc * S;
      const length = p * S;
      const text = mmFormat.format(p);
      const fits = labelWidth(text) + LABEL_PAD * 2 <= length;
      cotas.push({ ...cota({ x, y: rowY, length, orientation: 'horizontal', label: fits ? text : null }), text: fits ? text : null });
      acc += p;
    });
    def.parciales.slice(0, -1).reduce((a, p) => {
      const x = r(ox + (a + p) * S);
      ext.push(`M ${x} ${r(bottom + 3)} L ${x} ${r(rowY + COTA_T / 2)}`);
      return a + p;
    }, 0);
    rowY += COTA_T + ROW_GAP;
  }

  // El hueco de las cotas totales se reserva para el número más largo posible: mientras el
  // valor anima de una medida a otra, el texto nunca pisa la línea.
  const hueco = def.sinMedidas ? '? mm' : '0.000 mm';
  const ancho = cota({ x: ox, y: rowY, length: W, orientation: 'horizontal', label: hueco });
  const alto = cota({ x: right + COTA_GAP, y: oy, length: H, orientation: 'vertical', label: hueco });
  ext.push(`M ${r(ox)} ${r(bottom + 3)} L ${r(ox)} ${r(rowY + COTA_T / 2)}`);
  ext.push(`M ${r(right)} ${r(bottom + 3)} L ${r(right)} ${r(rowY + COTA_T / 2)}`);
  ext.push(`M ${r(right + 3)} ${r(oy)} L ${r(right + COTA_GAP + COTA_T / 2)} ${r(oy)}`);
  ext.push(`M ${r(right + 3)} ${r(bottom)} L ${r(right + COTA_GAP + COTA_T / 2)} ${r(bottom)}`);

  return { trazos, cotas, ancho, alto, ext };
}

/**
 * <Alzado categoria="Placards" />
 *   parciales   cotas parciales por módulo (desktop)
 *   draw        'mount' | 'view' (se dibuja la primera vez que entra en viewport)
 * Al cambiar `categoria`, el dibujo actual se borra (todo junto) y el nuevo se dibuja por
 * grupos. Si cambia otra vez mientras tanto, no se encola nada: al terminar el borrado se
 * dibuja la ÚLTIMA categoría pedida. Con reduced motion, crossfade.
 */
export default function Alzado({ categoria, parciales = false, draw = 'mount', className = '' }) {
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const sceneRef = useRef(null);
  const anchoLabelRef = useRef(null);
  const altoLabelRef = useRef(null);
  const { width, height } = useElementSize(rootRef);
  const { reduce } = useMotionSafe();
  const inView = useInView(rootRef, { once: true, margin: '0px 0px -10% 0px' });
  const armed = draw === 'mount' || inView;

  const [shown, setShown] = useState(categoria);
  const [drawTick, setDrawTick] = useState(0);
  const targetRef = useRef(categoria);
  targetRef.current = categoria;
  const erasing = useRef(false);
  const running = useRef([]);
  const alive = useRef(true);

  const def = alzadoDe(shown);
  const geo = width > 0 && height > 0 ? layout(def, width, height, parciales) : null;

  // Las cotas totales: el número anima del valor anterior al nuevo. Se escribe por ref (sin
  // setState por frame); el <text> no tiene hijos de React, así el render no lo pisa.
  const anchoMv = useMotionValue(def.ancho);
  const altoMv = useMotionValue(def.alto);
  useEffect(() => {
    const write = (ref) => (v) => ref.current && (ref.current.textContent = fmt(v));
    const offA = anchoMv.on('change', write(anchoLabelRef));
    const offB = altoMv.on('change', write(altoLabelRef));
    return () => {
      offA();
      offB();
    };
  }, [anchoMv, altoMv]);
  useLayoutEffect(() => {
    if (def.sinMedidas) return;
    if (anchoLabelRef.current) anchoLabelRef.current.textContent = fmt(anchoMv.get());
    if (altoLabelRef.current) altoLabelRef.current.textContent = fmt(altoMv.get());
  });

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      running.current.forEach((a) => a.stop());
    };
  }, []);

  const parts = (g) => [...(svgRef.current?.querySelectorAll(`[data-g="${g}"]`) ?? [])];
  const run = (els, keyframes, options) => {
    if (!els.length) return null;
    const a = animate(els, keyframes, options);
    running.current.push(a);
    return a;
  };
  const stopAll = () => {
    running.current.forEach((a) => a.stop());
    running.current = [];
  };

  // 1) Cambio de categoría: borrar lo que haya (aunque esté a medio dibujar) y recién ahí
  //    pasar a la última pedida.
  useEffect(() => {
    if (!armed || erasing.current || categoria === shown) return;
    erasing.current = true;
    stopAll();
    const done = reduce
      ? run([sceneRef.current], { opacity: 0 }, { duration: 0.1, ease: 'linear' })
      : Promise.all([
          run(DRAWN.flatMap(parts), { pathLength: 0 }, { duration: ERASE, ease: [0.4, 0, 1, 1] }),
          run(['oculto', 'cota-op', 'label'].flatMap(parts), { opacity: 0 }, { duration: ERASE * 0.6 }),
        ]);
    Promise.resolve(done).then(() => {
      if (!alive.current) return;
      erasing.current = false;
      setShown(targetRef.current);
      setDrawTick((t) => t + 1);
    });
    // `shown` y `armed` no disparan un borrado: solo el cambio de categoría pedida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  // 2) Dibujo de `shown` por grupos (o fade-in con reduced motion). Corre antes del paint, así
  //    el dibujo nuevo nunca aparece completo por un frame.
  const ready = !!geo;
  useLayoutEffect(() => {
    if (!ready || !armed) return;
    const first = drawTick === 0;
    if (reduce) {
      if (!first) run([sceneRef.current], { opacity: [0, 1] }, { duration: 0.1, ease: 'linear' });
      anchoMv.set(def.ancho);
      altoMv.set(def.alto);
      return;
    }
    DRAWN.forEach((g) => run(parts(g), { pathLength: [0, 1] }, { ...SEQ[g], ease: ease.softClose }));
    ['oculto', 'cota-op', 'label'].forEach((g) => run(parts(g), { opacity: [0, 1] }, { ...SEQ[g], ease: ease.settle }));
    if (first) {
      anchoMv.set(def.ancho);
      altoMv.set(def.alto);
    } else {
      running.current.push(animate(anchoMv, def.ancho, { ...NUMBER, ease: ease.softClose }));
      running.current.push(animate(altoMv, def.alto, { ...NUMBER, ease: ease.softClose }));
    }
    // Solo al cambiar lo que se dibuja; un resize redibuja los trazos ya completos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, drawTick, ready, armed]);

  const target = alzadoDe(categoria);
  const ariaLabel = target.sinMedidas
    ? `Boceto de ${target.descripcion}`
    : `Alzado de ${target.descripcion} de ${target.ancho} por ${target.alto} milímetros`;

  return (
    <div ref={rootRef} className={`${styles.root} ${className}`.trim()} role="img" aria-label={ariaLabel}>
      {geo && (
        <svg
          ref={svgRef}
          className={styles.svg}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          style={{ opacity: armed ? 1 : 0 }}
        >
          <g ref={sceneRef}>
            {geo.trazos.map((t, i) => (
              <path key={`${shown}-${i}`} d={t.d} data-g={t.g} className={styles[t.g]} />
            ))}

            {geo.ext.map((d, i) => (
              <path key={`e${i}`} d={d} data-g="cota-op" className={styles.ext} />
            ))}
            {[...geo.cotas, geo.ancho, geo.alto].map((c, i) => (
              <g key={`c${i}`}>
                {c.segments.map((d, j) => (
                  <path key={j} d={d} data-g="cota" className={styles.cota} />
                ))}
                {c.marks.map((d, j) => (
                  <path key={`m${j}`} d={d} data-g="cota-op" className={styles.mark} />
                ))}
              </g>
            ))}

            {geo.cotas.map(
              (c, i) =>
                c.text && (
                  <text key={`t${i}`} x={c.label.x} y={c.label.y} data-g="label" className={`${styles.label} tabular`}>
                    {c.text}
                  </text>
                )
            )}
            {def.sinMedidas ? (
              <>
                <text x={geo.ancho.label.x} y={geo.ancho.label.y} data-g="label" className={`${styles.label} tabular`}>
                  ? mm
                </text>
                <text
                  transform={`translate(${geo.alto.label.x} ${geo.alto.label.y}) rotate(90)`}
                  data-g="label"
                  className={`${styles.label} tabular`}
                >
                  ? mm
                </text>
              </>
            ) : (
              <>
                <text
                  ref={anchoLabelRef}
                  x={geo.ancho.label.x}
                  y={geo.ancho.label.y}
                  data-g="label"
                  data-cota="ancho"
                  className={`${styles.label} tabular`}
                />
                <text
                  ref={altoLabelRef}
                  transform={`translate(${geo.alto.label.x} ${geo.alto.label.y}) rotate(90)`}
                  data-g="label"
                  data-cota="alto"
                  className={`${styles.label} tabular`}
                />
              </>
            )}
          </g>
        </svg>
      )}
    </div>
  );
}
