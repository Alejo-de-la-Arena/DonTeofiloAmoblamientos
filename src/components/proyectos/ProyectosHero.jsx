import './ProyectosHero.css';

export default function ProyectosHero({ count }) {
  return (
    <header className="proy-hero">
      <div className="proy-hero-bg" />
      <div className="proy-hero-grain" />
      <div className="proy-hero-scrim" />
      <div className="proy-hero-content">
        <div className="proy-hero-inner">
          <h1 className="proy-hero-title">Proyectos</h1>
          <div className="proy-hero-meta">
            <span className="proy-hero-count">{count} proyectos seleccionados</span>
            <span className="proy-hero-line" />
          </div>
        </div>
      </div>
    </header>
  );
}
