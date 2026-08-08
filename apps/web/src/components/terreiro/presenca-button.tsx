'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';

export function PresencaButton({ eventoId }: { eventoId: string }) {
  const { user } = useAuth();
  const [confirmado, setConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <a href="/auth/login" className="btn btn-secondary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}>
        Entrar para confirmar
      </a>
    );
  }

  const toggle = async () => {
    setLoading(true);
    try {
      if (confirmado) {
        await api.delete(`/growth/eventos/${eventoId}/presenca`);
        setConfirmado(false);
      } else {
        await api.post(`/growth/eventos/${eventoId}/presenca`, { status: 'CONFIRMADO' });
        setConfirmado(true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${confirmado ? 'btn-primary' : 'btn-secondary'}`}
      style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}
    >
      {loading ? '...' : confirmado ? '✓ Presença confirmada' : 'Confirmar presença'}
    </button>
  );
}
