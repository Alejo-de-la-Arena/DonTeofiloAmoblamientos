import { useEffect, useRef } from 'react';
import './BeforeAfterSlider.css';

export default function BeforeAfterSlider({ beforeSrc, afterSrc }) {
  const sliderRef = useRef(null);
  const beforeWrapRef = useRef(null);
  const handleRef = useRef(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const slider = sliderRef.current;
    const beforeWrap = beforeWrapRef.current;
    const handle = handleRef.current;

    // El wrap de "antes" se recorta desde la derecha, así lo que queda visible es siempre
    // el tramo IZQUIERDO (0% → handle) — coincide con el tag "Antes" que vive a la izquierda.
    // El lado "después" es la capa de fondo sin recortar, siempre visible a la derecha del handle.
    function setPos(pos) {
      const clamped = Math.max(2, Math.min(98, pos));
      beforeWrap.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      handle.style.left = clamped + '%';
    }

    function onMove(ev) {
      if (!draggingRef.current) return;
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

    slider.addEventListener('mousedown', onDown);
    slider.addEventListener('touchstart', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    return () => {
      slider.removeEventListener('mousedown', onDown);
      slider.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  return (
    <div className="ba-slider" ref={sliderRef}>
      <div className="ba-after" style={{ '--after-img': `url(${afterSrc})` }}></div>
      <div className="ba-tag ba-tag--after">Después</div>
      <div className="ba-before-wrap" ref={beforeWrapRef}>
        <div className="ba-before" style={{ '--before-img': `url(${beforeSrc})` }}></div>
      </div>
      <div className="ba-tag ba-tag--before">Antes</div>
      <div className="ba-handle" ref={handleRef}>
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
