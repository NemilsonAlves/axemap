'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';

export function ClaimButton({ terreiroId, hasDirigente }: { terreiroId: string; hasDirigente: boolean }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');

  if (hasDirigente || claimed) return null;
  if (!user) {
    return (
      <a href={`/auth/login?redirect=/terreiro/${terreiroId}`} className="btn btn-outline btn-sm">
        Este terreiro é seu? Reivindique este perfil
      </a>
    );
  }

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/terreiros/${terreiroId}/reivindicar`, {}, token || undefined);
      setClaimed(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar reivindicação');
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleClaim}
        disabled={loading}
        className="btn btn-outline btn-sm"
        style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
      >
        {loading ? 'Enviando...' : claimed ? 'Solicitação enviada!' : 'Este terreiro é seu? Reivindique este perfil'}
      </button>
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
