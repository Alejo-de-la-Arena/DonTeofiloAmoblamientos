import { Link } from 'react-router-dom';
import PublishToggle from './PublishToggle';
import '../../components/admin/ProductsTable.css';

export default function ProjectsTable({
  proyectos,
  onTogglePublicado,
  onSetDestacado,
  onDelete,
  togglingId,
  destacandoId,
}) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Publicado</th>
            <th>Home</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.id}>
              <td>
                <div
                  className="admin-table-thumb"
                  style={p.imagen_despues ? { backgroundImage: `url(${p.imagen_despues})` } : undefined}
                />
              </td>
              <td className="admin-table-name">{p.titulo}</td>
              <td>{p.categoria}</td>
              <td>
                <span className={`admin-badge${p.publicado ? ' published' : ''}`}>
                  {p.publicado ? 'Publicado' : 'Borrador'}
                </span>
              </td>
              <td>
                <PublishToggle
                  checked={p.publicado}
                  disabled={togglingId === p.id}
                  onChange={(next) => onTogglePublicado(p, next)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className={`admin-star-toggle${p.destacado_home ? ' active' : ''}`}
                  disabled={destacandoId === p.id}
                  aria-pressed={p.destacado_home}
                  aria-label={
                    p.destacado_home ? 'Quitar de la Home' : 'Mostrar como destacado en la Home'
                  }
                  title={p.destacado_home ? 'Quitar de la Home' : 'Destacar en la Home'}
                  onClick={() => onSetDestacado(p, !p.destacado_home)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.6">
                    <path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-.7z" />
                  </svg>
                </button>
              </td>
              <td className="admin-table-actions">
                <Link to={`/admin/proyectos/${p.id}/editar`}>Editar</Link>
                <button type="button" onClick={() => onDelete(p)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
