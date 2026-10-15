// Alzados (dibujos técnicos de frente) del hero de /productos y de la card "a medida".
// Son ilustraciones genéricas de cada categoría, NO productos: sin nombres ni ubicaciones.
//
// Todo en milímetros reales, origen arriba a la izquierda (y crece hacia abajo, como en SVG).
// <Alzado> calcula la escala para el espacio disponible: nada está dibujado a mano.
//
//   ancho, alto    medidas totales: son las cotas de ancho (abajo) y alto (a la derecha)
//   parciales      anchos de cada módulo a lo largo del frente (suman `ancho`): cotas
//                  parciales, solo en desktop
//   descripcion    para el aria-label: "Alzado de {descripcion} de {ancho} por {alto} milímetros"
//   modulos        { tipo, x, y, ancho, alto, ...opciones } — ver los tipos en Alzado.jsx:
//     caja                    contorno de un cuerpo
//     zocalo, mesada          franjas llenas
//     division                línea horizontal en `y` (maletero, separaciones)
//     puertas-batientes       hojas: n · tirador: 'vertical' | 'horizontal'
//     puertas-corredizas      hojas: n · solape: mm (el solape va punteado: queda detrás)
//     cajones                 n: filas iguales, tirador horizontal al centro
//     estantes                n: ocultos detrás de las puertas → punteados
//     bacha                   bajo mesada → punteada · grifo: true dibuja la grifería arriba
//     marco                   jamba: espesor del marco (sin umbral abajo)
//     hoja-abertura           giro: 'izquierda' | 'derecha' · arco de apertura punteado
//     tabla                   tabla de escritorio o estante flotante
//     pared                   piso y cielorraso con rayado de corte (boceto "tu espacio")

const placard = {
  descripcion: 'un placard',
  ancho: 2400,
  alto: 2600,
  parciales: [800, 800, 800],
  modulos: [
    { tipo: 'caja', x: 0, y: 0, ancho: 2400, alto: 2600 },
    { tipo: 'puertas-batientes', x: 0, y: 0, ancho: 2400, alto: 500, hojas: 3, tirador: 'horizontal' },
    { tipo: 'division', x: 0, y: 500, ancho: 2400 },
    { tipo: 'puertas-corredizas', x: 0, y: 500, ancho: 2400, alto: 2000, hojas: 3, solape: 40 },
    { tipo: 'zocalo', x: 0, y: 2500, ancho: 2400, alto: 100 },
  ],
};

