import { useEffect, useRef } from 'react';

/* ==========================================================================
   Pista por proyecto (listado): cada card con antes/después vive en un wrapper alto
   ("pista") = alto de la card + RUNWAY. La card es sticky debajo del nav, así que queda
   fijada mientras se recorre el RUNWAY; el wipe se calcula solo sobre ese recorrido.
   Ajustar acá: son longitudes CSS (el alto del espaciador al pie de cada pista).
   ========================================================================== */
export const RUNWAY_DESKTOP = '80vh'; // ≥768px
export const RUNWAY_MOBILE = '70svh'; // <768px
/** Fracción de la pista en la que el wipe llega al 100%: el resto es una pausa con el "después" completo. */
export const WIPE_END = 0.85;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Un solo controlador para todas las pistas de la página: un IntersectionObserver marca cuáles
 * están cerca del viewport y un único listener de scroll (con requestAnimationFrame) recalcula
 * solo esas. Al salir del observer se hace un último cálculo para dejarlas en 0 o en 1.
 */
const pistas = new Map(); // elemento pista → { card, onProgress, active }
let observer = null;
let raf = null;

function medir(el, item) {
  const card = item.card;
  if (!card) return;
  const runway = el.offsetHeight - card.offsetHeight;
  const top = parseFloat(getComputedStyle(card).top) || 0;
  const scrolled = top - el.getBoundingClientRect().top;
  const progress = runway > 0 ? clamp01(scrolled / runway) : 0;
  const pinned = runway > 0 && scrolled > 0 && scrolled < runway;
  item.onProgress(progress, pinned);
}

function frame() {
  raf = null;
  pistas.forEach((item, el) => item.active && medir(el, item));
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(frame);
}

function start() {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const item = pistas.get(e.target);
        if (!item) return;
        item.active = e.isIntersecting;
        medir(e.target, item); // también al desactivarse: queda en su estado final
      });
    },
    { rootMargin: '25% 0px' }
  );
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}

function stop() {
  observer?.disconnect();
  observer = null;
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  if (raf) cancelAnimationFrame(raf);
  raf = null;
}

/**
 * Registra una pista. onProgress(progress 0–1, pinned) se llama en cada frame de scroll mientras
 * la pista esté cerca del viewport. `enabled` false (reduced motion o sin antes/después) → nada.
 */
export function usePista(pistaRef, cardRef, onProgress, enabled = true) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = pistaRef.current;
    if (!enabled || !el) return undefined;
    if (!pistas.size) start();
    const item = { card: cardRef.current, onProgress: (p, pinned) => cb.current(p, pinned), active: false };
    pistas.set(el, item);
    observer.observe(el);
    medir(el, item);
    return () => {
      observer?.unobserve(el);
      pistas.delete(el);
      if (!pistas.size) stop();
    };
  }, [pistaRef, cardRef, enabled]);
}
