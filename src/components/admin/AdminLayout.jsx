import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <span className="admin-topbar-name">DON TEÓFILO</span>
          <span className="admin-topbar-tag">Admin</span>
        </div>
        <nav className="admin-topbar-nav">
          <Link to="/admin/productos">Productos</Link>
          <a href="/" target="_blank" rel="noopener">
            Ver sitio ↗
          </a>
        </nav>
        <button type="button" className="admin-logout" onClick={handleSignOut}>
          Cerrar sesión
        </button>
      </header>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
