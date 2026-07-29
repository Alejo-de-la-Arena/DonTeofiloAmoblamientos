import './QuoteStats.css';

const STATS = [
  {
    n: '01',
    title: 'Materiales seleccionados',
    desc: 'Trabajamos con proveedores de confianza y revisamos cada placa antes de cortarla.',
  },
  {
    n: '02',
    title: 'Diseño a medida real',
    desc: 'Nada de módulos estándar forzados. Diseñamos al centímetro de tu espacio.',
  },
  {
    n: '03',
    title: 'Garantía en cada instalación',
    desc: 'Respondemos por nuestro trabajo. Si algo necesita un ajuste, volvemos.',
  },
];

export default function QuoteStats() {
  return (
    <section className="work-quote">
      <div className="work-quote-inner">
        <span className="work-quote-mark">“</span>
        <p className="work-quote-text">
          No hacemos muebles en serie. Cada proyecto se diseña para el espacio y la vida de quien
          lo va a usar.
        </p>
      </div>
      <div className="work-quote-stats">
        {STATS.map((s) => (
          <div key={s.n} className="work-stat">
            <div className="work-stat-num">{s.n}</div>
            <h4 className="work-stat-title">{s.title}</h4>
            <p className="work-stat-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
