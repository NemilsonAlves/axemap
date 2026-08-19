import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CertificadoStatus, AntifraudeStatus } from '@axemap/shared';
import { isAdminRole } from '../common/utils/roles';

const CERTIFICADO_DESCRICOES: Record<string, string> = {
  CASA_VERIFICADA: 'Identidade institucional e responsável legal confirmados por documentação validada.',
  COMPROMISSO_COMUNIDADE: 'Participação contínua e ativa na comunidade local.',
  PROJETO_SOCIAL_ATIVO: 'Executa projeto social verificado e com prestação de contas.',
  EDUCACAO_FORMACAO: 'Oferece cursos e formação com registros verificáveis.',
  ACESSIBILIDADE: 'Compromisso com ambientes e serviços acessíveis.',
  PATRIMONIO_CULTURAL: 'Contribui para a preservação do patrimônio cultural.',
  BOAS_PRATICAS_ADMINISTRATIVAS: 'Adota boas práticas de gestão e governança.',
  PRESTACAO_CONTAS_EM_DIA: 'Mantém prestação de contas de campanhas em dia.',
  EVENTOS_TRANSPARENTES: 'Eventos públicos com informações transparentes.',
  SUSTENTABILIDADE: 'Práticas sustentáveis verificáveis.',
};

const CERTIFICADO_ICONES: Record<string, string> = {
  CASA_VERIFICADA: 'shield-check',
  COMPROMISSO_COMUNIDADE: 'heart-handshake',
  PROJETO_SOCIAL_ATIVO: 'hand-heart',
  EDUCACAO_FORMACAO: 'graduation-cap',
  ACESSIBILIDADE: 'accessibility',
  PATRIMONIO_CULTURAL: 'landmark',
  BOAS_PRATICAS_ADMINISTRATIVAS: 'clipboard-check',
  PRESTACAO_CONTAS_EM_DIA: 'file-check',
  EVENTOS_TRANSPARENTES: 'calendar-check',
  SUSTENTABILIDADE: 'leaf',
};

const COMPLIANCE_ITEMS = [
  { chave: 'LGPD', categoria: 'LGPD', titulo: 'Política de privacidade e tratamento de dados pessoais conforme a LGPD.' },
  { chave: 'SEGURANCA', categoria: 'SEGURANCA', titulo: 'Práticas de segurança da informação no cadastro e operação.' },
  { chave: 'DOCUMENTACAO', categoria: 'DOCUMENTACAO', titulo: 'Documentação institucional e de responsáveis em dia.' },
  { chave: 'PRESTACAO_CONTAS', categoria: 'PRESTACAO_CONTAS', titulo: 'Prestação de contas de campanhas atualizada.' },
  { chave: 'POLITICAS', categoria: 'POLITICAS', titulo: 'Políticas internas claras de conduta e gestão.' },
  { chave: 'CONSENTIMENTOS', categoria: 'CONSENTIMENTOS', titulo: 'Consentimentos registrados para uso de imagem e dados.' },
  { chave: 'AUDITORIA', categoria: 'AUDITORIA', titulo: 'Registros auditáveis de alterações relevantes.' },
  { chave: 'TREINAMENTOS', categoria: 'TREINAMENTOS', titulo: 'Treinamento da equipe em acolhimento e segurança.' },
];

const FRAUDE_RISCO_REVISAO = new Set(['ALTO', 'CRITICO']);

@Injectable()
export class TrustEcosystemService {
  constructor(private prisma: PrismaService) {}

  // =================================================================
  //  CERTIFICAÇÕES (selos)
  // =================================================================

