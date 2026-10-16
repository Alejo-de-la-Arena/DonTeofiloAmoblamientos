import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (
  await readFile(new URL('../src/lib/estadoTaller.js', import.meta.url), 'utf8')
).replace(
  "'../config/contact'",
  JSON.stringify(new URL('../src/config/contact.js', import.meta.url).href)
);
const { getEstadoTaller } = await import(
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
);
const cases = [
  ['Lunes 8:59', '2026-10-12T08:59:00-03:00', false, 'hoy a las 9h'],
  ['Lunes 9:00', '2026-10-12T09:00:00-03:00', true, 'respondemos hoy'],
  ['Viernes 18:01', '2026-10-16T18:01:00-03:00', false, 'mañana a las 9h'],
  ['Sábado 12:59', '2026-10-17T12:59:00-03:00', true, 'respondemos hoy'],
  ['Sábado 13:00', '2026-10-17T13:00:00-03:00', false, 'el lunes a las 9h'],
  ['Domingo', '2026-10-18T12:00:00-03:00', false, 'mañana a las 9h'],
];
for (const [name, date, open, suffix] of cases) {
  const actual = getEstadoTaller(new Date(date));
  assert.equal(actual.abierto, open, name);
  assert.ok(actual.texto.endsWith(suffix), name + ': ' + actual.texto);
  console.log(name + ': OK — ' + actual.texto);
}
assert.deepEqual(
  getEstadoTaller(new Date('2026-10-12T12:00:00Z')),
  getEstadoTaller(new Date('2026-10-12T09:00:00-03:00'))
);
console.log('Mismo instante en UTC y Argentina: OK');
