'use client';

import dynamic from 'next/dynamic';
import { SectionsSkeleton } from './home-skeletons';

const HomeMapView = dynamic(() => import('./home-map').then((m) => m.HomeMap), {
  ssr: false,
  loading: () => <SectionsSkeleton />,
});

/** Wrapper client para carregar o mapa só no lado do cliente (leaflet). */
export function HomeMapLoader() {
  return <HomeMapView />;
}