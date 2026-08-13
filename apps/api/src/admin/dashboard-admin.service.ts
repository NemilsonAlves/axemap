import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@axemap/shared';

@Injectable()
export class DashboardAdminService {
  constructor(private prisma: PrismaService) {}

  async obterDashboard() {
    const agora = new Date();
    const ha7dias = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ha30dias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsuarios,
      usuariosPorRole,
      usuariosVerificados,
      usuariosBloqueados,
      novosUsuarios7d,
      novosUsuarios30d,
      totalTerreiros,
      terreirosPorStatus,
      terreirosPublicados,
      terreirosVerificados,
      novosTerreiros7d,
      totalOrganizacoes,
      organizacoesPublicadas,
      totalEventos,
      proximosEventos,
      totalAvaliacoes,
      totalDenuncias,
      denunciasAbertas,
      totalCursos,
      totalMatriculas,
      totalConteudos,
      totalAcoesSociais,
      totalFeedbacks,
      totalCertificados,
      totalMediacoes,
      mediacoesAtivas,
      totalCampanhas,
      campanhasPublicadas,
      valorCampanhasArrecadado,
      totalAssinaturas,
      assinaturasAtivas,
      receitaAssinaturas,
      totalTransacoes,
      totalReceitas,
      totalDespesas,
      totalGraphEntidades,
      totalGraphRelacionamentos,
      totalConteudoCultural,
      totalPatrimonioCultural,
      totalMembrosTerreiro,
      totalSeguidores,
      totalNotificacoes,
      totalIndicacoes,
      reivindicacoesPendentes,
      documentosPendentes,
      totalAuditLogs,
      flagsAtivas,
    ] = await Promise.all([
      this.prisma.usuarios.count({ where: { deletedAt: null } }),
      this.agruparPorRole(),
      this.prisma.usuarios.count({ where: { deletedAt: null, isVerified: true } }),
      this.prisma.usuarios.count({ where: { deletedAt: null, bloqueadoEm: { not: null } } }),
      this.prisma.usuarios.count({ where: { deletedAt: null, createdAt: { gte: ha7dias } } }),
      this.prisma.usuarios.count({ where: { deletedAt: null, createdAt: { gte: ha30dias } } }),
      this.prisma.terreiros.count({ where: { deletedAt: null } }),
      this.prisma.terreiros.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
      this.prisma.terreiros.count({ where: { deletedAt: null, isPublished: true } }),
      this.prisma.terreiros.count({ where: { deletedAt: null, isVerified: true } }),
      this.prisma.terreiros.count({ where: { deletedAt: null, createdAt: { gte: ha7dias } } }),
      this.prisma.organizacoes.count({ where: { deletedAt: null } }),
      this.prisma.organizacoes.count({ where: { deletedAt: null, isPublished: true } }),
      this.prisma.eventos.count({ where: { deletedAt: null } }),
      this.prisma.eventos.count({ where: { deletedAt: null, dataInicio: { gte: agora } } }),
      this.prisma.avaliacoes.count({ where: { deletedAt: null } }),
      this.prisma.denuncias.count(),
      this.prisma.denuncias.count({ where: { status: { in: ['PENDENTE', 'EM_ANALISE'] } } }),
      this.prisma.cursos.count(),
      this.prisma.matriculasCurso.count(),
      this.prisma.conteudos.count(),
      this.prisma.acoesSociais.count(),
      this.prisma.feedback.count(),
      this.prisma.certificado.count(),
      this.prisma.mediacoes.count(),
      this.prisma.mediacoes.count({
        where: { status: { in: ['REGISTRADA', 'EM_MEDIACAO', 'AGUARDANDO_RESPOSTA'] } },
      }),
      this.prisma.campanhas.count(),
      this.prisma.campanhas.count({ where: { status: { in: ['PUBLICADA', 'APROVADA', 'ENCERRADA'] } } }),
      this.prisma.campanhas.aggregate({ _sum: { arrecadado: true } }),
      this.prisma.planoAssinatura.count(),
      this.prisma.planoAssinatura.count({ where: { status: 'ATIVO' } }),
      this.prisma.planoAssinatura.aggregate({ where: { status: 'ATIVO' }, _sum: { valor: true } }),
      this.prisma.transacaoFinanceira.count(),
      this.prisma.transacaoFinanceira.aggregate({ where: { tipo: 'RECEITA' }, _sum: { valor: true } }),
      this.prisma.transacaoFinanceira.aggregate({ where: { tipo: 'DESPESA' }, _sum: { valor: true } }),
      this.prisma.graphEntidade.count({ where: { deletedAt: null } }),
      this.prisma.graphRelacionamento.count({ where: { deletedAt: null } }),
      this.prisma.conteudoCultural.count({ where: { deletedAt: null } }),
      this.prisma.patrimonioCultural.count({ where: { deletedAt: null } }),
      this.prisma.membrosTerreiro.count(),
      this.prisma.seguidoresTerreiro.count(),
      this.prisma.notificacoes.count(),
      this.prisma.indicacoes.count(),
      this.prisma.claimRequest.count({ where: { status: 'PENDENTE' } }),
      this.prisma.documentosVerificacao.count({ where: { status: 'PENDENTE' } }),
      this.prisma.auditLogs.count(),
      this.prisma.featureFlag.count({ where: { ativo: true } }),
    ]);

