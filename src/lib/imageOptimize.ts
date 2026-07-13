// Downscales + re-encodes raster uploads to WebP in the browser before they
// hit /api/upload, so Blob storage holds display-sized files instead of
// whatever resolution/format the source (phone camera, screenshot, export
// tool) produced. GIF is left untouched — canvas only ever captures a
// static first frame, which would silently kill animation.
const OPTIMIZABLE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export interface OptimizedImage {
  dataBase64: string;
  contentType: string;
  filename: string;
}

export async function optimizeImage(file: File, maxWidth: number, quality = 0.82): Promise<OptimizedImage> {
  if (!OPTIMIZABLE_TYPES.has(file.type)) {
    return { dataBase64: await blobToBase64(file), contentType: file.type, filename: file.name };
  }

  const fallback = () => blobToBase64(file).then((dataBase64) => ({ dataBase64, contentType: file.type, filename: file.name }));

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return fallback();
  }

  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return fallback();
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) return fallback();

  const dataBase64 = await blobToBase64(blob);
  const filename = file.name.replace(/\.[^./\\]+$/, '') + '.webp';
  return { dataBase64, contentType: 'image/webp', filename };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
