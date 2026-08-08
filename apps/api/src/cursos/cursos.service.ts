import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  private async verificarDirigente(usuarioId: string, terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      select: { dirigenteId: true },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');
    if (terreiro.dirigenteId !== usuarioId) {
      throw new ForbiddenException('Apenas o dirigente do terreiro pode gerenciar cursos');
    }
  }

  async criar(usuarioId: string, dto: {
    terreiroId: string; titulo: string; descricao?: string; modalidade?: string;
    cargaHoraria?: number; vagas?: number; dataInicio?: string; dataFim?: string;
  }) {
    if (!dto.terreiroId || !dto.titulo) {
      throw new BadRequestException('terreiroId e titulo são obrigatórios');
    }
    await this.verificarDirigente(usuarioId, dto.terreiroId);

    return this.prisma.cursos.create({
      data: {
        terreiroId: dto.terreiroId,
        titulo: dto.titulo,
        descricao: dto.descricao ?? null,
        modalidade: dto.modalidade ?? null,
        cargaHoraria: dto.cargaHoraria ?? null,
        vagas: dto.vagas ?? null,
        dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : null,
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      },
      include: { terreiro: { select: { id: true, nome: true, slug: true } } },
    });
  }

  async listar(terreiroId?: string, limite = 20, offset = 0) {
    const where: any = { deletedAt: null };
    if (terreiroId) where.terreiroId = terreiroId;

    const [data, total] = await Promise.all([
      this.prisma.cursos.findMany({
        where,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
          _count: { select: { matriculas: { where: { status: 'CONFIRMADO' } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limite, 100),
        skip: offset,
      }),
      this.prisma.cursos.count({ where }),
    ]);

    return { data, total };
  }

  async buscar(id: string) {
    const curso = await this.prisma.cursos.findFirst({
      where: { id, deletedAt: null },
      include: {
        terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        _count: { select: { matriculas: { where: { status: 'CONFIRMADO' } } } },
      },
    });
    if (!curso) throw new NotFoundException('Curso não encontrado');
    return curso;
  }

  async atualizar(usuarioId: string, id: string, dto: {
    titulo?: string; descricao?: string; modalidade?: string;
    cargaHoraria?: number; vagas?: number; dataInicio?: string; dataFim?: string;
  }) {
    const curso = await this.buscar(id);
    await this.verificarDirigente(usuarioId, curso.terreiroId);

    return this.prisma.cursos.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.modalidade !== undefined ? { modalidade: dto.modalidade } : {}),
        ...(dto.cargaHoraria !== undefined ? { cargaHoraria: dto.cargaHoraria } : {}),
        ...(dto.vagas !== undefined ? { vagas: dto.vagas } : {}),
        ...(dto.dataInicio !== undefined ? { dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : null } : {}),
        ...(dto.dataFim !== undefined ? { dataFim: dto.dataFim ? new Date(dto.dataFim) : null } : {}),
      },
    });
  }

  async remover(usuarioId: string, id: string) {
    const curso = await this.buscar(id);
    await this.verificarDirigente(usuarioId, curso.terreiroId);
    return this.prisma.cursos.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async matricular(usuarioId: string, cursoId: string) {
    const curso = await this.buscar(cursoId);
    if (curso.vagas) {
      const matriculados = await this.prisma.matriculasCurso.count({
        where: { cursoId, status: 'CONFIRMADO' },
      });
      if (matriculados >= curso.vagas) {
        throw new ConflictException('Curso sem vagas disponíveis');
      }
    }

    const existing = await this.prisma.matriculasCurso.findUnique({
      where: { usuarioId_cursoId: { usuarioId, cursoId } },
    });
    if (existing) {
      if (existing.status === 'CANCELADO') {
        return this.prisma.matriculasCurso.update({
          where: { id: existing.id },
          data: { status: 'CONFIRMADO' },
        });
      }
      throw new ConflictException('Você já está matriculado neste curso');
    }

    return this.prisma.matriculasCurso.create({
      data: { usuarioId, cursoId, status: 'CONFIRMADO' },
    });
  }

  async cancelarMatricula(usuarioId: string, cursoId: string) {
    const existing = await this.prisma.matriculasCurso.findUnique({
      where: { usuarioId_cursoId: { usuarioId, cursoId } },
    });
    if (!existing) throw new NotFoundException('Matrícula não encontrada');

    return this.prisma.matriculasCurso.update({
      where: { id: existing.id },
      data: { status: 'CANCELADO' },
    });
  }

  async listarMatriculas(usuarioId: string, cursoId: string) {
    const curso = await this.buscar(cursoId);
    await this.verificarDirigente(usuarioId, curso.terreiroId);

    return this.prisma.matriculasCurso.findMany({
      where: { cursoId, status: 'CONFIRMADO' },
      include: { usuario: { select: { id: true, nome: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async cancelarMatriculaDirigente(usuarioId: string, cursoId: string, matriculaId: string) {
    const curso = await this.buscar(cursoId);
    await this.verificarDirigente(usuarioId, curso.terreiroId);

    const matricula = await this.prisma.matriculasCurso.findUnique({
      where: { id: matriculaId },
    });
    if (!matricula || matricula.cursoId !== cursoId) {
      throw new NotFoundException('Matrícula não encontrada neste curso');
    }

    return this.prisma.matriculasCurso.update({
      where: { id: matriculaId },
      data: { status: 'CANCELADO' },
    });
  }

  async meusCursos(usuarioId: string) {
    return this.prisma.matriculasCurso.findMany({
      where: { usuarioId, status: 'CONFIRMADO' },
      include: {
        curso: {
          include: {
            terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
