import './ProjectFilterBar.css';

export default function ProjectFilterBar({ filters, active, onChange }) {
  return (
    <div className="proy-filter-bar">
      <div className="proy-filter-inner">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={`proy-filter-btn${f === active ? ' active' : ''}`}
            onClick={() => onChange(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
