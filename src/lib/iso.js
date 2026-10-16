import { placeCota } from '../components/primitives/cotaGeometry';

/* ==========================================================================
   Proyección isométrica de un mueble definido en mm (src/data/muebleIso.js).

   Misma arquitectura que <Alzado>: cada tipo de pieza es una función pura que devuelve aristas
   3D { a, b, g } (o polilíneas { pts, g }); recién al final se proyecta, se escala al tamaño real
   del contenedor y se pasa a paths en px. `g` es el grupo de la secuencia de dibujo:
     casco → oculto → divisiones → frentes → tiradores → cota (+ cota-op, label)
   Se ven la tapa (z = alto), el frente (y = profundidad) y el lateral derecho (x = ancho). Las 3
   aristas que concurren en el vértice trasero-inferior-izquierdo (0, 0, 0) quedan ocultas: van
   punteadas, como en un plano real.
   ========================================================================== */

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
/** Proyección isométrica de un punto del modelo (mm), sin escalar. Y de pantalla hacia abajo. */
export const iso = (x, y, z) => [(x - y) * COS, (x + y) * SIN - z];

// Direcciones en pantalla de cada eje del modelo (unitarias).
const EJE = { x: [COS, SIN], y: [-COS, SIN], z: [0, -1] };
const neg = ([a, b]) => [-a, -b];

const COTA_T = 22; // espesor de la fila de cotas (px), igual que en Alzado
const COTA_GAP = 14; // del dibujo a la cota
const EXT_FROM = 3; // las líneas de referencia arrancan apenas separadas del dibujo
const LUZ_MIN_PX = 1.75; // la luz entre frente y hueco nunca se dibuja más fina que esto

const r = (v) => Math.round(v * 2) / 2;

/* ---------- piezas → aristas 3D ---------- */

// Rectángulo en el plano del frente (y = prof), de (x, z) a (x + w, z + h).
const rectFrente = (prof, x, z, w, h) => [
  [x, prof, z],
  [x + w, prof, z],
  [x + w, prof, z + h],
  [x, prof, z + h],
  [x, prof, z],
];

function piezas(def, luz) {
  const { ancho: W, alto: H, profundidad: D } = def;
  const out = [];
  const seg = (g, a, b) => out.push({ g, pts: [a, b] });
  const poli = (g, pts) => out.push({ g, pts });

  // Casco: las 9 aristas visibles, en orden de trazo (tapa, frente, lateral).
  poli('casco', [[0, 0, H], [W, 0, H], [W, D, H], [0, D, H], [0, 0, H]]);
  seg('casco', [0, D, H], [0, D, 0]);
  seg('casco', [0, D, 0], [W, D, 0]);
  seg('casco', [W, D, 0], [W, D, H]);
  seg('casco', [W, D, 0], [W, 0, 0]);
  seg('casco', [W, 0, 0], [W, 0, H]);
  // Las 3 ocultas, desde el vértice de atrás.
  seg('oculto', [0, 0, 0], [W, 0, 0]);
  seg('oculto', [0, 0, 0], [0, D, 0]);
  seg('oculto', [0, 0, 0], [0, 0, H]);

  // Divisiones: el zócalo y el borde de cada hueco (placa, travesaño y parante quedan a la vista).
  seg('divisiones', [0, D, def.zocalo], [W, D, def.zocalo]);
  def.huecos.forEach((h) => poli('divisiones', rectFrente(D, h.x, h.z, h.ancho, h.alto)));

  // Frentes embutidos, separados del hueco por la luz; tiradores del lado libre.
  def.huecos.forEach((h) => {
    const x = h.x + luz;
    const z = h.z + luz;
    const w = h.ancho - 2 * luz;
    const alto = h.alto - 2 * luz;
    poli('frentes', rectFrente(D, x, z, w, alto));
    if (h.frente === 'cajon') {
      const largo = Math.min(240, w * 0.25);
      const tz = z + alto * 0.55;
      seg('tiradores', [x + w / 2 - largo / 2, D, tz], [x + w / 2 + largo / 2, D, tz]);
    } else {
      const largo = Math.min(140, alto * 0.3);
      const tx = h.bisagra === 'izquierda' ? x + w - 45 : x + 45;
      const top = z + alto - 60;
      seg('tiradores', [tx, D, top - largo], [tx, D, top]);
    }
  });
  return out;
}

