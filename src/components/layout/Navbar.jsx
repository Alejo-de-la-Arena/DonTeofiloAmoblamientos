import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { drawerInY, dur, ease, reducedTransition, useMotionSafe } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import BtnPill from '../ui/BtnPill';
import InstagramIcon from '../ui/icons/InstagramIcon';
import CornerMarks from '../primitives/CornerMarks';
import PencilMark from '../primitives/PencilMark';
import { useElementSize } from '../primitives/useElementSize';
import WhatsAppButton from '../primitives/WhatsAppButton';
import { WHATSAPP_URL, INSTAGRAM_URL, LOCATIONS } from '../../config/contact';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Productos' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/como-trabajamos', label: 'Cómo trabajamos' },
  { to: '/contacto', label: 'Contacto' },
];

function navLinkClass({ isActive }) {
  return `nav-link${isActive ? ' active' : ''}`;
}

/* ==========================================================================
   Menú mobile: "el cajón". Baja desde el header con cierre suave, sobre papel con grilla de
   plano; el header queda arriba (sólido mientras está abierto) con la hamburguesa hecha X.
   Los ítems entran escalonados cuando el panel termina de bajar; al cerrar, el panel sube
   entero. Cerrado queda montado pero con visibility: hidden (retrasada lo que dura la subida),
   así no es alcanzable con Tab.
   ========================================================================== */

const DRAWER_ID = 'nav-drawer';
const PANEL_IN = dur.md; // baja
const PANEL_OUT = dur.sm; // sube de una vez
const ITEM_STEP = 0.04;
const FOOTER_DELAY = PANEL_IN + NAV_LINKS.length * ITEM_STEP;
const PENCIL_DELAY = FOOTER_DELAY + 0.15; // el trazo del activo, con el menú ya abierto

const panelV = {
  closed: { y: '-100%', transition: { duration: PANEL_OUT, ease: ease.door } },
  open: { y: '0%', transition: { duration: PANEL_IN, ease: ease.softClose } },
};
const panelReducido = {
  closed: { opacity: 0, transition: reducedTransition },
  open: { opacity: 1, transition: reducedTransition },
};
const listV = {
  hidden: {},
  show: { transition: { delayChildren: PANEL_IN, staggerChildren: ITEM_STEP } },
};
const footerV = {
  hidden: drawerInY.hidden,
  show: { ...drawerInY.show, transition: { ...drawerInY.show.transition, delay: FOOTER_DELAY } },
};

function DrawerLink({ link, onNavigate }) {
  const labelRef = useRef(null);
  const { width } = useElementSize(labelRef);
  return (
    <NavLink to={link.to} end={link.end} className="nav-drawer-link" onClick={onNavigate}>
      {({ isActive }) => (
        <span ref={labelRef} className="nav-drawer-label">
          {link.label}
          {isActive && <PencilMark word={link.label} width={width} delay={PENCIL_DELAY} />}
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar({ isSolid }) {
  const [isOpen, setIsOpen] = useState(false);
  // Cada apertura remonta el contenido: los ítems vuelven a entrar escalonados y el trazo del
  // activo se vuelve a dibujar. Al cerrar no cambia, así el panel sube con todo adentro.
  const [aperturas, setAperturas] = useState(0);
  const navRef = useRef(null);
  const burgerRef = useRef(null);
  const panelRef = useRef(null);
  const { pathname } = useLocation();
  const hasBurger = useIsMobile(980);
  const { reduce } = useMotionSafe();

  const open = () => {
    setAperturas((n) => n + 1);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  // Expone la altura real del header como variable CSS — la usan el drawer de filtros de
  // /productos y el cajón del menú para arrancar justo debajo, sin un valor fijo a mano.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    // getBoundingClientRect().bottom (no offsetHeight) para reflejar el borde real
    // renderizado, incluso con el reflow que provoca el swap de la webfont Newsreader.
    const setHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-h', `${el.getBoundingClientRect().bottom}px`);
    };
    setHeaderHeight();
    document.fonts?.ready?.then(setHeaderHeight);
    window.addEventListener('resize', setHeaderHeight);
    const observer = new ResizeObserver(setHeaderHeight);
    // border-box: el padding del header cambia entre transparente y sólido.
    observer.observe(el, { box: 'border-box' });
    return () => {
      window.removeEventListener('resize', setHeaderHeight);
      observer.disconnect();
    };
  }, []);

  // Se cierra con cualquier navegación (no solo con el click en un ítem) y al pasar a desktop.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!hasBurger) setIsOpen(false);
  }, [hasBurger]);

  // Abierto: bloquea el scroll del body, encierra el foco (hamburguesa + panel) y cierra con
  // Escape devolviendo el foco a la hamburguesa.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const burger = burgerRef.current;
    document.body.style.overflow = 'hidden';
    panel.querySelector('a[href]')?.focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        burger.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = [burger, ...panel.querySelectorAll('a[href], button:not([disabled])')];
      const i = focusables.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!e.shiftKey && (i === -1 || i === focusables.length - 1)) {
        e.preventDefault();
        focusables[0].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // Con el cajón abierto el header va sólido (papel): logo y X en tinta sobre cualquier hero.
  // Si el sólido lo fuerza el menú, el header conserva su alto (.forced) y no salta.
  const solid = isSolid || isOpen;
  const solidClass = solid ? ` solid${isSolid ? '' : ' forced'}` : '';

  return (
    <>
      <nav ref={navRef} className={`nav${solidClass}`}>
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

      <div className={`nav-burger-wrap${solidClass}`}>
        <button
          ref={burgerRef}
          type="button"
          className={`nav-burger${isOpen ? ' open' : ''}`}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls={DRAWER_ID}
          onClick={isOpen ? close : open}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div
        id={DRAWER_ID}
        className={`nav-drawer${isOpen ? ' open' : ''}`}
        style={{ '--drawer-out': `${reduce ? reducedTransition.duration : PANEL_OUT}s` }}
      >
        <motion.nav
          ref={panelRef}
          className="nav-drawer-panel"
          aria-label="Menú"
          variants={reduce ? panelReducido : panelV}
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
        >
          <CornerMarks tone="ink" inset="var(--s-3)" size="18px" />
          <div key={aperturas} className="nav-drawer-inner">
            <motion.ul className="nav-drawer-list" variants={reduce ? undefined : listV} initial="hidden" animate="show">
              {NAV_LINKS.map((link) => (
                <motion.li key={link.to} className="nav-drawer-row" variants={reduce ? undefined : drawerInY}>
                  <DrawerLink link={link} onNavigate={close} />
                </motion.li>
              ))}
            </motion.ul>

            <motion.div className="nav-drawer-foot" variants={reduce ? undefined : footerV} initial="hidden" animate="show">
              <div className="nav-drawer-actions">
                <WhatsAppButton variant="primary">Escribinos</WhatsAppButton>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="nav-drawer-ig">
                  <InstagramIcon size={18} stroke="currentColor" />
                  Instagram
                </a>
              </div>
              <p className="nav-drawer-cities">{LOCATIONS.map((loc) => loc.city).join(' · ')}</p>
            </motion.div>
          </div>
        </motion.nav>
      </div>
    </>
  );
}
