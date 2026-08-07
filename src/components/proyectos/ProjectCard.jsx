import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './ProjectCard.css';

// size 'lg' → los primeros 3 (grid destacado); 'sm' → el resto, detrás de "Ver más proyectos".
// wide → solo la primera card del grid destacado, ocupa las 2 columnas.
export default function ProjectCard({ project, index, size = 'sm', wide = false }) {
  const [ref, isVisible] = useScrollReveal((index % 6) * 80);
  const blurb = project.resumen || project.descripcion;

  return (
    <article
      ref={ref}
      data-reveal
      className={`proy-card proy-card--${size}${wide ? ' proy-card--wide' : ''}${
        isVisible ? ' is-visible' : ''
      }`}
    >
      <Link to={`/proyectos/${project.slug}`} className="proy-card-media">
        <img
          src={project.imagen_despues}
          alt={project.titulo}
          loading={index < 3 ? 'eager' : 'lazy'}
        />
      </Link>
      <div className="proy-card-info">
        <span className="proy-card-cat">{project.categoria}</span>
        <h3 className="proy-card-title">{project.titulo}</h3>
        {blurb && <p className="proy-card-blurb">{blurb}</p>}
        <Link to={`/proyectos/${project.slug}`} className="proy-card-link">
          Ver detalles del proyecto <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
