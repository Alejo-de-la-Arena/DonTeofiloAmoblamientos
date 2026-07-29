import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductsTable from '../../components/admin/ProductsTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { fetchProductosAdmin, togglePublicado, deleteProducto } from '../../lib/productosApi';
import { CATEGORIAS } from '../../data/productCategories';
import './AdminProductos.css';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [togglingId, setTogglingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError('');
    try {
      const data = await fetchProductosAdmin();
      setProductos(data);
    } catch {
      setLoadError('No pudimos cargar los productos. Probá recargar la página.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return productos.filter(
      (p) =>
        (categoria === 'Todas' || p.categoria === categoria) &&
        (!q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
    );
  }, [productos, search, categoria]);

  async function handleToggle(product, next) {
    setTogglingId(product.id);
    const prev = productos;
    setProductos((list) =>
      list.map((p) => (p.id === product.id ? { ...p, publicado: next } : p))
    );
    try {
      await togglePublicado(product.id, next);
    } catch {
      setProductos(prev);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProducto(pendingDelete.id);
      setProductos((list) => list.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      // dejamos el modal abierto para que se vea que falló y se pueda reintentar
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-productos">
      <div className="admin-productos-head">
        <h1>Productos</h1>
        <Link to="/admin/productos/nuevo" className="admin-new-btn">
          + Nuevo producto
        </Link>
      </div>

      <div className="admin-productos-filters">
        <input
          type="text"
          placeholder="Buscar por nombre o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="Todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="admin-hint">Cargando…</p>}
      {!loading && loadError && <p className="admin-hint admin-hint--error">{loadError}</p>}
      {!loading && !loadError && filtered.length === 0 && (
        <p className="admin-hint">
          {productos.length === 0
            ? 'Todavía no cargaste ningún producto.'
            : 'No hay productos que coincidan con esa búsqueda.'}
        </p>
      )}
      {!loading && !loadError && filtered.length > 0 && (
        <ProductsTable
          productos={filtered}
          togglingId={togglingId}
          onTogglePublicado={handleToggle}
          onDelete={setPendingDelete}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Eliminar producto"
        message={
          pendingDelete
            ? `¿Seguro que querés eliminar "${pendingDelete.nombre}"? Esta acción no se puede deshacer y borra también sus imágenes.`
            : ''
        }
        confirmLabel="Eliminar"
        danger
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
