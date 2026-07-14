'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';

export function FollowButton({ terreiroId }: { terreiroId: string }) {
  const { user, token } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <a href="/auth/login" className="btn btn-outline btn-sm">
        Seguir
      </a>
    );
  }

  const toggle = async () => {
    setLoading(true);
    try {
      if (following) {
        await api.delete(`/growth/terreiros/${terreiroId}/seguir`, token || undefined);
        setFollowing(false);
      } else {
        await api.post(`/growth/terreiros/${terreiroId}/seguir`, {}, token || undefined);
        setFollowing(true);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${following ? 'btn-outline' : 'btn-primary'} btn-sm`}
    >
      {loading ? '...' : following ? 'Seguindo' : 'Seguir'}
    </button>
  );
}
