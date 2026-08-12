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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    try {
      await signup(email, nome, senha);
      router.push('/perfil');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">

        {/* ── Painel artístico ─────────────────────────────────── */}
        <div className="auth-art" aria-hidden="true">

          {/* SVG de fundo — motivos religiosos afro */}
          <svg
            className="auth-art-bg"
            viewBox="0 0 400 600"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* padrão de losangos kente */}
              <pattern id="kente-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="20" height="20" fill="rgba(255,200,80,0.04)" />
                <rect x="20" y="20" width="20" height="20" fill="rgba(255,200,80,0.04)" />
                <rect x="0" y="0" width="40" height="40" fill="none"
                  stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="600" fill="url(#kente-grid)" />

            {/* Espiral do Sankofa — canto superior esquerdo */}
            <path d="M80,80 C 80,40 120,20 140,50 C 160,80 130,120 90,110 C 60,100 55,70 80,80 Z"
              fill="none" stroke="rgba(255,200,80,0.12)" strokeWidth="1.5" />
            <circle cx="140" cy="50" r="8" fill="none" stroke="rgba(255,200,80,0.12)" strokeWidth="1" />

            {/* Losango Adinkra — centro */}
            <polygon points="200,80 320,200 200,320 80,200"
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <polygon points="200,100 300,200 200,300 100,200"
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

            {/* Iroco / Árvore sagrada — canto inferior direito */}
            <line x1="360" y1="580" x2="360" y2="440" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <path d="M360,460 C 330,440 310,460 340,480" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <path d="M360,480 C 390,460 410,480 380,500" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <path d="M360,440 C 335,415 315,435 345,455" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Cruz yorùbá — centro esquerdo */}
            <g transform="translate(60,300)" opacity="0.1">
              <circle cx="0" cy="0" r="35" fill="none" stroke="rgba(255,200,80,0.8)" strokeWidth="1" />
              <circle cx="0" cy="0" r="20" fill="none" stroke="rgba(255,200,80,0.6)" strokeWidth="0.8" />
              <line x1="-35" y1="0" x2="35" y2="0" stroke="rgba(255,200,80,0.8)" strokeWidth="1" />
              <line x1="0" y1="-35" x2="0" y2="35" stroke="rgba(255,200,80,0.8)" strokeWidth="1" />
            </g>

            {/* Ondas — lado direito */}
            <path d="M380,150 Q400,180 380,210 Q360,240 380,270 Q400,300 380,330 Q360,360 380,390"
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" />

            {/* Estrela de Davi / hexagrama — canto inferior esquerdo */}
            <g transform="translate(60,520)" opacity="0.08">
              <polygon points="0,-30 26,15 -26,15" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="1" />
              <polygon points="0,30 26,-15 -26,-15" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="1" />
            </g>

            {/* Triângulos aninhados — topo direito */}
            <polygon points="350,20 390,80 310,80"
              fill="none" stroke="rgba(255,200,80,0.1)" strokeWidth="1" />
            <polygon points="350,32 378,74 322,74"
              fill="none" stroke="rgba(255,200,80,0.07)" strokeWidth="0.8" />
          </svg>

          <div className="auth-art-dots" />
          <div className="auth-art-glow" />

          <div className="auth-art-content">
            {/* Símbolo Sankofa central */}
            <svg
              viewBox="0 0 200 200"
              width="130"
              height="130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="auth-art-symbol"
            >
              {/* Aros externos */}
              <circle cx="100" cy="100" r="92" stroke="rgba(255,200,80,0.18)" strokeWidth="1" />
              <circle cx="100" cy="100" r="72" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
              {/* Sankofa: coração invertido (olhar para o passado) */}
              <path
                d="M100 148 C 55 112, 32 76, 66 54 C 84 43, 100 62, 100 62
                   C 100 62, 116 43, 134 54 C 168 76, 145 112, 100 148 Z"
                fill="rgba(255,200,80,0.15)"
                stroke="rgba(255,200,80,0.65)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Ave do Sankofa — pescoço curvado */}
              <path d="M100 62 Q 95 44 106 36 Q 118 30 115 48"
                fill="none" stroke="rgba(255,200,80,0.5)" strokeWidth="1.5" />
              {/* Olho */}
              <circle cx="110" cy="38" r="4" fill="rgba(255,200,80,0.5)" />
              {/* Eixos de fundo */}
              <line x1="100" y1="8" x2="100" y2="192" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
              <line x1="8" y1="100" x2="192" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
            </svg>

            {/* Ícones religiosos */}
            <div className="auth-art-icons">
              {/* Símbolo do vento / Iansã */}
              <svg className="auth-art-icon" viewBox="0 0 36 36" fill="none">
                <path d="M8 18 Q 18 8 28 18 Q 18 28 8 18 Z"
                  fill="rgba(255,200,80,0.2)" stroke="rgba(255,200,80,0.6)" strokeWidth="1.2" />
                <circle cx="18" cy="18" r="3" fill="rgba(255,200,80,0.5)" />
                <path d="M18 6 Q 22 12 18 18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" />
                <path d="M30 12 Q 26 16 18 18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" />
                <path d="M30 24 Q 26 20 18 18" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" />
              </svg>
              {/* Axé / chama sagrada */}
              <svg className="auth-art-icon" viewBox="0 0 36 36" fill="none">
                <path d="M18 32 C 18 32, 6 24, 10 14 C 12 8, 18 10, 18 6 C 18 10, 24 8, 26 14 C 30 24, 18 32, 18 32 Z"
                  fill="rgba(255,200,80,0.28)" stroke="rgba(255,200,80,0.65)" strokeWidth="1.2" />
                <path d="M18 26 C 18 26, 13 22, 15 17 C 16 14, 18 16, 18 13 C 18 16, 20 14, 21 17 C 23 22, 18 26, 18 26 Z"
                  fill="rgba(255,255,255,0.2)" />
              </svg>
              {/* Búzio / concha */}
              <svg className="auth-art-icon" viewBox="0 0 36 36" fill="none">
                <ellipse cx="18" cy="18" rx="12" ry="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                <path d="M10 18 Q 14 14 18 18 Q 22 22 26 18"
                  fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.9" />
                <path d="M10 18 Q 14 22 18 18 Q 22 14 26 18"
                  fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                <circle cx="18" cy="18" r="2.5" fill="rgba(255,255,255,0.25)" />
              </svg>
            </div>

            <div className="auth-art-text">
              <h2 className="auth-art-titulo">{t('auth.art_titulo')}</h2>
              <p className="auth-art-subtitulo">{t('auth.art_subtitulo')}</p>
              <blockquote className="auth-art-frase">"{t('auth.art_frase')}"</blockquote>
            </div>
          </div>

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
            <h1 className="auth-title">{t('auth.criar_conta')}</h1>
            <p className="auth-subtitle">{t('auth.subtitle_cadastro')}</p>
          </div>

          {error && (
            <div role="alert" className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div className="auth-field">
              <label htmlFor="nome">{t('auth.nome')}</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                autoComplete="name"
                placeholder="Seu nome completo"
                className="auth-input"
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
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmarSenha">{t('auth.confirmar_senha')}</label>
              <div className="auth-password-wrap">
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  className="auth-input"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setMostrarConfirmar((v) => !v)}
                  aria-label={mostrarConfirmar ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                  tabIndex={-1}
                >
                  {mostrarConfirmar ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
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
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? 'Criando conta...' : t('auth.criar')}
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
