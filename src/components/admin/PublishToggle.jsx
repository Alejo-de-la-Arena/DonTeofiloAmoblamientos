import './PublishToggle.css';

export default function PublishToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Publicado' : 'Borrador'}
      className={`publish-toggle${checked ? ' on' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="publish-toggle-knob" />
    </button>
  );
}
