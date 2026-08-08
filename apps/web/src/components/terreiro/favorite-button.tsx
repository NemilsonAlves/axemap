'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';

export function FavoriteButton({ terreiroId }: { terreiroId: string }) {
  const { user, token } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <a href="/auth/login" className="btn btn-outline btn-sm">
        Favoritar
      </a>
    );
  }

  const toggle = async () => {
    setLoading(true);
    try {
      if (favorited) {
        await api.delete(`/growth/terreiros/${terreiroId}/favoritar`, token || undefined);
        setFavorited(false);
      } else {
        await api.post(`/growth/terreiros/${terreiroId}/favoritar`, {}, token || undefined);
        setFavorited(true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${favorited ? 'btn-primary' : 'btn-outline'} btn-sm`}
    >
      {loading ? '...' : favorited ? 'Favorito' : 'Favoritar'}
    </button>
  );
}
