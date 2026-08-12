import { Controller, Get, Post, Query, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AxegraphService } from './axegraph.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GraphEntidadeTipo, GraphRelacionamentoTipo, GraphFonte } from '@axemap/shared';

@Controller()
export class AxegraphPublicController {
  constructor(private axegraph: AxegraphService) {}

  // ---------- Busca híbrida (texto + geo + grafo) ----------
  @Get('graph/buscar')
  buscar(
    @Query('q') q?: string,
    @Query('tipo') tipo?: GraphEntidadeTipo,
    @Query('estado') estado?: string,
    @Query('cidade') cidade?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('raio') raio?: string,
    @Query('limit') limit?: string,
  ) {
    return this.axegraph.buscar({
      q,
      tipo: tipo as GraphEntidadeTipo,
      estado,
      cidade,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      raio: raio ? parseFloat(raio) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // ---------- Recomendações explicáveis ----------
  @Get('graph/recomendacoes')
  recomendar(
    @Query('tipo') tipo?: GraphEntidadeTipo,
    @Query('interesse') interesse?: string,
    @Query('estado') estado?: string,
    @Query('cidade') cidade?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('raio') raio?: string,
    @Query('limit') limit?: string,
  ) {
    return this.axegraph.recomendar({
      tipo: tipo as GraphEntidadeTipo,
      interesse,
      estado,
      cidade,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      raio: raio ? parseFloat(raio) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // ---------- Vizinhança / subgrafo (visualizador) ----------
  @Get('graph/vizinhanca/:tipo/:id')
  vizinhanca(@Param('tipo') tipo: GraphEntidadeTipo, @Param('id') id: string, @Query('profundidade') profundidade?: string) {
    return this.axegraph.vizinhanca(tipo, id, profundidade ? parseInt(profundidade) : 1, true);
  }

  // ---------- Relacionamentos públicos (verificados) ----------
  @Get('graph/relacionamentos')
  relacionamentos(
    @Query('tipo') tipo?: GraphRelacionamentoTipo,
    @Query('origemTipo') origemTipo?: string,
    @Query('origemId') origemId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.axegraph.listarRelacionamentos({
      tipo: tipo as GraphRelacionamentoTipo,
      origemTipo,
      origemId,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  // ---------- Cultura e memória ----------
  @Get('graph/conteudos')
  conteudos(@Query('tipo') tipo?: string, @Query('q') q?: string, @Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.axegraph.listarConteudosCulturais({
      tipo,
      q,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('graph/patrimonios')
  patrimonios(@Query('estado') estado?: string, @Query('cidade') cidade?: string, @Query('q') q?: string, @Query('limit') limit?: string) {
    return this.axegraph.listarPatrimonios({ estado, cidade, q, limit: limit ? parseInt(limit) : undefined });
  }

  // ---------- Rota/circuito cultural ----------
  @Get('graph/rotas')
  rotas(@Query('cidade') cidade?: string, @Query('estado') estado?: string, @Query('dias') dias?: string, @Query('lat') lat?: string, @Query('lon') lon?: string, @Query('raio') raio?: string) {
    return this.axegraph.rotasCulturais({
      cidade,
      estado,
      dias: dias ? parseInt(dias) : undefined,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      raio: raio ? parseFloat(raio) : undefined,
    });
  }
}

@Controller('graph')
@UseGuards(AuthGuard('jwt'))
export class AxegraphUserController {
  constructor(private axegraph: AxegraphService) {}

  // ---------- Criar relacionamento (vai para fila de revisão) ----------
  @Post('relacionamentos')
  criarRelacionamento(@Body() dto: any, @CurrentUser() user: any) {
    return this.axegraph.criarRelacionamento(dto, user.id, false);
  }

  @Get('relacionamentos/meus')
  meusRelacionamentos(@CurrentUser() user: any) {
    return this.axegraph.meusRelacionamentosPendentes(user.id);
  }

  // ---------- Cultura e memória (contribuição) ----------
  @Post('conteudos')
  criarConteudo(@Body() dto: any, @CurrentUser() user: any) {
    return this.axegraph.criarConteudoCultural(dto, user.id);
  }

  @Post('patrimonios')
  criarPatrimonio(@Body() dto: any, @CurrentUser() user: any) {
    return this.axegraph.criarPatrimonio(dto, user.id);
  }

  // ---------- Sugestão de relacionamento assistida (advisória) ----------
  @Post('sugerir')
  sugerir(@Body() dto: any, @CurrentUser() user: any) {
    // Cria como IA_SUGERIDO/PENDENTE — nunca vira fato sem revisão humana.
    return this.axegraph.criarRelacionamento({ ...dto, fonte: GraphFonte.IA_SUGERIDO }, user.id, false);
  }
}