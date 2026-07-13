import type { MapProviderDefinition } from '../map-provider.interface';
import { createLeafletMap } from './leaflet-map';

export const leafletProvider: MapProviderDefinition = {
  name: 'leaflet',
  create: createLeafletMap,
};
