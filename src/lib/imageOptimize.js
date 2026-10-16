// Recodifica una imagen a WebP (y la achica si excede maxWidth) antes de subirla a
// Storage, usando canvas nativo del navegador — así todo lo que se carga desde el admin
// (fotos de proyectos y productos) ya queda liviano, sin depender de herramientas externas.
// Si algo falla (navegador viejo, SVG, etc.) devuelve el archivo original sin tocar.
export async function optimizeImageFile(file, { maxWidth = 1920, quality = 0.82 } = {}) {
  if (!file?.type?.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/webp') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp' });
  } catch {
    return file;
  }
}

// Ancho y alto reales de una imagen (el archivo ya optimizado que se va a subir). Los usa
// "Del taller" para reservar el aspect ratio en el front sin reflow. null si no se puede leer.
export async function imageDimensions(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { ancho: bitmap.width, alto: bitmap.height };
    bitmap.close?.();
    return dims;
  } catch {
    return null;
  }
}
