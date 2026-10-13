import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/layout/Layout';
import RouteTransition from './components/layout/RouteTransition';
import Home from './pages/Home';
import Productos from './pages/Productos';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import ComoTrabajamos from './pages/ComoTrabajamos';
import Contacto from './pages/Contacto';

// El panel admin nunca lo carga un visitante normal — se separa del bundle inicial para
// que solo se descargue cuando alguien realmente entra a /admin.
const RequireAuth = lazy(() => import('./components/admin/RequireAuth'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminProductos = lazy(() => import('./pages/admin/AdminProductos'));
const AdminProductoForm = lazy(() => import('./pages/admin/AdminProductoForm'));
const AdminProyectos = lazy(() => import('./pages/admin/AdminProyectos'));
const AdminProyectoForm = lazy(() => import('./pages/admin/AdminProyectoForm'));

// Catálogo de primitivas, solo en dev: en build import.meta.env.DEV es `false` literal, así
// que Vite elimina la rama y el chunk ni siquiera se genera.
const DevPrimitives = import.meta.env.DEV ? lazy(() => import('./pages/dev/Primitives')) : null;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* RouteTransition maneja el scroll (arriba en PUSH, restaurado en POP) y las puertas
            entre rutas; pasa la location MOSTRADA a <Routes> para que la página saliente y el
            link activo del Navbar no cambien antes de que cierren las puertas. */}
        <RouteTransition>
          {(displayLocation) => (
            <Suspense fallback={<div style={{ padding: 40 }}>Cargando…</div>}>
              <Routes location={displayLocation}>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="productos" element={<Productos />} />
                  <Route path="proyectos" element={<Proyectos />} />
                  <Route path="proyectos/:slug" element={<ProyectoDetalle />} />
                  <Route path="como-trabajamos" element={<ComoTrabajamos />} />
                  <Route path="contacto" element={<Contacto />} />
                  {DevPrimitives && <Route path="dev/primitives" element={<DevPrimitives />} />}
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
            </Suspense>
          )}
        </RouteTransition>
      </AuthProvider>
    </BrowserRouter>
  );
}
