import { Controller, Get, Post, Patch, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { SaasService } from './saas.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('admin/saas')
@UseGuards(RolesGuard)
@Roles(...ADMIN_ROLES)
export class SaasAdminController {
  constructor(private saas: SaasService) {}

  // ---------- Catálogo de planos (CRUD) ----------
  @Get('planos')
  listarPlanos(@Query('incluirInativos') incluirInativos?: string) {
    return this.saas.listarPlanos(incluirInativos === 'true');
  }

  @Post('planos')
  criar(@Body() dto: any) {
    return this.saas.criarPlano(dto);
  }

  @Patch('planos/:id')
  atualizarPlano(@Param('id') id: string, @Body() dto: any) {
    return this.saas.atualizarPlano(id, dto);
  }

  @Delete('planos/:id')
  removerPlano(@Param('id') id: string) {
    return this.saas.removerPlano(id);
  }

  // ---------- Assinaturas + pagamentos pendentes ----------
  @Get('assinaturas')
  listarAssinaturas() {
    return this.saas.listarAssinaturas();
  }

  @Get('pagamentos/pendentes')
  pagamentosPendentes() {
    return this.saas.listarPagamentosPendentes();
  }

  @Post('pagamentos/:id/confirmar')
  confirmarPagamento(@Param('id') id: string, @CurrentUser() user: any) {
    return this.saas.confirmarPagamento(id, user.id);
  }
}