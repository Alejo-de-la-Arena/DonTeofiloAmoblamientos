import { useEffect, useState } from 'react';
import { fetchTallerPublico } from '../../lib/tallerApi';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../config/contact';
import styles from './DelTaller.module.css';

// Proporción real guardada al subir (ancho/alto). Filas sin medidas: 4:5 como reserva.
const ratio = (p) => (p.ancho && p.alto ? p.ancho / p.alto : 4 / 5);

/**
 * "Del taller": hasta 6 fotos activas de taller_posts. Desktop: una fila de alturas iguales
 * con anchos según la proporción real de cada foto. Mobile: scroll horizontal con snap y un
 * "peek" de la siguiente. Sin posts activos no se renderiza.
 */
export default function DelTaller() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchTallerPublico()
      .then((data) => !cancelled && setPosts(data))
      .catch(() => !cancelled && setPosts([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="taller-title">
      <div className={styles.head}>
        <h2 id="taller-title" className={styles.title}>
          Del taller
        </h2>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={styles.handle}>
          {INSTAGRAM_HANDLE}
        </a>
      </div>

      <ul className={styles.row}>
        {posts.map((p) => {
          const r = ratio(p);
          const img = (
            <img
              src={p.imagen_url}
              alt={p.alt}
              width={p.ancho || undefined}
              height={p.alto || undefined}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 768px) 25vw, 70vw"
              className={styles.img}
            />
          );
          return (
            <li key={p.id} className={styles.item} style={{ '--r': r, aspectRatio: r }}>
              {p.link_instagram ? (
                <a href={p.link_instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {img}
                  <span className="sr-only"> (ver en Instagram)</span>
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
