import { useLayoutEffect, useState } from 'react';

// Tamaño de layout de un elemento (sin transforms), actualizado con ResizeObserver.
// Cubre los cambios por breakpoint y el reflow del swap de la webfont.
export function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = (width, height) =>
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    update(el.offsetWidth, el.offsetHeight);
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      if (box) update(box.inlineSize, box.blockSize);
      else update(entry.target.offsetWidth, entry.target.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
