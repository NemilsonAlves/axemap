import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SaasService } from './saas.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlanoCiclo, PlanoPagamentoMetodo, TransacaoTipo } from '@axemap/shared';

@Controller()
export class PlanosController {
  constructor(private saas: SaasService) {}

  // Catálogo público de planos
  @Get('planos')
  listarPlanos(@Query('incluirInativos') incluirInativos?: string) {
    return this.saas.listarPlanos(incluirInativos === 'true');
  }

  // ---------- Assinatura (dirigente) ----------
  @Get('planos/assinatura/:terreiroId')
  @UseGuards(AuthGuard('jwt'))
  assinaturaAtual(@Param('terreiroId') terreiroId: string) {
    return this.saas.assinaturaAtual(terreiroId);
  }

  @Post('planos/assinatura')
  @UseGuards(AuthGuard('jwt'))
  assinar(
    @Body() dto: {
      terreiroId: string;
      planoSlug: string;
      ciclo: PlanoCiclo;
      metodo?: PlanoPagamentoMetodo;
    },
    @CurrentUser() user: any,
  ) {
    return this.saas.assinar(user.id, dto);
  }

  @Delete('planos/assinatura/:terreiroId')
  @UseGuards(AuthGuard('jwt'))
  cancelar(@Param('terreiroId') terreiroId: string, @CurrentUser() user: any) {
    return this.saas.cancelarAssinatura(user.id, terreiroId);
  }

  // ---------- Financeiro (dirigente) ----------
  @Post('financeiro/transacoes')
  @UseGuards(AuthGuard('jwt'))
  lancar(@Body() dto: any, @CurrentUser() user: any) {
    return this.saas.lancarTransacao(user.id, dto);
  }

  @Get('financeiro/transacoes')
  @UseGuards(AuthGuard('jwt'))
  listar(
    @Query('terreiroId') terreiroId: string,
    @Query('tipo') tipo?: TransacaoTipo,
    @Query('mes') periodo?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.saas.listarTransacoes(terreiroId, tipo, periodo, parseInt(limit) || 50, parseInt(offset) || 0);
  }

  @Get('financeiro/resumo')
  @UseGuards(AuthGuard('jwt'))
  resumo(@Query('terreiroId') terreiroId: string, @Query('mes') periodo?: string) {
    return this.saas.resumoFinanceiro(terreiroId, periodo);
  }

  @Patch('financeiro/transacoes/:id')
  @UseGuards(AuthGuard('jwt'))
  atualizar(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.saas.atualizarTransacao(user.id, id, dto);
  }

  @Delete('financeiro/transacoes/:id')
  @UseGuards(AuthGuard('jwt'))
  remover(@Param('id') id: string, @CurrentUser() user: any) {
    return this.saas.removerTransacao(user.id, id);
  }

  @Put('financeiro/pix/:terreiroId')
  @UseGuards(AuthGuard('jwt'))
  salvarPix(@Param('terreiroId') terreiroId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.saas.salvarPix(user.id, terreiroId, dto);
  }
}