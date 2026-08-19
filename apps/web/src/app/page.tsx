import type { Metadata } from 'next';
import { Suspense } from 'react';

import { JsonLd, websiteSchema, organizationSchema, datasetSchema } from '@/lib/seo/json-ld';
import { getHomeData } from '@/components/home/data';
import { HomeHero } from '@/components/home/home-hero';
import { HomeExplore } from '@/components/home/home-explore';
import { HomeTraditions } from '@/components/home/home-traditions';
import { HomeIfa } from '@/components/home/home-ifa';
import { HomeTrust } from '@/components/home/home-trust';
import { HomeVerified } from '@/components/home/home-verified';
import { HomeEvents } from '@/components/home/home-events';
import { HomeEducation } from '@/components/home/home-education';
import { HomeCommunity } from '@/components/home/home-community';
import { HomeImpacto } from '@/components/home/home-marketplace';
import { HomeCadastroGratuito } from '@/components/home/home-cadastro-gratuito';
import { HomeAds } from '@/components/home/home-ads';
import { HomeAI } from '@/components/home/home-ai';
import { HomeStory } from '@/components/home/home-story';
import { HomeNumbers } from '@/components/home/home-numbers';
import { HomeCulture } from '@/components/home/home-culture';
import { HomePartners } from '@/components/home/home-partners';
import { HomeCTA } from '@/components/home/home-cta';
import { HomeMapLoader } from '@/components/home/home-map-loader';
import { HomeRedeInstitucional } from '@/components/home/home-rede-institucional';
import { HomeTvAxemap } from '@/components/home/home-tv-axemap';
import { HomeWelcomePopup } from '@/components/home/home-welcome-popup';
import { HomeAudioPlayer } from '@/components/home/home-audio-player';
import { HomeSearch } from '@/components/home/home-search';
import { HeroSkeleton, SectionsSkeleton } from '@/components/home/home-skeletons';

export const metadata: Metadata = {
  metadataBase: new URL('https://axemap.com.br'),
  title: 'AxéMap — Mapa das Religiões de Matriz Africana no Brasil',
  description:
    'O mapa vivo das tradições de axé no Brasil. Descubra terreiros, casas de Candomblé, Umbanda, Batuque, Tambor de Mina, Jurema e todas as expressões afro-brasileiras — acesso gratuito para a comunidade.',
  keywords: [
    'religiões de matriz africana', 'candomblé', 'umbanda', 'batuque', 'tambor de mina',
    'xangô', 'jurema', 'terreiros', 'casas de santo', 'casas de axé',
    'afro-brasileiro', 'cultura afro-brasileira', 'patrimônio imaterial brasileiro',
    'ifá', 'yorùbá', 'angola', 'jeje', 'ketu',
    'mapa cultural brasil', 'mapa religioso brasil', 'axemap', 'axé map',
    'religiões afro-brasileiras', 'resistência cultural', 'quilombo', 'festa de largo',
    'tradições africanas no brasil', 'axémap brasil',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'AxéMap — Mapa das Religiões de Matriz Africana no Brasil',
    description:
      'Candomblé, Umbanda, Batuque, Tambor de Mina, Xangô, Jurema e muito mais. O mapa gratuito das tradições de axé no Brasil.',
    url: 'https://axemap.com.br',
    siteName: 'AxéMap',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AxéMap — Mapa das Tradições de Axé no Brasil',
    description: 'O mapa vivo das religiões de matriz africana. Acesso gratuito para a comunidade.',
  },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <>
      {/* First-visit institutional popup — client-side, localStorage gated */}
      <HomeWelcomePopup />

      {/* Floating user-initiated audio mini-player */}
      <HomeAudioPlayer />

      {/* ── HERO — Dark section (obsidian) ── */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* ── CONTENT — alternating dark / light sections ── */}
      <Suspense fallback={<SectionsSkeleton />}>
        <ContentSections />
      </Suspense>
    </>
  );
}

async function HeroSection() {
  const data = await getHomeData();
  return <HomeHero data={data} />;
}

async function ContentSections() {
  const data = await getHomeData();
  return (
    <>
      {/* ── Transição Hero → conteúdo: Explore o AxéMap ── */}
      <HomeExplore />

      {/* ── Gold section divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 01 · Busca — light */}
      <HomeSearch explore={data.explore} />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 02 · Tradições — light (BRASIL · MEMÓRIA · ANCESTRALIDADE) */}
      <HomeTraditions explore={data.explore} />

      {/* ── Dark divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 03 · Mapa vivo — dark */}
      <HomeMapLoader />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 04 · Cadastre sua casa — GRATUITO — light */}
      <HomeCadastroGratuito />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 05 · Rede Institucional — federações, associações, institutos — light */}
      <HomeRedeInstitucional />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 06 · TV AxéMap — dark */}
      <HomeTvAxemap />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 07 · Eventos — light */}
      <HomeEvents data={data} />

      {/* ── Dark divider ── */}
      <div className="section-divider-dark" aria-hidden="true" />

      {/* 08 · Cultura e conhecimento — light */}
      <HomeCulture />
      <HomeEducation data={data} />

      {/* ── Dark divider ── */}
      <div className="section-divider-dark" aria-hidden="true" />

      {/* 09 · Ifá — light */}
      <HomeIfa />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 10 · Comunidades verificadas — light */}
      <HomeVerified data={data} />
      <HomeCommunity data={data} />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 11 · Confiança — DARK (obsidian) with colored-border cards */}
      <HomeTrust data={data} />

      {/* ── Gold divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 12 · Impacto e território — light */}
      <HomeImpacto />

      {/* ── Dark divider ── */}
      <div className="section-divider-gold" aria-hidden="true" />

      {/* 13 · ADS — visível e claramente separado do Trust */}
      <HomeAds />

      {/* ── Dark divider ── */}
      <div className="section-divider-dark" aria-hidden="true" />

      {/* 14 · Parceiros */}
      <HomePartners />

      {/* 15 · Números — dark */}
      <div className="section-divider-gold" aria-hidden="true" />
      <HomeNumbers data={data} />

      {/* 16 · Story + AI + CTA final */}
      <HomeStory />
      <HomeAI />
      <HomeCTA />

      <JsonLd data={websiteSchema()} />
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={datasetSchema('Estatísticas do AxéMap', 'Números públicos do ecossistema de religiões de matriz africana no Brasil', [
          { name: 'Casas cadastradas', value: data.stats?.totalTerreiro ?? 0 },
          { name: 'Casas verificadas', value: data.stats?.totalVerificados ?? 0 },
          { name: 'Eventos', value: data.stats?.totalEventos ?? 0 },
          { name: 'Cursos', value: data.stats?.totalCursos ?? 0 },
        ])}
      />
    </>
  );
}
