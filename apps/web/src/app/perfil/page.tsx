'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function PerfilPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading) return <p>Carregando...</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Meu Perfil</h1>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{user.nome}</h2>
            <p style={{ color: 'var(--color-gray-300)' }}>{user.email}</p>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              background: 'var(--color-secondary)',
              color: 'white',
              marginTop: '0.5rem',
            }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="btn btn-secondary"
          style={{ borderColor: '#c00', color: '#c00' }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
