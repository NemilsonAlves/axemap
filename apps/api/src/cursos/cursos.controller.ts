import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CursosService } from './cursos.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('cursos')
export class CursosController {
  constructor(private cursosService: CursosService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async criar(@Body() dto: any, @CurrentUser() user: any) {
    return this.cursosService.criar(user.id, dto);
  }

  @Get()
  async listar(
    @Query('terreiroId') terreiroId?: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.cursosService.listar(terreiroId, parseInt(limit) || 20, parseInt(offset) || 0);
  }

  @Get('meus')
  @UseGuards(AuthGuard('jwt'))
  async meus(@CurrentUser() user: any) {
    return this.cursosService.meusCursos(user.id);
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    return this.cursosService.buscar(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.cursosService.atualizar(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remover(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cursosService.remover(user.id, id);
  }

  @Post(':id/matricular')
  @UseGuards(AuthGuard('jwt'))
  async matricular(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cursosService.matricular(user.id, id);
  }

  @Delete(':id/matricular')
  @UseGuards(AuthGuard('jwt'))
  async cancelarMatricula(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cursosService.cancelarMatricula(user.id, id);
  }

  @Get(':id/matriculas')
  @UseGuards(AuthGuard('jwt'))
  async listarMatriculas(@Param('id') id: string, @CurrentUser() user: any) {
    return this.cursosService.listarMatriculas(user.id, id);
  }

  @Delete(':id/matriculas/:matriculaId')
  @UseGuards(AuthGuard('jwt'))
  async cancelarMatriculaDirigente(
    @Param('id') id: string,
    @Param('matriculaId') matriculaId: string,
    @CurrentUser() user: any,
  ) {
    return this.cursosService.cancelarMatriculaDirigente(user.id, id, matriculaId);
  }
}
