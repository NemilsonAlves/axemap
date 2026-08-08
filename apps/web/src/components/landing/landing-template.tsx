import { LandingBreadcrumb } from './landing-breadcrumb';
import { LandingHero } from './landing-hero';
import { LandingStats } from './landing-stats';
import { LandingFaq } from './landing-faq';
import { LandingPanorama } from './landing-panorama';
import { LandingExtendedStats } from './landing-extended-stats';
import { LandingTimeline } from './landing-timeline';
import { LandingDistribution } from './landing-distribution';
import { LandingDiscovery } from './landing-discovery';
import {
  JsonLd,
  websiteSchema,
  organizationSchema,
  collectionPageSchema,
  datasetSchema,
  itemListSchema,
} from '@/lib/seo/json-ld';
import type { EstatisticasCompletas, DiscoveryData, FAQ } from '@/lib/seo/types';
import type { TerreiroBasico } from '@/lib/seo/types';

interface Crumb {
  label: string;
  href?: string;
}

interface StatsData {
  trustScoreMedio: number;
  totalTerreiro: number;
  totalVerificados: number;
  tradicoes?: Array<{ nome: string; count: number }>;
}

export function LandingTemplate({
  titulo,
  subtitulo,
  breadcrumb,
  stats,
  filters,
  children,
  faqs,
  panorama,
  perfilComunidade,
  estatisticas,
  discovery,
  terreiros,
}: {
  titulo: string;
  subtitulo: string;
  breadcrumb: Crumb[];
  stats: StatsData;
  filters?: React.ReactNode;
  children: React.ReactNode;
  faqs?: FAQ[];
  panorama?: string;
  perfilComunidade?: string;
  estatisticas?: EstatisticasCompletas;
  discovery?: DiscoveryData;
  terreiros?: TerreiroBasico[];
}) {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />
      {titulo && (
        <JsonLd
          data={collectionPageSchema(titulo, subtitulo || '', breadcrumb[breadcrumb.length - 1]?.href || '/')}
        />
      )}
      {estatisticas && (
        <JsonLd
          data={datasetSchema(
            `Estatísticas - ${titulo}`,
            'Dados agregados do AxéMap',
            [
              { name: 'Total de Terreiros', value: estatisticas.totalTerreiro },
              { name: 'Total Verificados', value: estatisticas.totalVerificados },
              { name: 'Trust Score Médio', value: estatisticas.trustScoreMedio },
              { name: 'Total Avaliações', value: estatisticas.totalAvaliacoes },
              { name: 'Média Avaliações', value: estatisticas.mediaAvaliacoes },
              { name: 'Total Eventos', value: estatisticas.totalEventos },
              { name: 'Total Cursos', value: estatisticas.totalCursos },
              { name: 'Total Ações Sociais', value: estatisticas.totalAcoesSociais },
              { name: 'Total Dirigentes', value: estatisticas.totalDirigentes },
            ],
          )}
        />
      )}
      {terreiros && terreiros.length > 0 && (
        <JsonLd
          data={itemListSchema(
            terreiros.map((t) => ({ name: t.nome, url: `/terreiro/${t.slug}` })),
            'Place',
          )}
        />
      )}
      <LandingBreadcrumb items={breadcrumb} />
      <LandingHero
        titulo={titulo}
        subtitulo={subtitulo}
        totalTerreiro={stats.totalTerreiro}
        totalVerificados={stats.totalVerificados}
      />
      <LandingStats
        trustScoreMedio={stats.trustScoreMedio}
        totalTerreiro={stats.totalTerreiro}
        totalVerificados={stats.totalVerificados}
        tradicoes={stats.tradicoes}
      />
      {(panorama || perfilComunidade) && (
        <LandingPanorama panorama={panorama || ''} perfilComunidade={perfilComunidade || ''} />
      )}
      {estatisticas && <LandingExtendedStats estatisticas={estatisticas} />}
      {estatisticas && estatisticas.evolucaoCadastros && (
        <LandingTimeline evolucaoCadastros={estatisticas.evolucaoCadastros} />
      )}
      {estatisticas && estatisticas.distribuicaoTradicoes && (
        <LandingDistribution
          distribuicao={estatisticas.distribuicaoTradicoes.map((t) => ({
            label: t.label,
            count: t.count,
          }))}
          total={estatisticas.totalTerreiro}
          title="Distribuição por Tradição"
        />
      )}
      {discovery && <LandingDiscovery discovery={discovery} />}
      {filters && <div className="mb-6">{filters}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {children}
      </div>
      {faqs && faqs.length > 0 && <LandingFaq faqs={faqs} />}
    </>
  );
}
