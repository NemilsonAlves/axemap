import { Injectable, NotFoundException } from '@nestjs/common';
import { VerificationLevel } from '@axemap/shared';
import { PrismaService } from '../database/prisma.service';

interface Componente {
  chave: string;
  label: string;
  peso: number;
  valor: number;
  detalhe: string;
}

const VERIFICACAO_PONTOS: Record<VerificationLevel, number> = {
  BASICO: 20,
  DOCUMENTAL: 40,
  COMUNITARIO: 60,
  AVANCADO: 80,
  COMPLETO: 100,
};

@Injectable()
export class TrustScoreService {
  constructor(private prisma: PrismaService) {}

  async recalcular(terreiroId: string) {
    const terreiro = await this.prisma.terreiros.findUnique({
      where: { id: terreiroId },
      include: {
        _count: { select: { fotos: true, eventos: true, avaliacoes: true, seguidores: true } },
        avaliacoes: { where: { deletedAt: null }, select: { nota: true } },
      },
    });
    if (!terreiro) throw new NotFoundException('Terreiro não encontrado');

    const componentes = this.calcularComponentes(terreiro);
    const score = Math.round(
      componentes.reduce((s, c) => s + c.valor * c.peso, 0) * 10,
    ) / 10;

    await this.prisma.terreiros.update({
      where: { id: terreiroId },
      data: { trustScore: score },
    });

    return {
      score,
      componentes: componentes.map(c => ({ ...c, contribuicao: Math.round(c.valor * c.peso * 10) / 10 })),
    };
  }

  private calcularComponentes(terreiro: any): Componente[] {
    return [
      this.completude(terreiro),
      this.verificacao(terreiro),
      this.reputacao(terreiro),
      this.frescor(terreiro),
      this.engajamento(terreiro),
    ];
  }

  private completude(terreiro: any): Componente {
    const checks = [
      !!terreiro.fotoUrl,
      !!terreiro.descricaoLonga,
      !!terreiro.telefone,
      !!terreiro.whatsapp,
      !!terreiro.horarioFuncionamento,
      (terreiro._count?.fotos || 0) > 0,
      !!terreiro.anoFundacao,
      !!terreiro.linhagem,
      !!terreiro.instagram,
      !!terreiro.website,
      !!terreiro.codigoIndicacao,
    ];
    const ok = checks.filter(Boolean).length;
    const valor = Math.round((ok / checks.length) * 100);
    return { chave: 'completude', label: 'Completude do perfil', peso: 0.25, valor, detalhe: `${ok}/${checks.length} campos preenchidos` };
  }

  private verificacao(terreiro: any): Componente {
    const base = VERIFICACAO_PONTOS[terreiro.verificationLevel as VerificationLevel] ?? 0;
    const bonus = terreiro.isVerified ? 20 : 0;
    const valor = Math.min(100, base + bonus);
    return {
      chave: 'verificacao',
      label: 'Verificação',
      peso: 0.3,
      valor,
      detalhe: `Nível ${terreiro.verificationLevel}${terreiro.isVerified ? ' + selo verificado' : ''}`,
    };
  }

  private reputacao(terreiro: any): Componente {
    const avaliacoes = terreiro.avaliacoes || [];
    if (avaliacoes.length === 0) {
      return { chave: 'reputacao', label: 'Reputação', peso: 0.2, valor: 0, detalhe: 'Sem avaliações' };
    }
    const media = avaliacoes.reduce((s: number, a: any) => s + a.nota, 0) / avaliacoes.length;
    const cobertura = Math.min(1, avaliacoes.length / 10);
    const valor = Math.round((media / 5) * 100 * (0.6 + 0.4 * cobertura));
    return {
      chave: 'reputacao',
      label: 'Reputação',
      peso: 0.2,
      valor: Math.min(100, valor),
      detalhe: `${avaliacoes.length} avaliação(ões), média ${media.toFixed(1)}/5`,
    };
  }

  private frescor(terreiro: any): Componente {
    const referencia = terreiro.updatedAt ? new Date(terreiro.updatedAt) : new Date(0);
    const dias = Math.max(0, (Date.now() - referencia.getTime()) / 86400000);
    const valor = Math.max(0, Math.round(100 - dias * 1.5));
    return {
      chave: 'frescor',
      label: 'Frescor dos dados',
      peso: 0.1,
      valor,
      detalhe: `Última atualização há ${Math.round(dias)} dia(s)`,
    };
  }

  private engajamento(terreiro: any): Componente {
    const eventos = terreiro._count?.eventos || 0;
    const fotos = terreiro._count?.fotos || 0;
    const seguidores = terreiro._count?.seguidores || 0;
    const pontos = Math.min(eventos * 15, 60) + Math.min(fotos * 5, 25) + Math.min(seguidores * 2, 15);
    return {
      chave: 'engajamento',
      label: 'Engajamento',
      peso: 0.15,
      valor: Math.min(100, pontos),
      detalhe: `${eventos} evento(s), ${fotos} foto(s), ${seguidores} seguidor(es)`,
    };
  }
}
