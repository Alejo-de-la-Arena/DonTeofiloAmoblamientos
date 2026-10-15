import { useEffect, useRef, useState } from 'react';
import PublishToggle from '../../components/admin/PublishToggle';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { optimizeImageFile, imageDimensions } from '../../lib/imageOptimize';
import { createTallerPost, deleteTallerPost, fetchTallerAdmin, updateTallerPost } from '../../lib/tallerApi';
import '../../components/admin/ProductsTable.css';
import '../../components/admin/SingleImageUploader.css';
import './AdminProyectos.css';
import './AdminProductoForm.css';
import './AdminTaller.css';

const IG_RE = /^https:\/\/(www\.)?instagram\.com\/\S+$/i;

// Validación compartida por el alta y la edición. El alt es obligatorio: describe la foto
// para quien no la ve (no es un título ni un hashtag).
function validate({ alt, link_instagram }) {
  const errors = {};
  if (!alt.trim()) errors.alt = 'Describí qué se ve en la foto.';
  if (link_instagram.trim() && !IG_RE.test(link_instagram.trim())) {
    errors.link_instagram = 'Tiene que ser un link de instagram.com (https://…).';
  }
  return errors;
}

const toFields = ({ alt, link_instagram, orden }) => ({
  alt: alt.trim(),
  link_instagram: link_instagram.trim() || null,
  orden: Number.isFinite(Number(orden)) ? Number(orden) : 0,
});

