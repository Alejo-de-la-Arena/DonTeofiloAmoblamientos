import './ProductosHero.css';

export default function ProductosHero() {
  return (
    <header className="catalog-hero">
      <span className="catalog-hero-watermark">CATÁLOGO</span>
      <div className="catalog-hero-inner">
        <div className="section-eyebrow">
          <span className="section-eyebrow-line"></span>
          <span>Showroom &amp; catálogo</span>
        </div>
        <div className="catalog-hero-grid">
          <h1 className="catalog-hero-title">
            Nuestros
            <br />
            Productos
          </h1>
          <p className="catalog-hero-lead">
            Cada pieza que ves acá se fabrica a medida. Filtrá por tipo, material o presupuesto —
            y si no encontrás lo que buscás, lo diseñamos con vos.
          </p>
        </div>
      </div>
    </header>
  );
}
