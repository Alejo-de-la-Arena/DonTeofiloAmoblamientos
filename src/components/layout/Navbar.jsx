import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import BtnPill from '../ui/BtnPill';
import { WHATSAPP_URL } from '../../config/contact';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/como-trabajamos', label: 'Cómo Trabajamos' },
  { to: '/contacto', label: 'Contacto' },
];

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? ' active' : ''}`;
}

function mobileNavLinkClass({ isActive }) {
  return `nav-mobile-link${isActive ? ' active' : ''}`;
}

export default function Navbar({ isSolid }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  // Expone la altura real del header como variable CSS — la usan elementos como el
  // drawer de filtros de /productos para arrancar justo debajo, sin un valor fijo a mano.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const setHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };
    setHeaderHeight();
    const observer = new ResizeObserver(setHeaderHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <nav ref={navRef} className={`nav${isSolid ? ' solid' : ''}`}>
        <Link to="/" className="nav-brand">
          <span className="nav-brand-name">DON TEÓFILO</span>
          <span className="nav-brand-sub">AMOBLAMIENTOS</span>
        </Link>
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <BtnPill href={WHATSAPP_URL}>Contactanos</BtnPill>
        </div>
      </nav>

      <div className={`nav-burger-wrap${isSolid ? ' solid' : ''}`}>
        <button
          className={`nav-burger${isOpen ? ' open' : ''}`}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`nav-mobile${isOpen ? ' open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={mobileNavLinkClass}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
