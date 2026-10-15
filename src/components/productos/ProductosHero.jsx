import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import cocinaDesktop from '../../assets/images/inicio/hero/dtf-cocina-hero-desktop.png';
import cocinaDesktopWebp from '../../assets/images/inicio/hero/dtf-cocina-hero-desktop.png?w=320;480;720&format=webp&as=srcset';
import cocinaMobile from '../../assets/images/inicio/hero/dtf-cocina-hero-mobile.png';
import cocinaMobileWebp from '../../assets/images/inicio/hero/dtf-cocina-hero-mobile.png?w=320;480;640&format=webp&as=srcset';
import placardDesktop from '../../assets/images/inicio/hero/dtf-placard-hero-desktop.png';
import placardDesktopWebp from '../../assets/images/inicio/hero/dtf-placard-hero-desktop.png?w=320;480;720&format=webp&as=srcset';
import placardMobile from '../../assets/images/inicio/hero/dtf-placard-hero-mobile.png';
import placardMobileWebp from '../../assets/images/inicio/hero/dtf-placard-hero-mobile.png?w=320;480;640&format=webp&as=srcset';
import banioDesktop from '../../assets/images/inicio/hero/dtf-banio-hero-desktop.png';
import banioDesktopWebp from '../../assets/images/inicio/hero/dtf-banio-hero-desktop.png?w=320;480;720&format=webp&as=srcset';
import banioMobile from '../../assets/images/inicio/hero/dtf-banio-hero-mobile.png';
import banioMobileWebp from '../../assets/images/inicio/hero/dtf-banio-hero-mobile.png?w=320;480;640&format=webp&as=srcset';
import puertaDesktop from '../../assets/images/inicio/hero/dtf-puerta-hero-desktop.png';
import puertaDesktopWebp from '../../assets/images/inicio/hero/dtf-puerta-hero-desktop.png?w=320;480;720&format=webp&as=srcset';
import puertaMobile from '../../assets/images/inicio/hero/dtf-puerta-hero-mobile.png';
import puertaMobileWebp from '../../assets/images/inicio/hero/dtf-puerta-hero-mobile.png?w=320;480;640&format=webp&as=srcset';
import './ProductosHero.css';

// Punto de montaje de video (a futuro, igual que en ProyectosHero.jsx): cuando haya un video
// de catálogo, reemplazaría la tarjeta TILES[0] (la primera de la pila en desktop) por un
// <video> recortado 4:5, con fallback automático a esta misma imagen si falla la carga.
const TILES = [
  {
    desktop: cocinaDesktop,
    desktopWebp: cocinaDesktopWebp,
    mobile: cocinaMobile,
    mobileWebp: cocinaMobileWebp,
    label: 'Cocinas',
  },
  {
    desktop: placardDesktop,
    desktopWebp: placardDesktopWebp,
    mobile: placardMobile,
    mobileWebp: placardMobileWebp,
    label: 'Placards',
  },
  {
    desktop: banioDesktop,
    desktopWebp: banioDesktopWebp,
    mobile: banioMobile,
    mobileWebp: banioMobileWebp,
    label: 'Vanitorys',
  },
  {
    desktop: puertaDesktop,
    desktopWebp: puertaDesktopWebp,
    mobile: puertaMobile,
    mobileWebp: puertaMobileWebp,
    label: 'Aberturas',
  },
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

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const TILT_MAX = 4; // grados extra, sumados a la rotación base de cada tarjeta
const TILT_SPRING = { stiffness: 150, damping: 20 };

function useFinePointer() {
  const [fine, setFine] = useState(() => typeof window !== 'undefined' && window.matchMedia(FINE_POINTER).matches);
  useEffect(() => {
    const mql = window.matchMedia(FINE_POINTER);
    const onChange = (e) => setFine(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return fine;
}

// Tarjeta del collage desktop. Tres capas, cada una con su propio transform para que no se
// pisen: el slot lleva el parallax (y), el botón el tilt del puntero y la tarjeta la entrada con
// su rotación base. Las rotaciones del botón y de la tarjeta se suman.
function HeroTile({ tile, index, parallax, active, tilt, initialState, onSelect }) {
  const target = useMotionValue(0);
  const rotate = useSpring(target, TILT_SPRING);

  function handlePointerMove(e) {
    if (!tilt) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1; // -1 (izq.) … 1 (der.)
    target.set(Math.max(-1, Math.min(1, x)) * TILT_MAX);
  }

  return (
    <motion.div className={`catalog-hero-slot catalog-hero-slot--${index}`} style={{ y: parallax }}>
      <motion.button
        type="button"
        className={`catalog-hero-tile-btn${active ? ' is-active' : ''}`}
        style={{ rotate }}
        aria-label={`Ver ${tile.label}`}
        aria-pressed={active}
        onClick={() => onSelect?.(tile.label)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => target.set(0)}
      >
        <motion.span
          className="catalog-hero-tile"
          custom={index}
          variants={tileVariants}
          initial={initialState}
          animate="show"
        >
          <picture>
            <source media="(max-width: 760px)" srcSet={tile.mobileWebp} type="image/webp" />
            <source media="(max-width: 760px)" srcSet={tile.mobile} />
            <source srcSet={tile.desktopWebp} type="image/webp" sizes="320px" />
            <img
              src={tile.desktop}
              alt=""
              sizes="320px"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </picture>
          <span className="catalog-hero-tile-label" aria-hidden="true">
            {tile.label}
          </span>
        </motion.span>
      </motion.button>
    </motion.div>
  );
}

export default function ProductosHero({ activeCategory, onCategorySelect }) {
  const heroRef = useRef(null);
  const isMobile = useIsMobile(760);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const p0 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -14]);
  const p1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -30]);
  const p2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -20]);
  const p3 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -38]);
  const parallax = [p0, p1, p2, p3];
  const initialState = reduce ? false : 'hidden';
  const finePointer = useFinePointer();

  if (isMobile) {
    return (
      <header className="catalog-hero catalog-hero--mobile" ref={heroRef}>
        <motion.div
          className="catalog-hero-copy-mobile"
          variants={textVariants}
          initial={initialState}
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
              className={`catalog-hero-carousel-item${activeCategory === tile.label ? ' is-active' : ''}`}
              aria-label={`Ver ${tile.label}`}
              aria-pressed={activeCategory === tile.label}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              onClick={() => onCategorySelect?.(tile.label)}
              custom={i}
              variants={carouselItemVariants}
              initial={initialState}
              animate="show"
            >
              <picture>
                <source
                  srcSet={tile.mobileWebp}
                  type="image/webp"
                  sizes="(max-width: 760px) 80vw, 320px"
                />
                <img
                  src={tile.mobile}
                  alt=""
                  sizes="(max-width: 760px) 80vw, 320px"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                />
              </picture>
              <span className="catalog-hero-carousel-scrim" aria-hidden="true" />
              <span className="catalog-hero-tile-label" aria-hidden="true">
                {tile.label}
              </span>
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
          initial={initialState}
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
            <HeroTile
              key={tile.label}
              tile={tile}
              index={i}
              parallax={parallax[i]}
              active={activeCategory === tile.label}
              tilt={finePointer && !reduce}
              initialState={initialState}
              onSelect={onCategorySelect}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
