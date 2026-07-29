import './WorkHero.css';

const MOSAIC = [
  { seed: 'dtf-taller-1', offset: false },
  { seed: 'dtf-taller-2', offset: true },
  { seed: 'dtf-taller-3', offset: false },
  { seed: 'dtf-taller-4', offset: true },
];

export default function WorkHero() {
  return (
    <header className="work-hero">
      <div className="work-hero-inner">
        <div className="work-hero-mosaic">
          {MOSAIC.map((tile) => (
            <div
              key={tile.seed}
              className={`work-hero-tile${tile.offset ? ' work-hero-tile--offset' : ''}`}
              style={{ backgroundImage: `url(https://picsum.photos/seed/${tile.seed}/500/500)` }}
            />
          ))}
        </div>
        <div className="work-hero-copy">
          <div className="section-eyebrow">
            <span className="section-eyebrow-line"></span>
            <span>Nuestro oficio</span>
          </div>
          <h1 className="work-hero-title">Cómo Trabajamos</h1>
          <p className="work-hero-lead">
            Cada mueble empieza con una idea y termina con un detalle bien hecho.
          </p>
        </div>
      </div>
    </header>
  );
}
