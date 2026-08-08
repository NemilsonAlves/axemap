import {
  Controller, Get, Post, Patch, Param, Query, Body, UploadedFile, UseInterceptors, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@axemap/shared';
import { VerificacaoService } from './verificacao.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('verificacoes')
export class VerificacaoController {
  constructor(private verificacaoService: VerificacaoService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  async enviar(
    @UploadedFile() file: Express.Multer.File,
    @Query('terreiroId') terreiroId: string,
    @Query('tipo') tipo: string,
    @CurrentUser() user: any,
  ) {
    return this.verificacaoService.enviar(user, terreiroId, tipo, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listar(@Query('terreiroId') terreiroId?: string, @CurrentUser() user?: any) {
    return this.verificacaoService.listar(user, terreiroId);
  }

  @Get('pendentes')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async pendentes(
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
    @CurrentUser() user: any,
  ) {
    return this.verificacaoService.listarPendentes(user, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async revisar(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('motivo') motivo?: string,
    @CurrentUser() user?: any,
  ) {
    return this.verificacaoService.revisar(user, id, status, motivo);
  }
}
