import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { DenunciaMotivo, DenunciaStatus, DenunciaTipo } from '@axemap/shared';

const TIPOS_VALIDOS = new Set<string>(Object.values(DenunciaTipo));

const MOTIVOS_VALIDOS = new Set<string>(Object.values(DenunciaMotivo));

const STATUS_VALIDOS = new Set<string>(Object.values(DenunciaStatus));

const MAX_DESCRICAO_LEN = 4000;

function gerarProtocolo(): string {
  const ano = new Date().getFullYear();
  const codigo = randomBytes(4).toString('hex').toUpperCase();
  return `AXE-${ano}-${codigo}`;
}

@Injectable()
export class ModerationService {
  constructor(
    private prisma: PrismaService,
    private notificacoes: NotificacoesService,
  ) {}

  /**
   * Denúncia pública — aceita usuários logados e denunciantes anônimos.
   * Nunca transforma automaticamente uma denúncia em acusação pública.
   */
  async denunciar(dto: {
    motivo: string;
    tipo?: string;
    entidadeId: string;
    terreiroId?: string;
    descricao?: string;
    emailContato?: string;
    usuarioId?: string;
  }) {
    if (!dto.motivo || !dto.entidadeId) {
      throw new BadRequestException('motivo e entidadeId são obrigatórios');
    }
    const motivo = dto.motivo.toUpperCase();
    if (!MOTIVOS_VALIDOS.has(motivo)) {
      throw new BadRequestException(`motivo inválido. Use um de: ${[...MOTIVOS_VALIDOS].join(', ')}`);
    }
    if (dto.tipo && !TIPOS_VALIDOS.has(dto.tipo.toUpperCase())) {
      throw new BadRequestException(`tipo inválido. Use um de: ${[...TIPOS_VALIDOS].join(', ')}`);
    }
    if (dto.descricao && dto.descricao.length > MAX_DESCRICAO_LEN) {
      throw new BadRequestException(`descricao excede ${MAX_DESCRICAO_LEN} caracteres`);
    }
    if (dto.emailContato && dto.emailContato.length > 254) {
      throw new BadRequestException('emailContato muito longo');
    }

    const protocolo = gerarProtocolo();

    const denuncia = await this.prisma.denuncias.create({
      data: {
        protocolo,
        criadoPorId: dto.usuarioId ?? null,
        emailContato: dto.usuarioId ? null : dto.emailContato ?? null,
        motivo,
        descricao: dto.descricao ?? null,
        tipo: (dto.tipo || 'TERREIRO').toUpperCase(),
        entidadeId: dto.entidadeId,
        terreiroId: dto.terreiroId ?? null,
      },
    });

    return {
      id: denuncia.id,
      protocolo: denuncia.protocolo,
      status: denuncia.status,
      mensagem:
        'Denúncia registrada. Nosso time fará a triagem com confidencialidade. Acompanhe o status pelo protocolo.',
    };
  }

  /** Acompanhamento público de status — retorna apenas dados não sensíveis. */
  async consultarPorProtocolo(protocolo: string) {
    const denuncia = await this.prisma.denuncias.findUnique({ where: { protocolo } });
    if (!denuncia) throw new NotFoundException('Protocolo não encontrado');

    return {
      protocolo: denuncia.protocolo,
      status: denuncia.status,
      criadaEm: denuncia.createdAt,
      resolvidoEm: denuncia.resolvidoEm,
    };
  }

  async listarMinhas(usuarioId: string, limite = 50, offset = 0) {
    const [data, total] = await Promise.all([
      this.prisma.denuncias.findMany({
        where: { criadoPorId: usuarioId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.denuncias.count({ where: { criadoPorId: usuarioId } }),
    ]);

    return {
      data: data.map((d) => ({
        id: d.id,
        protocolo: d.protocolo,
        motivo: d.motivo,
        tipo: d.tipo,
        status: d.status,
        createdAt: d.createdAt,
        resolvidoEm: d.resolvidoEm,
      })),
      total,
    };
  }

  async listar(status?: string, limite = 50, offset = 0) {
    const where: any = {};
    if (status) {
      const s = status.toUpperCase();
      if (!STATUS_VALIDOS.has(s)) {
        throw new BadRequestException(`status inválido. Use um de: ${[...STATUS_VALIDOS].join(', ')}`);
      }
      where.status = s;
    }

    const [data, total] = await Promise.all([
      this.prisma.denuncias.findMany({
        where,
        include: {
          criadoPor: { select: { id: true, nome: true, email: true } },
          revisadoPor: { select: { id: true, nome: true } },
          terreiro: { select: { id: true, nome: true, slug: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.denuncias.count({ where }),
    ]);

    return { data, total };
  }

  async resolver(denunciaId: string, revisorId: string, bloquearTerreiro = false) {
    const denuncia = await this.prisma.denuncias.findUnique({ where: { id: denunciaId } });
    if (!denuncia) throw new NotFoundException('Denúncia não encontrada');

    await this.prisma.denuncias.update({
      where: { id: denunciaId },
      data: { status: DenunciaStatus.RESOLVIDA, revisadoPorId: revisorId, resolvidoEm: new Date() },
    });

      if (bloquearTerreiro && denuncia.terreiroId) {
        await this.prisma.terreiros.update({
          where: { id: denuncia.terreiroId },
          data: { status: 'BLOQUEADO', isPublished: false },
        });
        const terreiro = await this.prisma.terreiros.findUnique({
          where: { id: denuncia.terreiroId },
          select: { dirigenteId: true, nome: true },
        });
        if (terreiro?.dirigenteId) {
          await this.notificacoes.criar(terreiro.dirigenteId, {
            tipo: 'TERREIRO_BLOQUEADO',
            titulo: 'Seu terreiro foi bloqueado',
            mensagem: `O terreiro ${terreiro.nome} foi bloqueado após análise de uma denúncia.`,
          });
        }
      }

      if (denuncia.criadoPorId) {
        await this.notificacoes.criar(denuncia.criadoPorId, {
          tipo: 'DENUNCIA_RESOLVIDA',
          titulo: 'Sua denúncia foi analisada',
          mensagem: bloquearTerreiro
            ? 'A denúncia foi confirmada e as medidas cabíveis foram tomadas.'
            : 'A denúncia foi analisada. Agradecemos sua contribuição.',
        });
      }

      return { id: denunciaId, protocolo: denuncia.protocolo, status: DenunciaStatus.RESOLVIDA, bloqueado: bloquearTerreiro && !!denuncia.terreiroId };
  }
}
