import { useRef, useState } from 'react';
import { removeStorageObject, updateProyecto, uploadProyectoPortada } from '../../lib/proyectosApi';
import './SingleImageUploader.css';

// Sube/reemplaza UNA sola imagen (antes/después de un proyecto).
// proyectoId === null (alta): el archivo queda en memoria (preview) hasta que el padre lo
//   suba después de crear el proyecto, vía onStagedFileChange(file).
// proyectoId presente (edición): al elegir un archivo se sube y reemplaza al instante —
//   se persiste en la fila del proyecto y recién después se borra el storage_path anterior,
//   para no dejar la fila apuntando a un archivo ya eliminado si algo falla en el medio.
export default function SingleImageUploader({
  proyectoId,
  field,
  label,
  initialUrl,
  initialStoragePath,
  onStagedFileChange,
}) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl || '');
  const [storagePath, setStoragePath] = useState(initialStoragePath || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError('');

    if (!proyectoId) {
      setPreviewUrl(URL.createObjectURL(file));
      onStagedFileChange?.(file);
      return;
    }

    setUploading(true);
    try {
      const prevPath = storagePath;
      const { url, storage_path } = await uploadProyectoPortada(proyectoId, file, field);
      await updateProyecto(proyectoId, {
        [`imagen_${field}`]: url,
        [`imagen_${field}_storage_path`]: storage_path,
      });
      if (prevPath) await removeStorageObject(prevPath);
      setPreviewUrl(url);
      setStoragePath(storage_path);
    } catch {
      setError('No pudimos subir la imagen. Probá de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="single-img-uploader">
      <span className="single-img-uploader-label">{label}</span>
      <div
        className="single-img-uploader-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleInputChange} />
        {previewUrl ? (
          <img src={previewUrl} alt="" className="single-img-uploader-preview" />
        ) : (
          <p>Arrastrá una imagen acá o hacé click para elegirla</p>
        )}
        {uploading && <span className="single-img-uploader-status">Subiendo…</span>}
        {previewUrl && !uploading && (
          <span className="single-img-uploader-replace">Click para reemplazar</span>
        )}
      </div>
      {error && <p className="single-img-uploader-error">{error}</p>}
    </div>
  );
}
