import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProjectsTable from '../../components/admin/ProjectsTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { fetchProyectosAdmin, togglePublicado, deleteProyecto } from '../../lib/proyectosApi';
import { CATEGORIAS } from '../../data/productCategories';
import './AdminProyectos.css';

export default function AdminProyectos() {
  const [proyectos, setProyectos] = useState([]);
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
      const data = await fetchProyectosAdmin();
      setProyectos(data);
    } catch {
      setLoadError('No pudimos cargar los proyectos. Probá recargar la página.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proyectos.filter(
      (p) =>
        (categoria === 'Todas' || p.categoria === categoria) &&
        (!q || p.titulo.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
    );
  }, [proyectos, search, categoria]);

  async function handleToggle(project, next) {
    setTogglingId(project.id);
    const prev = proyectos;
    setProyectos((list) =>
      list.map((p) => (p.id === project.id ? { ...p, publicado: next } : p))
    );
    try {
      await togglePublicado(project.id, next);
    } catch {
      setProyectos(prev);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProyecto(pendingDelete.id);
      setProyectos((list) => list.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      // dejamos el modal abierto para que se vea que falló y se pueda reintentar
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-proyectos">
      <div className="admin-proyectos-head">
        <h1>Proyectos</h1>
        <Link to="/admin/proyectos/nuevo" className="admin-new-btn">
          + Nuevo proyecto
        </Link>
      </div>

      <div className="admin-proyectos-filters">
        <input
          type="text"
          placeholder="Buscar por título o categoría…"
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
          {proyectos.length === 0
            ? 'Todavía no cargaste ningún proyecto.'
            : 'No hay proyectos que coincidan con esa búsqueda.'}
        </p>
      )}
      {!loading && !loadError && filtered.length > 0 && (
        <ProjectsTable
          proyectos={filtered}
          togglingId={togglingId}
          onTogglePublicado={handleToggle}
          onDelete={setPendingDelete}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Eliminar proyecto"
        message={
          pendingDelete
            ? `¿Seguro que querés eliminar "${pendingDelete.titulo}"? Esta acción no se puede deshacer y borra también sus imágenes.`
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
