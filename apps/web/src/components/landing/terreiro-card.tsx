import Link from 'next/link';
import { placeSchema, JsonLd } from '@/lib/seo/json-ld';
import type { TerreiroBasico } from '@/lib/seo/types';

export function TerreiroCard({ terreiro }: { terreiro: TerreiroBasico }) {
  return (
    <>
      <JsonLd data={placeSchema(terreiro)} />
      <Link
        href={`/terreiro/${terreiro.slug}`}
        className="group block bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      >
        {terreiro.fotoUrl && (
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={terreiro.fotoUrl}
              alt={terreiro.nome}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {terreiro.nome}
            </h3>
            {terreiro.isVerified && (
              <span className="shrink-0 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                Verificado
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {terreiro.descricaoCurta || `${terreiro.cidade}, ${terreiro.estado}`}
          </p>
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <span className="bg-secondary px-2 py-0.5 rounded">
              {terreiro.tradicao.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span>{terreiro.cidade}, {terreiro.estado}</span>
            <span className="ml-auto font-semibold text-amber-600">
              ★ {terreiro.trustScore.toFixed(1)}
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}
