// Mueble del hero de /como-trabajamos, en proyección isométrica (ver src/lib/iso.js).
// Es una ilustración genérica, NO un producto: un bajo mesada de 2 puertas y 1 cajón.
//
// Todo en milímetros reales. Ejes del modelo:
//   x  ancho, de izquierda a derecha del frente
//   y  profundidad, de la pared (0) hacia el frente (profundidad)
//   z  alto, del piso (0) hacia arriba
//
//   placa        espesor de las placas del casco: separa el borde del casco de cada hueco
//   zocalo       alto del zócalo (franja del frente, al ras)
//   luz          separación entre un frente y el borde de su hueco (frentes embutidos)
//   huecos       aberturas del frente { x, z, ancho, alto, frente }. Las aberturas son las
//                "divisiones" del dibujo (lo que dejan ver placa, travesaño y parante).
//     frente     'cajon' (tirador horizontal) · 'puerta' con bisagra 'izquierda' | 'derecha'
//                (el tirador va del lado libre)
//   descripcion  para el aria-label: "Plano isométrico de {descripcion} de A por H por P milímetros"

const ANCHO = 1200;
const ALTO = 860;
const PROF = 580;
const PLACA = 18;
const ZOCALO = 100;
const CAJON = 180; // alto del hueco del cajón

const piso = ZOCALO + PLACA; // cara superior de la base: 118
const techo = ALTO - PLACA; // cara inferior de la tapa: 842
const travesano = techo - CAJON - PLACA; // cara inferior del travesaño bajo el cajón: 644
const mitad = ANCHO / 2;

export const BAJO_MESADA = {
  descripcion: 'un bajo mesada',
  ancho: ANCHO,
  alto: ALTO,
  profundidad: PROF,
  placa: PLACA,
  zocalo: ZOCALO,
  luz: 3,
  huecos: [
    { x: PLACA, z: techo - CAJON, ancho: ANCHO - 2 * PLACA, alto: CAJON, frente: 'cajon' },
    { x: PLACA, z: piso, ancho: mitad - PLACA * 1.5, alto: travesano - piso, frente: 'puerta', bisagra: 'izquierda' },
    { x: mitad + PLACA / 2, z: piso, ancho: mitad - PLACA * 1.5, alto: travesano - piso, frente: 'puerta', bisagra: 'derecha' },
  ],
};