/* ---------- cotas: arista medida + dirección hacia afuera ---------- */

function cotasDe(def) {
  const { ancho: W, alto: H, profundidad: D } = def;
  return [
    { key: 'ancho', desde: [0, D, 0], eje: 'x', largo: W, hacia: EJE.y },
    { key: 'profundidad', desde: [W, 0, 0], eje: 'y', largo: D, hacia: EJE.x },
    { key: 'alto', desde: [0, D, 0], eje: 'z', largo: H, hacia: neg(EJE.x) },
  ];
}

const finDe = (desde, eje, largo) => {
  const p = [...desde];
  p['xyz'.indexOf(eje)] += largo;
  return p;
};

/* ---------- encuadre ---------- */

// Todos los puntos que ocupan lugar, en px, para una escala S: cada uno es S·(punto iso) + un
// desplazamiento fijo en px (el de las cotas no escala: su espesor es siempre COTA_T).
function extremos(def, S) {
  const pts = [];
  const vert = [0, def.ancho].flatMap((x) => [0, def.profundidad].flatMap((y) => [0, def.alto].map((z) => [x, y, z])));
  vert.forEach((v) => pts.push(iso(...v).map((c) => c * S)));
  cotasDe(def).forEach((c) => {
    [c.desde, finDe(c.desde, c.eje, c.largo)].forEach((p) => {
      const [px, py] = iso(...p).map((k) => k * S);
      const off = COTA_GAP + COTA_T;
      pts.push([px + c.hacia[0] * off, py + c.hacia[1] * off]);
    });
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/**
 * Dibujo completo en px para un contenedor de w × h.
 *   simple  sin divisiones ni tiradores (mobile)
 * Devuelve { trazos: [{ d, g }], cotas: [{ segments, marks, label, text }], ext: [d] } o null.
 */
export function isoLayout(def, w, h, { simple = false } = {}) {
  if (!(w > 0 && h > 0)) return null;
  // La escala que entra: el ancho/alto ocupado crece linealmente con S, se busca por bisección.
  const fits = (S) => {
    const e = extremos(def, S);
    return e.maxX - e.minX <= w - 2 && e.maxY - e.minY <= h - 2;
  };
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  const S = lo;
  if (!(S > 0)) return null;
  const e = extremos(def, S);
  const ox = (w - (e.maxX - e.minX)) / 2 - e.minX;
  const oy = (h - (e.maxY - e.minY)) / 2 - e.minY;
  const P = (p) => {
    const [x, y] = iso(...p);
    return [ox + x * S, oy + y * S];
  };
  const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'} ${P(p).map(r).join(' ')}`).join(' ');

  const luz = Math.max(def.luz, LUZ_MIN_PX / S);
  const trazos = piezas(def, luz)
    .filter((t) => !(simple && (t.g === 'divisiones' || t.g === 'tiradores')))
    .map((t) => ({ g: t.g, d: path(t.pts) }));

  const cotas = [];
  const ext = [];
  cotasDe(def).forEach((c) => {
    const a = P(c.desde);
    const b = P(finDe(c.desde, c.eje, c.largo));
    const [vx, vy] = c.hacia;
    const text = String(c.largo);
    cotas.push({
      key: c.key,
      text,
      ...placeCota({ x: a[0] + vx * COTA_GAP, y: a[1] + vy * COTA_GAP, u: EJE[c.eje], v: c.hacia, length: c.largo * S, thickness: COTA_T, label: text }),
    });
    const tope = COTA_GAP + COTA_T / 2;
    [a, b].forEach(([x, y]) => ext.push(`M ${r(x + vx * EXT_FROM)} ${r(y + vy * EXT_FROM)} L ${r(x + vx * tope)} ${r(y + vy * tope)}`));
  });

  return { trazos, cotas, ext };
}
