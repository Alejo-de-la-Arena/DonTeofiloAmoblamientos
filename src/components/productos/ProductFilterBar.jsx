import { useEffect, useRef, useState } from 'react';
import MobileFilterDrawer from './MobileFilterDrawer';
import './ProductFilterBar.css';

export default function ProductFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  materials,
  activeMaterial,
  onMaterialChange,
  maxPrice,
  maxPriceLabel,
  onMaxPriceChange,
  search,
  onSearchChange,
  count,
  hasFilters,
  onClearAll,
}) {
  const [stuck, setStuck] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: '-64px 0px 0px 0px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="catalog-filter-sentinel" />
      <div className={`catalog-filter-bar${stuck ? ' stuck' : ''}`}>
        <button
          type="button"
          className="catalog-filter-trigger"
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtrar
          {hasFilters && <span className="catalog-filter-trigger-dot" />}
        </button>

        <div className="catalog-filter-inner">
          <div className="catalog-filter-row">
            <div className="catalog-filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`catalog-filter-pill${cat === activeCategory ? ' active' : ''}`}
                  onClick={() => onCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="catalog-search-wrap">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="catalog-search-icon"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                className="catalog-search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar producto…"
              />
            </div>
          </div>

          <div className="catalog-filter-row catalog-filter-row--secondary">
            <div className="catalog-filter-materials">
              <span className="catalog-filter-label">Material</span>
              {materials.map((mat) => (
                <button
                  key={mat}
                  type="button"
                  className={`catalog-material-pill${mat === activeMaterial ? ' active' : ''}`}
                  onClick={() => onMaterialChange(mat)}
                >
                  {mat}
                </button>
              ))}
            </div>
            <div className="catalog-filter-price">
              <span className="catalog-filter-label">Hasta</span>
              <input
                type="range"
                min={200000}
                max={3000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              />
              <span className="catalog-filter-price-val">{maxPriceLabel}</span>
            </div>
            <div className="catalog-filter-count">
              <span>
                <b>{count}</b> productos
              </span>
              {hasFilters && (
                <button type="button" className="catalog-filter-clear" onClick={onClearAll}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        materials={materials}
        activeMaterial={activeMaterial}
        onMaterialChange={onMaterialChange}
        maxPrice={maxPrice}
        maxPriceLabel={maxPriceLabel}
        onMaxPriceChange={onMaxPriceChange}
        search={search}
        onSearchChange={onSearchChange}
        count={count}
        hasFilters={hasFilters}
        onClearAll={onClearAll}
      />
    </>
  );
}
