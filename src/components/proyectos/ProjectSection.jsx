import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import BeforeAfterSlider from '../home/BeforeAfterSlider';
import './ProjectSection.css';

function ProjectFacts({ project }) {
  return (
    <div className="proy-facts">
      <div className="proy-fact">
        <div className="proy-fact-k">Duración</div>
        <div className="proy-fact-v">{project.duracion}</div>
      </div>
      <div className="proy-fact">
        <div className="proy-fact-k">Ubicación</div>
        <div className="proy-fact-v">{project.ubicacion}</div>
      </div>
      <div className="proy-fact">
        <div className="proy-fact-k">Materiales</div>
        <div className="proy-fact-v">{project.materiales}</div>
      </div>
    </div>
  );
}

export default function ProjectSection({ project, index }) {
  const isLeft = index % 2 === 0;

  const [imgRef, imgVisible] = useScrollReveal(0);
  const [txtRef, txtVisible] = useScrollReveal(150);

  return (
    <section className={`proy-section${isLeft ? '' : ' proy-section--alt'}`}>
      <div className={`proy-section-inner${isLeft ? '' : ' reverse'}`}>
        <div
          ref={imgRef}
          data-reveal
          className={`proy-media${imgVisible ? ' is-visible' : ''}`}
        >
          <BeforeAfterSlider
            beforeSrc={project.imagenAntes}
            afterSrc={project.imagenDespues}
            grayscaleBefore
          />
        </div>

        <div className="proy-text-wrap">
          <div ref={txtRef} data-reveal className={`proy-text${txtVisible ? ' is-visible' : ''}`}>
            <span className="proy-cat">{project.categoria}</span>
            <h2 className="proy-title">{project.titulo}</h2>
            {project.factsTop && <ProjectFacts project={project} />}
            <p className="proy-desc">{project.descripcion}</p>
            {!project.factsTop && <ProjectFacts project={project} />}
            {project.hasCta && (
              <Link to="/contacto" className="proy-cta-link">
                {project.ctaLabel} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
