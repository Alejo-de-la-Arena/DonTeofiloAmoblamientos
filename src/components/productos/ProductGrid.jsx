import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductCustomCard from './ProductCustomCard';
import { dur, ease, useMotionSafe } from '../../lib/motion';
import styles from './ProductGrid.module.css';

const CUSTOM_KEY = 'a-medida';

/* Transiciones de filtrado: las cards que quedan se reacomodan con `layout` (solo posición: las
   celdas miden lo mismo, así nada se deforma), las nuevas entran con opacidad + scale .98 y las
   que salen se desvanecen. popLayout saca de flujo a las salientes para que el reacomodo
   arranque en el mismo frame. En mobile la grilla es una sola columna (sin scroll-snap), así
   que las mismas animaciones valen ahí. Con reduced motion: cambio instantáneo.
   initial={false}: en la carga no hay entrada de grilla; la primera aparición es el RevealImage
   de cada card. */
export default function ProductGrid({
  products,
  materialOptions,
  showCategory,
  activeCategory,
  search,
  hasFilters,
  onClearAll,
  onOpen,
}) {
  const { reduce } = useMotionSafe();
  const empty = products.length === 0;

  const item = reduce
    ? { initial: false, exit: { opacity: 0, transition: { duration: 0 } } }
    : {
        layout: 'position',
        initial: { opacity: 0, scale: 0.98 },
        animate: { opacity: 1, scale: 1, transition: { duration: dur.md, ease: ease.softClose } },
        exit: { opacity: 0, transition: { duration: dur.sm, ease: ease.settle } },
        transition: { layout: { duration: dur.md, ease: ease.softClose } },
      };

  return (
    <>
      {empty && hasFilters && (
        <div className={styles.emptyRow} role="status">
          <p className={styles.emptyText}>Ningún producto coincide con estos filtros.</p>
          <button type="button" className={styles.clear} onClick={onClearAll}>
            Limpiar filtros
          </button>
        </div>
      )}
      <LayoutGroup>
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout" initial={false}>
            {products.map((product) => (
              <motion.div key={product.id} className={styles.cell} {...item}>
                <ProductCard
                  product={product}
                  materialOptions={materialOptions}
                  showCategory={showCategory}
                  onOpen={onOpen}
                />
              </motion.div>
            ))}
            <motion.div key={CUSTOM_KEY} className={styles.cell} {...item}>
              <ProductCustomCard categoria={activeCategory} search={search} />
            </motion.div>
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </>
  );
}
