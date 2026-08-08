import type { TerreiroPerfil } from '@/types/terreiro';
import { BookOpenText, FileText, Video, Mic, Link as LinkIcon } from 'lucide-react';

const TIPO_ICONE: Record<string, typeof FileText> = {
  LIVRO: BookOpenText,
  ARTIGO: FileText,
  PESQUISA: FileText,
  VIDEO: Video,
  PODCAST: Mic,
  DOCUMENTO: FileText,
};

export function BibliotecaSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  if (!terreiro.conteudos.length) return null;

  return (
    <section className="section-card" id="biblioteca">
      <div className="flex items-center gap-2">
        <BookOpenText className="size-5 text-copper" />
        <h2 className="section-title">Biblioteca</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {terreiro.conteudos.map((c) => {
          const Icon = TIPO_ICONE[c.tipo] ?? FileText;
          return (
            <div key={c.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-copper-soft text-copper-strong">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-card-foreground">{c.titulo}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="uppercase tracking-wide">{c.tipo}</span>
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-copper hover:underline">
                      <LinkIcon className="size-3" /> Acessar
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}