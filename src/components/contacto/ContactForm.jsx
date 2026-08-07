import { useEffect, useRef, useState } from 'react';
import WhatsAppIcon from '../ui/icons/WhatsAppIcon';
import { WHATSAPP_URL } from '../../config/contact';
import './ContactForm.css';

const SEGMENTS = [
  { id: 'general', label: 'Consulta general' },
  { id: 'cocina', label: 'Renovación de cocina' },
  { id: 'placard', label: 'Placard a medida' },
  { id: 'otro', label: 'Otro proyecto' },
];

const FIELD_SCHEMA = {
  general: [
    { key: 'nombre', label: 'Nombre', kind: 'text' },
    { key: 'tel', label: 'Teléfono / WhatsApp', kind: 'text', type: 'tel' },
    { key: 'mensaje', label: 'Contanos qué necesitás', kind: 'area' },
  ],
  cocina: [
    { key: 'nombre', label: 'Nombre', kind: 'text' },
    { key: 'tel', label: 'Teléfono / WhatsApp', kind: 'text', type: 'tel' },
    { key: 'ciudad', label: 'Ciudad', kind: 'text' },
    { key: 'alcance', label: '¿Cocina completa o parcial?', kind: 'radio', options: ['Completa', 'Parcial'] },
    { key: 'metros', label: 'Metros aproximados', kind: 'text' },
    { key: 'fecha', label: 'Fecha estimada de inicio', kind: 'text' },
  ],
  placard: [
    { key: 'nombre', label: 'Nombre', kind: 'text' },
    { key: 'tel', label: 'Teléfono / WhatsApp', kind: 'text', type: 'tel' },
    { key: 'ciudad', label: 'Ciudad', kind: 'text' },
    { key: 'ambiente', label: 'Ambiente', kind: 'radio', options: ['Dormitorio', 'Living', 'Otro'] },
    { key: 'medidas', label: 'Medidas aproximadas (si las tenés)', kind: 'text' },
  ],
  otro: [
    { key: 'nombre', label: 'Nombre', kind: 'text' },
    { key: 'tel', label: 'Teléfono / WhatsApp', kind: 'text', type: 'tel' },
    { key: 'ciudad', label: 'Ciudad', kind: 'text' },
    { key: 'descripcion', label: 'Descripción del proyecto', kind: 'area' },
  ],
};

