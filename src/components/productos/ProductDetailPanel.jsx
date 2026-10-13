import WhatsAppButton from '../primitives/WhatsAppButton';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import './ProductDetailPanel.css';

export default function ProductDetailPanel({ product, onClose }) {
  const isOpen = !!product;

  const waHref = product
    ? buildWhatsAppUrl({
        mensaje: `¡Hola Don Teófilo! Me interesa el producto "${product.nombre}" (${product.categoria}). ¿Me pasan más info y presupuesto?`,
      })
    : '#';

  return (
    <>
      <div
        className={`catalog-backdrop${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`catalog-panel${isOpen ? ' open' : ''}`}>
        {product && (
          <div className="catalog-panel-scroll">
            <button className="catalog-panel-close" onClick={onClose} aria-label="Cerrar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div
              className="catalog-panel-hero"
              style={product.imagen ? { backgroundImage: `url(${product.imagen})` } : undefined}
            />

            <div className="catalog-panel-body">
              <div className="catalog-panel-cat">{product.categoria}</div>
              <h2 className="catalog-panel-name">{product.nombre}</h2>
              {product.mostrar_precio && product.precio != null && (
                <div className="catalog-panel-price">
                  ${Number(product.precio).toLocaleString('es-AR')}
                </div>
              )}
              {product.descripcion && <p className="catalog-panel-desc">{product.descripcion}</p>}

              <div className="catalog-panel-spec-label">Ficha técnica</div>
              <div className="catalog-panel-specs">
                <div className="catalog-panel-spec-row">
                  <span>Medidas orientativas</span>
                  <span>{product.medidas || '—'}</span>
                </div>
                <div className="catalog-panel-spec-row">
                  <span>Material</span>
                  <span>{product.material || '—'}</span>
                </div>
              </div>

              <WhatsAppButton href={waHref} variant="primary" block>
                Consultar por este producto
              </WhatsAppButton>
              <p className="catalog-panel-note">
                Te respondemos en menos de 24hs · Presupuesto sin compromiso
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
