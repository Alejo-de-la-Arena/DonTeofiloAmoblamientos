import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import cocinaAntesDesktop from '../../assets/images/proyectos/cocina-antes-proyectos-hero-desktop.png';
import cocinaDespuesDesktop from '../../assets/images/proyectos/cocina-despues-proyectos-hero-desktop.png';
import cocinaAntesMobile from '../../assets/images/proyectos/cocina-antes-proyectos-hero-mobile.png';
import cocinaDespuesMobile from '../../assets/images/proyectos/cocina-despues-proyectos-hero-mobile.png';
import './ProyectosHero.css';

// Punto de montaje del video del Hero.
// Cuando esté listo, importar el archivo y asignarlo acá:
//   import proyectosHeroVideo from '../../assets/videos/proyectos-hero-cocina.mp4';
//   const VIDEO_SRC = proyectosHeroVideo;
// Specs recomendadas para el video:
//   - mp4 (H.264), sin audio.
//   - Relación de aspecto 16:9 — se recorta con object-fit:cover en mobile.
//   - Duración corta (6-10s) con loop parejo: el primer y el último frame deben empalmar bien.
//   - Generación sugerida: dos fotos fijas de la MISMA cocina, mismo ángulo y encuadre
//     (antes deteriorada / después rediseñada) + una herramienta de video IA en modo
//     first-frame → last-frame para generar el morphing entre ambas.
// Mientras VIDEO_SRC esté vacío se usa el fallback de crossfade con las imágenes de abajo
// (fotos reales antes/después de la cocina, ya con recorte propio para desktop y mobile).
const VIDEO_SRC = '';
const FRAMES_DESKTOP = [cocinaAntesDesktop, cocinaDespuesDesktop];
const FRAMES_MOBILE = [cocinaAntesMobile, cocinaDespuesMobile];
const FRAME_DURATION = 4200;

export default function ProyectosHero({ count }) {
  const [videoError, setVideoError] = useState(false);
  const [active, setActive] = useState(0);
  const showVideo = Boolean(VIDEO_SRC) && !videoError;
  // Elige el par de imágenes antes de montar el frame, según el ancho real del viewport,
  // para no pedirle al navegador las cuatro fotos de golpe.
  const isMobile = useIsMobile();
  const FRAMES = isMobile ? FRAMES_MOBILE : FRAMES_DESKTOP;

  useEffect(() => {
    if (showVideo) return;
    const id = setInterval(() => setActive((a) => (a + 1) % FRAMES.length), FRAME_DURATION);
    return () => clearInterval(id);
  }, [showVideo, FRAMES.length]);

  return (
    <header className="proy-hero">
      {showVideo ? (
        <video
          className="proy-hero-video"
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
        />
      ) : (
        <div className="proy-hero-media">
          <AnimatePresence>
            <motion.div
              key={active}
              className="proy-hero-frame"
              style={{ backgroundImage: `url(${FRAMES[active]})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: 1.09 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.6, ease: 'easeInOut' },
                scale: { duration: FRAME_DURATION / 1000 + 1.6, ease: 'easeOut' },
              }}
            />
          </AnimatePresence>
        </div>
      )}
      <div className="proy-hero-grain" />
      <div className="proy-hero-scrim" />
      <div className="proy-hero-content">
        <div className="proy-hero-inner">
          <div className="proy-hero-title-row">
            <h1 className="proy-hero-title">Proyectos</h1>
            {!showVideo && (
              <span className="proy-hero-label">
                <span className="proy-hero-label-dot" aria-hidden="true" />
                <span className="proy-hero-label-text">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={active}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                    >
                      {active === 0 ? 'Antes' : 'Después'}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            )}
          </div>
          <div className="proy-hero-meta">
            <span className="proy-hero-count">{count} proyectos seleccionados</span>
            <span className="proy-hero-line" />
          </div>
        </div>
      </div>
    </header>
  );
}
