import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Core WebP conversion engine using Canvas API.
 * All processing happens locally in the browser.
 */

export const COMPRESSION_MODES = {
  standard: { quality: 82 },
  lossy: { quality: 65 },
  lossless: { quality: 100 },
  custom: null, // uses user-provided quality value
};

/**
 * Convert a single image file to WebP format.
 * @param {File} file - Original image file
 * @param {object} options - Conversion options
 * @param {string} options.mode - Compression mode key
 * @param {number} [options.customQuality] - Custom quality 1-100
 * @returns {Promise<object>} Conversion result with blob, sizes, etc.
 */
export async function convertSingleImage(file, options = {}) {
  const { mode = 'standard', customQuality = 82 } = options;

  const image = await loadImage(file);

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  // Determine quality based on compression mode
  const quality =
    mode === 'custom'
      ? Math.max(1, Math.min(100, customQuality)) / 100
      : (COMPRESSION_MODES[mode]?.quality ?? 82) / 100;

  const blob = await canvasToWebPOptimized(canvas, quality, file.size);

  const sizeIncreased = blob.size > file.size;
  const savedPercent = Math.round(((file.size - blob.size) / file.size) * 100);

  return {
    originalFile: file,
    originalName: file.name.replace(/\.[^.]+$/, ''),
    originalSize: file.size,
    originalType: file.type,
    originalWidth: image.naturalWidth,
    originalHeight: image.naturalHeight,
    originalPreview: URL.createObjectURL(file),
    convertedBlob: blob,
    convertedUrl: URL.createObjectURL(blob),
    convertedSize: blob.size,
    convertedPreview: URL.createObjectURL(blob),
    savedPercent: sizeIncreased ? 0 : savedPercent,
    sizeIncreased,
  };
}

/**
 * Batch convert multiple images to WebP.
 */
export async function convertBatch(files, options = {}, onProgress) {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await convertSingleImage(files[i], options);
      results.push(result);
    } catch {
      results.push({
        originalFile: files[i],
        originalName: files[i].name.replace(/\.[^.]+$/, ''),
        error: true,
      });
    }
    onProgress?.(i + 1, files.length);
  }
  return results;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function canvasToWebP(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create WebP blob'));
      },
      'image/webp',
      quality,
    );
  });
}

/**
 * Convert canvas to WebP with aggressive size optimization.
 * Tries multiple quality levels and always returns the smallest result.
 * If all WebP outputs exceed originalSize, returns the smallest one
 * and the caller will report a negative savings percentage.
 */
async function canvasToWebPOptimized(canvas, quality, originalSize) {
  // First try at the requested quality
  let bestBlob = await canvasToWebP(canvas, quality);

  // If already smaller, great — return it
  if (bestBlob.size <= originalSize) return bestBlob;

  // Output is larger than original — try a wide range of lower qualities
  // and always keep the smallest result
  const steps = [0.75, 0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.1];
  for (const q of steps) {
    const candidate = await canvasToWebP(canvas, q);
    if (candidate.size < bestBlob.size) {
      bestBlob = candidate;
    }
    // Once we're smaller than original, no need to go lower
    if (bestBlob.size <= originalSize) break;
  }

  return bestBlob;
}

/**
 * Download a single converted WebP file.
 */
export function downloadSingle(result) {
  const a = document.createElement('a');
  a.href = result.convertedUrl;
  a.download = `${result.originalName}.webp`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Download all converted images as a ZIP file.
 */
export async function downloadZip(results) {
  const zip = new JSZip();
  results.forEach((result, i) => {
    if (result.error || !result.convertedBlob) return;
    zip.file(`${result.originalName}.webp`, result.convertedBlob);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'privacybulkwebp-converted.zip');
}

/**
 * Clean up object URLs for a result set.
 */
export function cleanupResults(results) {
  results.forEach((r) => {
    if (r.originalPreview) URL.revokeObjectURL(r.originalPreview);
    if (r.convertedUrl) URL.revokeObjectURL(r.convertedUrl);
    if (r.convertedPreview) URL.revokeObjectURL(r.convertedPreview);
  });
}