/* ---------- alta ---------- */
function NuevoPost({ nextOrden, onCreated }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [vals, setVals] = useState({ alt: '', link_instagram: '', orden: nextOrden });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => setVals((v) => ({ ...v, orden: nextOrden })), [nextOrden]);

  async function handleFile(raw) {
    if (!raw) return;
    const optimized = await optimizeImageFile(raw);
    setFile(optimized);
    setPreview(URL.createObjectURL(optimized));
    setErrors((e) => ({ ...e, file: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(vals);
    if (!file) errs.file = 'Elegí una imagen.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setSaveError('');
    try {
      const dims = await imageDimensions(file);
      const post = await createTallerPost({ file, ...toFields(vals), ancho: dims?.ancho ?? null, alto: dims?.alto ?? null });
      onCreated(post);
      setFile(null);
      setPreview('');
      setVals({ alt: '', link_instagram: '', orden: nextOrden + 1 });
    } catch {
      setSaveError('No pudimos subir la foto. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  return (
    <form className="admin-form admin-taller-form" onSubmit={handleSubmit} noValidate>
      <div className="admin-taller-new">
        <div className="single-img-uploader">
          <span className="single-img-uploader-label">Foto</span>
          <div
            className="single-img-uploader-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {preview ? (
              <img src={preview} alt="" className="single-img-uploader-preview" />
            ) : (
              <p>Arrastrá una imagen acá o hacé click para elegirla</p>
            )}
            {saving && <span className="single-img-uploader-status">Subiendo…</span>}
          </div>
          {errors.file && <p className="single-img-uploader-error">{errors.file}</p>}
        </div>

        <div className="admin-taller-fields">
          <label className="admin-field">
            Descripción de la foto (alt, obligatoria)
            <textarea rows={3} value={vals.alt} onChange={set('alt')} aria-invalid={!!errors.alt} placeholder="Ej.: Frentes de cocina en roble recién lijados en el taller" />
            {errors.alt && <em className="admin-field-error">{errors.alt}</em>}
          </label>
          <label className="admin-field">
            Link a Instagram (opcional)
            <input type="url" value={vals.link_instagram} onChange={set('link_instagram')} aria-invalid={!!errors.link_instagram} placeholder="https://www.instagram.com/p/…" />
            {errors.link_instagram && <em className="admin-field-error">{errors.link_instagram}</em>}
          </label>
          <label className="admin-field admin-taller-orden">
            Orden
            <input type="number" value={vals.orden} onChange={set('orden')} />
          </label>
        </div>
      </div>

      {saveError && <p className="admin-hint admin-hint--error">{saveError}</p>}
      <div className="admin-form-actions">
        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'Subiendo…' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}

/* ---------- fila (vista / edición) ---------- */
function PostRow({ post, toggling, onToggle, onSaved, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [vals, setVals] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function startEdit() {
    setVals({ alt: post.alt, link_instagram: post.link_instagram || '', orden: post.orden ?? 0 });
    setErrors({});
    setEditing(true);
  }

  async function save() {
    const errs = validate(vals);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const fields = toFields(vals);
      await updateTallerPost(post.id, fields);
      onSaved({ ...post, ...fields });
      setEditing(false);
    } catch {
      setErrors({ form: 'No pudimos guardar. Probá de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  const set = (k) => (e) => setVals((v) => ({ ...v, [k]: e.target.value }));

  return (
    <tr>
      <td>
        <div className="admin-table-thumb" style={{ backgroundImage: `url(${post.imagen_url})` }} />
      </td>
      {editing ? (
        <>
          <td>
            <label className="admin-field">
              <span className="sr-only">Descripción (alt)</span>
              <textarea rows={2} value={vals.alt} onChange={set('alt')} aria-invalid={!!errors.alt} />
              {errors.alt && <em className="admin-field-error">{errors.alt}</em>}
            </label>
          </td>
          <td>
            <label className="admin-field">
              <span className="sr-only">Link a Instagram</span>
              <input type="url" value={vals.link_instagram} onChange={set('link_instagram')} aria-invalid={!!errors.link_instagram} />
              {errors.link_instagram && <em className="admin-field-error">{errors.link_instagram}</em>}
            </label>
          </td>
          <td>
            <label className="admin-field admin-taller-orden">
              <span className="sr-only">Orden</span>
              <input type="number" value={vals.orden} onChange={set('orden')} />
            </label>
          </td>
        </>
      ) : (
        <>
          <td className="admin-taller-alt">{post.alt}</td>
          <td className="admin-taller-link">
            {post.link_instagram ? (
              <a href={post.link_instagram} target="_blank" rel="noopener noreferrer">
                Ver post
              </a>
            ) : (
              '—'
            )}
          </td>
          <td className="tabular">{post.orden}</td>
        </>
      )}
      <td>
        <PublishToggle checked={post.activo} disabled={toggling} onChange={(next) => onToggle(post, next)} />
      </td>
      <td className="admin-table-actions">
        {editing ? (
          <>
            <button type="button" className="admin-taller-save" onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button type="button" className="admin-taller-cancel" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </button>
            {errors.form && <em className="admin-field-error">{errors.form}</em>}
          </>
        ) : (
          <>
            <button type="button" className="admin-taller-edit" onClick={startEdit}>
              Editar
            </button>
            <button type="button" onClick={() => onDelete(post)}>
              Eliminar
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

export default function AdminTaller() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setPosts(await fetchTallerAdmin());
      } catch {
        setLoadError('No pudimos cargar las fotos. Probá recargar la página.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = [...posts].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
  const nextOrden = posts.reduce((m, p) => Math.max(m, p.orden ?? 0), 0) + 1;
  const activos = posts.filter((p) => p.activo).length;

  async function handleToggle(post, next) {
    setTogglingId(post.id);
    const prev = posts;
    setPosts((list) => list.map((p) => (p.id === post.id ? { ...p, activo: next } : p)));
    try {
      await updateTallerPost(post.id, { activo: next });
    } catch {
      setPosts(prev);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTallerPost(pendingDelete);
      setPosts((list) => list.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch {
      // queda abierto el modal para reintentar, igual que en proyectos
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-proyectos">
      <div className="admin-proyectos-head">
        <h1>Del taller</h1>
      </div>
      <p className="admin-taller-help">
        Fotos del taller para la sección &quot;Del taller&quot; del Home. Se muestran las primeras 6 activas, por orden
        {activos > 6 ? ` (hay ${activos} activas: las de orden más alto no se ven)` : ''}.
      </p>

      <NuevoPost nextOrden={nextOrden} onCreated={(post) => setPosts((list) => [...list, post])} />

      {loading && <p className="admin-hint">Cargando…</p>}
      {!loading && loadError && <p className="admin-hint admin-hint--error">{loadError}</p>}
      {!loading && !loadError && posts.length === 0 && <p className="admin-hint">Todavía no subiste ninguna foto.</p>}
      {!loading && !loadError && posts.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Descripción (alt)</th>
                <th>Instagram</th>
                <th>Orden</th>
                <th>Activa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <PostRow
                  key={p.id}
                  post={p}
                  toggling={togglingId === p.id}
                  onToggle={handleToggle}
                  onSaved={(updated) => setPosts((list) => list.map((x) => (x.id === updated.id ? updated : x)))}
                  onDelete={setPendingDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Eliminar foto"
        message="¿Seguro que querés eliminar esta foto? Se borra también el archivo y no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        busy={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
