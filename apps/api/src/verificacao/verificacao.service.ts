import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UploadService } from '../upload/upload.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { UserRole } from '@axemap/shared';

const TIPOS_VALIDOS = new Set(['CNPJ', 'REGISTRO', 'RESPONSAVEL', 'ENDERECO', 'OUTROS']);

@Injectable()
export class VerificacaoService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
    private auditLogs: AuditLogsService,
    private notificacoes: NotificacoesService,
  ) {}

  private async validarAcesso(usuario: { id: string; role?: string }, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({ where: { id: terreiroId } });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    const isAdmin = usuario.role === UserRole.ADMIN || usuario.role === UserRole.SUPER_ADMIN;
    if (terreiro.dirigenteId !== usuario.id && !isAdmin) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar a verificação');
    }
    return terreiro;
  }

  async enviar(
    usuario: { id: string; role?: string },
    terreiroId: string,
    tipo: string,
    file?: Express.Multer.File,
  ) {
    const terreiro = await this.validarAcesso(usuario, terreiroId);
    if (!file) throw new BadRequestException('Envie o arquivo do documento');
    if (!tipo || !TIPOS_VALIDOS.has(tipo)) {
      throw new BadRequestException('Tipo de documento inválido. Use: CNPJ, REGISTRO, RESPONSAVEL, ENDERECO ou OUTROS');
    }

    const upload = await this.uploadService.uploadArquivo(usuario.id, file, 'documentos');

    const doc = await this.prisma.documentosVerificacao.create({
      data: { terreiroId: terreiro.id, tipo, arquivoUrl: upload.url },
    });

    await this.auditLogs.registrar(usuario.id, 'ENVIAR_DOCUMENTO', 'DocumentosVerificacao', doc.id, {
      depois: { tipo, status: doc.status },
    });

    return doc;
  }

  async listar(usuario: { id: string; role?: string }, terreiroId?: string) {
    const isAdmin = usuario.role === UserRole.ADMIN || usuario.role === UserRole.SUPER_ADMIN;
    if (terreiroId) {
      await this.validarAcesso(usuario, terreiroId);
      return this.prisma.documentosVerificacao.findMany({
        where: { terreiroId },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.documentosVerificacao.findMany({
      where: isAdmin ? {} : { terreiro: { dirigenteId: usuario.id } },
      include: { terreiro: { select: { id: true, nome: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listarPendentes(usuario: { id: string; role?: string }, limite = 50, offset = 0) {
    const isAdmin = usuario.role === UserRole.ADMIN || usuario.role === UserRole.SUPER_ADMIN;
    if (!isAdmin) throw new ForbiddenException('Apenas administradores podem listar documentos pendentes');
    return this.prisma.documentosVerificacao.findMany({
      where: { status: 'PENDENTE' },
      include: { terreiro: { select: { id: true, nome: true, slug: true, dirigenteId: true } } },
      orderBy: { createdAt: 'asc' },
      take: limite,
      skip: offset,
    });
  }

  async revisar(
    usuario: { id: string; role?: string },
    id: string,
    status: string,
    motivo?: string,
  ) {
    const isAdmin = usuario.role === UserRole.ADMIN || usuario.role === UserRole.SUPER_ADMIN;
    if (!isAdmin) throw new ForbiddenException('Apenas administradores podem revisar documentos');

    const doc = await this.prisma.documentosVerificacao.findUnique({
      where: { id },
      include: { terreiro: { select: { id: true, nome: true, dirigenteId: true } } },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');

    const novoStatus = status === 'APROVADO' ? 'APROVADO' : 'REJEITADO';

    const updated = await this.prisma.documentosVerificacao.update({
      where: { id },
      data: { status: novoStatus },
    });

    if (novoStatus === 'APROVADO') {
      await this.prisma.terreiros.update({ where: { id: doc.terreiroId }, data: { isVerified: true } });
    }

    await this.auditLogs.registrar(usuario.id, 'REVISAR_DOCUMENTO', 'DocumentosVerificacao', id, {
      antes: { status: doc.status },
      depois: { status: novoStatus, motivo },
    });

    const dirigenteId = doc.terreiro.dirigenteId;
    if (!dirigenteId) return updated;

    await this.notificacoes.criar(dirigenteId, {
      tipo: 'VERIFICACAO',
      titulo: novoStatus === 'APROVADO' ? 'Terreiro verificado' : 'Documento recusado',
      mensagem:
        novoStatus === 'APROVADO'
          ? `Parabéns! O terreiro ${doc.terreiro.nome} foi verificado e agora exibe o selo de verificado.`
          : motivo || 'O documento enviado não foi aprovado. Envie um novo documento com informações válidas.',
    });

    return updated;
  }
}
