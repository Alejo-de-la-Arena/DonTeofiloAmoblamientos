import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProyectosHero from '../components/proyectos/ProyectosHero';
import ProjectFilterBar from '../components/proyectos/ProjectFilterBar';
import ProjectSection from '../components/proyectos/ProjectSection';
import ProjectsCTA from '../components/proyectos/ProjectsCTA';
import { PROYECTOS, PROYECTOS_FILTROS } from '../data/mockProjects';
import './Proyectos.css';

const VISIBLE_STEP = 3;
const EASE = [0.22, 0.61, 0.36, 1];

export default function Proyectos() {
  const [filter, setFilter] = useState('Todos');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => PROYECTOS.filter((p) => filter === 'Todos' || p.categoriaFiltro === filter),
    [filter]
  );

  useEffect(() => {
    setShowAll(false);
  }, [filter]);

  const visible = showAll ? filtered : filtered.slice(0, VISIBLE_STEP);
  const hasMore = !showAll && filtered.length > VISIBLE_STEP;

  return (
    <>
      <ProyectosHero count={PROYECTOS.length} />
      <ProjectFilterBar filters={PROYECTOS_FILTROS} active={filter} onChange={setFilter} />
      <main>
        {visible.map((project, index) => {
          const isExtra = index >= VISIBLE_STEP;
          if (!isExtra) return <ProjectSection key={project.id} project={project} index={index} />;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <ProjectSection project={project} index={index} />
            </motion.div>
          );
        })}
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
