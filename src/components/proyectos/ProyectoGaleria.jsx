import { useEffect, useMemo, useRef, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './ProyectoGaleria.module.css';

const SWIPE_PX = 50;
const ratio = (img) => (img.ancho > 0 && img.alto > 0 ? img.alto / img.ancho : 3 / 4); // sin dimensiones: 4:3

/**
 * Reparte las imágenes (ya en el orden del admin) en columnas: cada una va a la columna más
 * corta según su proporción real. Así el orden visual corre de izquierda a derecha, coincide con
 * el del lightbox y, con ancho/alto guardados, el alto queda reservado (sin reflow).
 */
function repartir(imagenes, cols) {
  const columnas = Array.from({ length: cols }, () => ({ alto: 0, items: [] }));
  imagenes.forEach((img, i) => {
    const corta = columnas.reduce((min, c) => (c.alto < min.alto ? c : min), columnas[0]);
    corta.items.push({ img, i });
    corta.alto += ratio(img);
  });
  return columnas.map((c) => c.items);
}

function Lightbox({ imagenes, index, onChange, onClose, titulo }) {
  const ref = useRef(null);
  const touch = useRef(null);
  const open = index != null;
  const total = imagenes.length;
  const go = (d) => onChange((index + d + total) % total);

  // <dialog> nativo: showModal() da el foco atrapado, el fondo inerte y Escape; al cerrar, el
  // foco vuelve al botón que lo abrió.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return undefined;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  if (!imagenes.length) return null;
  const img = open ? imagenes[index] : null;

  return (
    <dialog
      ref={ref}
      className={styles.lightbox}
      aria-label={`Galería de ${titulo}`}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (total < 2) return;
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start || total < 2) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      }}
    >
      {img && (
        <>
          <figure className={styles.figure}>
            <img
              key={img.id}
              className={styles.lbImg}
              src={img.url}
              alt={img.alt || `${titulo}, imagen ${index + 1} de ${total}`}
              width={img.ancho || undefined}
              height={img.alto || undefined}
            />
            <figcaption className={`${styles.count} tabular`} aria-live="polite">
              {index + 1} de {total}
            </figcaption>
          </figure>
          <button type="button" className={`${styles.lbBtn} ${styles.close}`} onClick={onClose} aria-label="Cerrar galería">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {total > 1 && (
            <>
              <button type="button" className={`${styles.lbBtn} ${styles.prev}`} onClick={() => go(-1)} aria-label="Imagen anterior">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className={`${styles.lbBtn} ${styles.next}`} onClick={() => go(1)} aria-label="Imagen siguiente">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </>
      )}
    </dialog>
  );
}

/** Galería del proyecto terminado. Sin imágenes no renderiza nada. */
export default function ProyectoGaleria({ imagenes, titulo }) {
  const isMobile = useIsMobile(767);
  const columnas = useMemo(() => repartir(imagenes, isMobile ? 2 : 3), [imagenes, isMobile]);
  const [abierta, setAbierta] = useState(null);
  const total = imagenes.length;

  if (!total) return null;

  return (
    <section className={styles.section} aria-labelledby="galeria-titulo">
      <h2 id="galeria-titulo" className={styles.heading}>
        Galería
      </h2>
      <div className={styles.grid} style={{ '--cols': columnas.length }}>
        {columnas.map((col, c) => (
          <div key={c} className={styles.col}>
            {col.map(({ img, i }) => (
              <button
                key={img.id}
                type="button"
                className={styles.item}
                onClick={() => setAbierta(i)}
                aria-label={`Ampliar imagen ${i + 1} de ${total}`}
              >
                <img
                  className={styles.img}
                  src={img.url}
                  alt={img.alt || ''}
                  loading="lazy"
                  decoding="async"
                  sizes={isMobile ? '50vw' : '(min-width: 1300px) 420px, 33vw'}
                  width={img.ancho || undefined}
                  height={img.alto || undefined}
                  style={img.ancho > 0 && img.alto > 0 ? { aspectRatio: `${img.ancho} / ${img.alto}` } : undefined}
                />
              </button>
            ))}
          </div>
        ))}
      </div>
      <Lightbox imagenes={imagenes} index={abierta} onChange={setAbierta} onClose={() => setAbierta(null)} titulo={titulo} />
    </section>
  );
}
