import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, HttpCode, HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TerreiroService } from './terreiro.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

@Controller('terreiros')
export class TerreiroController {
  constructor(private terreiroService: TerreiroService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async criar(@Body() dto: any, @CurrentUser() user: any) {
    return this.terreiroService.criar(dto, user.id);
  }

  @Get()
  async listar(
    @Query('cidade') cidade?: string,
    @Query('estado') estado?: string,
    @Query('tradicao') tradicao?: string,
    @Query('q') q?: string,
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    return this.terreiroService.listar({
      cidade, estado, tradicao, q,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  }

  @Get(':slug')
  async buscarPorSlug(@Param('slug') slug: string) {
    return this.terreiroService.buscarPorSlug(slug);
  }

  @Get(':slug/perfil')
  async getPerfil(@Param('slug') slug: string) {
    return this.terreiroService.getPerfil(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.terreiroService.atualizar(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DIRIGENTE)
  async deletar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.terreiroService.deletar(id, user.id);
  }
}
