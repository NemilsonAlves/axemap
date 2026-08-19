'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { TerreiroPerfil } from '@/types/terreiro';

export function GaleriaSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fotos = terreiro.fotos || [];
  const videos = terreiro.videos || [];

  if (fotos.length === 0 && videos.length === 0) return null;

  return (
    <section className="section-card" id="galeria">
      <h2 className="section-title">Galeria</h2>

      {fotos.length > 0 && (
        <div className="galeria-grid">
          {fotos.slice(0, 9).map((foto) => (
            <button
              key={foto.id}
              className="galeria-item"
              onClick={() => setSelectedPhoto(foto.url)}
              aria-label={foto.alt || 'Foto do terreiro'}
            >
              <Image
                src={foto.thumbUrl || foto.url}
                alt={foto.alt || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
            </button>
          ))}
          {fotos.length > 9 && (
            <button className="galeria-item galeria-mais" onClick={() => setSelectedPhoto(fotos[0].url)}>
              +{fotos.length - 9}
            </button>
          )}
        </div>
      )}

      {videos.length > 0 && (
        <div className="videos-lista">
          <h3 className="section-subtitle">Vídeos</h3>
          <div className="videos-grid">
            {videos.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="video-item"
              >
                <div className="video-thumb">
                  <div className="video-play-icon">▶</div>
                </div>
                <span className="video-titulo">{video.titulo || 'Vídeo'}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPhoto(null)}>×</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedPhoto} alt="Foto ampliada" className="modal-image" />
          </div>
        </div>
      )}
    </section>
  );
}
