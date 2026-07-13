'use client';

import type { TerreiroPerfil } from '@/types/terreiro';
import { MapProviderWrapper, MapView, leafletProvider } from '@/lib/map';

export function LocalizacaoSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const hasCoords = terreiro.latitude && terreiro.longitude;

  return (
    <section className="section-card" id="localizacao">
      <h2 className="section-title">Localização</h2>

      <div className="localizacao-content">
        <div className="localizacao-info">
          <div className="info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>
              {terreiro.cidade}, {terreiro.estado}
              {terreiro.estacionamento && ` — ${terreiro.estacionamento === 'GRATUITO' ? 'Estacionamento gratuito' : terreiro.estacionamento === 'PAGO' ? 'Estacionamento pago' : 'Sem estacionamento'}`}
            </span>
          </div>
          {terreiro.acessibilidade && (
            <div className="info-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6" r="1.5"/><path d="M12 10v8"/><path d="M10 14h4"/></svg>
              <span>Acessível</span>
            </div>
          )}
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${terreiro.latitude},${terreiro.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              Como chegar
            </a>
          )}
        </div>

        {hasCoords && (
          <div className="localizacao-mapa" style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', marginTop: '1rem' }}>
            <MapProviderWrapper provider={leafletProvider}>
              <MapView
                center={{ lat: terreiro.latitude, lng: terreiro.longitude }}
                zoom={15}
                markers={[{
                  id: terreiro.id,
                  position: { lat: terreiro.latitude, lng: terreiro.longitude },
                  title: terreiro.nome,
                }]}
              />
            </MapProviderWrapper>
          </div>
        )}
      </div>
    </section>
  );
}
