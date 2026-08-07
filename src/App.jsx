import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import ComoTrabajamos from './pages/ComoTrabajamos';
import Contacto from './pages/Contacto';
import RequireAuth from './components/admin/RequireAuth';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProductos from './pages/admin/AdminProductos';
import AdminProductoForm from './pages/admin/AdminProductoForm';
import AdminProyectos from './pages/admin/AdminProyectos';
import AdminProyectoForm from './pages/admin/AdminProyectoForm';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="productos" element={<Productos />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="proyectos/:slug" element={<ProyectoDetalle />} />
            <Route path="como-trabajamos" element={<ComoTrabajamos />} />
            <Route path="contacto" element={<Contacto />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="productos" replace />} />
              <Route path="productos" element={<AdminProductos />} />
              <Route path="productos/nuevo" element={<AdminProductoForm />} />
              <Route path="productos/:id/editar" element={<AdminProductoForm />} />
              <Route path="proyectos" element={<AdminProyectos />} />
              <Route path="proyectos/nuevo" element={<AdminProyectoForm />} />
              <Route path="proyectos/:id/editar" element={<AdminProyectoForm />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
