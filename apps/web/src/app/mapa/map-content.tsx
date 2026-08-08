'use client';

import { useEffect, useState } from 'react';
import { MapView } from '@/lib/map';
import type { MapMarker, MapGeoPoint } from '@/lib/map/types';

export default function MapContent() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recife: MapGeoPoint = { lat: -8.0476, lng: -34.877 };

  useEffect(() => {
    async function loadMarkers() {
      try {
        const [terreirosRes, campanhasRes] = await Promise.all([
          fetch('/api/v1/terreiros?limit=100'),
          fetch('/api/v1/campanhas/mapa'),
        ]);
        const [terreirosJson, campanhasJson] = await Promise.all([
          terreirosRes.json(),
          campanhasRes.json(),
        ]);

        const terreiroMarkers: MapMarker[] = (terreirosJson.data || []).map((t: any) => ({
          id: `t-${t.id}`,
          position: { lat: t.latitude, lng: t.longitude },
          title: t.nome,
          slug: `/terreiro/${t.slug}`,
          trustScore: t.trustScore,
          description: `${t.tradicao} — ${t.cidade}, ${t.estado}`,
        }));

        const campanhaMarkers: MapMarker[] = (campanhasJson.data || []).map((c: any) => ({
          id: `c-${c.id}`,
          position: { lat: c.latitude, lng: c.longitude },
          title: c.titulo,
          slug: `/campanhas/${c.slug}`,
          description: `${c.categoria} — ${c.cidade ?? ''} ${c.estado ?? ''}`,
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
