import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUploader from '../../components/admin/ImageUploader';
import SingleImageUploader from '../../components/admin/SingleImageUploader';
import DetalleFieldsEditor from '../../components/admin/DetalleFieldsEditor';
import {
  createProyecto,
  fetchProyectoById,
  updateProyecto,
  uploadProyectoPortada,
  uploadProyectoImagen,
  deleteProyectoImagen,
  reorderProyectoImagenes,
  upsertDetalle,
  deleteDetalle,
} from '../../lib/proyectosApi';
import { CATEGORIAS } from '../../data/productCategories';
import '../admin/AdminProductoForm.css';
import './AdminProyectoForm.css';

// Aproximación cliente del slugify() de la DB (sin unaccent real) — solo para que el campo
// slug se autocomplete al tipear; la normalización final y la resolución de colisiones
// las hace el trigger proyectos_set_slug en la base.
function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const BASE_DETALLES = [
  { label: 'Duración', valor: '' },
  { label: 'Ubicación', valor: '' },
  { label: 'Materiales', valor: '' },
];

function withTempIds(rows) {
  return rows.map((r, i) => ({ tempId: `tmp-${Date.now()}-${i}`, ...r }));
}

const EMPTY_FORM = {
  titulo: '',
  slug: '',
  categoria: '',
  descripcion: '',
  resumen: '',
  orden: '',
  publicado: true,
};

