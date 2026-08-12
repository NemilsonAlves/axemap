'use client';

import { useEffect, useState } from 'react';
import { MapView } from '@/lib/map';
import type { MapMarker, MapGeoPoint } from '@/lib/map/types';
import { api } from '@/lib/api-client';

interface TerreiroNoMapa {
  id: string;
  nome: string;
  slug: string;
  tradicao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  latitude: number | null;
  longitude: number | null;
  trustScore?: number | null;
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

export default function MapContent() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recife: MapGeoPoint = { lat: -8.0476, lng: -34.877 };

  useEffect(() => {
    async function loadMarkers() {
      try {
        const [terreirosJson, campanhasJson] = await Promise.all([
          api.get<ListResponse<TerreiroNoMapa>>('/terreiros?limit=100'),
          api.get<ListResponse<CampanhaNoMapa>>('/campanhas/mapa'),
        ]);

        const terreiroMarkers: MapMarker[] = (terreirosJson.data ?? [])
          .filter((t) => typeof t.latitude === 'number' && typeof t.longitude === 'number')
          .map((t) => ({
            id: `t-${t.id}`,
            position: { lat: t.latitude as number, lng: t.longitude as number },
            title: t.nome,
            slug: `/terreiro/${t.slug}`,
            trustScore: t.trustScore ?? undefined,
            description: `${t.tradicao ?? 'Tradição não informada'} - ${[t.cidade, t.estado].filter(Boolean).join(', ')}`,
          }));

        const campanhaMarkers: MapMarker[] = (campanhasJson.data ?? [])
          .filter((c) => typeof c.latitude === 'number' && typeof c.longitude === 'number')
          .map((c) => ({
            id: `c-${c.id}`,
            position: { lat: c.latitude as number, lng: c.longitude as number },
            title: c.titulo,
            slug: `/campanhas/${c.slug}`,
            description: `${c.categoria ?? 'Campanha'} - ${[c.cidade, c.estado].filter(Boolean).join(', ')}`,
            color: '#0d9488',
          }));

        setMarkers([...terreiroMarkers, ...campanhaMarkers]);
      } catch (err) {
        setError('Erro ao carregar dados no mapa');
      } finally {
        setLoading(false);
      }
    }

    loadMarkers();
  }, []);

  function handleMapClick(position: MapGeoPoint) {
    console.log('Mapa clicado em:', position);
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>Mapa de Terreiros</h1>

      {loading && <p>Carregando dados...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <MapView
        center={recife}
        zoom={12}
        markers={markers}
        style={{ height: '600px', borderRadius: '0.5rem' }}
        onClick={handleMapClick}
      />

      <p style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
        {markers.length} terreiro(s) encontrado(s)
      </p>
    </div>
  );
}
