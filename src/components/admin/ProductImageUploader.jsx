import { useRef, useState } from 'react';
import { removeStorageObject, updateProducto, uploadProductoImagen } from '../../lib/productosApi';
import { optimizeImageFile } from '../../lib/imageOptimize';
import './SingleImageUploader.css';

// Sube/reemplaza la única imagen de un producto — mismo patrón que SingleImageUploader
// (antes/después de proyectos) pero wireado a productosApi, ya que cada producto tiene
// una sola imagen.
// productoId === null (alta): el archivo queda en memoria (preview) hasta que el padre lo
//   suba después de crear el producto, vía onStagedFileChange(file).
// productoId presente (edición): al elegir un archivo se sube y reemplaza al instante.
export default function ProductImageUploader({
  productoId,
  initialUrl,
  initialStoragePath,
  onStagedFileChange,
}) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl || '');
  const [storagePath, setStoragePath] = useState(initialStoragePath || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleFile(rawFile) {
    if (!rawFile) return;
    setError('');
    const file = await optimizeImageFile(rawFile);

    if (!productoId) {
      setPreviewUrl(URL.createObjectURL(file));
      onStagedFileChange?.(file);
      return;
    }

    setUploading(true);
    try {
      const prevPath = storagePath;
      const { url, storage_path } = await uploadProductoImagen(productoId, file);
      await updateProducto(productoId, { imagen: url, imagen_storage_path: storage_path });
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
