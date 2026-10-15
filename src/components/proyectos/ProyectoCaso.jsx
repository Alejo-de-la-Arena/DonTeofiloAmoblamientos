import { forwardRef, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import RevealImage from '../primitives/RevealImage';
import { bajada, detallesConValor, splitTitulo } from '../../lib/proyectos';
import { useAfterLoad } from '../../hooks/useAfterLoad';
import styles from './ProyectoCaso.module.css';

// Rotación editorial en desktop: lámina (16:9 a lo ancho), imagen a la izquierda, a la derecha.
const LAYOUTS = ['lamina', 'izquierda', 'derecha'];
const SIZES = {
  lamina: '(min-width: 768px) min(1300px, 90vw), 100vw',
  izquierda: '(min-width: 768px) 55vw, 100vw',
  derecha: '(min-width: 768px) 55vw, 100vw',
};
const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const pad = (n) => String(n).padStart(2, '0');

/**
 * Un caso del listado (un <li> de la <ol>). Un solo link para teclado y lector: el del título,
 * con un ::after estirado sobre todo el caso. La imagen tiene su propio <a> al mismo destino,
 * fuera del orden de tab y oculto al lector, que solo con puntero fino se eleva sobre el ::after
 * para recibir el hover ("asomar el antes") sin perder Ctrl/Cmd+click ni el click medio.
 * El botón "Ver antes" (mobile, aria-pressed) va por encima de todo, después del link en el orden
 * de tab. motionProps: animación de entrada del <li> (los que llegan con "Ver más").
 */
const ProyectoCaso = forwardRef(function ProyectoCaso({ proyecto, index, eager = false, motionProps }, titleRef) {
  const layout = LAYOUTS[index % LAYOUTS.length];
  const { nombre, ubicacion } = splitTitulo(proyecto);
  const texto = bajada(proyecto);
  const meta = detallesConValor(proyecto).filter((d) => !/ubicaci/i.test(d.label)).slice(0, 3);
  const href = `/proyectos/${proyecto.slug}`;
  const titleId = `caso-${proyecto.id}`;

  // El "antes" se pide recién cuando hace falta: con puntero fino, cuando el caso está cerca y la
  // página ya cargó (así el hover no descubre un marco vacío); en touch, al tocar "Ver antes".
  const tieneAntes = Boolean(proyecto.imagen_antes);
  const nearRef = useRef(null);
  const near = useInView(nearRef, { once: true, margin: '0px 0px 400px 0px' });
  const afterLoad = useAfterLoad();
  const [showAntes, setShowAntes] = useState(false);
  const [wantAntes, setWantAntes] = useState(false);
  const fine = typeof window !== 'undefined' && window.matchMedia(FINE_POINTER).matches;
  const loadAntes = tieneAntes && (wantAntes || (fine && near && afterLoad));

  return (
    <motion.li ref={nearRef} className={`${styles.caso} ${styles[layout]}`} {...motionProps}>
      <article aria-labelledby={titleId} className={styles.article}>
        {/* La info va antes en el DOM (orden de tab: link del título → botón "Ver antes"); la
            imagen se dibuja arriba por CSS. */}
        <div className={styles.info}>
          <div className={styles.lead}>
            <span className={`${styles.num} tabular`} aria-hidden="true">
              {pad(index + 1)}
            </span>
            {proyecto.categoria && <p className={styles.cat}>{proyecto.categoria}</p>}
          </div>

          <div className={styles.body}>
            <h2 id={titleId} className={styles.title}>
              <Link ref={titleRef} to={href} className={styles.titleLink}>
                {nombre}
              </Link>
            </h2>
            {ubicacion && <p className={styles.place}>{ubicacion}</p>}
            {texto && <p className={styles.desc}>{texto}</p>}
            <span className={styles.action} aria-hidden="true">
              Ver proyecto
            </span>
          </div>

          {meta.length > 0 && (
            <dl className={styles.meta}>
              {meta.map((d) => (
                <div key={d.id ?? d.label} className={styles.metaItem}>
                  <dt>{d.label}</dt>
                  <dd>{d.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className={styles.media}>
          <Link to={href} className={styles.mediaLink} tabIndex={-1} aria-hidden="true">
            <RevealImage
              src={proyecto.imagen_despues}
              alt=""
              sizes={SIZES[layout]}
              loading={eager ? 'eager' : 'lazy'}
              aspectRatio="var(--caso-ratio)"
              className={styles.frame}
            />
            {tieneAntes && (
              <span className={`${styles.peek} ${showAntes ? styles.peekShown : ''}`}>
                <img
                  className={styles.peekImg}
                  src={loadAntes ? proyecto.imagen_antes : undefined}
                  alt=""
                  sizes={SIZES[layout]}
                  decoding="async"
                />
                <span className={styles.peekLabel}>Antes</span>
              </span>
            )}
            {tieneAntes && <span className={styles.peekLine} />}
          </Link>
          {tieneAntes && (
            <button
              type="button"
              className={styles.toggle}
              aria-pressed={showAntes}
              onClick={() => {
                setWantAntes(true);
                setShowAntes((v) => !v);
              }}
            >
              Ver antes<span className="sr-only"> de {nombre}</span>
            </button>
          )}
        </div>

      </article>
    </motion.li>
  );
});

export default ProyectoCaso;
