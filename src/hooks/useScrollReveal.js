import { useEffect, useState } from 'react';

export function useScrollReveal(delay = 0) {
  // Callback ref (vía useState) en vez de useRef: si el elemento se monta recién en un
  // render posterior (ej. un componente que devuelve null mientras carga datos async),
  // este estado cambia y el effect de abajo se vuelve a ejecutar para observarlo. Con
  // useRef, ese effect corre una sola vez al montar y, si el nodo todavía no existía en
  // ese momento, el IntersectionObserver nunca llega a adjuntarse — el elemento queda con
  // opacity:0 para siempre (ver regla [data-reveal] en global.css).
  const [node, setNode] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, delay]);

  return [setNode, isVisible];
}
