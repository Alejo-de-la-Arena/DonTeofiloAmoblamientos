import { useEffect } from 'react';

// Title y meta description por página, sin dependencias. Al salir de la página se restauran
// los de index.html (los que no setean nada propio siguen usando esos).
export function usePageMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const prevTitle = document.title;
    const prevDescription = meta?.getAttribute('content');
    document.title = title;
    if (meta && description) meta.setAttribute('content', description);
    return () => {
      document.title = prevTitle;
      if (meta && prevDescription != null) meta.setAttribute('content', prevDescription);
    };
  }, [title, description]);
}
