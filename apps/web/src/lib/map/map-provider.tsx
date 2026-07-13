'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { MapProviderInstance, MapProviderDefinition } from './map-provider.interface';

interface MapProviderContextValue {
  provider: MapProviderDefinition | null;
}

const MapProviderContext = createContext<MapProviderContextValue>({ provider: null });

export function MapProviderWrapper({
  children,
  provider,
}: {
  children: ReactNode;
  provider: MapProviderDefinition | null;
}) {
  return (
    <MapProviderContext.Provider value={{ provider }}>
      {children}
    </MapProviderContext.Provider>
  );
}

export function useMapProvider(): MapProviderDefinition | null {
  const ctx = useContext(MapProviderContext);
  return ctx.provider;
}