function SegmentButton({ active, label, onClick }) {
  return (
    <button type="button" className={`segment-btn${active ? ' active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

function FloatingField({ field, value, focused, error, onInput, onFocus, onBlur }) {
  const active = focused || value.length > 0;
  const Tag = field.kind === 'area' ? 'textarea' : 'input';
  return (
    <div className={`floating-field${error ? ' has-error' : ''}`}>
      <Tag
        className="dtinput"
        type={field.kind === 'text' ? field.type || 'text' : undefined}
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <label className={`floating-label${active ? ' active' : ''}`}>{field.label}</label>
      <span className={`floating-underline${focused ? ' focused' : ''}`}></span>
      {error && <span className="floating-error">Falta completar este campo</span>}
    </div>
  );
}

function RadioPillGroup({ field, value, onSelect }) {
  return (
    <div>
      <div className="radio-group-label">{field.label}</div>
      <div className="radio-group-options">
        {field.options.map((option) => (
          <button
            type="button"
            key={option}
            className={`radio-pill${value === option ? ' active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessagePreview({ show, onToggle, previewText }) {
  return (
    <div className="message-preview">
      <button type="button" className="message-preview-toggle" onClick={onToggle}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`message-preview-chevron${show ? ' open' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        Así vas a enviar tu mensaje
      </button>
      <div className={`message-preview-wrap${show ? ' open' : ''}`}>
        <div className="message-preview-panel">
          <div className="message-preview-bubble-row">
            <div className="message-preview-bubble">
              {previewText}
              <div className="message-preview-time">12:34 ✓✓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactForm() {
  const [type, setType] = useState('general');
  const [vals, setVals] = useState({});
  const [focus, setFocus] = useState({});
  const [errors, setErrors] = useState({});
  const [fade, setFade] = useState(1);
  const [showPreview, setShowPreview] = useState(true);
  const [sent, setSent] = useState(false);
  const [checkDrawn, setCheckDrawn] = useState(false);

  const fadeTimeoutRef = useRef(null);
  const sentTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(fadeTimeoutRef.current);
      clearTimeout(sentTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!sent) {
      setCheckDrawn(false);
      return;
    }
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setCheckDrawn(true));
    });
    return () => cancelAnimationFrame(raf1);
  }, [sent]);

  function handleSetType(t) {
    if (t === type) return;
    setFade(0);
    setErrors({});
    clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => {
      setType(t);
      setFade(1);
    }, 200);
  }

  function labelFor(t) {
    return SEGMENTS.find((s) => s.id === t).label;
  }

  function buildMessage() {
    const lines = [`Hola Don Teófilo 👋 Quiero hacer una consulta sobre: ${labelFor(type)}.`, ''];
    FIELD_SCHEMA[type].forEach((f) => {
      const v = vals[f.key];
      if (v && String(v).trim()) {
        lines.push(`• ${f.label.replace('¿', '').replace('?', '')}: ${v}`);
      }
    });
    if (lines.length === 2) lines.push('(Todavía no completé los datos)');
    return lines.join('\n');
  }

  function handleSubmit() {
    if (sent) return;
    const required = ['nombre', 'tel'].filter((key) => FIELD_SCHEMA[type].some((f) => f.key === key));
    const newErrors = {};
    required.forEach((key) => {
      if (!vals[key] || !String(vals[key]).trim()) newErrors[key] = true;
    });
    setErrors(newErrors);
    setSent(true);
    const msg = encodeURIComponent(buildMessage());
    sentTimeoutRef.current = setTimeout(() => {
      window.open(`${WHATSAPP_URL}?text=${msg}`, '_blank');
      setSent(false);
    }, 900);
  }

  return (
    <div className="contact-form-card">
      <div className="contact-form-label">¿Sobre qué querés consultar?</div>
      <div className="contact-form-segments">
        {SEGMENTS.map((s) => (
          <SegmentButton
            key={s.id}
            active={s.id === type}
            label={s.label}
            onClick={() => handleSetType(s.id)}
          />
        ))}
      </div>

      <div
        className="contact-form-fields"
        style={{ opacity: fade, transform: `translateY(${fade ? 0 : 8}px)` }}
      >
        {FIELD_SCHEMA[type].map((f) => (
          <div className="field-row" key={f.key}>
            {f.kind === 'radio' ? (
              <RadioPillGroup
                field={f}
                value={vals[f.key]}
                onSelect={(v) => setVals((prev) => ({ ...prev, [f.key]: v }))}
              />
            ) : (
              <FloatingField
                field={f}
                value={vals[f.key] || ''}
                focused={!!focus[f.key]}
                error={!!errors[f.key]}
                onInput={(v) => {
                  setVals((prev) => ({ ...prev, [f.key]: v }));
                  if (errors[f.key]) setErrors((prev) => ({ ...prev, [f.key]: false }));
                }}
                onFocus={() => setFocus((prev) => ({ ...prev, [f.key]: true }))}
                onBlur={() => setFocus((prev) => ({ ...prev, [f.key]: false }))}
              />
            )}
          </div>
        ))}
      </div>

      <button type="button" className={`whatsapp-submit${sent ? ' sent' : ''}`} onClick={handleSubmit}>
        {sent ? (
          <>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="whatsapp-submit-check"
              style={{ strokeDasharray: 24, strokeDashoffset: checkDrawn ? 0 : 24 }}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>¡Abriendo WhatsApp…</span>
          </>
        ) : (
          <>
            <WhatsAppIcon size={20} />
            <span>Enviar por WhatsApp</span>
          </>
        )}
      </button>

      <MessagePreview
        show={showPreview}
        onToggle={() => setShowPreview((s) => !s)}
        previewText={buildMessage()}
      />
    </div>
  );
}
