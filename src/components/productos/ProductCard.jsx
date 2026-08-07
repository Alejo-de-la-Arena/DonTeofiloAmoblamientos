import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ProductCard.css';

export default function ProductCard({ product, index, onOpen }) {
  const [ref, isVisible] = useScrollReveal((index % 6) * 80);
  const cover = product.imagenes[0];

  return (
    <article
      ref={ref}
      data-reveal
      className={`catalog-card${isVisible ? ' is-visible' : ''}`}
      onClick={() => onOpen(product.id)}
    >
      <div className="catalog-card-media">
        <div
          className="catalog-card-img"
          style={cover ? { backgroundImage: `url(${cover})` } : undefined}
        />
        {product.destacado && <div className="catalog-card-badge">Destacado</div>}
      </div>
      <div className="catalog-card-info">
        <div className="catalog-card-cat">{product.categoria}</div>
        {product.descripcion && <p className="catalog-card-desc">{product.descripcion}</p>}
        <span className="catalog-card-link">
          Ver detalle <span aria-hidden="true">→</span>
        </span>
      </div>
    </article>
  );
}
