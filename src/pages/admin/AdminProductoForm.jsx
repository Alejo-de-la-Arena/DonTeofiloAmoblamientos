import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUploader from '../../components/admin/ImageUploader';
import {
  createProducto,
  fetchProductoById,
  updateProducto,
  uploadProductoImagen,
  deleteProductoImagen,
  reorderProductoImagenes,
} from '../../lib/productosApi';
import { CATEGORIAS, MATERIALES } from '../../data/productCategories';
import './AdminProductoForm.css';

const EMPTY_FORM = {
  nombre: '',
  categoria: '',
  material: '',
  precio: '',
  mostrar_precio: true,
  descripcion: '',
  medidas: '',
  destacado: false,
  publicado: false,
};

export default function AdminProductoForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initialImages, setInitialImages] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const p = await fetchProductoById(id);
        setForm({
          nombre: p.nombre || '',
          categoria: p.categoria || '',
          material: p.material || '',
          precio: p.precio != null ? String(p.precio) : '',
          mostrar_precio: p.mostrar_precio,
          descripcion: p.descripcion || '',
          medidas: p.medidas || '',
          destacado: p.destacado,
          publicado: p.publicado,
        });
        setInitialImages(p.imagenes);
      } catch {
        setLoadError('No pudimos cargar este producto.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next = {};
    if (!form.nombre.trim()) next.nombre = 'Requerido';
    if (!form.categoria) next.categoria = 'Requerido';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      material: form.material || null,
      precio: form.precio === '' ? null : Number(form.precio),
      mostrar_precio: form.mostrar_precio,
      descripcion: form.descripcion || null,
      medidas: form.medidas || null,
      destacado: form.destacado,
      publicado: form.publicado,
    };

    try {
      if (isEdit) {
        await updateProducto(id, payload);
      } else {
        const created = await createProducto(payload);
        let ordenCounter = 0;
        for (const file of stagedFiles) {
          try {
            await uploadProductoImagen(created.id, file, ordenCounter);
            ordenCounter += 1;
          } catch {
            setSaveError('El producto se guardó, pero alguna imagen no se pudo subir.');
          }
        }
      }
      setSaved(true);
      setTimeout(() => navigate('/admin/productos'), 900);
    } catch {
      setSaveError('No pudimos guardar el producto. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-hint">Cargando…</p>;
  if (loadError) return <p className="admin-hint admin-hint--error">{loadError}</p>;

  return (
    <div className="admin-form-page">
      <h1>{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Nombre *</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setField('nombre', e.target.value)}
            />
            {errors.nombre && <em className="admin-field-error">{errors.nombre}</em>}
          </label>

          <label className="admin-field">
            <span>Categoría *</span>
            <select
              value={form.categoria}
              onChange={(e) => setField('categoria', e.target.value)}
            >
              <option value="">Elegir…</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.categoria && <em className="admin-field-error">{errors.categoria}</em>}
          </label>

          <label className="admin-field">
            <span>Material</span>
            <select value={form.material} onChange={(e) => setField('material', e.target.value)}>
              <option value="">Sin especificar</option>
              {MATERIALES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Precio</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={form.precio}
              onChange={(e) => setField('precio', e.target.value)}
              placeholder="Dejar vacío para 'Consultar'"
            />
          </label>

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.mostrar_precio}
              onChange={(e) => setField('mostrar_precio', e.target.checked)}
            />
            Mostrar precio públicamente
          </label>

          <label className="admin-field">
            <span>Medidas</span>
            <input
              type="text"
              value={form.medidas}
              onChange={(e) => setField('medidas', e.target.value)}
              placeholder="Ej: 180cm x 60cm x 90cm"
            />
          </label>
        </div>

        <label className="admin-field">
          <span>Descripción</span>
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(e) => setField('descripcion', e.target.value)}
          />
        </label>

        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={form.destacado}
            onChange={(e) => setField('destacado', e.target.checked)}
          />
          Destacar en el catálogo (card más grande)
        </label>

        <div className="admin-form-section">
          <span className="admin-form-section-label">Imágenes</span>
          <ImageUploader
            parentId={isEdit ? id : null}
            initialImages={initialImages}
            onStagedFilesChange={setStagedFiles}
            uploadFn={uploadProductoImagen}
            deleteFn={deleteProductoImagen}
            reorderFn={reorderProductoImagenes}
          />
        </div>

        <div className="admin-publish-row">
          <label className="admin-checkbox admin-checkbox--publish">
            <input
              type="checkbox"
              checked={form.publicado}
              onChange={(e) => setField('publicado', e.target.checked)}
            />
            {form.publicado ? 'Publicar en la web' : 'Guardar como borrador'}
          </label>
        </div>

        {saveError && <p className="admin-hint admin-hint--error">{saveError}</p>}
        {saved && (
          <p className="admin-hint admin-hint--success">¡Guardado! Volviendo al listado…</p>
        )}

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn-ghost"
            onClick={() => navigate('/admin/productos')}
          >
            Cancelar
          </button>
          <button type="submit" className="admin-btn-primary" disabled={saving || saved}>
            {saving ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
