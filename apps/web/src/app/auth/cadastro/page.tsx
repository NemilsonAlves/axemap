'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import '../auth.css';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signup } = useAuth();
  const { t } = useI18n();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('Senhas não conferem');
      return;
    }

    if (senha.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    try {
      await signup(email, nome, senha);
      router.push('/perfil');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Painel visual — lado esquerdo */}
        <div className="auth-art" aria-hidden="true">
          <div className="auth-art-content">
            <svg
              viewBox="0 0 200 200"
              width="120"
              height="120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="auth-art-symbol"
              aria-hidden="true"
            >
              {/* Símbolo Adinkra "Sankofa" — olhar para o passado para avançar */}
              <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="55" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
              {/* Coração invertido / Sankofa */}
              <path
                d="M100 140 C 60 110, 40 80, 70 60 C 85 50, 100 65, 100 65 C 100 65, 115 50, 130 60 C 160 80, 140 110, 100 140 Z"
                fill="rgba(255,255,255,0.15)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />
              <circle cx="100" cy="55" r="8" fill="rgba(255,255,255,0.3)" />
              {/* Padrão radial */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="36" y1="36" x2="164" y2="164" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="164" y1="36" x2="36" y2="164" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>

            <div className="auth-art-text">
              <h2 className="auth-art-titulo">{t('auth.art_titulo')}</h2>
              <p className="auth-art-subtitulo">{t('auth.art_subtitulo')}</p>
              <blockquote className="auth-art-frase">"{t('auth.art_frase')}"</blockquote>
            </div>

            <div className="auth-art-dots" aria-hidden="true" />
          </div>
        </div>

        {/* Formulário — lado direito */}
        <div className="auth-form-wrap">
          <div className="auth-brand">
            <span className="auth-brand-dot" />
            <span className="auth-brand-name">AxéMap</span>
          </div>

          <div>
            <h1 className="auth-title">{t('auth.criar_conta')}</h1>
            <p className="auth-subtitle">{t('auth.subtitle_cadastro')}</p>
          </div>

          {error && (
            <div role="alert" className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="auth-field">
              <label htmlFor="nome">{t('auth.nome')}</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
                className="input"
              />
            </div>

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
                autoComplete="new-password"
                className="input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirmarSenha">{t('auth.confirmar_senha')}</label>
              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                className="input"
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" style={{ marginTop: '0.25rem' }}>
              {t('auth.criar')}
            </button>
          </form>

          <div className="auth-links" style={{ justifyContent: 'center' }}>
            <a href="/auth/login" className="auth-link">
              {t('auth.ja_tem_conta')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
