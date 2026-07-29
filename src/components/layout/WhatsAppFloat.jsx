import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_URL } from '../../config/contact';
import './WhatsAppFloat.css';

export default function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener"
      className="whatsapp-float"
      aria-label="Escribinos por WhatsApp"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
