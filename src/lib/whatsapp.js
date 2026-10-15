import { WHATSAPP_NUMBER } from '../config/contact';

const BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const clean = (v) => (v == null ? '' : String(v).trim());
// "¿Cocina completa o parcial?" → "Cocina completa o parcial" (los labels del form son preguntas)
const asLabel = (label) => label.replace('¿', '').replace('?', '');

/**
 * Arma el texto del mensaje.
 *
 * - Con `tipo` (formulario de Contacto): saludo + "Quiero hacer una consulta sobre: {tipo}."
 *   y una línea "• Campo: valor" por cada dato completado, en orden. `nombre`, `telefono` y
 *   `mensaje` se agregan como campos; `extra` ([[label, valor], …]) suma campos dinámicos
 *   (ej. los de cada segmento del form). Si no hay ningún dato, agrega `sinDatos` (por defecto
 *   la aclaración del form de Contacto; null para no agregar nada).
 * - Sin `tipo`: `mensaje` va tal cual (consultas puntuales desde producto o proyecto).
 */
export function buildWhatsAppMessage({ tipo, nombre, telefono, mensaje, extra = [], sinDatos = '(Todavía no completé los datos)' } = {}) {
  if (!tipo) return clean(mensaje);

  const fields = [
    ['Nombre', nombre],
    ['Teléfono / WhatsApp', telefono],
    ...extra,
    ['Mensaje', mensaje],
  ];
  const lines = [`Hola Don Teófilo 👋 Quiero hacer una consulta sobre: ${tipo}.`, ''];
  fields.forEach(([label, value]) => {
    if (clean(value)) lines.push(`• ${asLabel(label)}: ${value}`);
  });
  if (lines.length === 2) {
    if (!sinDatos) return lines[0];
    lines.push(sinDatos);
  }
  return lines.join('\n');
}

/** URL de wa.me al número del negocio (config/contact.js), con el mensaje ya codificado. */
export function buildWhatsAppUrl(options = {}) {
  const text = buildWhatsAppMessage(options);
  return text ? `${BASE_URL}?text=${encodeURIComponent(text)}` : BASE_URL;
}
