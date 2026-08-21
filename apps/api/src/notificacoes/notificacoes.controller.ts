import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificacoesService } from './notificacoes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../database/prisma.service';

@Controller('notificacoes')
@UseGuards(AuthGuard('jwt'))
export class NotificacoesController {
  constructor(
    private notificacoesService: NotificacoesService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async listar(
    @CurrentUser() user: any,
    @Query('naoLidas') naoLidas?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.notificacoesService.listar(user.id, naoLidas === 'true', parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Get('nao-lidas/count')
  async contarNaoLidas(@CurrentUser() user: any) {
    return this.notificacoesService.contarNaoLidas(user.id);
  }

  @Post()
  async criar(@CurrentUser() user: any, @Body() dto: { tipo: string; titulo: string; mensagem?: string }) {
    const usuario = await this.prisma.usuarios.findUnique({ where: { id: user.id }, select: { role: true } });
    if (!usuario || !['ADMIN', 'SUPER_ADMIN'].includes(usuario.role)) {
      throw new ForbiddenException('Apenas administradores podem criar notificações');
    }
    return this.notificacoesService.criar(user.id, dto);
  }

  @Patch(':id/lida')
  async marcarLida(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificacoesService.marcarLida(user.id, id);
  }

  @Patch('lidas')
  async marcarTodasLidas(@CurrentUser() user: any) {
    return this.notificacoesService.marcarTodasLidas(user.id);
  }
}
