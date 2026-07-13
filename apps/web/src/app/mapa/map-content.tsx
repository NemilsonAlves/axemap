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
    async function loadTerreiros() {
      try {
        const res = await fetch('/api/v1/terreiros?limit=100');
        const json = await res.json();

        const mapMarkers: MapMarker[] = (json.data || []).map((t: any) => ({
          id: t.id,
          position: { lat: t.latitude, lng: t.longitude },
          title: t.nome,
          slug: t.slug,
          trustScore: t.trustScore,
          description: `${t.tradicao} — ${t.cidade}, ${t.estado}`,
        }));

        setMarkers(mapMarkers);
      } catch (err) {
        setError('Erro ao carregar terreiros no mapa');
      } finally {
        setLoading(false);
      }
    }

    loadTerreiros();
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
