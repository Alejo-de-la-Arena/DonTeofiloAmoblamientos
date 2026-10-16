import { useLocation } from 'react-router-dom';
import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_URL } from '../../config/contact';
import './WhatsAppFloat.css';

// /contacto ya es en sí el embudo a WhatsApp (formulario + botón de envío): el flotante ahí
// solo duplica la acción y tapa el formulario en mobile.
const HIDDEN_ON = ['/contacto'];

export default function WhatsAppFloat() {
  const { pathname } = useLocation();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Escribinos por WhatsApp"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
