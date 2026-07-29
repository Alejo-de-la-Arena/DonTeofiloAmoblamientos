import { useEffect, useState } from 'react';
import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_NUMBER } from '../../config/contact';
import './ProductDetailPanel.css';

export default function ProductDetailPanel({ product, onClose }) {
  const [activeImg, setActiveImg] = useState(0);
  const isOpen = !!product;

  useEffect(() => {
    setActiveImg(0);
  }, [product?.id]);

  const waHref = product
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `¡Hola Don Teófilo! Me interesa el producto "${product.nombre}" (${product.categoria}). ¿Me pasan más info y presupuesto?`
      )}`
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
              style={
                product.imagenes[activeImg]
                  ? { backgroundImage: `url(${product.imagenes[activeImg]})` }
                  : undefined
              }
            />
            {product.imagenes.length > 0 && (
              <div className="catalog-panel-thumbs">
                {product.imagenes.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    aria-label={`Foto ${i + 1}`}
                    className={`catalog-panel-thumb${i === activeImg ? ' active' : ''}`}
                    style={{ backgroundImage: `url(${src})` }}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}

            <div className="catalog-panel-body">
              <div className="catalog-panel-cat">{product.categoria}</div>
              <h2 className="catalog-panel-name">{product.nombre}</h2>
              <div className="catalog-panel-price">
                {product.mostrar_precio && product.precio != null
                  ? `$${Number(product.precio).toLocaleString('es-AR')}`
                  : 'Consultar'}
              </div>
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

              <a href={waHref} target="_blank" rel="noopener" className="catalog-panel-wa">
                <WhatsAppIcon size={20} />
                Consultar por este producto
              </a>
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
