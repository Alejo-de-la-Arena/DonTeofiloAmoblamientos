import { useEffect, useRef } from 'react';
import './BeforeAfterSlider.css';

const STEP = 4;

export default function BeforeAfterSlider({ beforeSrc, afterSrc, alt = '' }) {
  const sliderRef = useRef(null);
  const beforeWrapRef = useRef(null);
  const handleRef = useRef(null);
  const draggingRef = useRef(false);
  const posRef = useRef(50);

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

    function onMove(ev) {
      if (!draggingRef.current) return;
      // preventDefault mientras se arrastra para que el gesto horizontal no dispare
      // también el scroll vertical de la página (requiere el listener no-pasivo).
      if (ev.touches) ev.preventDefault();
      const r = slider.getBoundingClientRect();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      setPos(((cx - r.left) / r.width) * 100);
    }

    function onDown() {
      draggingRef.current = true;
    }
    function onUp() {
      draggingRef.current = false;
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

    slider.addEventListener('mousedown', onDown);
    slider.addEventListener('touchstart', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    handle.addEventListener('keydown', onKeyDown);

    return () => {
      slider.removeEventListener('mousedown', onDown);
      slider.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
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
