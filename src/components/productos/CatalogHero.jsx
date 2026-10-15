import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import RevealLines from '../primitives/RevealLines';
import CornerMarks from '../primitives/CornerMarks';
import Alzado from './Alzado';
import CategoryIndex from './CategoryIndex';
import { reducedTransition, useMotionSafe } from '../../lib/motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import styles from './CatalogHero.module.css';

const TITLE = ['Cada mueble empieza', 'en un plano'];

function verLabel(n) {
  if (n == null) return 'Ver productos';
  if (n === 0) return 'Ver opciones a medida';
  return `Ver ${n} ${n === 1 ? 'producto' : 'productos'}`;
}

/**
 * Hero de /productos: alzado técnico de la categoría activa + índice de categorías.
 *   counts       { [categoría]: n | null } productos publicados (null mientras carga)
 *   resultCount  lo que muestra la grilla con los filtros actuales (acción "Ver N" en mobile)
 *   onSelect(cat, { scroll })  desktop filtra y baja a la grilla; mobile solo filtra, así se
 *                              ve el alzado nuevo, y la acción de texto es la que baja.
 */
export default function CatalogHero({ categories, counts, activeCategory, resultCount, onSelect, onShowResults }) {
  const isMobile = useIsMobile(760);
  const { reduce } = useMotionSafe();
  const [preview, setPreview] = useState(null);

  const ver = verLabel(resultCount);
  const fade = reduce ? reducedTransition : { duration: 0.15, ease: 'linear' };

  return (
    <header className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <RevealLines as="h1" lines={TITLE} draw="mount" className={styles.title} />
          <p className={styles.lead}>
            Cada pieza se fabrica a medida de tu espacio. Si no está acá, la diseñamos con vos.
          </p>
        </div>

        <div className={styles.plano}>
          <span className={styles.grilla} aria-hidden="true" />
          <CornerMarks size="18px" />
          <Alzado categoria={preview ?? activeCategory} parciales={!isMobile} className={styles.alzado} />
        </div>

        <div className={styles.index}>
          <CategoryIndex
            categories={categories}
            counts={counts}
            active={activeCategory}
            onSelect={(cat) => onSelect(cat, { scroll: !isMobile })}
            onPreview={isMobile ? undefined : setPreview}
          />
          {isMobile && (
            <button type="button" className={styles.ver} onClick={onShowResults}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={ver}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                >
                  {ver}
                </motion.span>
              </AnimatePresence>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 3v10M4 9l4 4 4-4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
