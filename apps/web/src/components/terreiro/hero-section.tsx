import type { TerreiroPerfil } from '@/types/terreiro';
import { ShareButtons } from './share-buttons';
import { FollowButton } from './follow-button';

function TrustScoreBadge({ score, label }: { score: number; label: string }) {
  const hue = Math.min(score * 1.2, 120);
  return (
    <div
      className="trust-score-badge"
      style={{ '--ts-hue': hue } as React.CSSProperties}
      title={`Trust Score: ${score}/100 — ${label}`}
    >
      <div className="trust-score-ring">
        <svg viewBox="0 0 36 36" width="48" height="48">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--color-gray-200)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={`hsl(${hue}, 50%, 45%)`}
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <span className="trust-score-value">{score}</span>
      </div>
      <span className="trust-score-label">{label}</span>
    </div>
  );
}

export function HeroSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const hasPhoto = !!terreiro.fotoUrl;
  const shareUrl = `https://axemap.com.br/terreiro/${terreiro.slug}`;

  return (
    <div className={`hero-section ${hasPhoto ? 'has-photo' : ''}`}>
      {hasPhoto && (
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${terreiro.fotoUrl})` }}
        />
      )}
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-main">
          <div className="hero-info">
            <div className="hero-badges">
              {terreiro.isVerified && (
                <span className="tag tag-primary">Verificado</span>
              )}
              <span className="tag">
                {terreiro.tradicao?.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="hero-title">{terreiro.nome}</h1>
            <p className="hero-location">
              {terreiro.cidade}, {terreiro.estado}
            </p>
            {terreiro.descricaoCurta && (
              <p className="hero-desc">{terreiro.descricaoCurta}</p>
            )}
          </div>

          <div className="hero-actions">
            <TrustScoreBadge score={terreiro.trustScoreInfo.score} label={terreiro.trustScoreInfo.label} />

            <div className="hero-buttons">
              <FollowButton terreiroId={terreiro.id} />
              {terreiro.whatsapp && (
                <a
                  href={`https://wa.me/55${terreiro.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  WhatsApp
                </a>
              )}
              {terreiro.telefone && (
                <a href={`tel:${terreiro.telefone}`} className="btn btn-outline">
                  Ligar
                </a>
              )}
              {terreiro.instagram && (
                <a
                  href={`https://instagram.com/${terreiro.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Instagram
                </a>
              )}
              {terreiro.website && (
                <a
                  href={terreiro.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Site
                </a>
              )}
            </div>

            <ShareButtons url={shareUrl} title={terreiro.nome} />
          </div>
        </div>
      </div>
    </div>
  );
}
