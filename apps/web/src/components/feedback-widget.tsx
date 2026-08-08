'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';

const TIPOS = [
  { value: 'SUGESTAO', label: 'Sugestão' },
  { value: 'BUG', label: 'Bug' },
  { value: 'ELOGIO', label: 'Elogio' },
  { value: 'CRITICA', label: 'Crítica' },
  { value: 'DUVIDA', label: 'Dúvida' },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState('SUGESTAO');
  const [mensagem, setMensagem] = useState('');
  const [contato, setContato] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    try {
      await api.post('/feedback', {
        tipo,
        mensagem: mensagem.trim(),
        pagina: window.location.pathname,
        contato: contato.trim() || undefined,
      });
      setEnviado(true);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    }
  };

  const reset = () => {
    setOpen(false);
    setTipo('SUGESTAO');
    setMensagem('');
    setContato('');
    setEnviado(false);
    setError('');
  };

  return (
    <>
      <button
        className="feedback-fab"
        onClick={() => setOpen(true)}
        aria-label="Enviar feedback"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--color-accent)', color: 'var(--color-white)',
          border: 'none', cursor: 'pointer', fontSize: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        💬
      </button>

      {open && (
        <div
          className="feedback-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) reset(); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1001,
          }}
        >
          <div
            className="feedback-modal"
            style={{
              background: 'var(--color-card)', color: 'var(--color-text)', borderRadius: '16px', padding: '2rem',
              maxWidth: '480px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {enviado ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🙏</div>
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Obrigado!</h3>
                <p style={{ color: 'var(--color-gray-400)', marginBottom: '1rem' }}>
                  Seu feedback nos ajuda a melhorar.
                </p>
                <button onClick={reset} className="btn-primary" style={{
                  background: 'var(--color-accent)', color: 'var(--color-white)',
                  border: 'none', borderRadius: '8px', padding: '0.625rem 1.5rem',
                  cursor: 'pointer', fontWeight: 600,
                }}>
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Enviar Feedback</h3>

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
                  Tipo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  style={{
                    width: '100%', padding: '0.625rem', borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)', marginBottom: '1rem',
                    background: 'var(--color-card)', color: 'var(--color-text)', fontSize: '0.9rem',
                  }}
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
                  Mensagem
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={4}
                  required
                  placeholder="Conte o que você pensa..."
                  style={{
                    width: '100%', padding: '0.625rem', borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)', marginBottom: '1rem',
                    resize: 'vertical', fontSize: '0.9rem', fontFamily: 'inherit',
                  }}
                />

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text)' }}>
                  Contato (opcional)
                </label>
                <input
                  type="text"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Email ou WhatsApp"
                  style={{
                    width: '100%', padding: '0.625rem', borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)', marginBottom: '0.25rem',
                    fontSize: '0.9rem',
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-300)', marginBottom: '1rem' }}>
                  Caso queira um retorno sobre seu feedback.
                </p>

                {error && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={reset} style={{
                    background: 'transparent', border: '1px solid var(--color-gray-200)',
                    borderRadius: '8px', padding: '0.625rem 1.5rem', cursor: 'pointer',
                    fontWeight: 500,
                  }}>
                    Cancelar
                  </button>
                  <button type="submit" style={{
                    background: 'var(--color-accent)', color: 'var(--color-white)',
                    border: 'none', borderRadius: '8px', padding: '0.625rem 1.5rem',
                    cursor: 'pointer', fontWeight: 600,
                  }}>
                    Enviar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
