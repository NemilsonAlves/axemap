'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { EvolutionDashboard } from '@/types/evolution';
import { AxScoreHeader } from './axscore-header';
import { MissionsSection } from './missions-section';
import { AchievementsSection } from './achievements-section';
import { ComparacaoSection } from './comparacao-section';
import { TimelineSection } from './timeline-section';
import { AcoesSection } from './acoes-section';
import './evolucao.css';

export default function CentralEvolucaoPage() {
  const { user, token, loading } = useAuth();
  const [dashboard, setDashboard] = useState<EvolutionDashboard | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      setError('Faça login para acessar a Central de Evolução');
      return;
    }

    api.get<EvolutionDashboard>('/evolucao/me', token || undefined)
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setFetching(false));
  }, [user, token, loading]);

  if (loading || fetching) {
    return (
      <div className="evolucao-loading">
        <div className="evolucao-spinner" />
        <p>Carregando sua Central de Evolução...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evolucao-error">
        <h2>Central de Evolução</h2>
        <p>{error}</p>
        {!user && <a href="/auth/login" className="btn btn-primary">Fazer Login</a>}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="evolucao-page">
      <AxScoreHeader
        score={dashboard.axScore}
        stats={dashboard.stats}
        completude={dashboard.completude}
      />

      <div className="evolucao-grid">
        <div className="evolucao-main">
          <MissionsSection
            missoes={dashboard.missoes}
            total={dashboard.stats.totalMissoes}
            completas={dashboard.stats.missoesCompletas}
          />
          <AchievementsSection
            conquistas={dashboard.conquistas}
            total={dashboard.stats.totalConquistas}
            obtidas={dashboard.stats.conquistasObtidas}
          />
          <TimelineSection historico={dashboard.historico} />
        </div>
        <aside className="evolucao-sidebar">
          <ComparacaoSection comparacao={dashboard.comparacao} score={dashboard.axScore} />
          <AcoesSection acoes={dashboard.acoes} />
        </aside>
      </div>
    </div>
  );
}
