import { useEffect, useState } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [isSolid, setIsSolid] = useState(false);

  useEffect(() => {
    let scrollRaf = null;

    function onScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        const y = window.scrollY || 0;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setIsSolid(y > 80);
        setProgress((h > 0 ? Math.min(1, y / h) : 0) * 100);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return { progress, isSolid };
}
