// Geometría de una línea de medida de plano, compartida por <Cota> (SVG propio, en px del
// elemento) y <Alzado> (cotas dentro del dibujo). Se arma sobre dos ejes abstractos —`a` a lo
// largo de la cota, `c` a lo ancho— y recién al final se traduce a x/y según la orientación. Así
// horizontal y vertical comparten el mismo cálculo; la marca a 45° queda igual en ambas (de
// arriba-izquierda a abajo-derecha).

export const LABEL_PAD = 10; // aire entre el label y cada tramo de línea
const EDGE = 16; // distancia mínima del label al tope con labelPosition start/end
const TICK = 9 / 2 / Math.SQRT2; // media diagonal de la marca a 45° (9px de largo)

export function cotaGeometry({ length, thickness, labelLength, labelPosition = 'center', orientation }) {
  const pt = (a, c) => (orientation === 'horizontal' ? `${a} ${c}` : `${c} ${a}`);
  const mid = thickness / 2;
  const gap = labelLength ? Math.min(labelLength + LABEL_PAD * 2, length) : 0;
  let center = length / 2;
  if (labelPosition === 'start') center = Math.min(length / 2, EDGE + gap / 2);
  if (labelPosition === 'end') center = Math.max(length / 2, length - EDGE - gap / 2);

  return {
    center,
    // Cada tramo arranca en el borde del hueco y termina en el extremo: con pathLength 0→1 la
    // línea se dibuja desde el centro (el label) hacia afuera.
    segments: [
      `M ${pt(center - gap / 2, mid)} L ${pt(0, mid)}`,
      `M ${pt(center + gap / 2, mid)} L ${pt(length, mid)}`,
    ],
    stops: [
      `M ${pt(0.5, 2)} L ${pt(0.5, thickness - 2)}`,
      `M ${pt(length - 0.5, 2)} L ${pt(length - 0.5, thickness - 2)}`,
    ],
    ticks: [0, length].map((a) => {
      const [x, y] = orientation === 'horizontal' ? [a, mid] : [mid, a];
      return `M ${x - TICK} ${y - TICK} L ${x + TICK} ${y + TICK}`;
    }),
  };
}

/* ---------- cotas dentro de un dibujo SVG ---------- */

// Ancho estimado de un label de cota dibujado como <text> (10.5px, 600, tabular, +.06em; ver
// .label en Alzado.module.css y MuebleIso.module.css). Dentro de un dibujo no se mide el DOM.
const CHAR_W = 6.9;
export const labelWidth = (text) => text.length * CHAR_W;

const half = (v) => Math.round(v * 2) / 2;

/**
 * Cota ubicada en un marco cualquiera del dibujo: la geometría se arma en horizontal (eje `a` a lo
 * largo, `c` a lo ancho) y cada punto se lleva a pantalla como origen + a·u + c·v.
 *   u   dirección de la medida (unitaria)
 *   v   dirección hacia la que crece el espesor de la fila de cotas (unitaria). En un alzado es
 *       perpendicular a u; en una isométrica es otro eje iso, así topes y marcas quedan cizallados
 *       sobre el plano, como en un plano isométrico real.
 * Devuelve los trazos en px (redondeados a .5) y la posición y el ángulo del label, que siempre
 * queda legible (nunca cabeza abajo).
 */
export function placeCota({ x, y, u, v, length, thickness, label, labelPosition }) {
  const geo = cotaGeometry({ length, thickness, labelLength: label ? labelWidth(label) : 0, labelPosition, orientation: 'horizontal' });
  const map = (a, c) => [half(x + a * u[0] + c * v[0]), half(y + a * u[1] + c * v[1])];
  const t = (d) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, a, c) => map(+a, +c).join(' '));
  let angle = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  if (angle > 90.01) angle -= 180;
  if (angle < -90.01) angle += 180;
  const mid = thickness / 2;
  return {
    segments: geo.segments.map(t),
    marks: [...geo.stops, ...geo.ticks].map(t),
    label: { x: x + geo.center * u[0] + mid * v[0], y: y + geo.center * u[1] + mid * v[1], angle },
  };
}
