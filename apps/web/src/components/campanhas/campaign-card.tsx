import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BadgeCheck, Heart, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const CATEGORIA_LABEL: Record<string, string> = {
  SOCIAL: 'Social',
  CULTURAL: 'Cultural',
  EDUCACIONAL: 'Educacional',
  AMBIENTAL: 'Ambiental',
  EMERGENCIAL: 'Emergencial',
  INFRAESTRUTURA: 'Infraestrutura',
  PATRIMONIO_HISTORICO: 'Patrimônio Histórico',
  PESQUISA: 'Pesquisa',
  JUVENTUDE: 'Juventude',
  INCLUSAO: 'Inclusão',
  EVENTOS: 'Eventos',
};

export interface CampaignSummary {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  categoria: string;
  metaFinanceira: number;
  arrecadado: number;
  apoiadoresCount: number;
  nivelVerificacao: string;
  cidade?: string | null;
  estado?: string | null;
  imagemUrl?: string | null;
  trustScore?: number | null;
}

const NIVEL_LABEL: Record<string, { label: string; variant: 'success' | 'info' | 'muted' }> = {
  VERIFICADA: { label: 'Verificada', variant: 'success' },
  OFICIAL: { label: 'Oficial', variant: 'info' },
  NAO_VERIFICADA: { label: 'Não verificada', variant: 'muted' },
};

export function CampaignCard({ campanha }: { campanha: CampaignSummary }) {
  const pct = campanha.metaFinanceira > 0
    ? Math.min(100, Math.round((campanha.arrecadado / campanha.metaFinanceira) * 100))
    : 0;
  const nivel = NIVEL_LABEL[campanha.nivelVerificacao] ?? NIVEL_LABEL.NAO_VERIFICADA;

  return (
    <Link
      href={`/campanhas/${campanha.slug}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-[var(--duration-base)] group-hover:-translate-y-0.5 group-hover:border-turquoise/40 group-hover:shadow-lg">
        <div className="relative h-40 overflow-hidden bg-turquoise-soft">
          {campanha.imagemUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={campanha.imagemUrl} alt={campanha.titulo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-turquoise/15 to-turquoise-soft">
              <Heart className="size-10 text-turquoise" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="outline" className="bg-card/90 backdrop-blur">
              {CATEGORIA_LABEL[campanha.categoria] ?? campanha.categoria}
            </Badge>
          </div>
          {nivel.label !== 'Não verificada' && (
            <Badge variant={nivel.variant} className="absolute right-3 top-3 bg-card/90 backdrop-blur">
              <BadgeCheck className="size-3" /> {nivel.label}
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-display text-base font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-turquoise-strong">
            {campanha.titulo}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{campanha.descricao}</p>

          <div className="mt-auto space-y-3">
            <Progress value={pct} indicatorClassName="bg-turquoise group-hover:bg-turquoise-strong" />
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-turquoise-strong">{brl.format(campanha.arrecadado)}</div>
                <div className="text-xs text-muted-foreground">
                  de {brl.format(campanha.metaFinanceira)}{' '}
                  <span className="font-semibold text-turquoise-strong">({pct}%)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" /> {campanha.apoiadoresCount}
              </div>
            </div>
            {campanha.cidade && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {campanha.cidade}
                {campanha.estado ? `, ${campanha.estado}` : ''}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}