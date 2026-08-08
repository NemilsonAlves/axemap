import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvaliacoesService } from './avaliacoes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private avaliacoesService: AvaliacoesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async criar(
    @Body() dto: { terreiroId: string; nota: number; texto?: string },
    @CurrentUser() user: any,
  ) {
    return this.avaliacoesService.criar(user.id, dto);
  }

  @Get()
  async listar(
    @Query('terreiroId') terreiroId?: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.avaliacoesService.listar(
      terreiroId,
      parseInt(limit) || 20,
      parseInt(offset) || 0,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async minhas(@CurrentUser() user: any) {
    return this.avaliacoesService.listarPorUsuario(user.id);
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.avaliacoesService.buscar(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(
    @Param('id') id: string,
    @Body() dto: { nota?: number; texto?: string },
    @CurrentUser() user: any,
  ) {
    return this.avaliacoesService.atualizar(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remover(@Param('id') id: string, @CurrentUser() user: any) {
    return this.avaliacoesService.remover(user.id, id);
  }

  @Post(':id/responder')
  @UseGuards(AuthGuard('jwt'))
  async responder(
    @Param('id') id: string,
    @Body('texto') texto: string,
    @CurrentUser() user: any,
  ) {
    return this.avaliacoesService.responder(user.id, id, texto);
  }

  @Post(':id/util')
  @UseGuards(AuthGuard('jwt'))
  async marcarUtil(@Param('id') id: string, @CurrentUser() user: any) {
    return this.avaliacoesService.marcarUtil(user.id, id);
  }
}
