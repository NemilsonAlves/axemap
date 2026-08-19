import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UploadService } from './upload.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('kind') kind?: string,
    @CurrentUser() user?: any,
  ) {
    if (!file) throw new BadRequestException('Envie o campo multipart "file"');
    const safeKind = (kind || 'geral').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) || 'geral';
    return this.uploadService.uploadArquivo(user?.id ?? 'anonimo', file, safeKind);
  }
}