    const topTerreiros = await this.prisma.terreiros.findMany({
      where: { deletedAt: null },
      orderBy: { trustScore: 'desc' },
      take: 5,
      select: { id: true, nome: true, slug: true, cidade: true, estado: true, trustScore: true, status: true },
    });

    const ultimosAudits = await this.prisma.auditLogs.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { usuario: { select: { id: true, nome: true } } },
    });

    return {
      geradoEm: agora.toISOString(),
      usuarios: {
        total: totalUsuarios,
        porRole: usuariosPorRole,
        verificados: usuariosVerificados,
        bloqueados: usuariosBloqueados,
        novos7d: novosUsuarios7d,
        novos30d: novosUsuarios30d,
      },
      terreiros: {
        total: totalTerreiros,
        porStatus: terreirosPorStatus,
        publicados: terreirosPublicados,
        verificados: terreirosVerificados,
        novos7d: novosTerreiros7d,
        topPorTrustScore: topTerreiros,
      },
      organizacoes: {
        total: totalOrganizacoes,
        publicadas: organizacoesPublicadas,
      },
      eventos: {
        total: totalEventos,
        proximos: proximosEventos,
      },
      conteudo: {
        avaliacoes: totalAvaliacoes,
        cursos: totalCursos,
        matriculas: totalMatriculas,
        conteudos: totalConteudos,
        acoesSociais: totalAcoesSociais,
        feedbacks: totalFeedbacks,
        certificados: totalCertificados,
        conteudoCultural: totalConteudoCultural,
        patrimonioCultural: totalPatrimonioCultural,
        graphEntidades: totalGraphEntidades,
        graphRelacionamentos: totalGraphRelacionamentos,
      },
      comunidade: {
        membrosTerreiro: totalMembrosTerreiro,
        seguidores: totalSeguidores,
        notificacoes: totalNotificacoes,
        indicacoes: totalIndicacoes,
      },
      moderacao: {
        denuncias: totalDenuncias,
        denunciasAbertas,
        mediacoes: totalMediacoes,
        mediacoesAtivas,
        reivindicacoesPendentes,
        documentosPendentes,
      },
      impacto: {
        campanhas: totalCampanhas,
        campanhasPublicadas,
        valorArrecadado: valorCampanhasArrecadado._sum.arrecadado ?? 0,
      },
      financeiro: {
        assinaturas: totalAssinaturas,
        assinaturasAtivas,
        receitaAssinaturas: receitaAssinaturas._sum.valor ?? 0,
        transacoes: totalTransacoes,
        receitas: totalReceitas._sum.valor ?? 0,
        despesas: totalDespesas._sum.valor ?? 0,
      },
      sistema: {
        auditLogs: totalAuditLogs,
        flagsAtivas,
        ultimosAudits,
      },
    };
  }

  private async agruparPorRole() {
    const grupos = await this.prisma.usuarios.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: { _all: true },
    });
    const porRole: Record<string, number> = {};
    for (const role of Object.values(UserRole)) porRole[role] = 0;
    for (const g of grupos) porRole[g.role] = g._count._all;
    return porRole;
  }
}
