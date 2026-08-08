'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import { uploadImage, type UploadProgress } from '@/lib/upload-pipeline';

interface Foto {
  id: string;
  url: string;
  thumbUrl: string | null;
  alt: string | null;
  isPrincipal: boolean;
}

export function GerenciarFotos({ terreiroId, slug }: { terreiroId: string; slug: string }) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState('');
  const [erro, setErro] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    try {
      const t = await api.get<any>(`/terreiros/${slug}/perfil`);
      setFotos(Array.isArray(t.fotos) ? t.fotos : []);
    } catch {}
    setCarregando(false);
  }, [slug]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const enviar = async (file: File) => {
    setEnviando(true);
    setErro('');
    setProgresso('Preparando imagem...');
    try {
      const onProgress = (p: UploadProgress) => {
        setProgresso(
          p.stage === 'validating' ? 'Validando...' :
          p.stage === 'compressing' ? 'Comprimindo...' :
          p.stage === 'thumbnail' ? 'Criando miniatura...' :
          p.stage === 'uploading' ? `Enviando (${p.progress}%)...` :
          p.stage === 'error' ? (p.error || 'Erro no upload') : 'Concluído',
        );
      };
      const resultado = await uploadImage(file, onProgress);
      const isPrincipal = fotos.length === 0;
      await api.post(`/terreiros/${terreiroId}/fotos`, {
        url: resultado.url,
        thumbUrl: resultado.thumbUrl,
        alt: '',
        isPrincipal,
      });
      await carregar();
      setProgresso('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remover = async (fotoId: string) => {
    if (!window.confirm('Remover esta foto?')) return;
    try {
      await api.delete(`/terreiros/${terreiroId}/fotos/${fotoId}`);
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao remover');
    }
  };

  const tornarPrincipal = async (foto: Foto) => {
    try {
      await api.patch(`/terreiros/${terreiroId}`, { fotoUrl: foto.url });
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao definir foto principal');
    }
  };

  if (carregando) return <p className="painel-empty">Carregando fotos...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Galeria ({fotos.length})</h2>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) enviar(f); }}
          />
          <button className="painel-btn" disabled={enviando} onClick={() => inputRef.current?.click()}>
            {enviando ? progresso || 'Enviando...' : '+ Adicionar foto'}
          </button>
        </div>
      </div>

      {enviando && progresso && <p className="painel-subtitle" style={{ marginBottom: '1rem' }}>{progresso}</p>}
      {erro && <div className="painel-error">{erro}</div>}

      {fotos.length === 0 ? (
        <p className="painel-empty">Nenhuma foto ainda. Adicione fotos para completar seu perfil.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {fotos.map((f) => (
            <div key={f.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: 12, overflow: 'hidden', background: 'var(--color-white)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.thumbUrl || f.url} alt={f.alt || ''} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '0.5rem', display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                {f.isPrincipal && <span className="painel-status" style={{ background: 'var(--success)', color: 'var(--success-foreground)' }}>Principal</span>}
                <button className="painel-icon-btn" onClick={() => tornarPrincipal(f)}>Capa</button>
                <button className="painel-icon-btn danger" onClick={() => remover(f.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
