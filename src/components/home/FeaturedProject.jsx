import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import BeforeAfterSlider from './BeforeAfterSlider';
import { fetchProyectoDestacadoHome } from '../../lib/proyectosApi';
import './FeaturedProject.css';

export default function FeaturedProject() {
  const [ref, isVisible] = useScrollReveal(0);
  const revealClass = isVisible ? ' is-visible' : '';
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProyectoDestacadoHome();
        if (!cancelled) setProyecto(data);
      } catch {
        if (!cancelled) setProyecto(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sin proyecto publicado en toda la base (o falló la carga): no rompemos la Home,
  // simplemente no mostramos la sección.
  if (loading || !proyecto) return null;

  const detalles = proyecto.detalles.slice(0, 2);

  return (
    <section id="proyectos" className="featured">
      <div className="featured-grid">
        <BeforeAfterSlider beforeSrc={proyecto.imagen_antes} afterSrc={proyecto.imagen_despues} />
        <div ref={ref} className={`featured-header${revealClass}`} data-reveal>
          <span className="section-eyebrow-solo">Proyecto destacado</span>
          <h2 className="featured-title">
            <Link to={`/proyectos/${proyecto.slug}`}>{proyecto.titulo}</Link>
          </h2>
          <p className="featured-desc">{proyecto.resumen || proyecto.descripcion}</p>
        </div>
        <div className={`featured-facts-link${revealClass}`} data-reveal>
          {detalles.length > 0 && (
            <div className="featured-facts">
              {detalles.map((d) => (
                <div key={d.id}>
                  <div className="featured-fact-label">{d.label}</div>
                  <div className="featured-fact-val">{d.valor || '—'}</div>
                </div>
              ))}
            </div>
          )}
          <Link to="/proyectos" className="link-arrow">
            Ver todos los proyectos →
          </Link>
        </div>
      </div>
    </section>
  );
}
