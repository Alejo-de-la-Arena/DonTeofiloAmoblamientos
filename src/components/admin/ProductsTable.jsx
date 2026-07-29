import { Link } from 'react-router-dom';
import PublishToggle from './PublishToggle';
import './ProductsTable.css';

function money(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

export default function ProductsTable({ productos, onTogglePublicado, onDelete, togglingId }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Publicado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>
                <div
                  className="admin-table-thumb"
                  style={p.imagenes[0] ? { backgroundImage: `url(${p.imagenes[0]})` } : undefined}
                />
              </td>
              <td className="admin-table-name">{p.nombre}</td>
              <td>{p.categoria}</td>
              <td>{p.mostrar_precio && p.precio != null ? money(p.precio) : 'Consultar'}</td>
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
                <Link to={`/admin/productos/${p.id}/editar`}>Editar</Link>
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
