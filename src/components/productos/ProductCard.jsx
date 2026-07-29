import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ProductCard.css';

const BASE_SPAN = 30;

function priceLabel(product) {
  if (!product.mostrar_precio || product.precio == null) return 'Consultar';
  return `$${Number(product.precio).toLocaleString('es-AR')}`;
}

export default function ProductCard({ product, index, onOpen }) {
  const [ref, isVisible] = useScrollReveal((index % 6) * 80);
  const rowSpan = product.destacado ? BASE_SPAN + 4 : BASE_SPAN;
  const cover = product.imagenes[0];

  return (
    <article
      ref={ref}
      data-reveal
      className={`catalog-card${product.destacado ? ' catalog-card--featured' : ''}${
        isVisible ? ' is-visible' : ''
      }`}
      style={{ gridRow: `span ${rowSpan}` }}
      onClick={() => onOpen(product.id)}
    >
      <div className="catalog-card-media">
        <div
          className="catalog-card-img"
          style={cover ? { backgroundImage: `url(${cover})` } : undefined}
        />
        {product.destacado && (
          <>
            <div className="catalog-card-scrim" />
            <div className="catalog-card-overlay">
              <div className="catalog-card-overlay-cat">{product.categoria}</div>
              <div className="catalog-card-overlay-name">{product.nombre}</div>
            </div>
          </>
        )}
        {product.material && <div className="catalog-card-tag">{product.material}</div>}
      </div>
      {!product.destacado && (
        <div className="catalog-card-info">
          <div className="catalog-card-cat">{product.categoria}</div>
          <div className="catalog-card-name">{product.nombre}</div>
          <div className="catalog-card-row">
            <span className="catalog-card-price">{priceLabel(product)}</span>
            <span className="catalog-card-link">Ver detalle →</span>
          </div>
        </div>
      )}
    </article>
  );
}
