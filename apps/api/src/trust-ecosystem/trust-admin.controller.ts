import {
  Controller, Get, Post, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { TrustEcosystemService } from './trust-ecosystem.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin/trust')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class TrustAdminController {
  constructor(
    private readonly trust: TrustEcosystemService,
    private readonly audit: AuditLogsService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.trust.dashboard();
  }

  // ---------- Certificações ----------
  @Get('certificados')
  listarCertificados(@Query('status') status?: string, @Query('limit') limit = '50', @Query('offset') offset = '0') {
    return this.trust.listarCertificados(status || undefined, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('certificados')
  async conceder(
    @Body() dto: { terreiroId: string; tipo: string; expiraEm?: string },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.trust.concederCertificado(dto, user.id);
    await this.audit.registrar(user.id, 'CERTIFICADO_CONCEDER', 'CERTIFICADO', result.id, {
      depois: { tipo: result.tipo, codigo: result.codigo },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('certificados/:id/revogar')
  async revogar(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.trust.revogarCertificado(id, user.id);
    await this.audit.registrar(user.id, 'CERTIFICADO_REVOGAR', 'CERTIFICADO', id, {
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Mediação ----------
  @Get('mediacoes')
  listarMediacoes(@Query('status') status?: string, @Query('limit') limit = '50', @Query('offset') offset = '0') {
    return this.trust.listarMediacoesAdmin(status || undefined, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('mediacoes/:id/iniciar')
  async iniciarMediacao(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.trust.iniciarMediacao(id, user.id);
    await this.audit.registrar(user.id, 'MEDIACAO_INICIADA', 'MEDIACAO', id, {
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('mediacoes/:id/responder')
  async responder(@Param('id') id: string, @Body('texto') texto: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.trust.responderMediacaoModerador(id, texto);
    await this.audit.registrar(user.id, 'MEDIACAO_RESPONDIDA', 'MEDIACAO', id, {
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('mediacoes/:id/encerrar')
  async encerrar(
    @Param('id') id: string,
    @Body() dto: { publicar?: boolean; resolucao?: string },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.trust.encerrarMediacao(id, dto);
    await this.audit.registrar(user.id, 'MEDIACAO_ENCERRADA', 'MEDIACAO', id, {
      depois: { status: result.status, publicar: result.publicar },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post('mediacoes/:id/arquivar')
  async arquivar(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.trust.arquivarMediacao(id);
    await this.audit.registrar(user.id, 'MEDIACAO_ARQUIVADA', 'MEDIACAO', id, {
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Compliance ----------
  @Get('compliance')
  listarCompliance(@Query('terreiroId') terreiroId?: string, @Query('limit') limit = '30') {
    return this.trust.listarCompliance(terreiroId || undefined, parseInt(limit) || 30);
  }

  @Post('compliance/gerar')
  gerarCompliance(@Body('terreiroId') terreiroId: string) {
    return this.trust.gerarCompliance(terreiroId);
  }

  @Post('compliance/itens')
  async atualizarCompliance(
    @Body() dto: { checklistId: string; itens: { id: string; conforme: boolean; observacao?: string }[] },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.trust.atualizarCompliance(dto.checklistId, dto.itens);
    await this.audit.registrar(user.id, 'COMPLIANCE_ATUALIZADO', 'COMPLIANCE', dto.checklistId, {
      depois: { score: result.score, status: result.status },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Antifraude ----------
  @Get('antifraude')
  listarAntifraude(@Query('status') status?: string, @Query('risco') risco?: string, @Query('limit') limit = '50', @Query('offset') offset = '0') {
    return this.trust.listarAntifraude(status || undefined, risco || undefined, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Post('antifraude')
  reportar(@Body() dto: any, @CurrentUser() user: any) {
    return this.trust.reportarFraude(dto, user.id);
  }

  @Post('antifraude/analisar')
  analisar(@Body() dto: { tipo: string; sinais: number }) {
    return this.trust.analisarFraude(dto);
  }

  @Post('antifraude/:id/revisar')
  async revisar(@Param('id') id: string, @Body('decisao') decisao: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.trust.revisarFraude(id, { decisao }, user.id);
    await this.audit.registrar(user.id, 'ANTIFRAUDE_REVISTA', 'ANTIFRAUDE', id, {
      depois: { status: result.status, decisao },
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }

  // ---------- Evidências ----------
  @Get('evidencias')
  listarEvidencias(@Query('referenciaTipo') referenciaTipo?: string, @Query('validada') validada?: string) {
    return this.trust.listarEvidencias(referenciaTipo || undefined, validada || undefined);
  }

  @Post('evidencias/:id/validar')
  async validarEvidencia(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.trust.validarEvidencia(id, user.id);
    await this.audit.registrar(user.id, 'EVIDENCIA_VALIDADA', 'EVIDENCIA', id, {
      ip: req.ip, userAgent: req.headers['user-agent'],
    });
    return result;
  }
}