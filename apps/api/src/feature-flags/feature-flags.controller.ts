import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@axemap/shared';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private featureFlagsService: FeatureFlagsService) {}

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
  async criar(@Body() body: { chave: string; titulo: string; descricao?: string; ativo?: boolean; regras?: any }) {
    return this.featureFlagsService.criar(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async atualizar(@Param('id') id: string, @Body() body: { ativo?: boolean; titulo?: string; descricao?: string; regras?: any }) {
    return this.featureFlagsService.atualizar(id, body);
  }

  @Post('overrides')
  @UseGuards(RolesGuard)
  @Roles(...ADMIN_ROLES)
  async setOverride(@Body() body: {
    flagId: string; ativo: boolean;
    usuarioId?: string; cidade?: string; estado?: string;
  }) {
    return this.featureFlagsService.setOverride(body);
  }
}