export const ALZADOS = {
  Placards: placard,

  Cocinas: {
    descripcion: 'una cocina',
    ancho: 3200,
    alto: 2200,
    parciales: [600, 800, 600, 1200],
    modulos: [
      // Alacena alta
      { tipo: 'caja', x: 0, y: 0, ancho: 3200, alto: 700 },
      { tipo: 'puertas-batientes', x: 0, y: 0, ancho: 800, alto: 700, hojas: 2, tirador: 'vertical', abre: 'abajo' },
      { tipo: 'puertas-batientes', x: 800, y: 0, ancho: 600, alto: 700, hojas: 1, tirador: 'vertical', abre: 'abajo' },
      { tipo: 'puertas-batientes', x: 1400, y: 0, ancho: 1000, alto: 700, hojas: 2, tirador: 'vertical', abre: 'abajo' },
      { tipo: 'puertas-batientes', x: 2400, y: 0, ancho: 800, alto: 700, hojas: 2, tirador: 'vertical', abre: 'abajo' },
      // Bajo mesada: mesada a 900 del piso
      { tipo: 'mesada', x: 0, y: 1300, ancho: 3200, alto: 40 },
      { tipo: 'caja', x: 0, y: 1340, ancho: 3200, alto: 760 },
      { tipo: 'cajones', x: 0, y: 1340, ancho: 600, alto: 760, n: 3 },
      { tipo: 'puertas-batientes', x: 600, y: 1340, ancho: 800, alto: 760, hojas: 2, tirador: 'vertical' },
      { tipo: 'bacha', x: 750, y: 1340, ancho: 500, alto: 200, grifo: true },
      { tipo: 'puertas-batientes', x: 1400, y: 1340, ancho: 600, alto: 760, hojas: 1, tirador: 'vertical' },
      { tipo: 'puertas-batientes', x: 2000, y: 1340, ancho: 1200, alto: 760, hojas: 2, tirador: 'vertical' },
      { tipo: 'zocalo', x: 0, y: 2100, ancho: 3200, alto: 100 },
    ],
  },

  Vanitorys: {
    descripcion: 'un vanitory suspendido',
    ancho: 1200,
    alto: 550,
    modulos: [
      { tipo: 'mesada', x: 0, y: 0, ancho: 1200, alto: 30 },
      { tipo: 'caja', x: 0, y: 30, ancho: 1200, alto: 520 },
      { tipo: 'bacha', x: 350, y: 30, ancho: 500, alto: 170 },
      { tipo: 'cajones', x: 0, y: 30, ancho: 1200, alto: 520, n: 2 },
    ],
  },

  Aberturas: {
    descripcion: 'una puerta',
    ancho: 900,
    alto: 2100,
    modulos: [
      { tipo: 'marco', x: 0, y: 0, ancho: 900, alto: 2100, jamba: 50 },
      { tipo: 'hoja-abertura', x: 50, y: 50, ancho: 800, alto: 2050, giro: 'izquierda' },
    ],
  },

  Alacenas: {
    descripcion: 'una alacena',
    ancho: 2400,
    alto: 700,
    parciales: [800, 800, 800],
    modulos: [
      { tipo: 'caja', x: 0, y: 0, ancho: 2400, alto: 700 },
      { tipo: 'estantes', x: 0, y: 0, ancho: 2400, alto: 700, n: 1 },
      { tipo: 'puertas-batientes', x: 0, y: 0, ancho: 800, alto: 700, hojas: 2, tirador: 'vertical', abre: 'abajo' },
      { tipo: 'puertas-batientes', x: 800, y: 0, ancho: 800, alto: 700, hojas: 2, tirador: 'vertical', abre: 'abajo' },
      { tipo: 'puertas-batientes', x: 1600, y: 0, ancho: 800, alto: 700, hojas: 2, tirador: 'vertical', abre: 'abajo' },
    ],
  },

  'Diseño integral': {
    descripcion: 'un placard con escritorio',
    ancho: 3600,
    alto: 2600,
    parciales: [1800, 1800],
    modulos: [
      // Placard de dos hojas
      { tipo: 'caja', x: 0, y: 0, ancho: 1800, alto: 2600 },
      { tipo: 'estantes', x: 0, y: 0, ancho: 1800, alto: 2500, n: 4 },
      { tipo: 'puertas-batientes', x: 0, y: 0, ancho: 1800, alto: 2500, hojas: 2, tirador: 'vertical' },
      { tipo: 'zocalo', x: 0, y: 2500, ancho: 1800, alto: 100 },
      // Escritorio a 750 del piso, con cajonera y estante flotante
      { tipo: 'tabla', x: 1800, y: 1100, ancho: 1500, alto: 30 },
      { tipo: 'tabla', x: 1800, y: 1820, ancho: 1800, alto: 30 },
      { tipo: 'caja', x: 3150, y: 1850, ancho: 450, alto: 750 },
      { tipo: 'cajones', x: 3150, y: 1850, ancho: 450, alto: 750, n: 3 },
    ],
  },

  // Boceto de la card "Lo diseñamos con vos": la pared vacía de quien escribe.
  'pared-vacia': {
    descripcion: 'una pared sin medidas',
    ancho: 3000,
    alto: 2600,
    sinMedidas: true,
    modulos: [{ tipo: 'pared', x: 0, y: 0, ancho: 3000, alto: 2600 }],
  },
};

// "Todos" (sin filtro) muestra el placard.
export function alzadoDe(categoria) {
  return ALZADOS[categoria] ?? placard;
}

// Láminas del ciclo del hero, en orden. Por cada una:
//   palabra   la del título "Cada {palabra} / empieza en un plano"
//   nombre    lo que dibuja el alzado, para el cajetín (genérico: nunca un producto real)
//   pedido    artículo + sustantivo para "Pedí {pedido} a medida"
export const LAMINAS = [
  { categoria: 'Cocinas', palabra: 'cocina', nombre: 'Cocina con alacena y bajo mesada', pedido: 'una cocina' },
  { categoria: 'Placards', palabra: 'placard', nombre: 'Placard corredizo 3 puertas', pedido: 'un placard' },
  { categoria: 'Vanitorys', palabra: 'vanitory', nombre: 'Vanitory suspendido', pedido: 'un vanitory' },
  { categoria: 'Aberturas', palabra: 'puerta', nombre: 'Puerta de abrir con marco', pedido: 'una puerta' },
  { categoria: 'Alacenas', palabra: 'alacena', nombre: 'Alacena de 3 módulos', pedido: 'una alacena' },
  { categoria: 'Diseño integral', palabra: 'proyecto', nombre: 'Placard y escritorio integrados', pedido: 'un proyecto integral' },
].map((l) => ({ ...l, ancho: ALZADOS[l.categoria].ancho, alto: ALZADOS[l.categoria].alto }));
