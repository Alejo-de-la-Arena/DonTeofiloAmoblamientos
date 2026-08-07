import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BtnPill from '../ui/BtnPill';
import InstagramIcon from '../ui/icons/InstagramIcon';
import { WHATSAPP_URL, INSTAGRAM_URL, LOCATIONS } from '../../config/contact';
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

const panelVariants = {
  hidden: { x: '100%' },
  show: { x: 0 },
};
const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.22 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function Navbar({ isSolid }) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);
  const panelRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

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

  // Bloquea el scroll del body y permite cerrar con Escape mientras el panel está abierto.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const motionTransition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.5, ease: [0.65, 0, 0.35, 1] };

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

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              className="nav-mobile-backdrop"
              aria-label="Cerrar menú"
              onClick={() => setIsOpen(false)}
              variants={backdropVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
            />
            <motion.div
              ref={panelRef}
              className="nav-mobile"
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              tabIndex={-1}
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              transition={motionTransition}
            >
              <div className="nav-mobile-rail" aria-hidden="true" />
              <div className="nav-mobile-content">
                <Link to="/" className="nav-mobile-brand" onClick={() => setIsOpen(false)}>
                  <span className="nav-mobile-brand-name">DON TEÓFILO</span>
                  <span className="nav-mobile-brand-sub">AMOBLAMIENTOS</span>
                </Link>

                <motion.nav
                  className="nav-mobile-links"
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  {NAV_LINKS.map((link, i) => (
                    <motion.div key={link.to} className="nav-mobile-row-wrap" variants={rowVariants}>
                      <NavLink
                        to={link.to}
                        end={link.end}
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="nav-mobile-row-index">{String(i + 1).padStart(2, '0')}</span>
                        <span className="nav-mobile-row-label">{link.label}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                </motion.nav>

                <div className="nav-mobile-bottom">
                  <BtnPill href={WHATSAPP_URL} className="nav-mobile-wa">
                    Escribinos
                  </BtnPill>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener"
                    aria-label="Instagram"
                    className="nav-mobile-ig"
                  >
                    <InstagramIcon size={19} stroke="#FAFAF8" />
                  </a>
                  <span className="nav-mobile-cities">
                    {LOCATIONS.map((loc) => loc.city).join(' · ')}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
