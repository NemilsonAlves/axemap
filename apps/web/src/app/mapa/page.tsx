'use client';

import dynamic from 'next/dynamic';
import { MapProviderWrapper, leafletProvider } from '@/lib/map';

const MapPageContent = dynamic(
  () => import('./map-content'),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando mapa...</div> },
);

export default function MapaPage() {
  return (
    <MapProviderWrapper provider={leafletProvider}>
      <MapPageContent />
    </MapProviderWrapper>
  );
}
