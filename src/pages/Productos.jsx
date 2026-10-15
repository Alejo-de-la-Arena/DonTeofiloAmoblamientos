import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProductosHero from '../components/productos/ProductosHero';
import ProductFilterBar from '../components/productos/ProductFilterBar';
import ProductGrid from '../components/productos/ProductGrid';
import ProductDetailPanel from '../components/productos/ProductDetailPanel';
import { fetchProductosPublicos } from '../lib/productosApi';
import { useMotionSafe } from '../lib/motion';
import { fold, materialOptions, splitMateriales, tienePrecioVisible } from '../lib/catalogo';
import { CATEGORIAS, categoriaFromSlug, slugifyCategoria } from '../data/productCategories';
import './Productos.css';

const MAX_PRICE_DEFAULT = 3000000;
const TODOS = 'Todos';

function money(n) {
  return '$' + n.toLocaleString('es-AR');
}

/* La URL es la fuente de verdad de lo compartible:
   ?categoria=<slug>  ?q=<búsqueda>  → se escriben con replace (no llenan el historial)
   ?producto=<slug>                   → abrir el panel hace PUSH, así "atrás" lo cierra
   Material y precio son estado local: dependen de los datos y no tienen valor como link.
   RouteTransition no anima cambios de solo search (mismo pathname → swap inmediato). */
export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { reduce } = useMotionSafe();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [material, setMaterial] = useState(null); // clave normalizada, null = todos
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_DEFAULT);

  const categoria = categoriaFromSlug(searchParams.get('categoria')) ?? TODOS;
  const search = searchParams.get('q') ?? '';
  const productoSlug = searchParams.get('producto');

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

  const updateParams = useCallback(
    (mutate, options = { replace: true }) =>
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        return next;
      }, options),
    [setSearchParams]
  );

  const setCategoria = useCallback(
    (cat) =>
      updateParams((p) => {
        if (cat === TODOS) p.delete('categoria');
        else p.set('categoria', slugifyCategoria(cat));
      }),
    [updateParams]
  );

  const setSearch = useCallback(
    (q) =>
      updateParams((p) => {
        if (q) p.set('q', q);
        else p.delete('q');
      }),
    [updateParams]
  );

  // Material es texto libre en el admin: las opciones salen de los valores reales. Con menos de
  // dos no hay nada que filtrar y el grupo no se muestra; lo mismo con el precio.
  const materiales = useMemo(() => materialOptions(productos), [productos]);
  const showMaterial = materiales.length >= 2;
  const showPrice = useMemo(() => productos.filter(tienePrecioVisible).length >= 2, [productos]);
  const activeMaterial = showMaterial ? material : null;
  const activeMaxPrice = showPrice ? maxPrice : MAX_PRICE_DEFAULT;

  const filtered = useMemo(() => {
    const q = fold(search);
    return productos.filter((p) => {
      const priceOk = !tienePrecioVisible(p) || p.precio <= activeMaxPrice;
      const materialOk =
        !activeMaterial || splitMateriales(p.material).some((m) => fold(m) === activeMaterial);
      const searchOk =
        !q || [p.nombre, p.categoria, p.material].some((field) => fold(field).includes(q));
      return (categoria === TODOS || p.categoria === categoria) && materialOk && priceOk && searchOk;
    });
  }, [productos, categoria, activeMaterial, activeMaxPrice, search]);

  const hasFilters =
    categoria !== TODOS || !!activeMaterial || activeMaxPrice < MAX_PRICE_DEFAULT || search.trim() !== '';

  function clearAll() {
    setMaterial(null);
    setMaxPrice(MAX_PRICE_DEFAULT);
    updateParams((p) => {
      p.delete('categoria');
      p.delete('q');
    });
  }

  // ---------- panel de detalle ----------
  const detailProduct = productoSlug ? productos.find((p) => p.slug === productoSlug) ?? null : null;

  // Link con un slug que no existe (o despublicado): no se abre nada y se limpia el param.
  useEffect(() => {
    if (!loading && productoSlug && !detailProduct) updateParams((p) => p.delete('producto'));
  }, [loading, productoSlug, detailProduct, updateParams]);

  function openDetail(product) {
    updateParams((p) => p.set('producto', product.slug), { state: { panel: true } });
  }

  // Si el panel se abrió desde la página, cerrar = volver a la entrada anterior (la misma URL
  // sin el param), así el historial no acumula entradas. Si se entró con el link directo, no
  // hay entrada propia a la que volver: se saca el param con replace.
  const closeDetail = useCallback(() => {
    if (location.state?.panel) navigate(-1);
    else updateParams((p) => p.delete('producto'));
  }, [location.state, navigate, updateParams]);

  // Tiles del hero: aplican su categoría y bajan hasta la grilla (scroll-margin-top la deja
  // debajo del header).
  function handleHeroCategorySelect(cat) {
    setCategoria(cat);
    document
      .getElementById('catalogo')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <>
      <ProductosHero activeCategory={categoria} onCategorySelect={handleHeroCategorySelect} />
      <ProductFilterBar
        categories={[TODOS, ...CATEGORIAS]}
        activeCategory={categoria}
        onCategoryChange={setCategoria}
        materials={showMaterial ? materiales : null}
        activeMaterial={activeMaterial}
        onMaterialChange={setMaterial}
        showPrice={showPrice}
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
          {!loading && !loadError && (
            <ProductGrid
              products={filtered}
              materialOptions={materiales}
              showCategory={categoria === TODOS}
              activeCategory={categoria}
              search={search}
              hasFilters={hasFilters}
              onClearAll={clearAll}
              onOpen={openDetail}
            />
          )}
        </main>
      </div>
      <ProductDetailPanel product={detailProduct} materialOptions={materiales} onClose={closeDetail} />
    </>
  );
}
