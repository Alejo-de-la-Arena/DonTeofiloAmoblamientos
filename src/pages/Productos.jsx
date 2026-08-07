import { useEffect, useMemo, useState } from 'react';
import ProductosHero from '../components/productos/ProductosHero';
import ProductFilterBar from '../components/productos/ProductFilterBar';
import ProductGrid from '../components/productos/ProductGrid';
import ProductEmptyState from '../components/productos/ProductEmptyState';
import ProductDetailPanel from '../components/productos/ProductDetailPanel';
import { fetchProductosPublicos } from '../lib/productosApi';
import { CATEGORIAS, MATERIALES } from '../data/productCategories';
import './Productos.css';

const MAX_PRICE_DEFAULT = 3000000;

function money(n) {
  return '$' + n.toLocaleString('es-AR');
}

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [categoria, setCategoria] = useState('Todos');
  const [material, setMaterial] = useState('Todos');
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_DEFAULT);
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProductosPublicos();
        if (!cancelled) setProductos(data);
      } catch {
        if (!cancelled) setLoadError('No pudimos cargar el catálogo. Probá recargar la página.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter((p) => {
      const priceOk = !p.mostrar_precio || p.precio == null || p.precio <= maxPrice;
      return (
        (categoria === 'Todos' || p.categoria === categoria) &&
        (material === 'Todos' || p.material === material) &&
        priceOk &&
        (!q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
      );
    });
  }, [productos, categoria, material, maxPrice, search]);

  const hasFilters =
    categoria !== 'Todos' ||
    material !== 'Todos' ||
    maxPrice < MAX_PRICE_DEFAULT ||
    search.trim() !== '';

  const detailProduct = productos.find((p) => p.id === detailId) || null;

  function clearAll() {
    setCategoria('Todos');
    setMaterial('Todos');
    setMaxPrice(MAX_PRICE_DEFAULT);
    setSearch('');
  }

  function handleHeroCategorySelect(categoria) {
    setCategoria(categoria);
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <ProductosHero onCategorySelect={handleHeroCategorySelect} />
      <ProductFilterBar
        categories={['Todos', ...CATEGORIAS]}
        activeCategory={categoria}
        onCategoryChange={setCategoria}
        materials={['Todos', ...MATERIALES]}
        activeMaterial={material}
        onMaterialChange={setMaterial}
        maxPrice={maxPrice}
        maxPriceLabel={money(maxPrice)}
        onMaxPriceChange={setMaxPrice}
        search={search}
        onSearchChange={setSearch}
        count={filtered.length}
        hasFilters={hasFilters}
        onClearAll={clearAll}
      />
      <div id="catalogo" className="catalog-main-wrap">
        <main className="catalog-main">
          {loading && <p className="catalog-status">Cargando catálogo…</p>}
          {!loading && loadError && <p className="catalog-status catalog-status--error">{loadError}</p>}
          {!loading && !loadError && productos.length === 0 && (
            <p className="catalog-status">Todavía no hay productos cargados. ¡Volvé pronto!</p>
          )}
          {!loading && !loadError && productos.length > 0 && filtered.length > 0 && (
            <ProductGrid products={filtered} onOpen={setDetailId} />
          )}
          {!loading && !loadError && productos.length > 0 && filtered.length === 0 && (
            <ProductEmptyState />
          )}
        </main>
      </div>
      <ProductDetailPanel product={detailProduct} onClose={() => setDetailId(null)} />
    </>
  );
}
