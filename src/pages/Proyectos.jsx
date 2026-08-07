import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProyectosHero from '../components/proyectos/ProyectosHero';
import ProjectCard from '../components/proyectos/ProjectCard';
import ProjectsCTA from '../components/proyectos/ProjectsCTA';
import { fetchProyectosPublicos } from '../lib/proyectosApi';
import './Proyectos.css';

const VISIBLE_STEP = 3;
const EASE = [0.22, 0.61, 0.36, 1];

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProyectosPublicos();
        if (!cancelled) setProyectos(data);
      } catch {
        if (!cancelled) setLoadError('No pudimos cargar los proyectos. Probá recargar la página.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = showAll ? proyectos : proyectos.slice(0, VISIBLE_STEP);
  const featured = visible.slice(0, VISIBLE_STEP);
  const rest = visible.slice(VISIBLE_STEP);
  const hasMore = !showAll && proyectos.length > VISIBLE_STEP;

  return (
    <>
      <ProyectosHero count={proyectos.length} />
      <main className="proy-main">
        {loading && <p className="proy-status">Cargando proyectos…</p>}
        {!loading && loadError && <p className="proy-status proy-status--error">{loadError}</p>}
        {!loading && !loadError && proyectos.length === 0 && (
          <p className="proy-status">Todavía no hay proyectos cargados. ¡Volvé pronto!</p>
        )}

        {!loading && !loadError && proyectos.length > 0 && (
          <>
            <div className="proy-featured-grid">
              {featured.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  size="lg"
                  wide={index === 0}
                />
              ))}
            </div>

            {rest.length > 0 && (
              <div className="proy-rest-grid">
                {rest.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <ProjectCard project={project} index={index + VISIBLE_STEP} size="sm" />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {hasMore && (
            <motion.div
              className="proy-more-wrap"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <button type="button" className="proy-more-btn" onClick={() => setShowAll(true)}>
                Ver más proyectos
                <span aria-hidden="true">↓</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <ProjectsCTA />
    </>
  );
}
