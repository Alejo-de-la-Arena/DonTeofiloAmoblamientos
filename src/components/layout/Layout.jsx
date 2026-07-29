import { Outlet, useLocation } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFloat from './WhatsAppFloat';
import { useScrollProgress } from '../../hooks/useScrollProgress';

// Solo Home y Proyectos tienen un hero oscuro full-bleed debajo del nav,
// así que solo ahí tiene sentido el nav transparente-a-sólido con el scroll.
const DARK_HERO_ROUTES = ['/', '/proyectos'];

export default function Layout() {
  const { pathname } = useLocation();
  const { progress, isSolid } = useScrollProgress();
  const navSolid = DARK_HERO_ROUTES.includes(pathname) ? isSolid : true;

  return (
    <>
      <ProgressBar progress={progress} />
      <Navbar isSolid={navSolid} />
      <Outlet />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
