import ProductCard from './ProductCard';
import './ProductGrid.css';

export default function ProductGrid({ products, onOpen }) {
  return (
    <div className="catalog-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} onOpen={onOpen} />
      ))}
    </div>
  );
}