export default function AdminProyectoForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imagenAntes, setImagenAntes] = useState({ url: '', storagePath: '' });
  const [imagenDespues, setImagenDespues] = useState({ url: '', storagePath: '' });
  const [stagedAntesFile, setStagedAntesFile] = useState(null);
  const [stagedDespuesFile, setStagedDespuesFile] = useState(null);
  const [initialImages, setInitialImages] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [detalles, setDetalles] = useState(withTempIds(BASE_DETALLES));
  const [originalDetalleIds, setOriginalDetalleIds] = useState([]);
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
        const p = await fetchProyectoById(id);
        setForm({
          titulo: p.titulo || '',
          slug: p.slug || '',
          categoria: p.categoria || '',
          descripcion: p.descripcion || '',
          resumen: p.resumen || '',
          orden: p.orden != null ? String(p.orden) : '',
          publicado: p.publicado,
        });
        setSlugTouched(true);
        setImagenAntes({
          url: p.imagen_antes || '',
          storagePath: p.imagen_antes_storage_path || '',
        });
        setImagenDespues({
          url: p.imagen_despues || '',
          storagePath: p.imagen_despues_storage_path || '',
        });
        setInitialImages(p.galeria);
        setDetalles(p.detalles.length > 0 ? p.detalles : withTempIds(BASE_DETALLES));
        setOriginalDetalleIds(p.detalles.map((d) => d.id));
      } catch {
        setLoadError('No pudimos cargar este proyecto.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTituloChange(value) {
    setField('titulo', value);
    if (!slugTouched) setField('slug', slugify(value));
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    setField('slug', slugify(value));
  }

  function validate() {
    const next = {};
    if (!form.titulo.trim()) next.titulo = 'Requerido';
    if (!form.categoria) next.categoria = 'Requerido';
    const hasDespues = isEdit ? !!imagenDespues.url : !!stagedDespuesFile;
    if (!hasDespues) next.imagenDespues = 'La imagen "después" es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveDetalles(proyectoId) {
    const currentIds = detalles.filter((d) => d.id).map((d) => d.id);
    const removed = originalDetalleIds.filter((oid) => !currentIds.includes(oid));
    for (const oid of removed) {
      await deleteDetalle(oid);
    }
    let ordenCounter = 0;
    for (const row of detalles) {
      if (!row.label.trim()) continue;
      await upsertDetalle({
        id: row.id,
        proyecto_id: proyectoId,
        label: row.label.trim(),
        valor: row.valor || null,
        orden: ordenCounter,
      });
      ordenCounter += 1;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');

    const payload = {
      titulo: form.titulo.trim(),
      slug: form.slug.trim() || null,
      categoria: form.categoria,
      descripcion: form.descripcion || null,
      resumen: form.resumen || null,
      orden: form.orden === '' ? null : Number(form.orden),
      publicado: form.publicado,
    };

    try {
      let proyectoId = id;
      if (isEdit) {
        await updateProyecto(id, payload);
      } else {
        const created = await createProyecto(payload);
        proyectoId = created.id;

        if (stagedAntesFile) {
          try {
            const { url, storage_path } = await uploadProyectoPortada(
              proyectoId,
              stagedAntesFile,
              'antes'
            );
            await updateProyecto(proyectoId, {
              imagen_antes: url,
              imagen_antes_storage_path: storage_path,
            });
          } catch {
            setSaveError('El proyecto se guardó, pero la imagen "antes" no se pudo subir.');
          }
        }
        if (stagedDespuesFile) {
          try {
            const { url, storage_path } = await uploadProyectoPortada(
              proyectoId,
              stagedDespuesFile,
              'despues'
            );
            await updateProyecto(proyectoId, {
              imagen_despues: url,
              imagen_despues_storage_path: storage_path,
            });
          } catch {
            setSaveError('El proyecto se guardó, pero la imagen "después" no se pudo subir.');
          }
        }

        let ordenCounter = 0;
        for (const file of stagedFiles) {
          try {
            await uploadProyectoImagen(proyectoId, file, ordenCounter);
            ordenCounter += 1;
          } catch {
            setSaveError('El proyecto se guardó, pero alguna imagen de la galería no se pudo subir.');
          }
        }
      }

      await saveDetalles(proyectoId);

      setSaved(true);
      setTimeout(() => navigate('/admin/proyectos'), 900);
    } catch {
      setSaveError('No pudimos guardar el proyecto. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-hint">Cargando…</p>;
  if (loadError) return <p className="admin-hint admin-hint--error">{loadError}</p>;

  return (
    <div className="admin-form-page">
      <h1>{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>Título *</span>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
            />
            {errors.titulo && <em className="admin-field-error">{errors.titulo}</em>}
          </label>

          <label className="admin-field">
            <span>Slug (URL)</span>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="se genera solo desde el título"
            />
          </label>

          <label className="admin-field">
            <span>Categoría *</span>
            <select value={form.categoria} onChange={(e) => setField('categoria', e.target.value)}>
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
            <span>Orden</span>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => setField('orden', e.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>

        <label className="admin-field">
          <span>Resumen (card del listado)</span>
          <textarea
            rows={2}
            value={form.resumen}
            onChange={(e) => setField('resumen', e.target.value)}
            placeholder="Opcional — si lo dejás vacío, la card usa la descripción"
          />
        </label>

        <label className="admin-field">
          <span>Descripción</span>
          <textarea
            rows={5}
            value={form.descripcion}
            onChange={(e) => setField('descripcion', e.target.value)}
          />
        </label>

        <div className="admin-form-section">
          <span className="admin-form-section-label">Imagen antes / después</span>
          <div className="admin-portada-grid">
            <SingleImageUploader
              proyectoId={isEdit ? id : null}
              field="antes"
              label="Antes"
              initialUrl={imagenAntes.url}
              initialStoragePath={imagenAntes.storagePath}
              onStagedFileChange={setStagedAntesFile}
            />
            <SingleImageUploader
              proyectoId={isEdit ? id : null}
              field="despues"
              label="Después *"
              initialUrl={imagenDespues.url}
              initialStoragePath={imagenDespues.storagePath}
              onStagedFileChange={setStagedDespuesFile}
            />
          </div>
          {errors.imagenDespues && <em className="admin-field-error">{errors.imagenDespues}</em>}
        </div>

        <div className="admin-form-section">
          <span className="admin-form-section-label">Galería del proyecto terminado</span>
          <ImageUploader
            parentId={isEdit ? id : null}
            initialImages={initialImages}
            onStagedFilesChange={setStagedFiles}
            uploadFn={uploadProyectoImagen}
            deleteFn={deleteProyectoImagen}
            reorderFn={reorderProyectoImagenes}
          />
        </div>

        <div className="admin-form-section">
          <span className="admin-form-section-label">Ficha de detalles</span>
          <DetalleFieldsEditor value={detalles} onChange={setDetalles} />
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
            onClick={() => navigate('/admin/proyectos')}
          >
            Cancelar
          </button>
          <button type="submit" className="admin-btn-primary" disabled={saving || saved}>
            {saving ? 'Guardando…' : 'Guardar proyecto'}
          </button>
        </div>
      </form>
    </div>
  );
}
