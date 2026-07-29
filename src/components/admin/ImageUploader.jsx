import { useCallback, useRef, useState } from 'react';
import {
  uploadProductoImagen,
  deleteProductoImagen,
  reorderProductoImagenes,
} from '../../lib/productosApi';
import './ImageUploader.css';

let stagedIdSeq = 0;

// productoId === null  → modo "alta": los archivos quedan en memoria (solo preview) hasta
//   que el producto se cree y el padre los suba en orden vía onStagedFilesChange.
// productoId presente  → modo "edición": cada archivo se sube al instante a Storage + DB.
export default function ImageUploader({ productoId, initialImages = [], onStagedFilesChange }) {
  const [persisted, setPersisted] = useState(
    [...initialImages].sort((a, b) => a.orden - b.orden)
  );
  const [staged, setStaged] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragIndex, setDragIndex] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const notifyStaged = useCallback(
    (list) => {
      onStagedFilesChange?.(list.map((s) => s.file));
    },
    [onStagedFilesChange]
  );

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setError('');

    if (!productoId) {
      const additions = files.map((file) => ({
        stagedId: `staged-${stagedIdSeq++}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setStaged((list) => {
        const next = [...list, ...additions];
        notifyStaged(next);
        return next;
      });
      return;
    }

    setUploadingCount((n) => n + files.length);
    let ordenCounter = persisted.length + staged.length;
    for (const file of files) {
      try {
        const row = await uploadProductoImagen(productoId, file, ordenCounter);
        ordenCounter += 1;
        setPersisted((list) => [...list, row]);
      } catch {
        setError('No pudimos subir una de las imágenes. Probá de nuevo.');
      } finally {
        setUploadingCount((n) => n - 1);
      }
    }
  }

  function handleInputChange(e) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  async function handleRemovePersisted(img) {
    setPersisted((list) => list.filter((i) => i.id !== img.id));
    try {
      await deleteProductoImagen(img.id, img.storage_path);
    } catch {
      setError('No pudimos borrar esa imagen. Recargá la página e intentá de nuevo.');
    }
  }

  function handleRemoveStaged(stagedId) {
    setStaged((list) => {
      const next = list.filter((i) => i.stagedId !== stagedId);
      notifyStaged(next);
      return next;
    });
  }

  const combined = [
    ...persisted.map((img) => ({ type: 'persisted', ...img })),
    ...staged.map((img) => ({ type: 'staged', ...img })),
  ];

  async function handleDropReorder(e, index) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...combined];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setDragIndex(null);

    const nextPersisted = reordered.filter((i) => i.type === 'persisted');
    const nextStaged = reordered.filter((i) => i.type === 'staged');
    setPersisted(nextPersisted);
    setStaged(nextStaged);
    notifyStaged(nextStaged);

    if (nextPersisted.length > 0) {
      try {
        await reorderProductoImagenes(nextPersisted.map((img, i) => ({ id: img.id, orden: i })));
      } catch {
        setError('No pudimos guardar el nuevo orden.');
      }
    }
  }

  return (
    <div className="img-uploader">
      <div
        className="img-uploader-drop"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleInputChange}
        />
        <p>Arrastrá imágenes acá o hacé click para elegir archivos</p>
        {uploadingCount > 0 && (
          <span className="img-uploader-status">Subiendo {uploadingCount}…</span>
        )}
      </div>

      {error && <p className="img-uploader-error">{error}</p>}

      {combined.length > 0 && (
        <div className="img-uploader-grid">
          {combined.map((img, index) => (
            <div
              key={img.type === 'persisted' ? img.id : img.stagedId}
              className={`img-uploader-item${index === 0 ? ' cover' : ''}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropReorder(e, index)}
            >
              <img src={img.type === 'persisted' ? img.url : img.previewUrl} alt="" />
              {index === 0 && <span className="img-uploader-cover-tag">Portada</span>}
              <button
                type="button"
                className="img-uploader-remove"
                onClick={() =>
                  img.type === 'persisted'
                    ? handleRemovePersisted(img)
                    : handleRemoveStaged(img.stagedId)
                }
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
