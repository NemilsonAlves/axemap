'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';

export function MatricularButton({ cursoId }: { cursoId: string }) {
  const { user } = useAuth();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [erro, setErro] = useState('');

  if (!user) {
    return <a href="/auth/login" className="btn btn-secondary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}>Entrar para matricular</a>;
  }

  const matricular = async () => {
    setState('loading');
    try {
      await api.post(`/cursos/${cursoId}/matricular`, {});
      setState('done');
    } catch (e) {
      setState('error');
      setErro(e instanceof Error ? e.message : 'Erro ao matricular');
    }
  };

  if (state === 'done') {
    return <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>✓ Matriculado</span>;
  }

  return (
    <div>
      <button
        onClick={matricular}
        disabled={state === 'loading'}
        className="btn btn-primary"
        style={{ padding: '0.35rem 0.9rem', fontSize: '0.8rem' }}
      >
        {state === 'loading' ? 'Matriculando...' : 'Matricular'}
      </button>
      {state === 'error' && <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>{erro}</div>}
    </div>
  );
}
