import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventosService } from './eventos.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('eventos')
export class EventosController {
  constructor(private eventosService: EventosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async criar(@Body() dto: any, @CurrentUser() user: any) {
    return this.eventosService.criar(user.id, dto);
  }

  @Get()
  async listar(
    @Query('terreiroId') terreiroId?: string,
    @Query('uf') uf?: string,
    @Query('tipo') tipo?: string,
    @Query('passados') passados?: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.eventosService.listar({
      terreiroId,
      uf,
      tipo,
      passados: passados === 'true',
      limite: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
    });
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.eventosService.buscar(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.eventosService.atualizar(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remover(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventosService.remover(user.id, id);
  }
}
