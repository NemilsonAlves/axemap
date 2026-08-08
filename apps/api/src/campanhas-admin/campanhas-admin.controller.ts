import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CampanhasAdminService } from './campanhas-admin.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin/campanhas')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class CampanhasAdminController {
  constructor(
    private campanhasAdminService: CampanhasAdminService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get()
  async listar(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.campanhasAdminService.listar(status, q, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Get('pendentes')
  async pendentes() {
    return this.campanhasAdminService.pendentes();
  }

  @Get(':id')
  async detalhe(@Param('id') id: string) {
    return this.campanhasAdminService.detalhe(id);
  }

  @Post('enviar')
  async enviar(
    @Body() dto: any,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.campanhasAdminService.criar(dto, user.id);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_CRIADA', 'CAMPANHA', result.id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/analise-ia')
  async analiseIa(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.campanhasAdminService.analiseIa(id, user.id);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_ANALISE_IA', 'CAMPANHA', id, {
      depois: { scoreIa: result.scoreIa, riscoIa: result.riscoIa, status: result.status },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/aprovar')
  async aprovar(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.campanhasAdminService.aprovar(id, user.id);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_APROVAR', 'CAMPANHA', id, {
      depois: { status: result.status, nivelVerificacao: result.nivelVerificacao },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/recusar')
  async recusar(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.campanhasAdminService.recusar(id, user.id, motivo);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_RECUSAR', 'CAMPANHA', id, {
      depois: { status: result.status, motivo },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/bloquear')
  async bloquear(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.campanhasAdminService.bloquear(id, user.id);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_BLOQUEAR', 'CAMPANHA', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/publicar')
  async publicar(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.campanhasAdminService.publicar(id, user.id);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_PUBLICAR', 'CAMPANHA', id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/verificar')
  async verificar(
    @Param('id') id: string,
    @Body('nivel') nivel: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.campanhasAdminService.verificar(id, nivel);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_VERIFICAR', 'CAMPANHA', id, {
      depois: { nivelVerificacao: result.nivelVerificacao },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }

  @Post(':id/pontuacao')
  async pontuacao(
    @Param('id') id: string,
    @Body('trustScore') trustScore: number,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.campanhasAdminService.pontuacao(id, trustScore);
    await this.auditLogsService.registrar(user.id, 'CAMPANHA_TRUST_SCORE', 'CAMPANHA', id, {
      depois: { trustScore: result.trustScore },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return result;
  }
}