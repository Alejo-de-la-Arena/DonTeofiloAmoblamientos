import { useEffect, useRef } from 'react';
import { useMotionSafe } from '../../lib/motion';
import { usePinProgress } from './usePinProgress';
import styles from './PinnedSection.module.css';

// GOTCHA: position:sticky deja de funcionar si CUALQUIER ancestro tiene overflow
// hidden | auto | scroll (ese ancestro pasa a ser el scroll container). Para recortar desborde
// horizontal usar overflow-x:clip, que no crea scroll container (ver body en global.css).
// En dev se avisa por consola si algún ancestro lo rompe.
function useStickyGuard(ref, enabled) {
  useEffect(() => {
    if (!import.meta.env.DEV || !enabled || !ref.current) return;
    for (let el = ref.current.parentElement; el && el !== document.documentElement; el = el.parentElement) {
      const { overflowX, overflowY } = getComputedStyle(el);
      if ([overflowX, overflowY].some((v) => v === 'hidden' || v === 'auto' || v === 'scroll')) {
        console.warn('[PinnedSection] Un ancestro rompe position:sticky (usar overflow: clip):', el);
        return;
      }
    }
  }, [ref, enabled]);
}

/**
 * Contenedor alto con un hijo sticky de 100svh. `children` puede ser un nodo o una función
 * (progress, { pinned }) => nodo, donde progress es el MotionValue 0→1 de usePinProgress.
 *
 * Con reduced motion no hay pin: la sección mide lo que mide su contenido y `pinned` es false
 * para que el hijo renderice su versión estática.
 */
export default function PinnedSection({
  height = '300vh',
  heightMobile = '220vh',
  as: Tag = 'section',
  className = '',
  stickyClassName = '',
  children,
  ...rest
}) {
  const ref = useRef(null);
  const { reduce } = useMotionSafe();
  const pinned = !reduce;
  const progress = usePinProgress(ref);
  useStickyGuard(ref, pinned);

  const content = typeof children === 'function' ? children(progress, { pinned }) : children;

  if (!pinned) {
    return (
      <Tag ref={ref} className={className} {...rest}>
        {content}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`${styles.pin} ${className}`.trim()}
      style={{ '--pin-h': height, '--pin-h-mobile': heightMobile }}
      {...rest}
    >
      <div className={`${styles.sticky} ${stickyClassName}`.trim()}>{content}</div>
    </Tag>
  );
}
