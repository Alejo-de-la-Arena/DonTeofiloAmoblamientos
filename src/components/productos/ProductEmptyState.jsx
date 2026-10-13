import WhatsAppButton from '../primitives/WhatsAppButton';
import './ProductEmptyState.css';

export default function ProductEmptyState() {
  return (
    <div className="catalog-empty">
      <div className="catalog-empty-title">No encontramos productos con esos filtros.</div>
      <p className="catalog-empty-text">
        Pero eso no es un problema — lo que hacemos es, justamente, fabricar a medida. Contanos
        qué buscás y lo armamos para vos.
      </p>
      <WhatsAppButton variant="dark">Escribinos y lo armamos a medida →</WhatsAppButton>
    </div>
  );
}
