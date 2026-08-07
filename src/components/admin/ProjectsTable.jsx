import { Link } from 'react-router-dom';
import PublishToggle from './PublishToggle';
import '../../components/admin/ProductsTable.css';

export default function ProjectsTable({ proyectos, onTogglePublicado, onDelete, togglingId }) {
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
