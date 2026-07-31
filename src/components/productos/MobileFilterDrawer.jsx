import { AnimatePresence, motion } from 'framer-motion';
import './MobileFilterDrawer.css';

const EASE = [0.22, 0.61, 0.36, 1];

export default function MobileFilterDrawer({
  open,
  onClose,
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
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="filter-drawer-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          />
          <motion.div
            className="filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros de productos"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="filter-drawer-head">
              <span className="filter-drawer-title">Filtros</span>
              <button
                type="button"
                className="filter-drawer-close"
                aria-label="Cerrar filtros"
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>

            <div className="filter-drawer-body">
              <div className="filter-drawer-group">
                <span className="filter-drawer-label">Buscar</span>
                <div className="filter-drawer-search-wrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="filter-drawer-search-icon">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  <input
                    className="filter-drawer-search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar producto…"
                  />
                </div>
              </div>

              <div className="filter-drawer-group">
                <span className="filter-drawer-label">Categoría</span>
                <div className="filter-drawer-pills">
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
              </div>

              <div className="filter-drawer-group">
                <span className="filter-drawer-label">Material</span>
                <div className="filter-drawer-pills">
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
              </div>

              <div className="filter-drawer-group">
                <span className="filter-drawer-label">Precio hasta</span>
                <div className="filter-drawer-price">
                  <input
                    type="range"
                    min={200000}
                    max={3000000}
                    step={50000}
                    value={maxPrice}
                    onChange={(e) => onMaxPriceChange(Number(e.target.value))}
                  />
                  <span className="filter-drawer-price-val">{maxPriceLabel}</span>
                </div>
              </div>
            </div>

            <div className="filter-drawer-footer">
              {hasFilters && (
                <button type="button" className="filter-drawer-clear" onClick={onClearAll}>
                  Limpiar filtros
                </button>
              )}
              <button type="button" className="filter-drawer-apply" onClick={onClose}>
                Ver {count} producto{count === 1 ? '' : 's'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
