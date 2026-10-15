import { useLayoutEffect, useRef } from 'react';
import styles from './CategoryIndex.module.css';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';

function conteo(n) {
  if (n == null) return { visible: '—', sr: '' }; // cargando: nunca un "a medida" falso
  if (n === 0) return { visible: 'a medida', sr: 'a medida' };
  return { visible: String(n), sr: `${n} ${n === 1 ? 'producto' : 'productos'}` };
}

/**
 * Índice de categorías del hero con el conteo real de productos publicados.
 * Desktop: lista con líneas de puntos; hover (solo puntero fino) o foco de teclado previsualiza
 * el alzado y al salir de la lista vuelve el de la categoría filtrada.
 * Mobile: chips en una fila horizontal con scroll-snap.
 */
export default function CategoryIndex({ categories, counts, active, onSelect, onPreview }) {
  const listRef = useRef(null);

  // Mobile: si se entra con ?categoria=, el chip activo arranca a la vista (solo scroll
  // horizontal del propio contenedor: nunca mueve la página).
  useLayoutEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[aria-pressed="true"]');
    if (!list || !el || list.scrollWidth <= list.clientWidth) return;
    const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
    if (el.offsetLeft + el.offsetWidth > list.clientWidth) list.scrollLeft = el.offsetLeft - pad;
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = (cat) => onPreview?.(cat);

  return (
    <div
      ref={listRef}
      className={styles.list}
      role="group"
      aria-label="Categorías"
      onPointerLeave={(e) => e.pointerType === 'mouse' && preview(null)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) preview(null);
      }}
    >
      {categories.map((cat) => {
        const on = cat === active;
        const c = conteo(counts?.[cat]);
        return (
          <button
            key={cat}
            type="button"
            className={`${styles.item} ${on ? styles.on : ''}`.trim()}
            aria-pressed={on}
            onClick={() => onSelect(cat)}
            onPointerEnter={(e) => {
              if (e.pointerType === 'mouse' && window.matchMedia(FINE_POINTER).matches) preview(cat);
            }}
            onFocus={(e) => {
              if (e.target.matches(':focus-visible')) preview(cat);
            }}
          >
            <span className={styles.name}>{cat}</span>
            <span className={styles.leader} aria-hidden="true" />
            <span className={`${styles.count} tabular`} aria-hidden="true">
              {c.visible}
            </span>
            {c.sr && <span className="sr-only">, {c.sr}</span>}
          </button>
        );
      })}
    </div>
  );
}
