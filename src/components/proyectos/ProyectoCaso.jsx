import { forwardRef, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BeforeAfterSlider from '../home/BeforeAfterSlider';
import { bajada, detallesConValor, splitTitulo } from '../../lib/proyectos';
import { useMotionSafe } from '../../lib/motion';
import { RUNWAY_DESKTOP, RUNWAY_MOBILE, WIPE_END, usePista } from './pista';
import styles from './ProyectoCaso.module.css';

const pad = (n) => String(n).padStart(2, '0');
const DRAG_CLICK_PX = 4; // un arrastre del slider no debe terminar navegando

/**
 * Un caso del listado (un <li> de la <ol>), con la misma card para todos.
 *
 * Wipe por scroll: si el proyecto tiene antes y después, la card vive en una "pista" (ver
 * pista.js) y queda fijada debajo del nav mientras el slider pasa del antes al después. Si el
 * usuario arrastra o usa el teclado, su posición manda mientras la card esté fijada; al salir de
 * la pista vuelve a quedar controlada por el scroll. Con reduced motion: sin pista, slider al 50%.
 *
 * Un solo link para teclado y lector: el del título, con un ::after estirado sobre la card. La
 * imagen tiene su propio <a> al mismo destino (fuera del tab y oculto al lector) para el click,
 * el click medio y Ctrl/Cmd+click; el tirador del slider queda por encima y sigue enfocable.
 */
const ProyectoCaso = forwardRef(function ProyectoCaso({ proyecto, index, motionProps }, titleRef) {
  const { reduce } = useMotionSafe();
  const { nombre, ubicacion } = splitTitulo(proyecto);
  const texto = bajada(proyecto);
  const meta = detallesConValor(proyecto).filter((d) => !/ubicaci/i.test(d.label)).slice(0, 2);
  const href = `/proyectos/${proyecto.slug}`;
  const titleId = `caso-${proyecto.id}`;
  const tienePar = Boolean(proyecto.imagen_antes && proyecto.imagen_despues);
  const conPista = tienePar && !reduce;
  // El wipe alterna: índice par → el "después" entra desde la izquierda; impar → desde la derecha.
  const direction = index % 2 === 0 ? 'ltr' : 'rtl';

  const pistaRef = useRef(null);
  const cardRef = useRef(null);
  const sliderRef = useRef(null);
  const manualRef = useRef(false);
  const lastPos = useRef(null);
  const press = useRef(null); // { x, y } del mousedown, para distinguir click de arrastre

  const onProgress = useCallback((progress, pinned) => {
    const el = pistaRef.current;
    if (el) {
      el.dataset.progress = progress.toFixed(3);
      el.dataset.pinned = pinned ? '1' : '0';
    }
    if (!pinned) manualRef.current = false;
    if (pinned && manualRef.current) return;
    const wipe = Math.min(1, progress / WIPE_END);
    const pos = direction === 'ltr' ? 100 * wipe : 100 * (1 - wipe);
    if (pos === lastPos.current) return;
    lastPos.current = pos;
    sliderRef.current?.setPosition(pos);
  }, [direction]);
  usePista(pistaRef, cardRef, onProgress, conPista);

  const imageLink = (children) => (
    <Link
      to={href}
      className={styles.mediaLink}
      tabIndex={-1}
      aria-hidden="true"
      draggable={false}
      onMouseDown={(e) => (press.current = { x: e.clientX, y: e.clientY })}
      onClick={(e) => {
        const p = press.current;
        if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > DRAG_CLICK_PX) e.preventDefault();
      }}
    >
      {children}
    </Link>
  );

  return (
    <motion.li className={styles.caso} {...motionProps}>
      <div
        ref={pistaRef}
        className={conPista ? styles.pista : undefined}
        style={conPista ? { '--runway-mobile': RUNWAY_MOBILE, '--runway-desktop': RUNWAY_DESKTOP } : undefined}
      >
        <article ref={cardRef} aria-labelledby={titleId} className={`${styles.card} ${conPista ? styles.fijable : ''}`}>
          {/* La info va antes en el DOM (orden de tab: título → tirador del slider); la imagen se
              dibuja primero por CSS. */}
          <div className={styles.info}>
            <p className={styles.lead}>
              <span className={`${styles.num} tabular`} aria-hidden="true">
                {pad(index + 1)}
              </span>
              {proyecto.categoria && <span className={styles.cat}>{proyecto.categoria}</span>}
            </p>
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
            {tienePar ? (
              <BeforeAfterSlider
                ref={sliderRef}
                beforeSrc={proyecto.imagen_antes}
                afterSrc={proyecto.imagen_despues}
                alt={proyecto.titulo}
                direction={direction}
                initial={conPista ? (direction === 'ltr' ? 0 : 100) : 50}
                fadeTags={conPista}
                onUserInput={() => (manualRef.current = true)}
                overlay={imageLink(null)}
              />
            ) : (
              proyecto.imagen_despues &&
              imageLink(<img className={styles.img} src={proyecto.imagen_despues} alt="" loading="lazy" decoding="async" draggable={false} />)
            )}
          </div>
        </article>
      </div>
    </motion.li>
  );
});

export default ProyectoCaso;
