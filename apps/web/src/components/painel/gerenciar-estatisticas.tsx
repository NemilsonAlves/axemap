'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';

interface Analytics {
  seguidores: number;
  favoritos: number;
  membros: number;
  indicacoes: { total: number; convertidas: number; taxaConversao: number };
  acessosQR: number;
  presencasConfirmadas: number;
}

export function GerenciarEstatisticas({ terreiroId }: { terreiroId: string }) {
  const [stats, setStats] = useState<Analytics | null>(null);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const data = await api.get<Analytics>(`/growth/terreiros/${terreiroId}/analytics`);
      setStats(data);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
    }
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (erro) return <p className="painel-erro">{erro}</p>;
  if (!stats) return <p className="painel-empty">Carregando estatísticas...</p>;

  const cards = [
    { label: 'Seguidores', valor: stats.seguidores },
    { label: 'Favoritos', valor: stats.favoritos },
    { label: 'Membros', valor: stats.membros },
    { label: 'Acessos via QR', valor: stats.acessosQR },
    { label: 'Presenças confirmadas', valor: stats.presencasConfirmadas },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {cards.map((c) => (
          <div key={c.label} className="painel-form-card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)' }}>{c.valor}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-gray-300)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="painel-form-card" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Indicações</h3>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontWeight: 700 }}>{stats.indicacoes.total}</span>{' '}
            <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>total</span>
          </div>
          <div>
            <span style={{ fontWeight: 700 }}>{stats.indicacoes.convertidas}</span>{' '}
            <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>convertidas</span>
          </div>
          <div>
            <span style={{ fontWeight: 700 }}>{stats.indicacoes.taxaConversao}%</span>{' '}
            <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>taxa de conversão</span>
          </div>
        </div>
      </div>

      <p className="painel-empty" style={{ fontSize: '0.78rem' }}>
        Atualize a página para ver números recentes.
      </p>
    </div>
  );
}
