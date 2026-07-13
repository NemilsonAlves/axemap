export type UploadStage = 'idle' | 'validating' | 'compressing' | 'converting' | 'thumbnail' | 'uploading' | 'done' | 'error';

export interface UploadProgress {
  stage: UploadStage;
  progress: number;
  error?: string;
}

export interface UploadResult {
  url: string;
  thumbUrl?: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

type ProgressCallback = (progress: UploadProgress) => void;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const THUMB_MAX_DIM = 400;

async function validateFile(file: File): Promise<void> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato não suportado. Use JPEG, PNG, WebP ou AVIF.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 20MB.');
  }
}

async function compressImage(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > 2048) {
        height = Math.round((height * 2048) / width);
        width = 2048;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Falha na compressão'));
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar imagem'));
    };

    img.src = url;
  });
}

async function createThumbnail(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const max = THUMB_MAX_DIM;

      if (width > height) {
        if (width > max) {
          height = Math.round((height * max) / width);
          width = max;
        }
      } else {
        if (height > max) {
          width = Math.round((width * max) / height);
          height = max;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Falha ao criar thumbnail'));
        },
        'image/webp',
        0.7,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar thumbnail'));
    };

    img.src = url;
  });
}

async function uploadToR2(blob: Blob, fileName: string, onProgress: ProgressCallback): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, fileName);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro no upload' }));
    throw new Error(error.message || 'Falha no upload');
  }

  const result = await response.json();
  onProgress({ stage: 'done', progress: 100 });
  return result.url;
}

export async function uploadImage(
  file: File,
  onProgress: ProgressCallback,
): Promise<UploadResult> {
  try {
    onProgress({ stage: 'validating', progress: 0 });
    await validateFile(file);
    onProgress({ stage: 'validating', progress: 100 });

    onProgress({ stage: 'compressing', progress: 0 });
    const compressed = await compressImage(file);
    onProgress({ stage: 'compressing', progress: 100 });

    onProgress({ stage: 'thumbnail', progress: 0 });
    const thumbBlob = await createThumbnail(compressed);
    onProgress({ stage: 'thumbnail', progress: 100 });

    const baseName = file.name.replace(/\.[^.]+$/, '');
    const timestamp = Date.now();

    onProgress({ stage: 'uploading', progress: 0 });
    const url = await uploadToR2(compressed, `${baseName}-${timestamp}.webp`, onProgress);

    onProgress({ stage: 'uploading', progress: 50 });
    const thumbUrl = await uploadToR2(thumbBlob, `${baseName}-${timestamp}-thumb.webp`, onProgress);

    onProgress({ stage: 'done', progress: 100 });

    return {
      url,
      thumbUrl,
      width: 0,
      height: 0,
      size: compressed.size,
      format: 'webp',
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Erro desconhecido';
    onProgress({ stage: 'error', progress: 0, error });
    throw err;
  }
}
