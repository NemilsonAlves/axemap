import Link from 'next/link';

interface RecomendacaoItem {
  terreiroId: string;
  nome: string;
  slug: string;
  tradicao: string;
  trustScore: number;
  isVerified: boolean;
  cidade: string;
  estado: string;
  descricaoCurta: string | null;
  fotoUrl: string | null;
  score: number;
  distanciaKm?: number;
  explicacao: string;
}

export function RecommendationCard({ item }: { item: RecomendacaoItem }) {
  return (
    <Link
      href={`/terreiro/${item.slug}`}
      className="group block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
    >
      {item.fotoUrl && (
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img
            src={item.fotoUrl}
            alt={item.nome}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {item.nome}
          </h3>
          {item.isVerified && (
            <span className="shrink-0 bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              Verif.
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          {item.tradicao.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} &middot; {item.cidade}, {item.estado}
        </p>
        {item.explicacao && (
          <p className="text-[11px] text-muted-foreground/70 italic line-clamp-2">
            {item.explicacao}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="font-semibold text-amber-600">★ {item.trustScore.toFixed(1)}</span>
          {item.distanciaKm !== undefined && (
            <span className="text-muted-foreground">{item.distanciaKm} km</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function EventoSimplesCard({ item, linkPrefixo }: { item: { id: string; titulo: string; tipo: string; dataInicio: string; local: string; terreiroNome: string; terreiroSlug: string; cidade: string; estado: string }; linkPrefixo?: string }) {
  const data = new Date(item.dataInicio);
  const dia = data.getDate();
  const mes = data.toLocaleString('pt-BR', { month: 'short' });

  return (
    <Link
      href={linkPrefixo ? `${linkPrefixo}#evento-${item.id}` : `/terreiro/${item.terreiroSlug}`}
      className="group flex gap-3 bg-card border rounded-lg p-3 hover:shadow-md transition-all"
    >
      <div className="shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold text-primary leading-none">{dia}</span>
        <span className="text-[10px] text-primary capitalize leading-none">{mes}</span>
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {item.titulo}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {item.terreiroNome} &middot; {item.cidade}, {item.estado}
        </p>
        <p className="text-[11px] text-muted-foreground/70 capitalize">{item.tipo.replace(/_/g, ' ').toLowerCase()}</p>
      </div>
    </Link>
  );
}

export function CursoSimplesCard({ item, linkPrefixo }: { item: { id: string; titulo: string; modalidade: string | null; dataInicio: string | null; terreiroNome: string; terreiroSlug: string; cidade: string; estado: string }; linkPrefixo?: string }) {
  return (
    <Link
      href={linkPrefixo ? `${linkPrefixo}#curso-${item.id}` : `/terreiro/${item.terreiroSlug}`}
      className="group flex gap-3 bg-card border rounded-lg p-3 hover:shadow-md transition-all"
    >
      <div className="shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {item.titulo}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {item.terreiroNome} &middot; {item.cidade}, {item.estado}
        </p>
        {item.modalidade && (
          <p className="text-[11px] text-muted-foreground/70">{item.modalidade}</p>
        )}
      </div>
    </Link>
  );
}
