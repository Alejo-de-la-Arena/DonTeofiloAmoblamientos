import { WORKSHOP_TIME_ZONE, WORKSHOP_SCHEDULE } from '../config/contact';

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: WORKSHOP_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

/** Función pura: todos los cálculos usan el calendario local del taller. */
export function getEstadoTaller(date) {
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map(({ type, value }) => [type, value])
  );
  const calendar = new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  );
  const day = calendar.getUTCDay();
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const today = WORKSHOP_SCHEDULE.find((slot) => slot.days.includes(day));
  if (today && minutes >= today.opens && minutes < today.closes) {
    return { abierto: true, texto: 'Estamos en el taller ahora · respondemos hoy' };
  }
  for (let offset = 0; offset <= 7; offset++) {
    const nextDay = (day + offset) % 7;
    const slot = WORKSHOP_SCHEDULE.find((item) => item.days.includes(nextDay));
    if (!slot || (offset === 0 && minutes >= slot.opens)) continue;
    const when =
      offset === 0
        ? 'hoy'
        : offset === 1
          ? 'mañana'
          : 'el ' +
            ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][nextDay];
    return {
      abierto: false,
      texto: 'Ahora estamos cerrados · te respondemos ' + when + ' a las ' + slot.opens / 60 + 'h',
    };
  }
}
