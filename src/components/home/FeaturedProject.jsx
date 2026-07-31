import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import BeforeAfterSlider from './BeforeAfterSlider';
import cocinaAntes from '../../assets/images/inicio/antes-despues/cocina-antes.avif';
import cocinaDespues from '../../assets/images/inicio/antes-despues/cocina-despues.avif';
import './FeaturedProject.css';

export default function FeaturedProject() {
  const [ref, isVisible] = useScrollReveal(0);
  const revealClass = isVisible ? ' is-visible' : '';

  return (
    <section id="proyectos" className="featured">
      <div className="featured-grid">
        <BeforeAfterSlider beforeSrc={cocinaAntes} afterSrc={cocinaDespues} />
        <div ref={ref} className={`featured-header${revealClass}`} data-reveal>
          <span className="section-eyebrow-solo">Proyecto destacado</span>
          <h2 className="featured-title">
            Cocina completa
            <br />— Palermo, Buenos Aires
          </h2>
          <p className="featured-desc">
            Renovación integral de cocina en departamento. Muebles bajo y sobre mesada en
            melamina roble, mesada de cuarzo, alacena esquinera con herrajes de cierre suave.
          </p>
        </div>
        <div className={`featured-facts-link${revealClass}`} data-reveal>
          <div className="featured-facts">
            <div>
              <div className="featured-fact-label">Duración</div>
              <div className="featured-fact-val">3 semanas</div>
            </div>
            <div>
              <div className="featured-fact-label">Ubicación</div>
              <div className="featured-fact-val">Palermo, CABA</div>
            </div>
          </div>
          <Link to="/proyectos" className="link-arrow">
            Ver todos los proyectos →
          </Link>
        </div>
      </div>
    </section>
  );
}
