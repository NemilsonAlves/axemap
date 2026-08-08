import type { TerreiroPerfil } from '@/types/terreiro';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Crown } from 'lucide-react';

export function LiderancaSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const lider = terreiro.dirigente;
  const iniciais = (lider?.nome ?? terreiro.nome)
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <section className="section-card" id="lideranca">
      <div className="flex items-center gap-2">
        <Crown className="size-5 text-copper" />
        <h2 className="section-title">Liderança</h2>
      </div>

      <div className="mt-4 flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <Avatar className="size-16">
          <AvatarImage src={lider?.avatarUrl ?? undefined} alt={lider?.nome ?? 'Liderança'} />
          <AvatarFallback className="bg-copper text-white">{iniciais}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground">{lider?.nome ?? terreiro.nome}</h3>
          <p className="text-sm text-muted-foreground">Dirigente responsável pela casa</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            Guardião(ã) da tradição, conduz a comunidade com respeito e dedicação,
            acolhendo filhos e filhas de santo e toda a comunidade ao redor.
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 text-center sm:gap-2">
          <div>
            <div className="text-2xl font-bold text-copper-strong">{terreiro.lideranca.tempoAtuacaoAnos}</div>
            <div className="text-xs text-muted-foreground">anos de atuação</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-copper-strong">{terreiro.acoesSociais.length}</div>
            <div className="text-xs text-muted-foreground">projetos sociais</div>
          </div>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="size-4" />
        {terreiro.hub.membros} membros participam da comunidade.
      </p>
      <p className="mt-2 text-xs italic text-muted-foreground">
        Valorizamos a liderança sem transformá-la em ranking — cada casa tem seu valor e sua história.
      </p>
    </section>
  );
}