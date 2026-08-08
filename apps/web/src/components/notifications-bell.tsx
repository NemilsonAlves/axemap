'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  lida: boolean;
  createdAt: string;
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notificacao[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setCount(0);
      setItems([]);
      return;
    }
    carregar();
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const carregar = async () => {
    try {
      const [cnt, lista] = await Promise.all([
        api.get<{ total: number }>('/notificacoes/nao-lidas/count'),
        api.get<{ data: Notificacao[] }>('/notificacoes?limit=20'),
      ]);
      setCount(cnt.total || 0);
      setItems(lista.data || []);
    } catch {}
  };

  const marcarLida = async (id: string) => {
    await api.patch(`/notificacoes/${id}/lida`, {});
    carregar();
  };

  const marcarTodas = async () => {
    await api.patch('/notificacoes/lidas', {});
    carregar();
  };

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => { setOpen(!open); if (!open) carregar(); }}
        aria-label="Notificações"
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -8,
            background: 'var(--danger)', color: 'var(--color-white)',
            borderRadius: '9999px', fontSize: '0.65rem',
            padding: '0.1rem 0.35rem', lineHeight: 1.2,
          }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 8,
          width: 320, maxHeight: 400, overflowY: 'auto',
          background: 'var(--color-card)', border: '1px solid var(--color-gray-200)',
          borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 50,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-gray-200)',
          }}>
            <strong>Notificações</strong>
            {count > 0 && (
              <button onClick={marcarTodas} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-gray-300)', fontSize: '0.85rem' }}>
              Nenhuma notificação.
            </p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.lida) marcarLida(n.id); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                  border: 'none', borderBottom: '1px solid var(--color-gray-100)',
                  background: n.lida ? 'var(--color-card)' : 'var(--color-accent)', cursor: n.lida ? 'default' : 'pointer',
                }}
              >
                <div style={{ fontWeight: n.lida ? 500 : 700, fontSize: '0.85rem' }}>{n.titulo}</div>
                {n.mensagem && <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-300)' }}>{n.mensagem}</div>}
                <div style={{ fontSize: '0.68rem', color: 'var(--color-gray-300)', marginTop: '0.25rem' }}>
                  {new Date(n.createdAt).toLocaleString('pt-BR')}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
