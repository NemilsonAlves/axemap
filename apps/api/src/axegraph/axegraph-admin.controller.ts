import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AxegraphService } from './axegraph.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole, GraphRelacionamentoTipo, GraphStatus, ConteudoStatus, DuplicidadeStatus } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin/graph')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class AxegraphAdminController {
  constructor(
    private readonly axegraph: AxegraphService,
    private readonly audit: AuditLogsService,
  ) {}

  // ---------- Visão geral / métricas ----------
  @Get('dashboard')
  dashboard() {
    return this.axegraph.estatisticas();
  }

  // ---------- Sincronizar/indexar entidades a partir das fontes ----------
  @Post('sincronizar')
  async sincronizar(@CurrentUser() user: any, @Req() req: any) {
    const result = await this.axegraph.sincronizar();
    await this.audit.registrar(user.id, 'AXEGRAPH_SINCRONIZAR', 'GRAPH', 'all', {
      depois: { total: result.total },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Relacionamentos (fila de moderação) ----------
  @Get('relacionamentos')
  relacionamentos(
    @Query('tipo') tipo?: GraphRelacionamentoTipo,
    @Query('status') status?: GraphStatus,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.axegraph.listarRelacionamentos({
      tipo,
      status: status as GraphStatus,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Post('relacionamentos')
  async criar(@Body() dto: any, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.axegraph.criarRelacionamento(dto, user.id, true);
    await this.audit.registrar(user.id, 'AXEGRAPH_RELACIONAMENTO_CRIAR', 'GRAPH_REL', result.relacionamento.id, {
      depois: { tipo: dto.tipo, origem: dto.origemId, alvo: dto.alvoId },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('relacionamentos/:id/revisar')
  async revisar(
    @Param('id') id: string,
    @Body('decisao') decisao: 'VERIFICAR' | 'REJEITAR' | 'SUSPENDER',
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.axegraph.revisarRelacionamento(id, decisao, user.id);
    await this.audit.registrar(user.id, 'AXEGRAPH_RELACIONAMENTO_REVISAR', 'GRAPH_REL', id, {
      depois: { status: result.status, decisao },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Get('relacionamentos/:id/historico')
  historico(@Param('id') id: string) {
    return this.axegraph.historicoRelacionamento(id);
  }

  @Post('relacionamentos/:id/remover')
  async remover(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.axegraph.removerRelacionamento(id, user.id);
    await this.audit.registrar(user.id, 'AXEGRAPH_RELACIONAMENTO_REMOVER', 'GRAPH_REL', id, {
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Entity resolution / duplicidades ----------
  @Post('duplicidades/detectar')
  detectarDuplicidades() {
    return this.axegraph.detectarDuplicidades();
  }

  @Get('duplicidades')
  listarDuplicidades(@Query('status') status?: DuplicidadeStatus) {
    return this.axegraph.listarDuplicidades(status as DuplicidadeStatus);
  }

  @Post('duplicidades/:id/resolver')
  async resolverDuplicidade(
    @Param('id') id: string,
    @Body() dto: { decisao: 'CONFIRMAR' | 'REJEITAR'; entidadeCanonicaId?: string },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.axegraph.resolverDuplicidade(id, dto, user.id);
    await this.audit.registrar(user.id, 'AXEGRAPH_DUPLICIDADE_RESOLVER', 'GRAPH_DUP', id, {
      depois: { decisao: dto.decisao },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Cultura e memória (moderação) ----------
  @Get('conteudos')
  conteudosAdmin(@Query('status') status?: ConteudoStatus, @Query('limit') limit?: string) {
    return this.axegraph.listarConteudosCulturais({
      status: status as ConteudoStatus,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Post('conteudos/:id/revisar')
  async revisarConteudo(
    @Param('id') id: string,
    @Body() dto: { status?: ConteudoStatus; verificado?: boolean },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.axegraph.revisarConteudoCultural(id, dto, user.id);
    await this.audit.registrar(user.id, 'AXEGRAPH_CONTEUDO_REVISAR', 'GRAPH_CONTEUDO', id, {
      depois: { status: result.status },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }
}