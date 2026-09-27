/**
 * Client-side high performance image compressor and resizer.
 * Takes large mobile photos (often 5MB-15MB) and resizes them via HTML5 Canvas
 * down to ~200-400KB with excellent visual quality, perfectly optimized for mobile networks.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: string;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<{ blob: Blob; dataUrl: string; originalSize: number; compressedSize: number }> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // If the file is already small (e.g. < 80KB) and is jpeg/png/webp, we can still load it
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw with smoothing for high quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as compressed blob and dataUrl
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed image blob'));
              return;
            }
            const compressedDataUrl = canvas.toDataURL(mimeType, quality);
            resolve({
              blob,
              dataUrl: compressedDataUrl,
              originalSize: file.size,
              compressedSize: blob.size,
            });
          },
          mimeType,
          quality
        );
      };

      img.onerror = (err) => {
        reject(new Error('Failed to load image. If this is an unformatted HEIC file, please convert or use standard camera upload.'));
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
