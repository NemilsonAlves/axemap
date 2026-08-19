'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapView } from '@/lib/map';
import type { MapMarker, MapGeoPoint } from '@/lib/map/types';
import type { MapViewHandle } from '@/lib/map/map-view';
import { api } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n/i18n-context';
import { regionalRank } from '@/lib/geo';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapaVivo, type MapaVivoNode } from '@/components/map/mapa-vivo';
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  ShieldCheck,
  Megaphone,
  X,
  ArrowUpRight,
  Globe2,
  Sparkles,
  CalendarDays,
  Heart,
  Share2,
  Navigation,
  Users,
  Star,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TerreiroNoMapa {
  id: string;
  nome: string;
  slug: string;
  tradicao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  continente?: string | null;
  latitude: number | null;
  longitude: number | null;
  trustScore?: number | null;
  isVerified?: boolean | null;
  descricaoCurta?: string | null;
  fotoUrl?: string | null;
}

interface CampanhaNoMapa {
  id: string;
  titulo: string;
  slug: string;
  categoria?: string | null;
  cidade?: string | null;
  estado?: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface ListResponse<T> {
  data: T[];
}

type Camada = 'todas' | 'terreiros' | 'campanhas';
type Vista = 'mapa' | 'constelacao' | 'lista';

const CONTINENTES = [
  { value: '', label: 'Brasil' },
  { value: 'AFRICA', label: 'África' },
  { value: 'AMERICA-SUL', label: 'América do Sul' },
  { value: 'AMERICA-NORTE', label: 'América do Norte' },
  { value: 'CARIBE', label: 'Caribe' },
  { value: 'EUROPA', label: 'Europa' },
  { value: 'ASIA', label: 'Ásia' },
  { value: 'OCEANIA', label: 'Oceania' },
];

const TRADICOES = [
  { value: '', label: 'Todas as tradições' },
  { value: 'Candomblé',     label: 'Candomblé' },
  { value: 'Umbanda',       label: 'Umbanda' },
  { value: 'Batuque',       label: 'Batuque' },
  { value: 'Tambor de Mina',label: 'Tambor de Mina' },
  { value: 'Xangô',         label: 'Xangô' },
  { value: 'Jurema',        label: 'Jurema' },
];

interface EntidadeLista {
  id: string;
  tipo: 'terreiro' | 'campanha';
  nome: string;
  slug: string;
  tradicao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  pais?: string | null;
  continente?: string | null;
  trustScore?: number | null;
  isVerified?: boolean | null;
  descricaoCurta?: string | null;
  fotoUrl?: string | null;
  position: MapGeoPoint;
  markerId: string;
}

// ─── Trust color helper ───────────────────────────────────────────────────────

function trustColor(score: number | null | undefined): string {
  if (score == null) return 'text-muted-foreground';
  if (score >= 7) return 'text-fern';
  if (score >= 4) return 'text-amber-600 dark:text-amber-400';
  return 'text-terracota';
}

function trustBg(score: number | null | undefined): string {
  if (score == null) return '';
  if (score >= 7) return 'bg-fern/10 border-fern/20';
  if (score >= 4) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-terracota/10 border-terracota/20';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapContent() {
  const { country, formatNumber } = useI18n();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [entidades, setEntidades] = useState<EntidadeLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [continente, setContinente] = useState('');
  const [tradicao, setTradicao] = useState('');
  const [camada, setCamada] = useState<Camada>('todas');
  const [busca, setBusca] = useState('');
  const [vista, setVista] = useState<Vista>('mapa');
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const mapRef = useRef<MapViewHandle>(null);

  const brasil: MapGeoPoint = { lat: -15.8, lng: -47.9 };

  useEffect(() => {
    let cancelled = false;

    async function loadMarkers() {
      try {
        setLoading(true);
        const params = new URLSearchParams({ limit: '500' });
        if (continente) params.set('continente', continente);
        if (tradicao) params.set('tradicao', tradicao);

        const [terreirosJson, campanhasJson] = await Promise.all([
          api.get<ListResponse<TerreiroNoMapa>>(`/terreiros?${params}`),
          api.get<ListResponse<CampanhaNoMapa>>('/campanhas/mapa'),
        ]);

        if (cancelled) return;

        const terreiros = terreirosJson?.data ?? [];
        const campanhas = campanhasJson?.data ?? [];

        const terreiroMarkers: MapMarker[] = terreiros
          .filter((t) => typeof t.latitude === 'number' && typeof t.longitude === 'number')
          .map((t) => ({
            id: `t-${t.id}`,
            position: { lat: t.latitude as number, lng: t.longitude as number },
            title: t.nome,
            slug: `/terreiro/${t.slug}`,
            trustScore: t.trustScore ?? undefined,
            description: `${t.tradicao ?? 'Tradição não informada'} · ${[t.cidade, t.estado].filter(Boolean).join(', ')}`,
          }));

        const campanhaMarkers: MapMarker[] = campanhas
          .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
          .map((c) => ({
            id: `c-${c.id}`,
            position: { lat: c.latitude as number, lng: c.longitude as number },
            title: c.titulo,
            slug: `/campanhas/${c.slug}`,
            description: `${c.categoria ?? 'Campanha'} · ${[c.cidade, c.estado].filter(Boolean).join(', ')}`,
            color: '#b45309',
          }));

        const entidadesLista: EntidadeLista[] = [
          ...terreiros
            .filter((t) => typeof t.latitude === 'number' && typeof t.longitude === 'number')
            .map((t) => ({
              id: t.id,
              tipo: 'terreiro' as const,
              nome: t.nome,
              slug: `/terreiro/${t.slug}`,
              tradicao: t.tradicao,
              cidade: t.cidade,
              estado: t.estado,
              pais: t.pais,
              continente: t.continente,
              trustScore: t.trustScore,
              isVerified: t.isVerified,
              descricaoCurta: t.descricaoCurta,
              fotoUrl: t.fotoUrl,
              position: { lat: t.latitude as number, lng: t.longitude as number },
              markerId: `t-${t.id}`,
            })),
          ...campanhas
            .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
            .map((c) => ({
              id: c.id,
              tipo: 'campanha' as const,
              nome: c.titulo,
              slug: `/campanhas/${c.slug}`,
              tradicao: null,
              cidade: c.cidade,
              estado: c.estado,
              pais: null,
              continente: null,
              trustScore: null,
              isVerified: null,
              descricaoCurta: null,
              fotoUrl: null,
              position: { lat: c.latitude as number, lng: c.longitude as number },
              markerId: `c-${c.id}`,
            })),
        ];

        setMarkers([...terreiroMarkers, ...campanhaMarkers]);
        setEntidades(entidadesLista);
      } catch {
        if (!cancelled) setError('Erro ao carregar dados do mapa. Verifique a conexão.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMarkers();
    return () => { cancelled = true; };
  }, [continente, tradicao]);

  const filtrados = useMemo(() => {
    let list = entidades;
    if (camada === 'terreiros') list = list.filter((e) => e.tipo === 'terreiro');
    if (camada === 'campanhas') list = list.filter((e) => e.tipo === 'campanha');
    const q = busca.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.nome.toLowerCase().includes(q) ||
          (e.tradicao ?? '').toLowerCase().includes(q) ||
          (e.cidade ?? '').toLowerCase().includes(q) ||
          (e.estado ?? '').toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const ra = regionalRank(country, a);
      const rb = regionalRank(country, b);
      if (ra !== rb) return ra - rb;
      // Verified first, then trust score
      if ((b.isVerified ? 1 : 0) !== (a.isVerified ? 1 : 0)) return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
      return (b.trustScore ?? 0) - (a.trustScore ?? 0);
    });
  }, [entidades, camada, busca, country]);

  const visiveis = useMemo(() => {
    const ids = new Set(filtrados.map((e) => e.markerId));
    return markers.filter((m) => ids.has(m.id));
  }, [markers, filtrados]);

  const selecionado = useMemo(
    () => filtrados.find((e) => e.markerId === selecionadoId || e.id === selecionadoId) ?? null,
    [filtrados, selecionadoId],
  );

  const handleMapClick = useCallback((_position: MapGeoPoint) => {
    setSelecionadoId(null);
  }, []);

  const flyToSelecionado = useCallback((entidade: EntidadeLista) => {
    setSelecionadoId(entidade.markerId);
    if (vista !== 'constelacao') {
      mapRef.current?.flyTo(entidade.position, Math.max(8, mapRef.current?.getZoom() ?? 8));
    }
  }, [vista]);

  const contagem = useMemo(() => {
    const t = filtrados.filter((e) => e.tipo === 'terreiro').length;
    const c = filtrados.length - t;
    const v = filtrados.filter((e) => e.isVerified).length;
    return { terreiros: t, campanhas: c, total: filtrados.length, verificadas: v };
  }, [filtrados]);

  const filtroLabel = useMemo(
    () => CONTINENTES.find((c) => c.value === continente)?.label ?? 'Brasil',
    [continente],
  );

  // Nodes for MapaVivo
  const vivoNodes = useMemo<MapaVivoNode[]>(() => (
    filtrados
      .filter((e) => e.tipo === 'terreiro')
      .slice(0, 120)
      .map((e) => ({
        id: e.id,
        nome: e.nome,
        cidade: e.cidade,
        estado: e.estado,
        latitude: e.position.lat,
        longitude: e.position.lng,
        trustScore: e.trustScore,
        isVerified: e.isVerified,
        tipo: 'terreiro' as const,
        slug: e.slug,
        fotoUrl: e.fotoUrl,
      }))
  ), [filtrados]);

  return (
    <main className="container-page py-6 lg:py-10" aria-labelledby="mapa-titulo">

      {/* ── Header ── */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-azul-atlantico">
            <Globe2 className="size-4" aria-hidden="true" />
            AxéMap · Mapa das Tradições
          </p>
          <h1 id="mapa-titulo" className="font-display text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
            O mapa vivo das tradições de axé
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground lg:text-base">
            Candomblé, Umbanda, Batuque, Tambor de Mina, Xangô, Jurema e todas as tradições afro-brasileiras —
            explore por camadas, filtre e selecione cada ponto.
          </p>
        </div>

        {/* Vista toggle */}
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 self-start lg:self-auto" role="tablist" aria-label="Alternar visualização">
          <button
            type="button" role="tab" aria-selected={vista === 'mapa'}
            onClick={() => setVista('mapa')}
            className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition', vista === 'mapa' ? 'bg-universo-mapa text-white shadow' : 'text-muted-foreground hover:text-foreground')}
          >
            <MapIcon className="size-3.5" /> Mapa
          </button>
          <button
            type="button" role="tab" aria-selected={vista === 'constelacao'}
            onClick={() => setVista('constelacao')}
            className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition', vista === 'constelacao' ? 'bg-[hsl(var(--obsidiana))] text-white shadow' : 'text-muted-foreground hover:text-foreground')}
            title="Visualização em constelação — mapa vivo"
          >
            <Sparkles className="size-3.5" /> Constelação
          </button>
          <button
            type="button" role="tab" aria-selected={vista === 'lista'}
            onClick={() => setVista('lista')}
            className={cn('inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition', vista === 'lista' ? 'bg-universo-mapa text-white shadow' : 'text-muted-foreground hover:text-foreground')}
          >
            <List className="size-3.5" /> Lista
          </button>
        </div>
      </header>

      {/* ── Stats bar ── */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-azul-atlantico/20 bg-azul-atlantico/5 px-3 py-1 text-[11px] font-semibold text-azul-atlantico">
          <MapPin className="size-3" />
          {formatNumber(contagem.terreiros)} comunidades
        </span>
        {contagem.verificadas > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-fern/20 bg-fern/5 px-3 py-1 text-[11px] font-semibold text-fern">
            <ShieldCheck className="size-3" />
            {formatNumber(contagem.verificadas)} verificadas
          </span>
        )}
        {contagem.campanhas > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Megaphone className="size-3" />
            {formatNumber(contagem.campanhas)} campanhas
          </span>
        )}
        <span className="text-xs text-muted-foreground">em {filtroLabel}</span>
      </div>

      {/* ── Filtros ── */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Busca + toggle filtros */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar comunidade, tradição, cidade..."
              aria-label="Buscar no mapa"
              className="w-full rounded-2xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-azul-atlantico/50 focus:ring-2 focus:ring-azul-atlantico/20"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFiltros((v) => !v)}
            aria-pressed={showFiltros}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition',
              showFiltros ? 'border-azul-atlantico bg-azul-atlantico/10 text-azul-atlantico' : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <Filter className="size-4" />
            Filtros
          </button>
        </div>

        {showFiltros && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4">
            {/* Camadas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Camada</span>
              {([
                { value: 'todas', label: 'Tudo' },
                { value: 'terreiros', label: 'Comunidades' },
                { value: 'campanhas', label: 'Campanhas' },
              ] as const).map((c) => (
                <button
                  key={c.value} type="button"
                  onClick={() => setCamada(c.value)}
                  aria-pressed={camada === c.value}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition',
                    camada === c.value ? 'bg-universo-mapa text-white' : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Região */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Região</span>
              {CONTINENTES.map((c) => (
                <button
                  key={c.value} type="button"
                  aria-pressed={continente === c.value}
                  onClick={() => setContinente(c.value)}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition',
                    continente === c.value ? 'bg-copper text-white' : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Tradição */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tradição</span>
              {TRADICOES.map((t) => (
                <button
                  key={t.value} type="button"
                  aria-pressed={tradicao === t.value}
                  onClick={() => setTradicao(t.value)}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition',
                    tradicao === t.value ? 'bg-roxo-ancestral text-white' : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {/* ── Corpo: visualização + painel lateral ── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">

        {/* Mapa / Constelação / Lista */}
        <div className="min-w-0">
          {vista === 'constelacao' ? (
            loading ? (
              <Skeleton className="h-[60vh] w-full rounded-3xl" />
            ) : (
              <MapaVivo
                nodes={vivoNodes}
                selecionadoId={selecionado?.id ?? null}
                onSelect={(id) => {
                  const e = filtrados.find((x) => x.id === id);
                  if (e) flyToSelecionado(e);
                }}
                className="h-[60vh] lg:h-[65vh]"
              />
            )
          ) : vista === 'lista' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              ) : filtrados.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center">
                  <MapPin className="mx-auto size-8 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">Nenhum resultado com estes filtros.</p>
                </div>
              ) : (
                filtrados.slice(0, 60).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => flyToSelecionado(e)}
                    aria-pressed={selecionadoId === e.markerId}
                    className={cn(
                      'group flex items-start gap-3 rounded-2xl border bg-card p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                      selecionadoId === e.markerId ? 'border-azul-atlantico/50 ring-2 ring-azul-atlantico/10' : 'border-border',
                    )}
                  >
                    {/* Foto thumbnail */}
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {e.fotoUrl ? (
                        <Image src={e.fotoUrl} alt={e.nome} fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xl">
                          {e.tipo === 'terreiro' ? '🏛️' : '📢'}
                        </div>
                      )}
                      {e.isVerified && (
                        <span className="absolute bottom-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-fern">
                          <ShieldCheck className="size-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-display text-sm font-bold leading-snug text-foreground group-hover:text-azul-atlantico">
                          {e.nome}
                        </span>
                        {e.trustScore != null && (
                          <span className={cn('shrink-0 font-display text-sm font-bold', trustColor(e.trustScore))}>
                            {e.trustScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {[e.cidade, e.estado].filter(Boolean).join(', ')}
                        {e.tradicao ? ` · ${e.tradicao}` : ''}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ── Mapa Leaflet ── */
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-md">
              {loading ? (
                <Skeleton className="h-[60vh] w-full rounded-3xl lg:h-[65vh]" />
              ) : (
                <>
                  <MapView
                    ref={mapRef}
                    center={brasil}
                    zoom={4}
                    markers={visiveis}
                    autoFit={visiveis.length > 0}
                    style={{ height: '60vh', borderRadius: 0 }}
                    className="min-h-[45vh] lg:h-[65vh]"
                    onClick={handleMapClick}
                    onMarkerClick={(markerId) => setSelecionadoId(markerId)}
                  />
                  {/* Overlay badges */}
                  <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow backdrop-blur">
                    <MapPin className="mr-1 inline size-3.5 text-azul-atlantico" />
                    {formatNumber(contagem.total)} pontos
                  </div>
                  {/* Trust legend */}
                  <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-2xl border border-border/60 bg-background/90 px-3 py-2.5 text-[10px] font-semibold backdrop-blur">
                    <p className="mb-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">Trust</p>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-fern inline-block" />Alto ≥ 7.0</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-600 inline-block" />Médio ≥ 4.0</span>
                    <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-copper inline-block" />Iniciando</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Painel lateral rico ── */}
        <aside className="flex flex-col">
          {selecionado ? (
            <RichPanel
              entidade={selecionado}
              onClose={() => setSelecionadoId(null)}
              onFly={() => {
                if (vista === 'mapa') mapRef.current?.flyTo(selecionado.position, 10);
                else setVista('mapa');
              }}
            />
          ) : (
            /* Lista rápida no painel quando nada selecionado */
            <div className="flex flex-col gap-2 lg:max-h-[65vh] lg:overflow-y-auto">
              <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {formatNumber(contagem.total)} resultado(s)
              </p>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)
              ) : filtrados.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                  <MapPin className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">Nenhum ponto encontrado.</p>
                </div>
              ) : (
                filtrados.slice(0, 50).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => flyToSelecionado(e)}
                    aria-pressed={selecionadoId === e.markerId}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md',
                      selecionadoId === e.markerId ? 'border-azul-atlantico/50 ring-2 ring-azul-atlantico/10' : 'border-border',
                    )}
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {e.fotoUrl ? (
                        <Image src={e.fotoUrl} alt={e.nome} fill className="object-cover" sizes="44px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-base">
                          {e.tipo === 'terreiro' ? '🏛️' : '📢'}
                        </div>
                      )}
                      {e.isVerified && (
                        <span className="absolute bottom-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-fern">
                          <ShieldCheck className="size-2 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-sm font-bold text-foreground group-hover:text-azul-atlantico">
                          {e.nome}
                        </span>
                        {e.trustScore != null && (
                          <span className={cn('shrink-0 text-xs font-bold', trustColor(e.trustScore))}>
                            {e.trustScore.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {[e.cidade, e.estado].filter(Boolean).join(', ')}
                        {e.tradicao ? ` · ${e.tradicao}` : ''}
                      </span>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-azul-atlantico" />
                  </button>
                ))
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Footer info */}
      <p className="mt-4 text-xs text-muted-foreground">
        {formatNumber(contagem.total)} ponto(s) · {formatNumber(contagem.terreiros)} comunidade(s) ·{' '}
        {formatNumber(contagem.verificadas)} verificada(s) · {formatNumber(contagem.campanhas)} campanha(s) em {filtroLabel}
        {tradicao ? ` · Tradição: ${tradicao}` : ''}
      </p>
    </main>
  );
}

// ─── Rich Panel Component ─────────────────────────────────────────────────────

interface RichPanelProps {
  entidade: EntidadeLista;
  onClose: () => void;
  onFly: () => void;
}

function RichPanel({ entidade, onClose, onFly }: RichPanelProps) {
  const isComunidade = entidade.tipo === 'terreiro';

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-lg lg:max-h-[65vh] lg:overflow-y-auto">

      {/* ── Hero foto ── */}
      <div className="relative">
        <div className="relative h-40 overflow-hidden bg-muted">
          {entidade.fotoUrl ? (
            <Image
              src={entidade.fotoUrl}
              alt={entidade.nome}
              fill
              className="object-cover"
              sizes="420px"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(var(--obsidiana)), hsl(24 25% 12%))' }}
            >
              <span className="text-5xl opacity-40">
                {isComunidade ? '🏛️' : '📢'}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Close + tipo badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider border',
              isComunidade
                ? 'bg-azul-atlantico/90 text-white border-azul-atlantico/50'
                : 'bg-amber-900/90 text-amber-100 border-amber-700/50',
            )}
          >
            {isComunidade ? 'Comunidade' : 'Campanha'}
          </Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
          aria-label="Fechar painel"
        >
          <X className="size-3.5" />
        </button>

        {/* Verified badge over photo */}
        {entidade.isVerified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-fern/90 px-2.5 py-1 backdrop-blur">
            <ShieldCheck className="size-3 text-white" />
            <span className="text-[10px] font-bold text-white">Verificada</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-4 p-4">

        {/* Nome + localização */}
        <div>
          <h2 className="font-display text-lg font-black leading-snug text-foreground">
            {entidade.nome}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-copper" />
            {[entidade.cidade, entidade.estado].filter(Boolean).join(', ')}
            {entidade.pais && entidade.pais !== 'BR' ? ` · ${entidade.pais}` : ''}
          </p>
          {entidade.tradicao && (
            <p className="mt-1 text-sm">
              <span className="font-semibold text-foreground">Tradição: </span>
              <span className="text-muted-foreground">{entidade.tradicao}</span>
            </p>
          )}
        </div>

        {/* Trust Score bar — só para terreiros */}
        {isComunidade && entidade.trustScore != null && (
          <div className={cn('rounded-2xl border p-3.5', trustBg(entidade.trustScore))}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={cn('size-4', trustColor(entidade.trustScore))} />
                <span className="text-xs font-bold text-foreground">Índice de Confiança</span>
              </div>
              <span className={cn('font-display text-xl font-black', trustColor(entidade.trustScore))}>
                {entidade.trustScore.toFixed(1)}
              </span>
            </div>
            {/* Animated progress bar */}
            <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (entidade.trustScore / 10) * 100)}%`,
                  background: entidade.trustScore >= 7
                    ? 'linear-gradient(90deg, hsl(var(--fern)), hsl(var(--verde-floresta)))'
                    : entidade.trustScore >= 4
                    ? 'linear-gradient(90deg, hsl(var(--acafrao)), hsl(var(--dourado-sol)))'
                    : 'linear-gradient(90deg, hsl(var(--terracota)), hsl(var(--copper)))',
                }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Baseado em verificação, atividade e histórico. Nunca afetado por publicidade.
            </p>
          </div>
        )}

        {/* Descrição curta */}
        {entidade.descricaoCurta && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {entidade.descricaoCurta}
          </p>
        )}

        {/* Ações rápidas */}
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={entidade.slug}>
              Ver perfil completo
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onFly}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Navigation className="size-4" />
              Ver no mapa
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${entidade.position.lat},${entidade.position.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <MapPin className="size-4" />
              Como chegar
            </a>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: entidade.nome, url: `${window.location.origin}${entidade.slug}` });
                } else {
                  navigator.clipboard.writeText(`${window.location.origin}${entidade.slug}`);
                }
              }}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-background p-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Share2 className="size-4" />
              Compartilhar
            </button>
          </div>
        </div>

        {/* Info cards grid */}
        {isComunidade && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`${entidade.slug}#eventos`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3 transition hover:bg-accent"
            >
              <CalendarDays className="size-4 shrink-0 text-azul-atlantico" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Eventos</p>
                <p className="text-xs font-semibold text-foreground">Ver agenda</p>
              </div>
            </Link>
            <Link
              href={`${entidade.slug}#campanhas`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3 transition hover:bg-accent"
            >
              <Heart className="size-4 shrink-0 text-terracota" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Apoio</p>
                <p className="text-xs font-semibold text-foreground">Campanhas</p>
              </div>
            </Link>
            <Link
              href={`${entidade.slug}#comunidade`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3 transition hover:bg-accent"
            >
              <Users className="size-4 shrink-0 text-roxo-ancestral" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Comunidade</p>
                <p className="text-xs font-semibold text-foreground">Membros</p>
              </div>
            </Link>
            <Link
              href={`${entidade.slug}#avaliacoes`}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-3 transition hover:bg-accent"
            >
              <Star className="size-4 shrink-0 text-acafrao" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avaliações</p>
                <p className="text-xs font-semibold text-foreground">Ver opiniões</p>
              </div>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
