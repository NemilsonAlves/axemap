'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import '../auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useI18n();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, senha);
      router.push('/perfil');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Painel visual — lado esquerdo */}
        <div className="auth-art" aria-hidden="true">
          <div className="auth-art-content">
            {/* Adinkra / grafismo ancestral em SVG inline */}
            <svg
              viewBox="0 0 200 200"
              width="120"
              height="120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="auth-art-symbol"
              aria-hidden="true"
            >
              {/* Símbolo Adinkra "Gye Nyame" simplificado */}
              <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="30" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
              {/* Cruz do axé */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
              {/* Oito pontas */}
              <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              <line x1="164" y1="36" x2="36" y2="164" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
              {/* Estrela central */}
              <polygon
                points="100,70 108,92 132,92 113,106 120,128 100,114 80,128 87,106 68,92 92,92"
                fill="rgba(255,255,255,0.18)"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.5"
              />
            </svg>

            <div className="auth-art-text">
              <h2 className="auth-art-titulo">{t('auth.art_titulo')}</h2>
              <p className="auth-art-subtitulo">{t('auth.art_subtitulo')}</p>
              <blockquote className="auth-art-frase">"{t('auth.art_frase')}"</blockquote>
            </div>

            {/* Decoração de fundo — padrão de pontos */}
            <div className="auth-art-dots" aria-hidden="true" />
          </div>
        </div>

        {/* Formulário — lado direito */}
        <div className="auth-form-wrap">
          {/* Marca */}
          <div className="auth-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">AxéMap</span>
          </div>

          <div>
            <h1 className="auth-title">{t('auth.entrar')}</h1>
            <p className="auth-subtitle">{t('auth.subtitle_login')}</p>
          </div>

          {error && (
            <div role="alert" className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="auth-field">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="senha">{t('auth.senha')}</label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={8}
                required
                autoComplete="current-password"
                className="input"
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              {t('auth.entrar')}
            </button>
          </form>

          <div className="auth-links">
            <a href="/auth/esqueci-senha" className="auth-link" style={{ fontWeight: 400, color: 'var(--color-muted-foreground)' }}>
              {t('auth.esqueceu_senha')}
            </a>
            <a href="/auth/cadastro" className="auth-link">
              {t('auth.ja_tem_conta')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
