'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import '../auth.css';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setCarregando(true);
    setErro(null);
    try {
      await api.post<{ message: string }>('/auth/forgot-password', { email });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível enviar as instruções.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ minHeight: 420 }}>
        <div className="auth-art" aria-hidden="true" />
        <div className="auth-form-wrap">
          <div className="auth-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">AxéMap</span>
          </div>
          <h1 className="auth-title">Recuperar senha</h1>
          <p className="auth-subtitle">Informe o e-mail da sua conta para iniciarmos a recuperação.</p>

          {enviado ? (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                border: '1px solid hsl(var(--info) / 0.35)',
                background: 'hsl(var(--info) / 0.08)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'var(--color-foreground)',
              }}
            >
              <strong>Instruções enviadas.</strong> Se o e-mail <strong>{email}</strong> estiver cadastrado, você
              receberá um link para redefinir sua senha. Verifique também a caixa de spam. Ainda não recebeu? Escreva
              para{' '}
              <a href={`mailto:contato@axemap.com.br?subject=Recuperação de senha&body=Meu e-mail de conta: ${encodeURIComponent(email)}`}>
                contato@axemap.com.br
              </a>{' '}
              e nossa equipe ajudará.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="auth-field">
                <label htmlFor="recuperar-email">E-mail</label>
                <input
                  id="recuperar-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  autoComplete="email"
                  required
                  className="input"
                />
              </div>
              {erro && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'hsl(var(--destructive))',
                  }}
                >
                  {erro}
                </p>
              )}
              <button type="submit" className="btn btn-primary" disabled={carregando}>
                {carregando ? 'Enviando…' : 'Enviar instruções'}
              </button>
            </form>
          )}

          <div className="auth-links">
            <Link href="/auth/login" className="auth-link">Voltar ao login</Link>
            <Link href="/auth/cadastro" className="auth-link">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
