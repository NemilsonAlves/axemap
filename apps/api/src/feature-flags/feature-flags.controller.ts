import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(
    private featureFlagsService: FeatureFlagsService,
    private auditLogsService: AuditLogsService,
  ) {}

  @Get()
  async listar() {
    return this.featureFlagsService.listar();
  }

  @Get('status')
  async status(@CurrentUser() user?: any) {
    return this.featureFlagsService.getFlagsStatus({ usuarioId: user?.id });
  }

  @Get(':chave')
  async check(@Param('chave') chave: string, @CurrentUser() user?: any) {
    return { chave, ativo: await this.featureFlagsService.isActive(chave, { usuarioId: user?.id }) };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async criar(@Body() body: { chave: string; titulo: string; descricao?: string; ativo?: boolean; regras?: any }, @CurrentUser() user?: any) {
    const flag = await this.featureFlagsService.criar(body);
    await this.auditLogsService.registrar(user?.id ?? null, 'FEATURE_FLAG_CRIAR', 'FEATURE_FLAG', flag.id, {
      depois: { chave: flag.chave, titulo: flag.titulo, ativo: flag.ativo },
    });
    return flag;
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async atualizar(@Param('id') id: string, @Body() body: { ativo?: boolean; titulo?: string; descricao?: string; regras?: any }, @CurrentUser() user?: any) {
    const flag = await this.featureFlagsService.atualizar(id, body);
    await this.auditLogsService.registrar(user?.id ?? null, 'FEATURE_FLAG_ATUALIZAR', 'FEATURE_FLAG', flag.id, {
      depois: { chave: flag.chave, titulo: flag.titulo, ativo: flag.ativo },
    });
    return flag;
  }

  @Post('overrides')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async setOverride(@Body() body: {
    flagId: string; ativo: boolean;
    usuarioId?: string; cidade?: string; estado?: string;
  }, @CurrentUser() user?: any) {
    const override = await this.featureFlagsService.setOverride(body);
    await this.auditLogsService.registrar(user?.id ?? null, 'FEATURE_FLAG_OVERRIDE', 'FEATURE_FLAG', body.flagId, {
      depois: { ativo: body.ativo, usuarioId: body.usuarioId, cidade: body.cidade, estado: body.estado },
    });
    return override;
  }
}
