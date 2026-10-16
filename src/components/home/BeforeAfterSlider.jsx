import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './BeforeAfterSlider.css';

const STEP = 4;
// Movimiento mínimo antes de decidir si un toque sobre la imagen es drag (horizontal) o scroll.
const LOCK_PX = 8;
// Con `fadeTags`, cada tag se apaga cuando el tirador queda a menos de esta distancia (px):
// así nunca rotula la foto equivocada ni lo cruza la línea durante un wipe por scroll.
const TAG_GAP_PX = 26;

/**
 * Comparador antes/después arrastrable (mouse, touch con bloqueo por dirección, teclado).
 *
 * Opcional, para controlarlo desde afuera (listado de proyectos, wipe por scroll):
 * - ref → { setPosition(pct) }: mueve sin límites (0–100); el arrastre manual sigue en 2–98.
 * - onUserInput(): se llama cuando el usuario lo mueve (drag o teclado).
 * - initial: posición inicial (default 50).
 * - overlay: nodo encima de las imágenes y debajo del tirador (ej. el link de la imagen).
 * - fadeTags: apaga cada tag cuando el tirador llega a él (el tag ya no rotularía su foto).
 * - direction: de qué lado está el "después". 'rtl' (default): antes a la izquierda del tirador,
 *   después a la derecha (un wipe 100 → 0 lo hace entrar desde la derecha). 'ltr': al revés, antes
 *   a la derecha y después a la izquierda (un wipe 0 → 100 lo hace entrar desde la izquierda).
 * Sin estas props se comporta como siempre (detalle de proyecto).
 */
const BeforeAfterSlider = forwardRef(function BeforeAfterSlider(
  { beforeSrc, afterSrc, alt = '', initial = 50, onUserInput, overlay, fadeTags = false, direction = 'rtl' },
  ref
) {
  const sliderRef = useRef(null);
  const beforeWrapRef = useRef(null);
  const beforeTagRef = useRef(null);
  const afterTagRef = useRef(null);
  const handleRef = useRef(null);
  const draggingRef = useRef(false);
  const posRef = useRef(initial);
  const setPosRef = useRef(null);
  const onUserInputRef = useRef(onUserInput);
  onUserInputRef.current = onUserInput;
  // Toque en curso: { x, y, mode: 'pending' | 'drag' | 'scroll' }. La dirección se decide una
  // vez por gesto y no cambia hasta el touchend.
  const touchRef = useRef(null);

  useImperativeHandle(ref, () => ({ setPosition: (pct) => setPosRef.current?.(pct, 0, 100) }), []);

  useEffect(() => {
    const slider = sliderRef.current;
    const beforeWrap = beforeWrapRef.current;
    const handle = handleRef.current;
    const ltr = direction === 'ltr';

    // 'rtl': el wrap de "antes" se recorta desde la derecha, así lo que queda visible es siempre
    // el tramo IZQUIERDO (0% → handle) — coincide con el tag "Antes" que vive a la izquierda.
    // 'ltr': se recorta desde la izquierda y queda el tramo DERECHO (handle → 100%).
    // El "después" es la capa de fondo sin recortar, visible del otro lado del handle.
    // Muta el DOM directo (no vía React state) para que el drag/teclado no dispare un
    // re-render por frame — mismo criterio que ya usaba el drag.
    function setPos(pos, min = 2, max = 98) {
      const clamped = Math.max(min, Math.min(max, pos));
      posRef.current = clamped;
      beforeWrap.style.clipPath = ltr ? `inset(0 0 0 ${clamped}%)` : `inset(0 ${100 - clamped}% 0 0)`;
      handle.style.left = clamped + '%';
      if (fadeTags) {
        const x = (clamped / 100) * slider.clientWidth;
        const izq = ltr ? afterTagRef.current : beforeTagRef.current;
        const der = ltr ? beforeTagRef.current : afterTagRef.current;
        izq.style.opacity = x < izq.offsetLeft + izq.offsetWidth + TAG_GAP_PX ? '0' : '1';
        der.style.opacity = x > der.offsetLeft - TAG_GAP_PX ? '0' : '1';
      }
      const rounded = Math.round(clamped);
      handle.setAttribute('aria-valuenow', rounded);
      handle.setAttribute('aria-valuetext', `${rounded}%`);
    }
    setPosRef.current = setPos;
    setPos(posRef.current, 0, 100);

    // Movimiento iniciado por el usuario (drag o teclado): avisa afuera.
    function userPos(pos) {
      setPos(pos);
      onUserInputRef.current?.();
    }

    function moveTo(clientX) {
      const r = slider.getBoundingClientRect();
      userPos(((clientX - r.left) / r.width) * 100);
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
          userPos(posRef.current - STEP);
          ev.preventDefault();
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          userPos(posRef.current + STEP);
          ev.preventDefault();
          break;
        case 'Home':
          userPos(2);
          ev.preventDefault();
          break;
        case 'End':
          userPos(98);
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
      setPosRef.current = null;
      slider.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('touchstart', onTouchStart);
      slider.removeEventListener('touchmove', onTouchMove);
      slider.removeEventListener('touchend', onTouchEnd);
      slider.removeEventListener('touchcancel', onTouchEnd);
      handle.removeEventListener('keydown', onKeyDown);
    };
  }, [fadeTags, direction]);

  return (
    <div className={`ba-slider${direction === 'ltr' ? ' ba-slider--ltr' : ''}`} ref={sliderRef}>
      <img className="ba-after" src={afterSrc} alt={`Después${alt ? `: ${alt}` : ''}`} loading="lazy" draggable={false} />
      <div className="ba-tag ba-tag--after" ref={afterTagRef}>
        Después
      </div>
      <div className="ba-before-wrap" ref={beforeWrapRef}>
        <img className="ba-before" src={beforeSrc} alt={`Antes${alt ? `: ${alt}` : ''}`} loading="lazy" draggable={false} />
      </div>
      <div className="ba-tag ba-tag--before" ref={beforeTagRef}>
        Antes
      </div>
      {overlay}
      <div
        className="ba-handle"
        ref={handleRef}
        role="slider"
        tabIndex={0}
        aria-label={`Comparar antes y después${alt ? `: ${alt}` : ''}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(initial)}
        aria-valuetext={`${Math.round(initial)}%`}
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
});

export default BeforeAfterSlider;
