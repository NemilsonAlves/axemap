import type { Metadata } from 'next';
import { fetchDiscovery } from '@/lib/seo/fetch-discovery';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';
import { CampaignCard, type CampaignSummary } from '@/components/campanhas/campaign-card';
import { HandHeart } from 'lucide-react';

export const revalidate = 150;

export const metadata: Metadata = {
  title: 'Axé Map Impacto — Apoie campanhas da comunidade',
  description:
    'Apoie campanhas sociais, culturais e comunitárias de terreiros e instituições. Transparência, verificação e prestação de contas em cada projeto.',
  openGraph: {
    title: 'Axé Map Impacto',
    description: 'Apoie campanhas da comunidade com transparência e verificação.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  alternates: { canonical: 'https://axemap.com.br/campanhas' },
  robots: { index: true, follow: true },
};

interface ListResponse {
  data: CampaignSummary[];
  total: number;
}

export default async function CampanhasPage() {
  const res = await fetchDiscovery<ListResponse>('/campanhas?limit=24', 150);
  const campanhas = res?.data ?? [];

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-turquoise-soft/40 to-card">
        <div className="container-page py-12 md:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-turquoise/25 bg-turquoise/10 px-3 py-1 text-xs font-semibold text-turquoise-strong">
            <HandHeart className="size-3.5" /> Axé Map Impacto
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-card-foreground md:text-5xl">
            Campanhas que{' '}
            <span className="bg-gradient-to-r from-turquoise to-turquoise-strong bg-clip-text text-transparent">
              transformam
            </span>{' '}
            a comunidade
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Apoie projetos sociais, culturais e de preservação. Cada campanha passa por verificação,
            revisão humana e prestação de contas aberta.
          </p>
        </div>
      </section>

      <div className="container-page py-10">
        {campanhas.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            Nenhuma campanha disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {campanhas.map((c) => (
              <CampaignCard key={c.id} campanha={c} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}