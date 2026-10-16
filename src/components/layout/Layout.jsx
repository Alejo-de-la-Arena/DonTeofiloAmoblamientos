import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFloat from './WhatsAppFloat';
import { NavDarkContext } from './navTheme';
import { useScrollProgress } from '../../hooks/useScrollProgress';

// Solo Home y Proyectos tienen un hero oscuro full-bleed debajo del nav,
// así que solo ahí tiene sentido el nav transparente-a-sólido con el scroll.
const DARK_HERO_ROUTES = ['/', '/proyectos'];

const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;

// true mientras el borde inferior de `el` siga por debajo del header.
function useOverDark(el) {
  const [over, setOver] = useState(true);
  useEffect(() => {
    if (!el) return undefined;
    let raf = null;
    const check = () => {
      raf = null;
      setOver(el.getBoundingClientRect().bottom > headerH());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [el]);
  return over;
}

export default function Layout() {
  const { pathname } = useLocation();
  const { progress, isSolid } = useScrollProgress();
  const [darkEl, setDarkEl] = useState(null);
  const registerDark = useCallback((el) => {
    setDarkEl(el);
    return () => setDarkEl((cur) => (cur === el ? null : cur));
  }, []);
  const overDark = useOverDark(darkEl);

  let navSolid = DARK_HERO_ROUTES.includes(pathname) ? isSolid : true;
  if (darkEl) navSolid = !overDark;

  return (
    <NavDarkContext.Provider value={registerDark}>
      <ProgressBar progress={progress} />
      <Navbar isSolid={navSolid} />
      <Outlet />
      <Footer />
      <WhatsAppFloat />
    </NavDarkContext.Provider>
  );
}
