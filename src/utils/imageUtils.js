/**
 * Procesa y valida URLs de imágenes, con soporte especial para Google Drive
 * @param {string} url - URL de la imagen a procesar
 * @returns {Object} - { success: boolean, url: string|null, error?: string, esGoogleDrive?: boolean }
 */
export function procesarUrlImagen(url) {
  // Si no hay URL, retornar null
  if (!url || url.trim() === '') {
    return { success: true, url: null };
  }

  const urlLimpia = url.trim();

  // Validar que sea una URL válida
  try {
    new URL(urlLimpia);
  } catch (error) {
    return { success: false, error: 'La URL de la imagen no es válida' };
  }

  // Detectar si es una URL de Google Drive
  const patronDrive1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/; // https://drive.google.com/file/d/ID/view...
  const patronDrive2 = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/; // https://drive.google.com/open?id=ID

  let match = urlLimpia.match(patronDrive1);
  if (!match) {
    match = urlLimpia.match(patronDrive2);
  }

  // Si es de Google Drive
  if (match && match[1]) {
    const driveId = match[1];
    const urlFinal = `https://drive.google.com/thumbnail?sz=w1500-h1200&id=${driveId}`;
    return { success: true, url: urlFinal, esGoogleDrive: true };
  }

  // Si NO es de Google Drive pero es una URL válida, retornar tal cual
  return { success: true, url: urlLimpia, esGoogleDrive: false };
}
