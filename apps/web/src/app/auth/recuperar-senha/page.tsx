'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import '../auth.css';

function RecuperarSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!token) {
      setErro('Link de recuperação inválido. Solicite um novo em "Esqueci minha senha".');
      return;
    }
    if (novaSenha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      await api.post<{ message: string }>('/auth/reset-password', { token, novaSenha });
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ minHeight: 460 }}>
        <div className="auth-art" aria-hidden="true" />
        <div className="auth-form-wrap">
          <div className="auth-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">AxéMap</span>
          </div>
          <h1 className="auth-title">Definir nova senha</h1>
          {email && <p className="auth-subtitle">Redefina a senha da conta <strong>{email}</strong>.</p>}

          {sucesso ? (
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
              <strong>Senha redefinida.</strong> Agora você já pode entrar com a nova senha.
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="btn btn-primary" onClick={() => router.push('/auth/login')}>
                  Ir para o login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="auth-field">
                <label htmlFor="nova-senha">Nova senha</label>
                <input
                  id="nova-senha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                  className="input"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="confirmar-senha">Confirmar nova senha</label>
                <input
                  id="confirmar-senha"
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
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
                {carregando ? 'Salvando…' : 'Redefinir senha'}
              </button>
            </form>
          )}

          <div className="auth-links">
            <Link href="/auth/login" className="auth-link">Voltar ao login</Link>
            <Link href="/auth/esqueci-senha" className="auth-link">Solicitar novo link</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarSenhaForm />
    </Suspense>
  );
}
