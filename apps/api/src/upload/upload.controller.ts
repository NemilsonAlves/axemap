import { Controller, Post, Patch, UploadedFile, UseInterceptors, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from './upload.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../database/prisma.service';
import type { Request } from 'express';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function mimeFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Formato não suportado. Use JPEG, PNG, WebP, AVIF, GIF, MP4, WebM ou MOV.'), false);
  }
}

function avatarFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) {
  if (AVATAR_MIME_TYPES.has(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Formato inválido. Use JPEG, PNG ou WebP.'), false);
  }
}

@Controller('upload')
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: mimeFileFilter }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('kind') kind?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) throw new BadRequestException('Envie o campo multipart "file"');
    const safeKind = (kind || 'geral').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'geral';
    return this.uploadService.uploadArquivo(user?.id ?? 'anonimo', file, safeKind);
  }

  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: avatarFileFilter }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Envie o campo multipart "file"');

    const result = await this.uploadService.uploadArquivo(user.id, file, 'avatar');

    await this.prisma.usuarios.update({
      where: { id: user.id },
      data: { avatarUrl: result.url },
    });

    return { url: result.url };
  }
}
