import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_URL } from '../../config/contact';
import './ProductEmptyState.css';

export default function ProductEmptyState() {
  return (
    <div className="catalog-empty">
      <div className="catalog-empty-title">No encontramos productos con esos filtros.</div>
      <p className="catalog-empty-text">
        Pero eso no es un problema — lo que hacemos es, justamente, fabricar a medida. Contanos
        qué buscás y lo armamos para vos.
      </p>
      <a href={`${WHATSAPP_URL}`} target="_blank" rel="noopener" className="catalog-empty-cta">
        <WhatsAppIcon size={19} />
        Escribinos y lo armamos a medida →
      </a>
    </div>
  );
}
