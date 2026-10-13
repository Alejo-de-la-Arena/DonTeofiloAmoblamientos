import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import SlidingDoors from '../primitives/SlidingDoors';
import { routeDoors, useMotionSafe } from '../../lib/motion';
import './RouteTransition.css';

/* ==========================================================================
   Transición entre rutas con puertas corredizas + manejo de scroll.

   Recibe `children` como función (displayLocation) => <Routes location={displayLocation}>.
   La location MOSTRADA va separada de la real: mientras las puertas cierran se sigue
   mostrando la página anterior, y como <Routes location> provee esa location por contexto,
   todo lo que está adentro (Navbar y su link activo, Layout, useLocation de cada página) ve
   la location mostrada, no la nueva. El cambio ocurre recién con las puertas cerradas.

   1. PUSH/REPLACE a otro pathname → cierran (280ms) → swap + scroll arriba → abren (280ms).
   2. Mismo pathname (solo cambian search/hash) → swap inmediato, sin puertas ni scroll.
   3. POP (atrás/adelante) → swap inmediato y se restaura el scroll guardado para esa entrada
      del historial (por location.key). Con <BrowserRouter> no existe <ScrollRestoration>
      (requiere createBrowserRouter), por eso se implementa acá.
   4. /admin (desde o hacia) y prefers-reduced-motion → swap inmediato, sin puertas.
   ========================================================================== */

const STORAGE_KEY = 'dt-scroll-positions';
const isAdmin = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

function loadPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePositions(positions) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    /* sessionStorage no disponible (modo privado estricto): la restauración vive en memoria */
  }
}

// `behavior: 'instant'` explícito: html tiene scroll-behavior:smooth y un scrollTo común
// animaría el salto (se vería la página nueva deslizarse hasta arriba).
const jump = (top) => window.scrollTo({ top, left: 0, behavior: 'instant' });

// Al volver, el contenido async (listas de Supabase) puede no haber llegado y la página ser
// más corta que la posición guardada. Se reintenta un rato hasta poder llegar, y se cancela
// si el usuario ya empezó a scrollear por su cuenta.
function restoreScroll(top) {
  let tries = 0;
  let cancelled = false;
  const cancel = () => (cancelled = true);
  window.addEventListener('wheel', cancel, { once: true, passive: true });
  window.addEventListener('touchstart', cancel, { once: true, passive: true });
  const attempt = () => {
    if (cancelled) return;
    jump(top);
    if (Math.abs(window.scrollY - top) > 2 && tries++ < 40) setTimeout(attempt, 50);
    else {
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
    }
  };
  attempt();
}

function scrollToHash(hash) {
  const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' }); // respeta scroll-margin-top
  else jump(0);
}

export default function RouteTransition({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { reduce } = useMotionSafe();

  const [shown, setShown] = useState({ location, navigationType });
  const [doorsOpen, setDoorsOpen] = useState(true);
  const pending = useRef(null);
  const positions = useRef(null);
  const shownKey = useRef(location.key);
  shownKey.current = shown.location.key;

  // El navegador no debe restaurar por su cuenta: lo hace este componente cuando corresponde.
  useEffect(() => {
    positions.current = loadPositions();
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        positions.current[shownKey.current] = window.scrollY;
      });
    };
    const persist = () => savePositions(positions.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      window.history.scrollRestoration = prev;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
      if (raf) cancelAnimationFrame(raf);
      persist();
    };
  }, []);

  // Cada cambio de location real decide cómo llegar a mostrarla.
  useEffect(() => {
    if (location.key === shown.location.key) return;
    const next = { location, navigationType };
    const samePath = location.pathname === shown.location.pathname;
    const instant =
      samePath || reduce || navigationType === 'POP' || isAdmin(location.pathname) || isAdmin(shown.location.pathname);

    if (instant) {
      pending.current = null;
      setShown(next);
      setDoorsOpen(true);
    } else {
      // Si ya estaban cerrando, solo se actualiza el destino: el swap usa el último.
      pending.current = next;
      setDoorsOpen(false);
    }
    // `shown` se lee a propósito sin ser dependencia: solo importa reaccionar a la location real.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigationType, reduce]);

  const handleClosed = useCallback(() => {
    if (!pending.current) return;
    setShown(pending.current);
    pending.current = null;
    setDoorsOpen(true);
  }, []);

  // Scroll del contenido recién mostrado, antes del paint (con las puertas todavía cerradas
  // cuando hubo transición). Cambios de solo search/hash en la misma página no tocan el scroll
  // salvo que haya un #ancla nuevo.
  const prevShown = useRef(shown.location);
  useLayoutEffect(() => {
    const prev = prevShown.current;
    prevShown.current = shown.location;
    if (prev.key === shown.location.key) return;
    const { pathname, hash, key } = shown.location;

    if (shown.navigationType === 'POP') {
      restoreScroll(positions.current?.[key] ?? 0);
    } else if (pathname === prev.pathname) {
      if (hash && hash !== prev.hash) scrollToHash(hash);
    } else if (hash) {
      scrollToHash(hash);
    } else {
      jump(0);
    }
  }, [shown]);

  return (
    <>
      {children(shown.location)}
      {!reduce && (
        <SlidingDoors
          open={doorsOpen}
          panels={routeDoors.panels}
          duration={routeDoors.duration}
          step={routeDoors.step}
          tone="madera"
          className="route-doors"
          onCloseComplete={handleClosed}
        />
      )}
    </>
  );
}
