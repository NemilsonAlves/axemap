import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { StorageProvider } from '@axemap/shared';
import { STORAGE_PROVIDER } from '../common/storage/storage.constants';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

@Injectable()
export class UploadService {
  constructor(@Inject(STORAGE_PROVIDER) private storage: StorageProvider) {}

  async uploadArquivo(
    usuarioId: string,
    file: Express.Multer.File,
    kind = 'geral',
  ): Promise<{ url: string; key: string; size: number; mimeType: string; video: boolean }> {
    if (!file) throw new BadRequestException('Arquivo não enviado');

    const isImage = IMAGE_TYPES.has(file.mimetype);
    const isVideo = VIDEO_TYPES.has(file.mimetype);
    if (!isImage && !isVideo) {
      throw new BadRequestException('Formato não suportado. Use JPEG, PNG, WebP, AVIF, GIF ou MP4/WebM.');
    }
    const limite = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > limite) {
      throw new BadRequestException(`Arquivo muito grande (máx. ${Math.round(limite / 1024 / 1024)}MB)`);
    }

    const ext = this.extensao(file.mimetype);
    const baseName = file.originalname.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
    const key = `uploads/${usuarioId}/${kind}/${Date.now()}-${randomUUID().slice(0, 8)}-${baseName}.${ext}`;

    await this.garantirBucket('axemap');

    const result = await this.storage.upload('axemap', key, file.buffer, file.mimetype, { public: true });

    return { url: result.url, key: result.key, size: result.size, mimeType: result.mimeType, video: isVideo };
  }

  private async garantirBucket(bucket: string) {
    const storage = this.storage as any;
    if (typeof storage.bucketExists !== 'function' || typeof storage.createBucket !== 'function') return;
    if (!(await storage.bucketExists(bucket))) {
      await storage.createBucket(bucket);
    }
    if (typeof storage.setBucketPublicRead === 'function') {
      await storage.setBucketPublicRead(bucket).catch(() => undefined);
    }
  }

  private extensao(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
    };
    return map[mime] || 'bin';
  }
}
