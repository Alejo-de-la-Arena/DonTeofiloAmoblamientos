import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import './RequireAuth.css';

export default function RequireAuth() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-boot">
        <div className="admin-boot-spinner" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
