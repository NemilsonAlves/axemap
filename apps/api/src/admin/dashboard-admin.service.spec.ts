import { Test } from '@nestjs/testing';
import { DashboardAdminService } from './dashboard-admin.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@axemap/shared';

describe('DashboardAdminService', () => {
  let service: DashboardAdminService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      usuarios: { count: jest.fn(), groupBy: jest.fn() },
      terreiros: { count: jest.fn(), groupBy: jest.fn(), findMany: jest.fn() },
      organizacoes: { count: jest.fn() },
      eventos: { count: jest.fn() },
      avaliacoes: { count: jest.fn() },
      denuncias: { count: jest.fn() },
      cursos: { count: jest.fn() },
      matriculasCurso: { count: jest.fn() },
      conteudos: { count: jest.fn() },
      acoesSociais: { count: jest.fn() },
      feedback: { count: jest.fn() },
      certificado: { count: jest.fn() },
      mediacoes: { count: jest.fn() },
      campanhas: { count: jest.fn(), aggregate: jest.fn() },
      planoAssinatura: { count: jest.fn(), aggregate: jest.fn() },
      transacaoFinanceira: { count: jest.fn(), aggregate: jest.fn() },
      graphEntidade: { count: jest.fn() },
      graphRelacionamento: { count: jest.fn() },
      conteudoCultural: { count: jest.fn() },
      patrimonioCultural: { count: jest.fn() },
      membrosTerreiro: { count: jest.fn() },
      seguidoresTerreiro: { count: jest.fn() },
      notificacoes: { count: jest.fn() },
      indicacoes: { count: jest.fn() },
      claimRequest: { count: jest.fn() },
      documentosVerificacao: { count: jest.fn() },
      auditLogs: { count: jest.fn(), findMany: jest.fn() },
      featureFlag: { count: jest.fn() },
    };

    prisma.usuarios.count.mockResolvedValue(100);
    prisma.usuarios.groupBy.mockResolvedValue([{ role: UserRole.VISITOR, _count: { _all: 100 } }]);
    prisma.terreiros.count.mockResolvedValue(40);
    prisma.terreiros.groupBy.mockResolvedValue([]);
    prisma.terreiros.findMany.mockResolvedValue([]);
    prisma.organizacoes.count.mockResolvedValue(3);
    prisma.eventos.count.mockResolvedValue(12);
    prisma.avaliacoes.count.mockResolvedValue(200);
    prisma.denuncias.count.mockResolvedValue(5);
    prisma.cursos.count.mockResolvedValue(8);
    prisma.matriculasCurso.count.mockResolvedValue(30);
    prisma.conteudos.count.mockResolvedValue(15);
    prisma.acoesSociais.count.mockResolvedValue(7);
    prisma.feedback.count.mockResolvedValue(9);
    prisma.certificado.count.mockResolvedValue(2);
    prisma.mediacoes.count.mockResolvedValue(4);
    prisma.campanhas.count.mockResolvedValue(6);
    prisma.campanhas.aggregate.mockResolvedValue({ _sum: { arrecadado: 1250.5 } });
    prisma.planoAssinatura.count.mockResolvedValue(3);
    prisma.planoAssinatura.aggregate.mockResolvedValue({ _sum: { valor: 300 } });
    prisma.transacaoFinanceira.count.mockResolvedValue(25);
    prisma.transacaoFinanceira.aggregate.mockResolvedValue({ _sum: { valor: 5000 } });
    prisma.graphEntidade.count.mockResolvedValue(88);
    prisma.graphRelacionamento.count.mockResolvedValue(63);
    prisma.conteudoCultural.count.mockResolvedValue(3);
    prisma.patrimonioCultural.count.mockResolvedValue(2);
    prisma.membrosTerreiro.count.mockResolvedValue(45);
    prisma.seguidoresTerreiro.count.mockResolvedValue(120);
    prisma.notificacoes.count.mockResolvedValue(55);
    prisma.indicacoes.count.mockResolvedValue(10);
    prisma.claimRequest.count.mockResolvedValue(1);
    prisma.documentosVerificacao.count.mockResolvedValue(2);
    prisma.auditLogs.count.mockResolvedValue(30);
    prisma.auditLogs.findMany.mockResolvedValue([]);
    prisma.featureFlag.count.mockResolvedValue(4);

    const moduleRef = await Test.createTestingModule({
      providers: [DashboardAdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(DashboardAdminService);
  });

  it('retorna contagens reais agregadas do dashboard', async () => {
    const result = await service.obterDashboard();

    expect(result.usuarios.total).toBe(100);
    expect(result.usuarios.verificados).toBe(100);
    expect(result.usuarios.porRole[UserRole.VISITOR]).toBe(100);
    expect(result.terreiros.total).toBe(40);
    expect(result.conteudo.graphEntidades).toBe(88);
    expect(result.conteudo.graphRelacionamentos).toBe(63);
    expect(result.conteudo.conteudoCultural).toBe(3);
    expect(result.conteudo.patrimonioCultural).toBe(2);
    expect(result.impacto.valorArrecadado).toBe(1250.5);
    expect(result.financeiro.receitaAssinaturas).toBe(300);
    expect(result.financeiro.receitas).toBe(5000);
    expect(result.sistema.flagsAtivas).toBe(4);
  });

  it('zera agregações nulas para arrecadação', async () => {
    prisma.campanhas.aggregate.mockResolvedValue({ _sum: { arrecadado: null } });

    const result = await service.obterDashboard();

    expect(result.impacto.valorArrecadado).toBe(0);
  });
});
