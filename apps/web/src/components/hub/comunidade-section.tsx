import type { TerreiroPerfil } from '@/types/terreiro';
import { Users, MessagesSquare, PenSquare, BookmarkPlus } from 'lucide-react';

export function ComunidadeSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  return (
    <section className="section-card" id="comunidade">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-turquoise" />
        <h2 className="section-title">Comunidade</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Users className="size-5 text-copper" />
          <div>
            <div className="text-lg font-bold text-card-foreground">{terreiro.hub.seguidores}</div>
            <div className="text-xs text-muted-foreground">seguidores</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Users className="size-5 text-copper" />
          <div>
            <div className="text-lg font-bold text-card-foreground">{terreiro.hub.membros}</div>
            <div className="text-xs text-muted-foreground">membros participantes</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: MessagesSquare, title: 'Discussões', desc: 'Participe de conversas respeitosas sobre a casa e a tradição.' },
          { icon: PenSquare, title: 'Publicações', desc: 'Acompanhe novidades publicadas pela própria comunidade.' },
          { icon: BookmarkPlus, title: 'Participação', desc: 'Contribua com projetos colaborativos e acompanhe resultados.' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
              <Icon className="size-6 text-turquoise" />
              <div className="text-sm font-semibold text-card-foreground">{c.title}</div>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}