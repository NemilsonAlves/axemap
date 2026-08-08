import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AcoesSociaisService } from './acoes-sociais.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('acoes-sociais')
export class AcoesSociaisController {
  constructor(private acoesSociaisService: AcoesSociaisService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async criar(@Body() dto: any, @CurrentUser() user: any) {
    return this.acoesSociaisService.criar(user.id, dto);
  }

  @Get()
  async listar(
    @Query('terreiroId') terreiroId?: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.acoesSociaisService.listar(terreiroId, parseInt(limit) || 20, parseInt(offset) || 0);
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.acoesSociaisService.buscar(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.acoesSociaisService.atualizar(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remover(@Param('id') id: string, @CurrentUser() user: any) {
    return this.acoesSociaisService.remover(user.id, id);
  }
}
