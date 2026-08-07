import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BeforeAfterSlider from '../components/home/BeforeAfterSlider';
import WhatsAppIcon from '../components/ui/icons/WhatsAppIcon';
import { fetchProyectoPorSlug } from '../lib/proyectosApi';
import { WHATSAPP_NUMBER } from '../config/contact';
import './ProyectoDetalle.css';

export default function ProyectoDetalle() {
  const { slug } = useParams();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setProyecto(null);
    (async () => {
      try {
        const data = await fetchProyectoPorSlug(slug);
        if (!cancelled) setProyecto(data);
      } catch {
        if (!cancelled) setLoadError('No pudimos cargar este proyecto. Probá recargar la página.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (lightboxIndex === null || !proyecto) return;
    const total = proyecto.galeria.length;
    function onKey(e) {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + total) % total);
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % total);
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxIndex, proyecto]);

  if (loading) {
    return (
      <main className="proydet-page">
        <p className="proydet-status">Cargando proyecto…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="proydet-page">
        <p className="proydet-status proydet-status--error">{loadError}</p>
      </main>
    );
  }

  if (!proyecto) {
    return (
      <main className="proydet-page">
        <div className="proydet-notfound">
          <span className="section-eyebrow-solo">404</span>
          <h1>No encontramos este proyecto</h1>
          <p>Puede que el link esté vencido o el proyecto ya no esté publicado.</p>
          <Link to="/proyectos" className="proydet-notfound-cta">
            ← Volver a proyectos
          </Link>
        </div>
      </main>
    );
  }

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `¡Hola Don Teófilo! Vi el proyecto "${proyecto.titulo}" en la web y me gustaría hacer una consulta parecida.`
  )}`;

  return (
    <main className="proydet-page">
      <Link to="/proyectos" className="proydet-back">
        ← Volver a proyectos
      </Link>

      <header className="proydet-header">
        <span className="proydet-cat">{proyecto.categoria}</span>
        <h1 className="proydet-title">{proyecto.titulo}</h1>
      </header>

      {(proyecto.imagen_antes || proyecto.imagen_despues) && (
        <div className="proydet-slider-wrap">
          <BeforeAfterSlider beforeSrc={proyecto.imagen_antes} afterSrc={proyecto.imagen_despues} />
        </div>
      )}

      {proyecto.galeria.length > 0 && (
        <section className="proydet-gallery-section">
          <h2 className="proydet-section-title">Galería del proyecto</h2>
          <div className="proydet-gallery">
            {proyecto.galeria.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className="proydet-gallery-item"
                onClick={() => setLightboxIndex(i)}
              >
                <img src={img.url} alt={img.alt || proyecto.titulo} loading={i < 2 ? 'eager' : 'lazy'} />
              </button>
            ))}
          </div>
        </section>
      )}

      {proyecto.descripcion && (
        <section className="proydet-body">
          <p>{proyecto.descripcion}</p>
        </section>
      )}

      {proyecto.detalles.length > 0 && (
        <section className="proydet-specs-section">
          <h2 className="proydet-section-title">Ficha técnica</h2>
          <div className="proydet-specs">
            {proyecto.detalles.map((d) => (
              <div className="proydet-spec-row" key={d.id}>
                <span>{d.label}</span>
                <span>{d.valor || '—'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="proydet-cta-section">
        <a href={waHref} target="_blank" rel="noopener" className="proydet-cta-wa">
          <WhatsAppIcon size={20} />
          Consultar por un proyecto similar
        </a>
        <p className="proydet-cta-note">Te respondemos en menos de 24hs · Presupuesto sin compromiso</p>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="proydet-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              className="proydet-lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            {proyecto.galeria.length > 1 && (
              <button
                type="button"
                className="proydet-lightbox-nav proydet-lightbox-nav--prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i - 1 + proyecto.galeria.length) % proyecto.galeria.length);
                }}
                aria-label="Anterior"
              >
                ‹
              </button>
            )}
            <motion.img
              key={lightboxIndex}
              src={proyecto.galeria[lightboxIndex].url}
              alt={proyecto.galeria[lightboxIndex].alt || proyecto.titulo}
              className="proydet-lightbox-img"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            />
            {proyecto.galeria.length > 1 && (
              <button
                type="button"
                className="proydet-lightbox-nav proydet-lightbox-nav--next"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i + 1) % proyecto.galeria.length);
                }}
                aria-label="Siguiente"
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
