import { useId, useState } from 'react';
import RevealImage from '../primitives/RevealImage';
import Cota from '../primitives/Cota';
import { materialLabels, nombreProducto } from '../../lib/catalogo';
import styles from './ProductCard.module.css';

const MAX_CHIPS = 2;
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

/**
 * Card del catálogo. Toda la card es clickeable sin <a> ni botones anidados: el único control
 * es "Ver detalle", y su ::after se estira sobre la card entera. El precio no va acá: vive solo
 * en el panel de detalle.
 */
export default function ProductCard({ product, materialOptions, showCategory, onOpen }) {
  const nameId = useId();
  const [hover, setHover] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const nombre = nombreProducto(product);
  const materiales = materialLabels(product, materialOptions);
  const extra = materiales.length - MAX_CHIPS;

  // La cota bajo el nombre aparece con un puntero fino de verdad (no alcanza con pointerType
  // "mouse": hay teléfonos y emuladores que lo reportan tras un tap) o con foco de TECLADO en
  // "Ver detalle" (:focus-visible; nunca :focus-within, que también se activa con un tap).
  // El CSS la oculta igual fuera de esos casos.
  const onEnter = (e) => {
    if (e.pointerType === 'mouse' && window.matchMedia(FINE_POINTER).matches) setHover(true);
  };

  return (
    <article
      className={styles.card}
      onPointerEnter={onEnter}
      onPointerLeave={() => setHover(false)}
    >
      <div className={styles.mediaWrap}>
        {product.imagen ? (
          <RevealImage
            src={product.imagen}
            alt=""
            sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"
            aspectRatio="4 / 3"
            className={styles.media}
            imgClassName={styles.img}
          />
        ) : (
          <div className={`${styles.media} ${styles.mediaEmpty}`} aria-hidden="true" />
        )}
        {product.destacado && <span className={styles.badge}>Destacado</span>}
      </div>

      <div className={styles.body}>
        {showCategory && <p className={styles.cat}>{product.categoria}</p>}
        <div className={styles.nameWrap}>
          <h3 id={nameId} className={styles.name}>
            {nombre}
          </h3>
          {(hover || keyboardFocus) && <Cota draw="mount" className={styles.cota} />}
        </div>

        {materiales.length > 0 && (
          <ul className={styles.chips} aria-label="Materiales">
            {materiales.slice(0, MAX_CHIPS).map((m) => (
              <li key={m} className={styles.chip}>
                {m}
              </li>
            ))}
            {extra > 0 && (
              <li className={styles.chip}>
                <span aria-hidden="true">+{extra}</span>
                <span className="sr-only">y {extra} más</span>
              </li>
            )}
          </ul>
        )}

        {product.descripcion && <p className={styles.desc}>{product.descripcion}</p>}

        <button
          type="button"
          className={styles.action}
          aria-describedby={nameId}
          onClick={() => onOpen(product)}
          onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
          onBlur={() => setKeyboardFocus(false)}
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
}
