'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import '../admin.css';
import './transparencia-admin.css';

interface TrustDash {
  perfisVerificados: number;
  solicitacoesPendentes: number;
  mediacoes: { emAndamento: number; publicadas: number };
  antifraude: { bloqueadas: number; criticasPendentes: number };
  certificacoes: number;
  trustScoreMedio: number;
  complianceConformes: number;
}

interface Relatorio {
  geradoEm: string;
  instituicao: string;
  url: string;
  metricas: Record<string, string | number>;
  moderacao: {
    denuncias: { total: number; pendentes: number };
    auditoria: number;
    feedbacks: number;
  };
  confianca: {
    perfisVerificados: number;
    solicitacoesPendentes: number;
    selosAtivos: number;
    mediacoesPublicadas: number;
    mediacoesEmAndamento: number;
    fraudesBloqueadas: number;
    trustScoreMedio: number;
    complianceConformes: number;
  };
}

export default function AdminTransparenciaPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [baixando, setBaixando] = useState<'json' | 'csv' | null>(null);

  const isAdmin = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dash, denuncias, audit, feedbacks, retention] = await Promise.all([
        api.get<TrustDash>('/admin/trust/dashboard'),
        api.get<any>('/admin/moderation?limit=1'),
        api.get<any>('/admin/audit-logs?limit=1'),
        api.get<any>('/feedback?limit=1'),
        api.get<any>('/analytics/retention'),
      ]);
      const denunciasData = denuncias?.data ?? [];
      const pendentes = denunciasData.filter((d: any) => d.status === 'PENDENTE').length;

      setRelatorio({
        geradoEm: new Date().toISOString(),
        instituicao: 'AxéMap',
        url: typeof window !== 'undefined' ? window.location.origin : '',
        metricas: {
          totalUsuariosAtivos: retention?.totalUsuarios ?? 0,
          wau: retention?.wau ?? 0,
          mau: retention?.mau ?? 0,
        },
        moderacao: {
          denuncias: { total: denunciasData.length, pendentes },
          auditoria: audit?.data?.length ?? 0,
          feedbacks: feedbacks?.data?.length ?? 0,
        },
        confianca: {
          perfisVerificados: dash?.perfisVerificados ?? 0,
          solicitacoesPendentes: dash?.solicitacoesPendentes ?? 0,
          selosAtivos: dash?.certificacoes ?? 0,
          mediacoesPublicadas: dash?.mediacoes?.publicadas ?? 0,
          mediacoesEmAndamento: dash?.mediacoes?.emAndamento ?? 0,
          fraudesBloqueadas: dash?.antifraude?.bloqueadas ?? 0,
          trustScoreMedio: dash?.trustScoreMedio ?? 0,
          complianceConformes: dash?.complianceConformes ?? 0,
        },
      });
    } catch (e) {
      setError('Não foi possível montar o relatório de transparência.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) carregar();
  }, [isAdmin, carregar]);

  const baixarArquivo = (conteudo: string, nome: string, mime: string) => {
    const blob = new Blob([conteudo], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const baixarJson = () => {
    if (!relatorio) return;
    setBaixando('json');
    baixarArquivo(JSON.stringify(relatorio, null, 2), `axemap-transparencia-${relatorio.geradoEm.slice(0, 10)}.json`, 'application/json;charset=utf-8');
    setTimeout(() => setBaixando(null), 600);
  };

  const baixarCsv = () => {
    if (!relatorio) return;
    setBaixando('csv');
    const linhas: string[][] = [
      ['Seção', 'Métrica', 'Valor'],
      ...Object.entries(relatorio.confianca).map(([k, v]) => ['Confiança', k, String(v)]),
      ...Object.entries(relatorio.metricas).map(([k, v]) => ['Plataforma', k, String(v)]),
      ['Moderação', 'Denúncias totais', String(relatorio.moderacao.denuncias.total)],
      ['Moderação', 'Denúncias pendentes', String(relatorio.moderacao.denuncias.pendentes)],
      ['Moderação', 'Registros de auditoria', String(relatorio.moderacao.auditoria)],
      ['Moderação', 'Feedbacks', String(relatorio.moderacao.feedbacks)],
    ];
    const csv = linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    baixarArquivo(`\uFEFF${csv}`, `axemap-transparencia-${relatorio.geradoEm.slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
    setTimeout(() => setBaixando(null), 600);
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Acesso restrito</h2>
          <p>Você precisa ser administrador para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page tp-admin">
      <div className="admin-header">
        <h1>Transparência</h1>
        <div className="admin-tabs">
          <a href="/admin" className="admin-tab" style={{ textDecoration: 'none' }}>← Painel</a>
          <Link href="/transparencia" className="admin-tab" style={{ textDecoration: 'none' }}>Relatório público</Link>
        </div>
      </div>

      {error && <div className="admin-error-msg">{error}</div>}

      <div className="admin-card">
        <h2 className="admin-card-title">Gerar relatório de transparência</h2>
        <p className="tp-admin-desc">
          Monte o relatório agregado da plataforma (moderação, verificação, mediação e compliance) e exporte em JSON ou CSV
          para publicação na página pública de Transparência.
        </p>
        <div className="tp-admin-actions">
          <button className="btn-admin-approve" onClick={baixarJson} disabled={!relatorio || baixando !== null}>
            {baixando === 'json' ? 'Gerando...' : 'Baixar JSON'}
          </button>
          <button className="btn-admin-status" onClick={baixarCsv} disabled={!relatorio || baixando !== null}>
            {baixando === 'csv' ? 'Gerando...' : 'Baixar CSV'}
          </button>
          <button className="btn-admin-reject" onClick={carregar} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar dados'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Montando relatório...</p>
        </div>
      ) : relatorio ? (
        <>
          <div className="admin-card">
            <h2 className="admin-card-title">Confiança & integridade</h2>
            <div className="admin-grid">
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.perfisVerificados}</span>
                <span className="admin-metric-label">Perfis verificados</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.solicitacoesPendentes}</span>
                <span className="admin-metric-label">Solicitações pendentes</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.selosAtivos}</span>
                <span className="admin-metric-label">Selos ativos</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.trustScoreMedio}</span>
                <span className="admin-metric-label">Trust Score médio</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.mediacoesPublicadas}</span>
                <span className="admin-metric-label">Mediações publicadas</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.mediacoesEmAndamento}</span>
                <span className="admin-metric-label">Mediações em andamento</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.fraudesBloqueadas}</span>
                <span className="admin-metric-label">Fraudes bloqueadas</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.confianca.complianceConformes}</span>
                <span className="admin-metric-label">Checklists conformes</span>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Moderação & atendimento</h2>
            <div className="admin-grid">
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.moderacao.denuncias.total}</span>
                <span className="admin-metric-label">Denúncias totais</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.moderacao.denuncias.pendentes}</span>
                <span className="admin-metric-label">Denúncias pendentes</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.moderacao.auditoria}</span>
                <span className="admin-metric-label">Registros de auditoria</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{relatorio.moderacao.feedbacks}</span>
                <span className="admin-metric-label">Feedbacks recebidos</span>
              </div>
            </div>
          </div>

          <div className="tp-admin-note">
            Relatório gerado em <strong>{new Date(relatorio.geradoEm).toLocaleString('pt-BR')}</strong>. A publicação no site
            público deve considerar LGPD: use apenas métricas agregadas, sem dados pessoais.{' '}
            <Link href="/governanca" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Saiba mais sobre governança →
            </Link>
          </div>
        </>
      ) : (
        <div className="admin-empty">Nenhum dado disponível.</div>
      )}
    </div>
  );
}
