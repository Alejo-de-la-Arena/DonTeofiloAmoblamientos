import './MaterialsScroller.css';

const MATERIALS = [
  {
    name: 'Melamina',
    note: 'Versátil, durable, gran variedad de texturas',
    seed: 'dtf-mat-melamina',
  },
  {
    name: 'Madera maciza',
    note: 'Nobleza y calidez que dura generaciones',
    seed: 'dtf-mat-madera',
  },
  { name: 'MDF laqueado', note: 'Superficies lisas y color pleno', seed: 'dtf-mat-mdf' },
  {
    name: 'Herrajes premium',
    note: 'Cierre suave y guías full-extension',
    seed: 'dtf-mat-herrajes',
  },
];

export default function MaterialsScroller() {
  return (
    <section className="work-materials">
      <div className="work-materials-head">
        <div className="work-materials-head-inner">
          <div className="section-eyebrow">
            <span className="section-eyebrow-line"></span>
            <span>Con qué trabajamos</span>
          </div>
          <h2 className="section-title">Materiales que se sienten</h2>
          <p className="section-lead">
            Elegimos cada material por cómo se ve, cómo se toca y cuánto dura. Deslizá para
            conocerlos.
          </p>
        </div>
      </div>
      <div className="work-materials-scroll">
        <div className="work-materials-track">
          {MATERIALS.map((m) => (
            <div
              key={m.name}
              className="work-material-card"
              style={{ backgroundImage: `url(https://picsum.photos/seed/${m.seed}/560/760)` }}
            >
              <div className="work-material-scrim" />
              <div className="work-material-copy">
                <div className="work-material-name">{m.name}</div>
                <div className="work-material-note">{m.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