  async certificadosDoTerreiro(slug: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { slug },
      select: { id: true, nome: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const certificados = await this.prisma.certificado.findMany({
      where: { terreiroId: terreiro.id, status: CertificadoStatus.ATIVO },
      orderBy: { concedidoEm: 'desc' },
      select: { codigo: true, tipo: true, titulo: true, icone: true, concedidoEm: true, expiraEm: true },
    });

    return {
      terreiro: { id: terreiro.id, nome: terreiro.nome },
      certificados: certificados.map((c) => ({
        ...c,
        descricao: CERTIFICADO_DESCRICOES[c.tipo] ?? null,
      })),
    };
  }

  async verificarCertificado(codigo: string) {
    const cert = await this.prisma.certificado.findUnique({
      where: { codigo },
      include: { terreiro: { select: { nome: true, slug: true, trustScore: true } } },
    });
    if (!cert) throw new NotFoundException('Certificação não encontrada');

    const valido = cert.status === CertificadoStatus.ATIVO && (!cert.expiraEm || cert.expiraEm > new Date());
    return {
      valido,
      codigo: cert.codigo,
      tipo: cert.tipo,
      titulo: cert.titulo,
      status: cert.status,
      concedidoEm: cert.concedidoEm,
      expiraEm: cert.expiraEm,
      instituicao: cert.terreiro,
    };
  }

  async concederCertificado(dto: { terreiroId: string; tipo: string; expiraEm?: string }, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: dto.terreiroId } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const existente = await this.prisma.certificado.findFirst({
      where: { terreiroId: dto.terreiroId, tipo: dto.tipo, status: CertificadoStatus.ATIVO },
    });
    if (existente) throw new ConflictException('Certificação deste tipo já está ativa para este terreiro');

    const codigo = `SEL-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;

    return this.prisma.certificado.create({
      data: {
        codigo,
        tipo: dto.tipo,
        titulo: dto.tipo,
        icone: CERTIFICADO_ICONES[dto.tipo],
        descricao: CERTIFICADO_DESCRICOES[dto.tipo],
        status: CertificadoStatus.ATIVO,
        concedidoEm: new Date(),
        expiraEm: dto.expiraEm ? new Date(dto.expiraEm) : null,
        terreiroId: dto.terreiroId,
        concedidoPorId: usuarioId,
      },
    });
  }

  async revogarCertificado(id: string, usuarioId: string) {
    const cert = await this.prisma.certificado.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Certificação não encontrada');
    return this.prisma.certificado.update({
      where: { id },
      data: { status: CertificadoStatus.REVOGADO, revogadoEm: new Date(), revogadoPorId: usuarioId },
    });
  }

  async listarCertificados(status?: string, limit = 50, offset = 0) {
    const where = status ? { status } : { status: CertificadoStatus.ATIVO };
    return this.prisma.certificado.findMany({
      where,
      include: { terreiro: { select: { nome: true, slug: true, cidade: true, estado: true } } },
      orderBy: { concedidoEm: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  // =================================================================
  //  MEDIAÇÃO (fluxo: registro → análise → mediação → resposta → encerramento)
  // =================================================================

  async criarMediacao(dto: { terreiroId: string; assunto: string; descricao: string }, usuarioId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: dto.terreiroId } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const prioridade = this.avaliarPrioridade(dto.assunto, dto.descricao);
    return this.prisma.mediacoes.create({
      data: {
        status: 'REGISTRADA',
        prioridade,
        origem: 'USUARIO',
        assunto: dto.assunto,
        descricao: dto.descricao,
        reclamanteId: usuarioId,
        terreiroId: dto.terreiroId,
      },
    });
  }

  private avaliarPrioridade(assunto: string, descricao: string): string {
    const texto = `${assunto} ${descricao}`.toLowerCase();
    const criticos = ['fraude', 'golpe', 'estelionato', 'ameaça', 'abuso', 'exploração', 'violência'];
    return criticos.some((k) => texto.includes(k)) ? 'ALTA' : 'NORMAL';
  }

  async listarMediacoesDoUsuario(usuarioId: string, status?: string) {
    return this.prisma.mediacoes.findMany({
      where: { reclamanteId: usuarioId, ...(status ? { status } : {}) },
      include: { terreiro: { select: { nome: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async detalheMediacao(id: string, usuarioId: string, role?: string) {
    const mediacao = await this.prisma.mediacoes.findUnique({
      where: { id },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true } },
        mensagens: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!mediacao) throw new NotFoundException('Mediação não encontrada');

    const isAdmin = isAdminRole(role);
    const podeVer = isAdmin || mediacao.reclamanteId === usuarioId || mediacao.moderadorId === usuarioId;
    if (!podeVer) throw new ForbiddenException('Você não participa desta mediação');
    return mediacao;
  }

  async enviarMensagemMediacao(id: string, texto: string, usuarioId: string, role?: string) {
    const mediacao = await this.prisma.mediacoes.findUnique({ where: { id } });
    if (!mediacao) throw new NotFoundException('Mediação não encontrada');
    if (['ENCERRADA', 'PUBLICADA', 'ARQUIVADA'].includes(mediacao.status)) {
      throw new ForbiddenException('Mediação encerrada não aceita novas mensagens');
    }
    const isAdmin = isAdminRole(role);
    const pode = isAdmin || mediacao.reclamanteId === usuarioId || mediacao.moderadorId === usuarioId;
    if (!pode) throw new ForbiddenException('Você não participa desta mediação');

    const autorTipo = isAdmin || mediacao.moderadorId === usuarioId ? 'MODERADOR' : 'USUARIO';
    return this.prisma.mediacaoMensagem.create({
      data: { texto, mediacaoId: id, autorId: usuarioId, autorTipo },
    });
  }

  async listarMediacoesAdmin(status?: string, limit = 50, offset = 0) {
    return this.prisma.mediacoes.findMany({
      where: status ? { status } : {},
      include: {
        terreiro: { select: { nome: true, slug: true } },
        reclamante: { select: { nome: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async iniciarMediacao(id: string, usuarioId: string) {
    const mediacao = await this.prisma.mediacoes.findUnique({ where: { id } });
    if (!mediacao) throw new NotFoundException('Mediação não encontrada');
    return this.prisma.mediacoes.update({
      where: { id },
      data: { status: 'EM_MEDIACAO', moderadorId: usuarioId },
    });
  }

  async responderMediacaoModerador(id: string, texto: string) {
    // Moderador (admin) envia uma mensagem de resposta e reabre para a parte.
    await this.prisma.mediacaoMensagem.create({
      data: { texto, mediacaoId: id, autorTipo: 'MODERADOR' },
    });
    return this.prisma.mediacoes.update({ where: { id }, data: { status: 'AGUARDANDO_RESPOSTA' } });
  }

  async encerrarMediacao(id: string, dto: { publicar?: boolean; resolucao?: string }) {
    const mediacao = await this.prisma.mediacoes.findUnique({ where: { id } });
    if (!mediacao) throw new NotFoundException('Mediação não encontrada');
    const publicar = !!dto.publicar;
    return this.prisma.mediacoes.update({
      where: { id },
      data: {
        status: publicar ? 'PUBLICADA' : 'ENCERRADA',
        resolucao: dto.resolucao ?? mediacao.resolucao,
        publicar,
        encerradoEm: new Date(),
        publicadoEm: publicar ? new Date() : null,
      },
    });
  }

  async arquivarMediacao(id: string) {
    const mediacao = await this.prisma.mediacoes.findUnique({ where: { id } });
    if (!mediacao) throw new NotFoundException('Mediação não encontrada');
    return this.prisma.mediacoes.update({ where: { id }, data: { status: 'ARQUIVADA' } });
  }

  // Apenas mediações concluídas com interesse público (status PUBLICADA) são expostas.
  async mediacoesDaCentral(slug: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { slug }, select: { id: true } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const mediacoes = await this.prisma.mediacoes.findMany({
      where: { terreiroId: terreiro.id, status: 'PUBLICADA' },
      select: {
        assunto: true, prioridade: true, resolucao: true, iniciadoEm: true, encerradoEm: true, publicadoEm: true,
      },
      orderBy: { publicadoEm: 'desc' },
    });

    let tempoMedioDias: number | null = null;
    const encerradas = mediacoes.filter((m) => m.encerradoEm);
    if (encerradas.length) {
      const soma = encerradas.reduce(
        (s, m) => s + Math.max(0, m.encerradoEm!.getTime() - m.iniciadoEm.getTime()),
        0,
      );
      tempoMedioDias = Math.max(0, Math.round(soma / encerradas.length / 86400000));
    }

    return { totalPublicadas: mediacoes.length, tempoMedioResolucaoDias: tempoMedioDias, historico: mediacoes };
  }

  // =================================================================
  //  COMPLIANCE
  // =================================================================

  async gerarCompliance(terreiroId: string) {
    const periodo = new Date().toISOString().slice(0, 7);

    const existente = await this.prisma.complianceChecklist.findUnique({
      where: { terreiroId_periodo: { terreiroId, periodo } },
      include: { itens: true },
    });
    if (existente) return existente;

    return this.prisma.complianceChecklist.create({
      data: {
        terreiroId,
        periodo,
        status: 'EM_ANDAMENTO',
        itens: { create: COMPLIANCE_ITEMS.map((it) => ({ chave: it.chave, categoria: it.categoria, titulo: it.titulo })) },
      },
      include: { itens: true },
    });
  }

  async atualizarCompliance(checklistId: string, itens: { id: string; conforme: boolean; observacao?: string }[]) {
    const checklist = await this.prisma.complianceChecklist.findUnique({ where: { id: checklistId } });
    if (!checklist) throw new NotFoundException('Checklist de compliance não encontrado');

    for (const item of itens) {
      await this.prisma.complianceItem.update({
        where: { id: item.id },
        data: { conforme: item.conforme, observacao: item.observacao },
      });
    }

    const atualizado = await this.prisma.complianceChecklist.findUnique({
      where: { id: checklistId },
      include: { itens: true },
    });
    const total = atualizado!.itens.length;
    const conformes = atualizado!.itens.filter((i) => i.conforme).length;
    const score = total ? Math.round((conformes / total) * 100) : 0;
    const status = score === 100 ? 'CONFORME' : score > 0 ? 'PENDENCIAS' : 'EM_ANDAMENTO';

    return this.prisma.complianceChecklist.update({
      where: { id: checklistId },
      data: { score, status },
      include: { itens: true },
    });
  }

  async listarCompliance(terreiroId?: string, limit = 30) {
    return this.prisma.complianceChecklist.findMany({
      where: terreiroId ? { terreiroId } : {},
      include: { terreiro: { select: { nome: true, slug: true } }, itens: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // =================================================================
  //  ANTIFRAUDE (IA advisória + revisão humana)
  // =================================================================

  async listarAntifraude(status?: string, risco?: string, limit = 50, offset = 0) {
    return this.prisma.antifraudeRegistro.findMany({
      where: { ...(status ? { status } : {}), ...(risco ? { risco } : {}) },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async reportarFraude(
    dto: { tipo: string; risco?: string; detalhes?: any; entidadeTipo?: string; entidadeId?: string },
    usuarioId: string,
  ) {
    const risco = dto.risco ?? 'BAIXO';
    return this.prisma.antifraudeRegistro.create({
      data: {
        tipo: dto.tipo,
        risco,
        status: AntifraudeStatus.ABERTO,
        detalhes: dto.detalhes,
        entidadeTipo: dto.entidadeTipo,
        entidadeId: dto.entidadeId,
        revisaoHumanaObrigatoria: FRAUDE_RISCO_REVISAO.has(risco),
        criadoPorId: usuarioId,
      },
    });
  }

  /** Detecção assistida (IA) — ADVISÓRIA. Nunca substitui a decisão humana. */
  analisarFraude(dto: { tipo: string; sinais: number }) {
    let risco = 'BAIXO';
    if (['ATAQUE_ORGANIZADO', 'MANIPULACAO_TRUST_SCORE', 'CAMPANHA_FRAUDULENTA'].includes(dto.tipo)) {
      risco = dto.sinais >= 3 ? 'CRITICO' : 'ALTO';
    } else if (dto.sinais >= 3) {
      risco = 'ALTO';
    } else if (dto.sinais >= 2) {
      risco = 'MEDIO';
    }
    return {
      risco,
      revisaoHumanaObrigatoria: FRAUDE_RISCO_REVISAO.has(risco),
      detalhes: `Análise automática (advisória): ${dto.sinais} sinal(is) na categoria ${dto.tipo}.`,
    };
  }

  async registrarAnaliseFraude(dto: { tipo: string; sinais: number }, usuarioId: string) {
    const sugestao = this.analisarFraude({ tipo: dto.tipo, sinais: dto.sinais });
    return this.prisma.antifraudeRegistro.create({
      data: {
        tipo: dto.tipo,
        risco: sugestao.risco,
        status: AntifraudeStatus.ABERTO,
        detalhes: `${sugestao.detalhes} Resultado nunca final; aguarda revisão humana.`,
        revisaoHumanaObrigatoria: sugestao.revisaoHumanaObrigatoria,
        criadoPorId: usuarioId,
      },
    });
  }

  /** Decisão humana - registros de risco ALTO/CRITICO exigem decisão explícita. */
  async revisarFraude(id: string, dto: { decisao: string }, usuarioId: string) {
    const registro = await this.prisma.antifraudeRegistro.findUnique({ where: { id } });
    if (!registro) throw new NotFoundException('Registro antifraude não encontrado');
    if (registro.revisaoHumanaObrigatoria && !dto.decisao) {
      throw new ForbiddenException('Revisão humana é obrigatória para registros de risco alto/crítico');
    }

    const status =
      dto.decisao === 'BLOQUEAR'
        ? AntifraudeStatus.BLOQUEADO
        : dto.decisao === 'DESCARTAR'
          ? AntifraudeStatus.DESCARTADO
          : AntifraudeStatus.REVISTO;

    return this.prisma.antifraudeRegistro.update({
      where: { id },
      data: { status, decisaoHumana: dto.decisao, revistoPorId: usuarioId, revisadoEm: new Date() },
    });
  }

  // =================================================================
  //  EVIDÊNCIAS
  // =================================================================

  async listarEvidencias(referenciaTipo?: string, validada?: string, limit = 50, offset = 0) {
    return this.prisma.evidencia.findMany({
      where: {
        ...(referenciaTipo ? { referenciaTipo } : {}),
        ...(validada ? { validada: validada === 'true' } : {}),
      },
      include: { criadoPor: { select: { nome: true } }, validadoPor: { select: { nome: true } } },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  }

  async validarEvidencia(id: string, usuarioId: string) {
    const evid = await this.prisma.evidencia.findUnique({ where: { id } });
    if (!evid) throw new NotFoundException('Evidência não encontrada');
    return this.prisma.evidencia.update({
      where: { id },
      data: { validada: true, validadoEm: new Date(), validadoPorId: usuarioId },
    });
  }

  // =================================================================
  //  GOVERNANÇA (Conselho)
  // =================================================================

  async conselho() {
    return this.prisma.governancaMembro.findMany({ where: { ativo: true }, orderBy: { createdAt: 'asc' } });
  }

  // =================================================================
  //  CENTRAL DE TRANSPARÊNCIA
  // =================================================================

  async transparencia(slug: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { slug },
      select: {
        id: true, nome: true, slug: true, trustScore: true, isVerified: true, verificationLevel: true, updatedAt: true,
        _count: { select: { acoesSociais: true, avaliacoes: true, campanhas: true, conteudos: true } },
      },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const [certificadosAtivos, campanhas, centralMediacao, compliance, evidencias, mudancas] = await Promise.all([
      this.prisma.certificado.count({ where: { terreiroId: terreiro.id, status: CertificadoStatus.ATIVO } }),
      this.prisma.campanhas.findMany({
        where: { terreiroId: terreiro.id },
        select: { titulo: true, arrecadado: true, apoiadoresCount: true, status: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.mediacoesDaCentral(slug),
      this.prisma.complianceChecklist.findFirst({
        where: { terreiroId: terreiro.id },
        select: { periodo: true, status: true, score: true, itens: { select: { conforme: true, categoria: true } } },
        orderBy: { periodo: 'desc' },
      }),
      this.prisma.evidencia.count({ where: { terreiroId: terreiro.id, validada: true } }),
      this.prisma.auditLogs.findMany({
        where: { entidadeTipo: 'TERREIRO', entidadeId: terreiro.id },
        select: { acao: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    return {
      instituicao: { nome: terreiro.nome, slug: terreiro.slug },
      confianca: {
        trustScore: terreiro.trustScore,
        isVerified: terreiro.isVerified,
        verificationLevel: terreiro.verificationLevel,
        certificadosAtivos,
        evidenciasValidadas: evidencias,
      },
      projetosSociais: terreiro._count.acoesSociais,
      avaliacoes: terreiro._count.avaliacoes,
      prestacaoDeContas: {
        totalCampanhas: campanhas.length,
        arrecadadoTotal: campanhas.reduce((s, c) => s + (c.arrecadado ?? 0), 0),
        campanhas: campanhas.map((c) => ({
          titulo: c.titulo, arrecadado: c.arrecadado, apoiadores: c.apoiadoresCount, status: c.status,
        })),
      },
      mediacoes: centralMediacao,
      compliance: compliance
        ? {
            periodo: compliance.periodo,
            status: compliance.status,
            score: compliance.score,
            conformes: compliance.itens.filter((i) => i.conforme).length,
            total: compliance.itens.length,
          }
        : null,
      mudancasRecentes: mudancas,
      ultimaAtualizacao: terreiro.updatedAt,
    };
  }

  // =================================================================
  //  DASHBOARD ADMIN (Trust Ecosystem)
  // =================================================================

  async dashboard() {
    const ativasStatus = ['REGISTRADA', 'EM_MEDIACAO', 'AGUARDANDO_RESPOSTA'];
    const [perfisVerificados, solicitacoesPendentes, mediacoesEmAndamento, mediacoesPublicadas, fraudesBloqueadas, fraudesCriticasPendentes, certificacoes, trustAgg, complianceConformes] =
      await Promise.all([
        this.prisma.terreiros.count({ where: { isVerified: true } }),
        this.prisma.terreiros.count({ where: { status: 'PENDENTE_REVISAO' } }),
        this.prisma.mediacoes.count({ where: { status: { in: ativasStatus } } }),
        this.prisma.mediacoes.count({ where: { status: 'PUBLICADA' } }),
        this.prisma.antifraudeRegistro.count({ where: { status: 'BLOQUEADO' } }),
        this.prisma.antifraudeRegistro.count({
          where: { risco: { in: ['ALTO', 'CRITICO'] }, status: { in: ['ABERTO', 'EM_REVISAO'] } },
        }),
        this.prisma.certificado.count({ where: { status: CertificadoStatus.ATIVO } }),
        this.prisma.terreiros.aggregate({ _avg: { trustScore: true } }),
        this.prisma.complianceChecklist.count({ where: { status: 'CONFORME' } }),
      ]);

    return {
      perfisVerificados,
      solicitacoesPendentes,
      mediacoes: { emAndamento: mediacoesEmAndamento, publicadas: mediacoesPublicadas },
      antifraude: { bloqueadas: fraudesBloqueadas, criticasPendentes: fraudesCriticasPendentes },
      certificacoes,
      trustScoreMedio: Math.round((trustAgg._avg.trustScore ?? 0) * 10) / 10,
      complianceConformes,
    };
  }
}