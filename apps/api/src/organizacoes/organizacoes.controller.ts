import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrganizacoesService } from './organizacoes.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { isAdminRole } from '../common/utils/roles';
import { CreateOrganizacaoDto } from './dto/create-organizacao.dto';
import { UpdateOrganizacaoDto } from './dto/update-organizacao.dto';
import { SolicitarVinculoDto } from './dto/solicitar-vinculo.dto';

@Controller()
export class OrganizacoesController {
  constructor(private organizacoesService: OrganizacoesService) {}

  @Get('organizacoes')
  async listar(
    @Query('q') q?: string,
    @Query('tipo') tipo?: string,
    @Query('pais') pais?: string,
    @Query('verificacao') verificacao?: string,
    @Query('limit') limit = '24',
    @Query('offset') offset = '0',
  ) {
    return this.organizacoesService.listar({
      q,
      tipo,
      pais,
      verificacao,
      limit: parseInt(limit) || 24,
      offset: parseInt(offset) || 0,
    });
  }

  @Get('federacoes')
  async federacoes(
    @Query('q') q?: string,
    @Query('pais') pais?: string,
    @Query('limit') limit = '24',
    @Query('offset') offset = '0',
  ) {
    return this.organizacoesService.listar({
      q,
      pais,
      tipo: 'FEDERACAO',
      limit: parseInt(limit) || 24,
      offset: parseInt(offset) || 0,
    });
  }

  @Get('taxonomia/regioes')
  async regioes() {
    return this.organizacoesService.listarRegioes();
  }

  @Post('organizacoes')
  @UseGuards(AuthGuard('jwt'))
  async criar(@Body() dto: CreateOrganizacaoDto, @CurrentUser() user: any) {
    return this.organizacoesService.criar(user.id, dto);
  }

  @Patch('organizacoes/:id')
  @UseGuards(AuthGuard('jwt'))
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizacaoDto,
    @CurrentUser() user: any,
  ) {
    return this.organizacoesService.atualizar(user.id, id, dto, isAdminRole(user.role));
  }

  @Post('organizacoes/:id/publicar')
  @UseGuards(AuthGuard('jwt'))
  async publicar(@Param('id') id: string, @CurrentUser() user: any) {
    return this.organizacoesService.publicar(user.id, id, isAdminRole(user.role));
  }

  @Post('organizacoes/:id/relacionamentos')
  @UseGuards(AuthGuard('jwt'))
  async solicitarVinculo(
    @Param('id') id: string,
    @Body() dto: SolicitarVinculoDto,
    @CurrentUser() user: any,
  ) {
    return this.organizacoesService.solicitarVinculo(user.id, id, dto.terreiroId);
  }

  @Post('organizacoes/:id/relacionamentos/:relacionamentoId/aceitar')
  @UseGuards(AuthGuard('jwt'))
  async aceitarVinculo(
    @Param('id') id: string,
    @Param('relacionamentoId') relacionamentoId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizacoesService.aceitarVinculo(user.id, id, relacionamentoId);
  }

  @Post('organizacoes/:id/relacionamentos/:relacionamentoId/recusar')
  @UseGuards(AuthGuard('jwt'))
  async recusarVinculo(
    @Param('id') id: string,
    @Param('relacionamentoId') relacionamentoId: string,
    @CurrentUser() user: any,
  ) {
    return this.organizacoesService.recusarVinculo(user.id, id, relacionamentoId);
  }

  @Get('organizacoes/:slug/relacionamentos')
  async relacionamentos(@Param('slug') slug: string) {
    const org = await this.organizacoesService.detalhe(slug);
    return this.organizacoesService.relacionamentosDaOrganizacao(org.id);
  }

  @Get('organizacoes/:slug')
  async detalhe(@Param('slug') slug: string) {
    return this.organizacoesService.detalhe(slug);
  }

  @Get('federacoes/:slug')
  async federacaoDetalhe(@Param('slug') slug: string) {
    const org = await this.organizacoesService.detalhe(slug);
    if (org?.tipo !== 'FEDERACAO') {
      throw new NotFoundException('Federação não encontrada');
    }
    return org;
  }
}