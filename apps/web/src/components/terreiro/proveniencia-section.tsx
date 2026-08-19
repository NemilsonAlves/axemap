import type { TerreiroPerfil } from '@/types/terreiro';
import Link from 'next/link';
import { Info, ShieldCheck, FileCheck2, CalendarClock, UserPen, Scale } from 'lucide-react';

function formatarData(data?: string | null): string {
  if (!data) return 'Data não informada';
  try {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return data;
  }
}

interface FonteInfo {
  rotulo: string;
  descricao: string;
}

function fonteDoNivel(nivelVerificacao: string | null | undefined, verificado: boolean, documentosValidos: number): FonteInfo {
  const nivel = (nivelVerificacao ?? '').toUpperCase();

  if (verificado || documentosValidos > 0 || ['AVANCADO', 'COMPLETO', 'DOCUMENTAL'].includes(nivel)) {
    if (nivel === 'COMPLETO') {
      return {
        rotulo: 'Fonte institucional e documental',
        descricao:
          'Perfil verificado pela plataforma com documentação e confirmação institucional. Isso verifica fatos e dados cadastrados — nunca legitimidade espiritual ou religiosa.',
      };
    }
    return {
      rotulo: 'Fonte documental e comunitária',
      descricao:
        'Informações mantidas pela comunidade e parcialmente verificadas via documentação e contato institucional. Não declara legitimidade religiosa.',
    };
  }

  return {
    rotulo: 'Fonte comunitária declarada',
    descricao:
      'Perfil administrado pela própria comunidade. As informações são declaradas pelo responsável e ainda não verificadas documentalmente pela plataforma.',
  };
}

export function ProvenienciaSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const g = terreiro.governanca;
  const fonte = fonteDoNivel(terreiro.verificationLevel, terreiro.isVerified, g.documentosValidos);

  return (
    <section className="section-card" id="proveniencia" aria-labelledby="proveniencia-titulo">
      <div className="flex items-center gap-2">
        <Info className="size-5 text-copper" />
        <h2 id="proveniencia-titulo" className="section-title">Sobre esta informação</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 sm:col-span-2">
          <UserPen className="mt-0.5 size-5 shrink-0 text-copper" />
          <div>
            <div className="text-sm font-semibold text-card-foreground">{fonte.rotulo}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{fonte.descricao}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <div className="text-sm font-semibold text-card-foreground">Nível de verificação</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {terreiro.verificationLevel ?? 'BASICO'} · {g.documentosValidos} documento(s) validado(s)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-copper" />
          <div>
            <div className="text-sm font-semibold text-card-foreground">Última atualização</div>
            <p className="mt-1 text-xs text-muted-foreground">{formatarData(terreiro.updatedAt)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 sm:col-span-2">
          <Scale className="mt-0.5 size-5 shrink-0 text-copper" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            O selo de verificação reflete o que foi verificado (identidade, contato, localização, documentação) — e quando.
            Ele nunca declara legitimidade espiritual ou religiosa. Para divergências, existem os canais da Central de
            Proteção e da governança cultural.
          </p>
        </div>

        <Link
          href={`/protecao?tipo=TERREIRO&entidadeId=${encodeURIComponent(terreiro.slug)}`}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive/40 hover:text-destructive sm:col-span-2"
        >
          <FileCheck2 className="size-4" />
          Encontrou um erro? Envie uma sugestão de correção
        </Link>
      </div>
    </section>
  );
}