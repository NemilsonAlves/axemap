import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TaxonomyCategory } from '@axemap/shared';
import { PrismaService } from '../database/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class OnboardingService {
  constructor(
    private prisma: PrismaService,
    private notificacoes: NotificacoesService,
  ) {}

  getSteps() {
    return [
      {
        key: 'nome',
        titulo: 'Qual o nome do terreiro?',
        descricao: 'Comece pelo nome. Você pode completar os detalhes depois.',
        campos: [
          { key: 'nome', tipo: 'text', label: 'Nome do terreiro', placeholder: 'Ex: Terreiro de Oyá', required: true, maxLength: 200 },
        ],
      },
      {
        key: 'localizacao',
        titulo: 'Onde fica?',
        descricao: 'Informe a cidade e marque a localização no mapa.',
        campos: [
          { key: 'cidade', tipo: 'text', label: 'Cidade', placeholder: 'Ex: Salvador', required: true },
          { key: 'estado', tipo: 'select', label: 'Estado', opcoes: [
            'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
          ], required: true },
          { key: 'latitude', tipo: 'hidden' },
          { key: 'longitude', tipo: 'hidden' },
        ],
      },
      {
        key: 'mapa',
        titulo: 'Marque a localização no mapa',
        descricao: 'Clique no mapa para marcar a posição do terreiro.',
        campos: [
          { key: 'latitude', tipo: 'mapa', label: 'Localização', required: true },
          { key: 'longitude', tipo: 'mapa', required: true },
        ],
      },
      {
        key: 'contato',
        titulo: 'WhatsApp de contato',
        descricao: 'O WhatsApp é o principal canal de contato. Os visitantes usarão para falar com você.',
        campos: [
          { key: 'whatsapp', tipo: 'tel', label: 'WhatsApp', placeholder: '(71) 99999-8888', required: true },
        ],
      },
      {
        key: 'revisao',
        titulo: 'Pronto para publicar!',
        descricao: 'Revise as informações e publique seu terreiro. Você poderá completar o perfil depois na Central de Evolução.',
        campos: [],
      },
    ];
  }

  async criarMinimo(dto: {
    nome: string; cidade: string; estado: string;
    latitude: number; longitude: number; whatsapp: string;
    tradicao?: string;
    taxonomyCategory?: TaxonomyCategory;
  }, usuarioId: string) {
    const slug = dto.nome
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const codigoIndicacao = `AX${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const terreiro = await this.prisma.terreiros.create({
      data: {
        nome: dto.nome,
        slug,
        tradicao: dto.tradicao || 'NAO_INFORMADA',
        taxonomyCategory: dto.taxonomyCategory || 'POVO',
        cidade: dto.cidade,
        estado: dto.estado,
        latitude: dto.latitude,
        longitude: dto.longitude,
        whatsapp: dto.whatsapp,
        isPublished: true,
        status: 'PUBLICADO',
        publicadoEm: new Date(),
        codigoIndicacao,
        criadoPorId: usuarioId,
        dirigenteId: usuarioId,
      },
    });

    return { ...terreiro, slug };
  }

  async reivindicar(usuarioId: string, terreiroId: string, mensagem?: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: terreiroId } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    if (terreiro.dirigenteId) throw new ConflictException('Este terreiro já possui um dirigente');

    const existing = await this.prisma.claimRequest.findUnique({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    if (existing) throw new ConflictException('Você já solicitou a reivindicação deste perfil');

    return this.prisma.claimRequest.create({
      data: { usuarioId, terreiroId, mensagem },
    });
  }

  async listarReivindicacoesPendentes() {
    return this.prisma.claimRequest.findMany({
      where: { status: 'PENDENTE' },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async aprovarReivindicacao(requestId: string, revisorId: string) {
    const request = await this.prisma.claimRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Solicitação não encontrada');

    await this.prisma.terreiros.update({
      where: { id: request.terreiroId },
      data: { dirigenteId: request.usuarioId },
    });

    await this.notificacoes.criar(request.usuarioId, {
      tipo: 'REIVINDICACAO_APROVADA',
      titulo: 'Reivindicação aprovada',
      mensagem: 'Sua reivindicação de dirigente do terreiro foi aprovada.',
    });

    return this.prisma.claimRequest.update({
      where: { id: requestId },
      data: { status: 'APROVADO', revisadoPorId: revisorId, revisadoEm: new Date() },
    });
  }

  async recusarReivindicacao(requestId: string, revisorId: string) {
    const request = await this.prisma.claimRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Solicitação não encontrada');

    await this.notificacoes.criar(request.usuarioId, {
      tipo: 'REIVINDICACAO_RECUSADA',
      titulo: 'Reivindicação recusada',
      mensagem: 'Sua reivindicação de dirigente do terreiro foi recusada.',
    });

    return this.prisma.claimRequest.update({
      where: { id: requestId },
      data: { status: 'RECUSADO', revisadoPorId: revisorId, revisadoEm: new Date() },
    });
  }

  async getReivindicacaoStatus(usuarioId: string, terreiroId: string) {
    const request = await this.prisma.claimRequest.findUnique({
      where: { usuarioId_terreiroId: { usuarioId, terreiroId } },
    });
    return { solicitado: !!request, status: request?.status || null };
  }
}