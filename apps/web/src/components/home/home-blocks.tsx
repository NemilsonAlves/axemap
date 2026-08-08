import Link from 'next/link';
import { RecommendationCard, EventoSimplesCard, CursoSimplesCard } from './discovery-cards';

interface BlocoHome {
  id: string;
  titulo: string;
  subtitulo: string;
  tipo: string;
  itens: any[];
  linkVerMais?: string;
}

export function BlocoSection({ bloco }: { bloco: BlocoHome }) {
  if (!bloco.itens?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{bloco.titulo}</h2>
          {bloco.subtitulo && (
            <p className="text-sm text-muted-foreground mt-0.5">{bloco.subtitulo}</p>
          )}
        </div>
        {bloco.linkVerMais && (
          <Link
            href={bloco.linkVerMais}
            className="text-sm text-primary hover:underline font-medium shrink-0"
          >
            Ver todos &rarr;
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {bloco.tipo === 'terreiros' && bloco.itens.map((item: any) => (
          <RecommendationCard key={item.terreiroId || item.id} item={item} />
        ))}
        {bloco.tipo === 'eventos' && bloco.itens.map((item: any) => (
          <EventoSimplesCard key={item.id} item={item} />
        ))}
        {bloco.tipo === 'cursos' && bloco.itens.map((item: any) => (
          <CursoSimplesCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
