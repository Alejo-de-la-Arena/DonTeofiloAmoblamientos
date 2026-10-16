import MessagePreview from './MessagePreview';
import { useMotionSafe } from '../../lib/motion';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CONTACT_TYPES } from '../../data/contactTypes';
import WhatsAppButton from '../primitives/WhatsAppButton';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../../lib/whatsapp';
import './ContactForm.css';

const SEGMENTS = [
  { id: 'general', label: 'Consulta general' },
  ...CONTACT_TYPES.map(({ slug, label }) => ({ id: slug, label })),
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
    {
      key: 'alcance',
      label: '¿Cocina completa o parcial?',
      kind: 'radio',
      options: ['Completa', 'Parcial'],
    },
    { key: 'metros', label: 'Metros aproximados', kind: 'text' },
    { key: 'fecha', label: 'Fecha estimada de inicio', kind: 'text' },
  ],
  placard: [
    { key: 'nombre', label: 'Nombre', kind: 'text' },
    { key: 'tel', label: 'Teléfono / WhatsApp', kind: 'text', type: 'tel' },
    { key: 'ciudad', label: 'Ciudad', kind: 'text' },
    {
      key: 'ambiente',
      label: 'Ambiente',
      kind: 'radio',
      options: ['Dormitorio', 'Living', 'Otro'],
    },
    { key: 'medidas', label: 'Medidas aproximadas (si las tenés)', kind: 'text' },
  ],
  otro: [
    { key: 'nombre', label: 'Nombre', kind: 'text' },
    { key: 'tel', label: 'Teléfono / WhatsApp', kind: 'text', type: 'tel' },
    { key: 'ciudad', label: 'Ciudad', kind: 'text' },
    { key: 'descripcion', label: 'Descripción del proyecto', kind: 'area' },
  ],
};

FIELD_SCHEMA.vanitory = FIELD_SCHEMA.otro;
FIELD_SCHEMA.abertura = FIELD_SCHEMA.otro;

function SegmentButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      className={`segment-btn${active ? ' active' : ''}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function FloatingField({ field, value, focused, error, inputRef, onInput, onFocus, onBlur }) {
  const active = focused || value.length > 0;
  const Tag = field.kind === 'area' ? 'textarea' : 'input';
  const inputId = `contact-${field.key}`;
  const errorId = `${inputId}-error`;
  return (
    <div className={`floating-field${error ? ' has-error' : ''}`}>
      <Tag
        id={inputId}
        name={field.key}
        autoComplete={{ nombre: 'name', tel: 'tel', ciudad: 'address-level2' }[field.key] || 'off'}
        placeholder=" "
        aria-required={field.key === 'nombre' || undefined}
        ref={inputRef}
        className="dtinput"
        type={field.kind === 'text' ? field.type || 'text' : undefined}
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
      />
      <label htmlFor={inputId} className={`floating-label${active ? ' active' : ''}`}>
        {field.label}
      </label>
      <span className={`floating-underline${focused ? ' focused' : ''}`}></span>
      {error && (
        <span id={errorId} className="floating-error" role="alert">
          Falta tu nombre para armar el mensaje
        </span>
      )}
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

export default function ContactForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [type, setType] = useState(() => {
    const tipo = searchParams.get('tipo');
    return SEGMENTS.some((s) => s.id === tipo) ? tipo : tipo ? 'otro' : 'general';
  });
  useEffect(() => {
    if (!searchParams.has('tipo')) return;
    const tipo = searchParams.get('tipo');
    setType(SEGMENTS.some((s) => s.id === tipo) ? tipo : 'otro');
    const next = new URLSearchParams(searchParams);
    next.delete('tipo');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);
  const [vals, setVals] = useState({});
  const [typing, setTyping] = useState(false);
  const [previewVals, setPreviewVals] = useState({});
  const { reduce } = useMotionSafe();
  const typingTimeout = useRef(null);
  useEffect(() => {
    if (reduce) {
      clearTimeout(typingTimeout.current);
      setTyping(false);
    }
    return () => clearTimeout(typingTimeout.current);
  }, [reduce]);
  function updateValue(key, value, text = true) {
    const next = { ...vals, [key]: value };
    setVals(next);
    clearTimeout(typingTimeout.current);
    if (reduce || !text) {
      setTyping(false);
      setPreviewVals(next);
      return;
    }
    setTyping(true);
    typingTimeout.current = setTimeout(() => {
      setPreviewVals(next);
      setTyping(false);
    }, 700);
  }
  const [focus, setFocus] = useState({});
  const [errors, setErrors] = useState({});
  const [fade, setFade] = useState(1);
  const [showPreview, setShowPreview] = useState(true);

  const fadeTimeoutRef = useRef(null);

  const fieldRefs = useRef({});

  useEffect(() => {
    return () => {
      clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  function handleSetType(t) {
    if (t === type) return;
    clearTimeout(typingTimeout.current);
    setTyping(false);
    setPreviewVals(vals);
    setType(t);
    setFade(reduce ? 1 : 0);
    setErrors({});
    clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(
      () => {
        setType(t);
        setFade(1);
      },
      reduce ? 0 : 200
    );
  }

  function labelFor(t) {
    return SEGMENTS.find((s) => s.id === t).label;
  }

  // Los campos del segmento activo, en orden y con su label: el armado del texto vive en
  // src/lib/whatsapp.js (compartido con producto y proyecto).
  function messageOptions(values = vals) {
    return { tipo: labelFor(type), extra: FIELD_SCHEMA[type].map((f) => [f.label, values[f.key]]) };
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Nombre es el único campo obligatorio del formulario, en cualquier segmento.
    const newErrors = {};
    if (!vals.nombre || !String(vals.nombre).trim()) newErrors.nombre = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      fieldRefs.current.nombre?.focus();
      return;
    }
    window.open(buildWhatsAppUrl(messageOptions()), '_blank', 'noopener,noreferrer');
  }

  return (
    <form className="contact-form-card" onSubmit={handleSubmit} noValidate>
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
                onSelect={(v) => updateValue(f.key, v, false)}
              />
            ) : (
              <FloatingField
                field={f}
                value={vals[f.key] || ''}
                focused={!!focus[f.key]}
                error={!!errors[f.key]}
                inputRef={(el) => (fieldRefs.current[f.key] = el)}
                onInput={(v) => {
                  updateValue(f.key, v);
                  if (errors[f.key]) setErrors((prev) => ({ ...prev, [f.key]: false }));
                }}
                onFocus={() => setFocus((prev) => ({ ...prev, [f.key]: true }))}
                onBlur={() => setFocus((prev) => ({ ...prev, [f.key]: false }))}
              />
            )}
          </div>
        ))}
      </div>

      <WhatsAppButton
        as="button"
        type="submit"
        variant="dark"
        block
        className="contact-form-submit"
      >
        Enviar por WhatsApp
      </WhatsAppButton>

      <MessagePreview
        show={showPreview}
        onToggle={() => setShowPreview((s) => !s)}
        typing={typing}
        typingKey={JSON.stringify(vals)}
        previewText={buildWhatsAppMessage(messageOptions(reduce ? vals : previewVals))}
      />
    </form>
  );
}
