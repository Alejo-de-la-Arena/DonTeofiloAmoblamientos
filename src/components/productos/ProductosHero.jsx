import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import cocinaDesktop from '../../assets/images/inicio/hero/dtf-cocina-hero-desktop.png';
import cocinaMobile from '../../assets/images/inicio/hero/dtf-cocina-hero-mobile.png';
import placardDesktop from '../../assets/images/inicio/hero/dtf-placard-hero-desktop.png';
import placardMobile from '../../assets/images/inicio/hero/dtf-placard-hero-mobile.png';
import banioDesktop from '../../assets/images/inicio/hero/dtf-banio-hero-desktop.png';
import banioMobile from '../../assets/images/inicio/hero/dtf-banio-hero-mobile.png';
import puertaDesktop from '../../assets/images/inicio/hero/dtf-puerta-hero-desktop.png';
import puertaMobile from '../../assets/images/inicio/hero/dtf-puerta-hero-mobile.png';
import './ProductosHero.css';

// Punto de montaje de video (a futuro, igual que en ProyectosHero.jsx): cuando haya un video
// de catálogo, reemplazaría la tarjeta TILES[0] (la primera de la pila en desktop) por un
// <video> recortado 4:5, con fallback automático a esta misma imagen si falla la carga.
const TILES = [
  { desktop: cocinaDesktop, mobile: cocinaMobile, label: 'Cocinas' },
  { desktop: placardDesktop, mobile: placardMobile, label: 'Placards' },
  { desktop: banioDesktop, mobile: banioMobile, label: 'Vanitorys' },
  { desktop: puertaDesktop, mobile: puertaMobile, label: 'Aberturas' },
];

// Desfase de "pila" y rotación en reposo de cada tarjeta (solo collage desktop). El desfase vive
// acá (como valor de motion) en vez de en el CSS (margin-top) porque un transform no altera el
// alto real de la grilla — así el collage nunca puede desbordar el hero, sea cual sea la altura
// del viewport.
const TILE_Y = [0, 14, -12, 10];
const TILE_ROTATE = [-2.5, 1.5, -1.5, 2];

const textVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } },
};
const tileVariants = {
  hidden: (i) => ({ opacity: 0, y: TILE_Y[i] + 42, scale: 0.94, rotate: 0 }),
  show: (i) => ({
    opacity: 1,
    y: TILE_Y[i],
    scale: 1,
    rotate: TILE_ROTATE[i],
    transition: { duration: 0.85, delay: 0.3 + i * 0.13, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

const carouselItemVariants = {
  hidden: { opacity: 0, x: 34 },
  show: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: 0.22 + i * 0.09, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

export default function ProductosHero({ onCategorySelect }) {
  const heroRef = useRef(null);
  const isMobile = useIsMobile(760);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const p0 = useTransform(scrollYProgress, [0, 1], [0, -14]);
  const p1 = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const p2 = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const p3 = useTransform(scrollYProgress, [0, 1], [0, -38]);
  const parallax = [p0, p1, p2, p3];

  if (isMobile) {
    return (
      <header className="catalog-hero catalog-hero--mobile" ref={heroRef}>
        <motion.div
          className="catalog-hero-copy-mobile"
          variants={textVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="section-eyebrow" variants={itemUp}>
            <span className="section-eyebrow-line"></span>
            <span>Showroom &amp; catálogo</span>
          </motion.div>
          <motion.h1 className="catalog-hero-title" variants={itemUp}>
            Nuestros
            <br />
            Productos
          </motion.h1>
          <motion.p className="catalog-hero-lead" variants={itemUp}>
            Cada pieza que ves acá se fabrica a medida. Filtrá por tipo, material o presupuesto —
            y si no encontrás lo que buscás, lo diseñamos con vos.
          </motion.p>
        </motion.div>

        {/* Carrusel horizontal con snap: reemplaza el collage 2x2 en mobile, donde el bloque de
            texto ya deja poco alto para 4 tarjetas apiladas. El padding lateral vive en el propio
            contenedor (no en un margin) para que siga siendo full-bleed y a la vez la primera
            tarjeta quede alineada con el margen del título. Es asimétrico a propósito: el
            izquierdo replica el margen de contenido del sitio, el derecho queda en 0 para que
            el scroll llegue de verdad hasta el borde (el "peek" de la próxima tarjeta). */}
        <div className="catalog-hero-carousel">
          {TILES.map((tile, i) => (
            <motion.button
              key={tile.label}
              type="button"
              className="catalog-hero-carousel-item"
              onClick={() => onCategorySelect?.(tile.label)}
              custom={i}
              variants={carouselItemVariants}
              initial="hidden"
              animate="show"
            >
              <img src={tile.mobile} alt={tile.label} loading={i === 0 ? 'eager' : 'lazy'} />
              <span className="catalog-hero-carousel-scrim" aria-hidden="true" />
              <span className="catalog-hero-tile-label">{tile.label}</span>
            </motion.button>
          ))}
        </div>
      </header>
    );
  }

  return (
    <header className="catalog-hero" ref={heroRef}>
      <div className="catalog-hero-inner">
        <motion.div
          className="catalog-hero-copy"
          variants={textVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div className="section-eyebrow" variants={itemUp}>
            <span className="section-eyebrow-line"></span>
            <span>Showroom &amp; catálogo</span>
          </motion.div>
          <motion.h1 className="catalog-hero-title" variants={itemUp}>
            Nuestros
            <br />
            Productos
          </motion.h1>
          <motion.p className="catalog-hero-lead" variants={itemUp}>
            Cada pieza que ves acá se fabrica a medida. Filtrá por tipo, material o presupuesto —
            y si no encontrás lo que buscás, lo diseñamos con vos.
          </motion.p>
        </motion.div>

        <div className="catalog-hero-stack">
          {TILES.map((tile, i) => (
            <motion.div
              key={tile.label}
              className={`catalog-hero-slot catalog-hero-slot--${i}`}
              style={{ y: parallax[i] }}
            >
              <motion.div
                className="catalog-hero-tile"
                custom={i}
                variants={tileVariants}
                initial="hidden"
                animate="show"
              >
                <picture>
                  <source media="(max-width: 760px)" srcSet={tile.mobile} />
                  <img src={tile.desktop} alt={tile.label} loading={i === 0 ? 'eager' : 'lazy'} />
                </picture>
                <span className="catalog-hero-tile-label">{tile.label}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </header>
  );
}
