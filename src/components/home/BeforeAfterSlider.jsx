import { useEffect, useRef } from 'react';
import './BeforeAfterSlider.css';

const STEP = 4;
// Movimiento mínimo antes de decidir si un toque sobre la imagen es drag (horizontal) o scroll.
const LOCK_PX = 8;

export default function BeforeAfterSlider({ beforeSrc, afterSrc, alt = '' }) {
  const sliderRef = useRef(null);
  const beforeWrapRef = useRef(null);
  const handleRef = useRef(null);
  const draggingRef = useRef(false);
  const posRef = useRef(50);
  // Toque en curso: { x, y, mode: 'pending' | 'drag' | 'scroll' }. La dirección se decide una
  // vez por gesto y no cambia hasta el touchend.
  const touchRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const beforeWrap = beforeWrapRef.current;
    const handle = handleRef.current;

    // El wrap de "antes" se recorta desde la derecha, así lo que queda visible es siempre
    // el tramo IZQUIERDO (0% → handle) — coincide con el tag "Antes" que vive a la izquierda.
    // El lado "después" es la capa de fondo sin recortar, siempre visible a la derecha del handle.
    // Muta el DOM directo (no vía React state) para que el drag/teclado no dispare un
    // re-render por frame — mismo criterio que ya usaba el drag.
    function setPos(pos) {
      const clamped = Math.max(2, Math.min(98, pos));
      posRef.current = clamped;
      beforeWrap.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      handle.style.left = clamped + '%';
      const rounded = Math.round(clamped);
      handle.setAttribute('aria-valuenow', rounded);
      handle.setAttribute('aria-valuetext', `${rounded}%`);
    }

    function moveTo(clientX) {
      const r = slider.getBoundingClientRect();
      setPos(((clientX - r.left) / r.width) * 100);
    }

    function onMouseMove(ev) {
      if (draggingRef.current) moveTo(ev.clientX);
    }
    function onMouseDown() {
      draggingRef.current = true;
    }
    function onMouseUp() {
      draggingRef.current = false;
    }

    // Touch: el tirador es siempre drag (touch-action: none). Sobre el resto de la imagen
    // (touch-action: pan-y) se espera al primer movimiento de LOCK_PX: horizontal → drag y
    // recién ahí preventDefault; vertical → se suelta y la página scrollea normal.
    function onTouchStart(ev) {
      const t = ev.touches[0];
      touchRef.current = { x: t.clientX, y: t.clientY, mode: handle.contains(ev.target) ? 'drag' : 'pending' };
    }
    function onTouchMove(ev) {
      const touch = touchRef.current;
      if (!touch) return;
      const t = ev.touches[0];
      if (touch.mode === 'pending') {
        const dx = t.clientX - touch.x;
        const dy = t.clientY - touch.y;
        if (Math.hypot(dx, dy) < LOCK_PX) return;
        touch.mode = Math.abs(dx) > Math.abs(dy) ? 'drag' : 'scroll';
      }
      if (touch.mode !== 'drag') return;
      if (ev.cancelable) ev.preventDefault();
      moveTo(t.clientX);
    }
    function onTouchEnd() {
      touchRef.current = null;
    }

    function onKeyDown(ev) {
      switch (ev.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          setPos(posRef.current - STEP);
          ev.preventDefault();
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          setPos(posRef.current + STEP);
          ev.preventDefault();
          break;
        case 'Home':
          setPos(2);
          ev.preventDefault();
          break;
        case 'End':
          setPos(98);
          ev.preventDefault();
          break;
        default:
          break;
      }
    }

    slider.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('touchstart', onTouchStart, { passive: true });
    slider.addEventListener('touchmove', onTouchMove, { passive: false });
    slider.addEventListener('touchend', onTouchEnd);
    slider.addEventListener('touchcancel', onTouchEnd);
    handle.addEventListener('keydown', onKeyDown);

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('touchstart', onTouchStart);
      slider.removeEventListener('touchmove', onTouchMove);
      slider.removeEventListener('touchend', onTouchEnd);
      slider.removeEventListener('touchcancel', onTouchEnd);
      handle.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="ba-slider" ref={sliderRef}>
      <img className="ba-after" src={afterSrc} alt={`Después${alt ? `: ${alt}` : ''}`} loading="lazy" />
      <div className="ba-tag ba-tag--after">Después</div>
      <div className="ba-before-wrap" ref={beforeWrapRef}>
        <img className="ba-before" src={beforeSrc} alt={`Antes${alt ? `: ${alt}` : ''}`} loading="lazy" />
      </div>
      <div className="ba-tag ba-tag--before">Antes</div>
      <div
        className="ba-handle"
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={`Comparar antes y después${alt ? `: ${alt}` : ''}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        aria-valuetext="50%"
      >
        <div className="ba-handle-btn">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
