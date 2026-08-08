import type { TerreiroPerfil } from '@/types/terreiro';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CATEGORIA_LABEL } from '@/components/campanhas/campaign-card';
import { HandHeart, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function CampanhasSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  if (!terreiro.campanhas.length) return null;

  return (
    <section className="section-card" id="impacto">
      <div className="flex items-center gap-2">
        <HandHeart className="size-5 text-turquoise" />
        <h2 className="section-title">Campanhas · Axé Map Impacto</h2>
        <Link href="/campanhas" className="ml-auto flex items-center gap-1 text-sm font-medium text-turquoise-strong hover:underline">
          Ver tudo <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {terreiro.campanhas.map((c) => {
          const pct = c.metaFinanceira > 0 ? Math.min(100, Math.round((c.arrecadado / c.metaFinanceira) * 100)) : 0;
          return (
            <Link
              key={c.id}
              href={`/campanhas/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-turquoise/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline">{CATEGORIA_LABEL[c.categoria] ?? c.categoria}</Badge>
                {c.nivelVerificacao !== 'NAO_VERIFICADA' && (
                  <Badge variant="success">Verificada</Badge>
                )}
              </div>
              <h3 className="mt-3 font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-turquoise-strong">
                {c.titulo}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.descricao}</p>
              <Progress value={pct} className="mt-4" indicatorClassName="bg-turquoise" />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-turquoise-strong">{brl.format(c.arrecadado)}</span>
                <span className="text-xs text-muted-foreground">
                  de {brl.format(c.metaFinanceira)} · {pct}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}