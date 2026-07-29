import { useMemo, useState } from 'react';
import ProyectosHero from '../components/proyectos/ProyectosHero';
import ProjectFilterBar from '../components/proyectos/ProjectFilterBar';
import ProjectSection from '../components/proyectos/ProjectSection';
import ProjectsCTA from '../components/proyectos/ProjectsCTA';
import { PROYECTOS, PROYECTOS_FILTROS } from '../data/mockProjects';

export default function Proyectos() {
  const [filter, setFilter] = useState('Todos');

  const filtered = useMemo(
    () => PROYECTOS.filter((p) => filter === 'Todos' || p.categoriaFiltro === filter),
    [filter]
  );

  return (
    <>
      <ProyectosHero count={PROYECTOS.length} />
      <ProjectFilterBar filters={PROYECTOS_FILTROS} active={filter} onChange={setFilter} />
      <main>
        {filtered.map((project, index) => (
          <ProjectSection key={project.id} project={project} index={index} />
        ))}
      </main>
      <ProjectsCTA />
    </>
  );
}
