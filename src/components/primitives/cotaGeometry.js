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
