import { useEffect, useState } from 'react';

const idle = (cb) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200));
const cancelIdle = (id) => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id));

/**
 * true cuando la página ya disparó `load` y el navegador quedó ocioso. Para descargas pesadas
 * que no deben competir con el LCP aunque su sección ya esté "cerca" al cargar (pantallas altas).
 */
export function useAfterLoad() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let id;
    const go = () => (id = idle(() => setReady(true)));
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      if (id) cancelIdle(id);
    };
  }, []);
  return ready;
}
