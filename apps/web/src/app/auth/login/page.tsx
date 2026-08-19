'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import '../auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useI18n();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, senha);
      router.push('/perfil');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">

        {/* ── Painel artístico ─────────────────────────────────── */}
        <div className="auth-art" aria-hidden="true">

          {/* Imagens SVG de fundo — motivos religiosos */}
          <svg
            className="auth-art-bg"
            viewBox="0 0 400 600"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Grade de losangos Adinkra ao fundo */}
            <defs>
              <pattern id="adinkra-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                {/* losango */}
                <polygon points="30,5 55,30 30,55 5,30"
                  fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
                {/* cruz interna */}
                <line x1="30" y1="5" x2="30" y2="55" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <line x1="5" y1="30" x2="55" y2="30" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="600" fill="url(#adinkra-grid)" />

            {/* Atabaque — círculo grande canto inferior esquerdo */}
            <circle cx="40" cy="530" r="80"
              fill="none" stroke="rgba(255,200,80,0.08)" strokeWidth="1" />
            <circle cx="40" cy="530" r="55"
              fill="none" stroke="rgba(255,200,80,0.06)" strokeWidth="0.8" />

            {/* Atabaque — canto superior direito */}
            <circle cx="370" cy="80" r="70"
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <circle cx="370" cy="80" r="45"
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />

            {/* Estrela de 8 pontas yorùbá — canto superior esquerdo */}
            <g transform="translate(60,90) rotate(22.5)" opacity="0.09">
              <polygon points="0,-40 9,-12 38,-12 16,5 24,32 0,16 -24,32 -16,5 -38,-12 -9,-12"
                fill="rgba(255,200,80,1)" />
            </g>

            {/* Símbolo da encruzilhada de Exu — centro inferior */}
            <g transform="translate(200,540)" opacity="0.1">
              <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              <line x1="0" y1="-30" x2="0" y2="30" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
              <line x1="-30" y1="0" x2="30" y2="0" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
            </g>

            {/* Ondas de Iemanjá — linha fluida canto direito */}
            <path d="M360,200 Q380,230 360,260 Q340,290 360,320 Q380,350 360,380"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <path d="M380,210 Q400,240 380,270 Q360,300 380,330 Q400,360 380,390"
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

            {/* Triângulo sagrado — centro superior */}
            <polygon points="200,30 240,100 160,100"
              fill="none" stroke="rgba(255,200,80,0.1)" strokeWidth="1" />
            <polygon points="200,45 230,95 170,95"
              fill="none" stroke="rgba(255,200,80,0.07)" strokeWidth="0.8" />

            {/* Arco-íris de Oxumaré — arco grande central */}
            <path d="M50,400 Q200,250 350,400"
              fill="none" stroke="rgba(255,180,50,0.08)" strokeWidth="2" />
            <path d="M70,420 Q200,280 330,420"
              fill="none" stroke="rgba(255,180,50,0.05)" strokeWidth="1.5" />
          </svg>

          {/* camadas de pontos e brilho */}
          <div className="auth-art-dots" />
          <div className="auth-art-glow" />

          {/* conteúdo principal */}
          <div className="auth-art-content">
            {/* Símbolo Gye Nyame / Adinkra central */}
            <svg
              viewBox="0 0 200 200"
              width="130"
              height="130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="auth-art-symbol"
            >
              {/* Aros concêntricos */}
              <circle cx="100" cy="100" r="92" stroke="rgba(255,200,80,0.2)" strokeWidth="1" />
              <circle cx="100" cy="100" r="72" stroke="rgba(255,200,80,0.15)" strokeWidth="1" />
              <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <circle cx="100" cy="100" r="28" fill="rgba(255,200,80,0.1)" stroke="rgba(255,200,80,0.5)" strokeWidth="2" />
              {/* Eixos cardinais */}
              <line x1="100" y1="8" x2="100" y2="192" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
              <line x1="8" y1="100" x2="192" y2="100" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
              <line x1="34" y1="34" x2="166" y2="166" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="166" y1="34" x2="34" y2="166" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              {/* Estrela central de 8 pontas */}
              <polygon
                points="100,65 108.5,88 134,88 114,103 122,126 100,112 78,126 86,103 66,88 91.5,88"
                fill="rgba(255,200,80,0.22)"
                stroke="rgba(255,200,80,0.7)"
                strokeWidth="1.5"
              />
              {/* Ponto central */}
              <circle cx="100" cy="100" r="5" fill="rgba(255,200,80,0.8)" />
            </svg>

            {/* Ícones religiosos decorativos */}
            <div className="auth-art-icons">
              {/* Atabaque */}
              <svg className="auth-art-icon" viewBox="0 0 36 36" fill="none">
                <ellipse cx="18" cy="8" rx="10" ry="4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                <line x1="8" y1="8" x2="6" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                <line x1="28" y1="8" x2="30" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                <ellipse cx="18" cy="28" rx="12" ry="4" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
                <line x1="10" y1="18" x2="26" y2="18" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              </svg>
              {/* Símbolo do axé / chama */}
              <svg className="auth-art-icon" viewBox="0 0 36 36" fill="none">
                <path d="M18 32 C 18 32, 6 24, 10 14 C 12 8, 18 10, 18 6 C 18 10, 24 8, 26 14 C 30 24, 18 32, 18 32 Z"
                  fill="rgba(255,200,80,0.3)" stroke="rgba(255,200,80,0.7)" strokeWidth="1.2" />
                <circle cx="18" cy="20" r="4" fill="rgba(255,200,80,0.4)" />
              </svg>
              {/* Concha de Iemanjá */}
              <svg className="auth-art-icon" viewBox="0 0 36 36" fill="none">
                <path d="M18 4 C 8 4, 4 14, 6 22 C 8 28, 14 32, 18 32 C 22 32, 28 28, 30 22 C 32 14, 28 4, 18 4 Z"
                  fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                <line x1="18" y1="4" x2="18" y2="32" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                <path d="M10 12 Q 18 18 26 12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
                <path d="M8 20 Q 18 26 28 20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
              </svg>
            </div>

            <div className="auth-art-text">
              <h2 className="auth-art-titulo">{t('auth.art_titulo')}</h2>
              <p className="auth-art-subtitulo">{t('auth.art_subtitulo')}</p>
              <blockquote className="auth-art-frase">&ldquo;{t('auth.art_frase')}&rdquo;</blockquote>
            </div>
          </div>

          {/* Tagline inferior */}
          <div className="auth-art-tagline">
            <span>Mapa</span>
            <div className="auth-art-tagline-dot" />
            <span>Memória</span>
            <div className="auth-art-tagline-dot" />
            <span>Ancestralidade</span>
            <div className="auth-art-tagline-dot" />
            <span>Conexão</span>
          </div>
        </div>

        {/* ── Formulário ───────────────────────────────────────── */}
        <div className="auth-form-wrap">
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
                placeholder="seu@email.com"
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="senha">{t('auth.senha')}</label>
              <div className="auth-password-wrap">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setMostrarSenha((v) => !v)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {mostrarSenha ? (
                    /* Olho fechado */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    /* Olho aberto */
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? 'Entrando...' : t('auth.entrar')}
            </button>
          </form>

          <div className="auth-links">
            <a href="/auth/esqueci-senha" className="auth-link auth-link-muted">
              {t('auth.esqueceu_senha')}
            </a>
            <a href="/auth/cadastro" className="auth-link">
              {t('auth.nao_tem_conta')}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
