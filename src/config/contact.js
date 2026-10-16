// Datos de contacto reales de Don Teófilo Amoblamientos.
export const WHATSAPP_NUMBER = '5491125278819';
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_DISPLAY = '11 2527-8819';

export const CONTACT_EMAIL = 'Donteofiloamoblamientos@gmail.com';

export const INSTAGRAM_HANDLE = '@donteofiloamoblamientos';
export const INSTAGRAM_URL = 'https://instagram.com/donteofiloamoblamientos';

export const LOCATIONS = [{ city: 'Buenos Aires' }, { city: 'Tandil' }];

// Reseñas de Google. TODO: completar con la URL real del perfil de Google Business y la nota
// real. Sin URL el badge no se muestra; sin nota (null) se muestra sin número ni estrellas.
// Nunca poner una nota que no salga de Google.
export const GOOGLE_REVIEWS_URL = null;
export const GOOGLE_RATING = null;

export const WORKSHOP_TIME_ZONE = 'America/Argentina/Buenos_Aires';
export const WORKSHOP_SCHEDULE = [
  { days: [1, 2, 3, 4, 5], opens: 9 * 60, closes: 18 * 60 },
  { days: [6], opens: 9 * 60, closes: 13 * 60 },
];
export const ROUTE_DISTANCE_KM = 360; // verificar distancia por ruta

const hourRange = ({ opens, closes }) => opens / 60 + ' a ' + closes / 60 + 'h';
export const BUSINESS_HOURS = {
  weekdays: 'Lun a Vie · ' + hourRange(WORKSHOP_SCHEDULE[0]),
  saturday: 'Sáb · ' + hourRange(WORKSHOP_SCHEDULE[1]),
};
