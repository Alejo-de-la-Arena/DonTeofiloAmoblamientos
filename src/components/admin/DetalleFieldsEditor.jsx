import { useState } from 'react';
import './DetalleFieldsEditor.css';

// Lista editable de pares label/valor (ficha de detalles de un proyecto: Duración,
// Ubicación, Materiales y cualquier campo libre que el admin quiera sumar). Totalmente
// controlado por el padre — este componente no persiste nada por su cuenta, solo emite
// `onChange` con el array actualizado; el guardado real ocurre al enviar el formulario.
export default function DetalleFieldsEditor({ value, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);

  function updateRow(index, patch) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    onChange([...value, { tempId: `tmp-${Date.now()}-${value.length}`, label: '', valor: '' }]);
  }

  function removeRow(index) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleDrop(index) {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    onChange(next);
  }

  return (
    <div className="detalle-editor">
      {value.map((row, index) => (
        <div
          key={row.id || row.tempId}
          className="detalle-editor-row"
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop(index);
          }}
        >
          <span className="detalle-editor-handle" aria-hidden="true">
            ⠿
          </span>
          <input
            type="text"
            className="detalle-editor-label"
            placeholder="Campo (ej. Duración)"
            value={row.label}
            onChange={(e) => updateRow(index, { label: e.target.value })}
          />
          <input
            type="text"
            className="detalle-editor-value"
            placeholder="Valor"
            value={row.valor || ''}
            onChange={(e) => updateRow(index, { valor: e.target.value })}
          />
          <button
            type="button"
            className="detalle-editor-remove"
            onClick={() => removeRow(index)}
            aria-label="Quitar campo"
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" className="detalle-editor-add" onClick={addRow}>
        + Agregar campo
      </button>
    </div>
  );
}
