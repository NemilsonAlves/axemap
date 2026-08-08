import type { TerreiroPerfil } from '@/types/terreiro';
import { Timeline } from '@/components/ui/timeline';
import { Landmark, Sparkles } from 'lucide-react';

export function HistoriaSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const fundo = terreiro.descricaoLonga || terreiro.descricaoCurta;

  const marcos: { title: string; description?: string; date?: string; status?: 'default' | 'success' | 'danger' | 'warning' | 'copper' }[] = [];

  if (terreiro.anoFundacao) {
    marcos.push({
      title: `Fundação — ${terreiro.anoFundacao}`,
      description: terreiro.linhagem
        ? `Linhagem: ${terreiro.linhagem}.`
        : 'Início da caminhada dessa casa. São mais de uma década de axé.',
      date: String(terreiro.anoFundacao),
      status: 'copper',
    });
  }

  for (const projeto of terreiro.acoesSociais) {
    marcos.push({
      title: projeto.nome,
      description: projeto.descricao ?? 'Projeto comunitário da casa.',
      date: projeto.data ? new Date(projeto.data).getFullYear().toString() : undefined,
      status: 'success',
    });
  }

  return (
    <section className="section-card" id="historia">
      <div className="flex items-center gap-2">
        <Landmark className="size-5 text-copper" />
        <h2 className="section-title">Nossa História</h2>
      </div>

      {fundo && (
        <p className="sobre-texto mt-3">{fundo}</p>
      )}

      <div className="mt-4">
        <Timeline items={marcos} />
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-copper" />
        Relato institucional apresentado pela própria comunidade. Conteúdo respeitoso, sem juízo de valor externo.
      </p>
    </section>
  );
}