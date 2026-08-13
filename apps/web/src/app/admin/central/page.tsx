'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { useAnalytics } from '@/lib/analytics/analytics-context';
import { SaasAdminPanel } from './saas-panel';
import '../admin.css';

type Tab = 'overview' | 'terreiros' | 'moderacao' | 'verificacao' | 'feature-flags' | 'feedback' | 'trust' | 'saas';

interface OverviewData {
  acquisition: { novosUsuarios: number; novosTerreiros: number; convitesAceitos: number; periodo: string };
  activation: { taxaConclusao: number; totalIniciados: number; totalPublicados: number; abandonos: number };
  engagement: { missoesCompletas: number; fotosAdicionadas: number; eventosPublicados: number };
  retention: { wau: number; mau: number; retorno7d: number; retorno30d: number; totalUsuarios: number };
  funnel: { etapa: string; valor: number }[];
}

interface Reivindicacao {
  id: string;
  status: string;
  documentoUrl: string | null;
  mensagem: string | null;
  createdAt: string;
  usuario: { id: string; nome: string; email: string };
  terreiro: { id: string; nome: string; slug: string; cidade: string; estado: string };
}

interface TerreiroAdmin {
  id: string;
  nome: string;
  slug: string;
  cidade: string;
  estado: string;
  status: string;
  trustScore: number;
  isPublished: boolean;
  isVerified: boolean;
  createdAt: string;
}

const STATUS_TERREIRO = [
  'RASCUNHO', 'PENDENTE_REVISAO', 'EM_REVISAO', 'AGUARDANDO_DIRIGENTE',
  'PUBLICADO', 'EM_EDICAO', 'RECUSADO', 'BLOQUEADO', 'ARQUIVADO', 'SUSPENSO', 'VERIFICADO',
];

interface FeedbackItem {
  id: string;
  tipo: string;
  mensagem: string;
  pagina: string | null;
  contato: string | null;
  createdAt: string;
  usuario: { id: string; nome: string; email: string } | null;
}

interface FeatureFlag {
  id: string;
  chave: string;
  titulo: string;
  descricao: string | null;
  ativo: boolean;
  regras: any;
  createdAt: string;
  updatedAt: string;
}

interface Denuncia {
  id: string;
  motivo: string;
  descricao: string | null;
  tipo: string;
  entidadeId: string;
  status: string;
  createdAt: string;
  criadoPor: { id: string; nome: string; email: string };
  terreiro: { id: string; nome: string; slug: string; status: string } | null;
}

interface AuditLog {
  id: string;
  acao: string;
  entidadeTipo: string;
  entidadeId: string;
  antes: any;
  depois: any;
  createdAt: string;
  usuario: { id: string; nome: string; email: string } | null;
}

interface DocumentoVerificacao {
  id: string;
  tipo: string;
  arquivoUrl: string;
  status: string;
  createdAt: string;
  terreiro: { id: string; nome: string; slug: string; dirigenteId: string | null };
}

export default function AdminPage() {
  const { user, token } = useAuth();
  const { track } = useAnalytics();
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flagForm, setFlagForm] = useState({ chave: '', titulo: '', descricao: '', ativo: false });

  const [reivindicacoes, setReivindicacoes] = useState<Reivindicacao[]>([]);
  const [terreiros, setTerreiros] = useState<TerreiroAdmin[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [loadingTerreiros, setLoadingTerreiros] = useState(false);

  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingModeracao, setLoadingModeracao] = useState(false);

  const [documentos, setDocumentos] = useState<DocumentoVerificacao[]>([]);
  const [loadingVerificacao, setLoadingVerificacao] = useState(false);

  const isAdmin = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  useEffect(() => {
    if (!isAdmin) return;
    track('pagina_admin_vista');
    loadOverview();
    loadFlags();
    loadFeedbacks();
  }, [user]);

  useEffect(() => {
    if (tab === 'terreiros' && isAdmin) {
      loadReivindicacoes();
      loadTerreiros();
    }
    if (tab === 'moderacao' && isAdmin) {
      loadDenuncias();
      loadAuditLogs();
    }
    if (tab === 'verificacao' && isAdmin) {
      loadDocumentos();
    }
  }, [tab, user, filtroStatus]);

  const loadOverview = async () => {
    try {
      const [acquisition, activation, engagement, retention, funnel] = await Promise.all([
        api.get<any>('/analytics/acquisition?periodo=30d'),
        api.get<any>('/analytics/activation'),
        api.get<any>('/analytics/engagement'),
        api.get<any>('/analytics/retention'),
        api.get<any>('/analytics/funnel'),
      ]);
      setOverview({ acquisition, activation, engagement, retention, funnel });
    } catch (e) {
      setError('Erro ao carregar métricas');
    }
  };

  const loadFlags = async () => {
    try {
      const data = await api.get<FeatureFlag[]>('/feature-flags');
      setFlags(data);
    } catch {}
  };

  const loadFeedbacks = async () => {
    try {
      const data = await api.get<any>('/feedback?limit=100');
      setFeedbacks(data.data || []);
    } catch {}
  };

  const loadReivindicacoes = async () => {
    try {
      const data = await api.get<any>('/admin/terreiros/pendentes');
      setReivindicacoes(data.reivindicacoes || []);
    } catch {}
  };

  const loadTerreiros = async () => {
    setLoadingTerreiros(true);
    try {
      const query = filtroStatus ? `?status=${filtroStatus}&limit=100` : '?limit=100';
      const data = await api.get<any>(`/admin/terreiros${query}`);
      setTerreiros(data.data || []);
    } catch {}
    setLoadingTerreiros(false);
  };

  const aprovarReivindicacao = async (requestId: string) => {
    await api.post(`/admin/reivindicacoes/${requestId}/aprovar`, {});
    loadReivindicacoes();
    loadTerreiros();
  };

  const recusarReivindicacao = async (requestId: string) => {
    await api.post(`/admin/reivindicacoes/${requestId}/recusar`, {});
    loadReivindicacoes();
  };

  const mudarStatus = async (terreiro: TerreiroAdmin, status: string) => {
    await api.post(`/admin/terreiros/${terreiro.id}/status`, { status });
    loadTerreiros();
  };

  const loadDenuncias = async () => {
    setLoadingModeracao(true);
    try {
      const data = await api.get<any>('/admin/moderation?limit=100');
      setDenuncias(data.data || []);
    } catch {}
    setLoadingModeracao(false);
  };

  const loadAuditLogs = async () => {
    try {
      const data = await api.get<any>('/admin/audit-logs?limit=100');
      setAuditLogs(data.data || []);
    } catch {}
  };

  const resolverDenuncia = async (id: string, bloquear: boolean) => {
    await api.post(`/admin/moderation/${id}/resolver`, { bloquear });
    loadDenuncias();
    loadAuditLogs();
  };

  const loadDocumentos = async () => {
    setLoadingVerificacao(true);
    try {
      const data = await api.get<DocumentoVerificacao[]>('/verificacoes/pendentes');
      setDocumentos(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingVerificacao(false);
  };

  const revisarDocumento = async (id: string, status: 'APROVADO' | 'REJEITADO') => {
    const motivo =
      status === 'REJEITADO' ? window.prompt('Motivo da recusa (será enviado ao dirigente):') || undefined : undefined;
    await api.patch(`/verificacoes/${id}/status`, { status, motivo });
    loadDocumentos();
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    await api.patch(`/feature-flags/${flag.id}`, { ativo: !flag.ativo });
    loadFlags();
  };

  const createFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/feature-flags', {
      chave: flagForm.chave,
      titulo: flagForm.titulo,
      descricao: flagForm.descricao || undefined,
      ativo: flagForm.ativo,
    });
    setFlagForm({ chave: '', titulo: '', descricao: '', ativo: false });
    loadFlags();
  };

  const label = (v: number) => v.toLocaleString('pt-BR');

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

  if (loading && !overview) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <p>Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Visão Geral</button>
          <button className={`admin-tab ${tab === 'terreiros' ? 'active' : ''}`} onClick={() => setTab('terreiros')}>Terreiros</button>
          <button className={`admin-tab ${tab === 'moderacao' ? 'active' : ''}`} onClick={() => setTab('moderacao')}>Moderação</button>
          <button className={`admin-tab ${tab === 'verificacao' ? 'active' : ''}`} onClick={() => setTab('verificacao')}>Verificação</button>
          <button className={`admin-tab ${tab === 'feature-flags' ? 'active' : ''}`} onClick={() => setTab('feature-flags')}>Feature Flags</button>
          <button className={`admin-tab ${tab === 'feedback' ? 'active' : ''}`} onClick={() => setTab('feedback')}>Feedbacks</button>
          <button className={`admin-tab ${tab === 'trust' ? 'active' : ''}`} onClick={() => setTab('trust')}>Trust</button>
          <button className={`admin-tab ${tab === 'saas' ? 'active' : ''}`} onClick={() => setTab('saas')}>SaaS</button>
          <a href="/admin/system" className="admin-tab" style={{ textDecoration: 'none' }}>🖥️ System</a>
        </div>
      </div>

      {error && <div className="admin-error-msg">{error}</div>}

      {tab === 'overview' && overview && (
        <div className="admin-overview">
          {overview.funnel.length > 0 && (
            <div className="admin-card">
              <h2 className="admin-card-title">Funil de Conversão</h2>
              {overview.funnel.map((item, i) => (
                <div key={item.etapa} className="funnel-step">
                  <div className="funnel-label">{item.etapa}</div>
                  <div className="funnel-bar-track">
                    {i > 0 && (
                      <div
                        className="funnel-bar-fill"
                        style={{ width: `${overview.funnel[0].valor > 0 ? (item.valor / overview.funnel[0].valor) * 100 : 0}%` }}
                      />
                    )}
                  </div>
                  <div className="funnel-value">{label(item.valor)}</div>
                </div>
              ))}
              <div className="funnel-info">
                Taxa de conversão: {overview.activation.taxaConclusao}% &middot; Abandono: {overview.activation.abandonos || 0}
              </div>
            </div>
          )}

          <div className="admin-grid">
            <div className="admin-card">
              <h2 className="admin-card-title">Aquisição (30d)</h2>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.acquisition.novosUsuarios)}</span>
                <span className="admin-metric-label">Novos usuários</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.acquisition.novosTerreiros)}</span>
                <span className="admin-metric-label">Terreiros publicados</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.acquisition.convitesAceitos)}</span>
                <span className="admin-metric-label">Convites aceitos</span>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="admin-card-title">Ativação</h2>
              <div className="admin-metric">
                <span className="admin-metric-value">{overview.activation.taxaConclusao}%</span>
                <span className="admin-metric-label">Onboarding concluído</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.activation.totalIniciados)}</span>
                <span className="admin-metric-label">Iniciaram onboarding</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.activation.totalPublicados)}</span>
                <span className="admin-metric-label">Publicaram perfil</span>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="admin-card-title">Engajamento</h2>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.engagement.missoesCompletas)}</span>
                <span className="admin-metric-label">Missões completas</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.engagement.fotosAdicionadas)}</span>
                <span className="admin-metric-label">Fotos adicionadas</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.engagement.eventosPublicados)}</span>
                <span className="admin-metric-label">Eventos publicados</span>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="admin-card-title">Retenção</h2>
              <div className="admin-metric">
                <span className="admin-metric-value">{overview.retention.retorno7d}%</span>
                <span className="admin-metric-label">Retorno 7 dias (WAU)</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{overview.retention.retorno30d}%</span>
                <span className="admin-metric-label">Retorno 30 dias (MAU)</span>
              </div>
              <div className="admin-metric">
                <span className="admin-metric-value">{label(overview.retention.totalUsuarios)}</span>
                <span className="admin-metric-label">Usuários ativos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'terreiros' && (
        <div className="admin-terreiros">
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="admin-card-title">Reivindicações pendentes</h2>
            {reivindicacoes.length === 0 ? (
              <p className="admin-empty">Nenhuma reivindicação pendente.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reivindicacoes.map((r) => (
                  <div key={r.id} className="claim-item">
                    <div>
                      <strong>{r.terreiro.nome}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                        Solicitante: {r.usuario.nome} ({r.usuario.email}) &middot; {r.terreiro.cidade}, {r.terreiro.estado}
                      </div>
                      {r.mensagem && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)', marginTop: '0.25rem' }}>
                          &ldquo;{r.mensagem}&rdquo;
                        </div>
                      )}
                    </div>
                    <div className="claim-actions">
                      <button className="btn-admin-approve" onClick={() => aprovarReivindicacao(r.id)}>
                        Aprovar
                      </button>
                      <button className="btn-admin-reject" onClick={() => recusarReivindicacao(r.id)}>
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Terreiros cadastrados</h2>
            <div className="status-filter">
              <button className={filtroStatus === '' ? 'active' : ''} onClick={() => setFiltroStatus('')}>
                Todos
              </button>
              {STATUS_TERREIRO.map((s) => (
                <button
                  key={s}
                  className={filtroStatus === s ? 'active' : ''}
                  onClick={() => setFiltroStatus(s)}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {loadingTerreiros ? (
              <p className="admin-empty">Carregando terreiros...</p>
            ) : terreiros.length === 0 ? (
              <p className="admin-empty">Nenhum terreiro encontrado.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="terreiros-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Cidade</th>
                      <th>Status</th>
                      <th>Trust Score</th>
                      <th>Alterar status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terreiros.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <a href={`/t/${t.slug}`} style={{ color: 'var(--color-primary)' }}>{t.nome}</a>
                          {t.isVerified && <span style={{ fontSize: '0.7rem', color: '#16a34a' }}> ✔</span>}
                        </td>
                        <td>{t.cidade}, {t.estado}</td>
                        <td>
                          <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status.replace(/_/g, ' ')}</span>
                        </td>
                        <td>{t.trustScore?.toFixed(1)}</td>
                        <td>
                          <select
                            className="status-select"
                            value={t.status}
                            onChange={(e) => mudarStatus(t, e.target.value)}
                          >
                            {STATUS_TERREIRO.map((s) => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'moderacao' && (
        <div className="admin-moderacao">
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="admin-card-title">Denúncias</h2>
            {loadingModeracao ? (
              <p className="admin-empty">Carregando denúncias...</p>
            ) : denuncias.length === 0 ? (
              <p className="admin-empty">Nenhuma denúncia encontrada.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {denuncias.map((d) => (
                  <div key={d.id} className="claim-item">
                    <div>
                      <strong>{d.motivo}</strong>{' '}
                      <span className={`status-badge ${d.status.toLowerCase()}`}>{d.status.replace(/_/g, ' ')}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                        {d.tipo} &middot; {d.terreiro ? `Terreiro: ${d.terreiro.nome}` : `Entidade: ${d.entidadeId}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                        Denunciante: {d.criadoPor.nome} ({d.criadoPor.email})
                      </div>
                      {d.descricao && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)', marginTop: '0.25rem' }}>
                          &ldquo;{d.descricao}&rdquo;
                        </div>
                      )}
                    </div>
                    {d.status === 'PENDENTE' && (
                      <div className="claim-actions">
                        <button className="btn-admin-approve" onClick={() => resolverDenuncia(d.id, false)}>
                          Resolver
                        </button>
                        {d.terreiro && (
                          <button className="btn-admin-reject" onClick={() => resolverDenuncia(d.id, true)}>
                            Resolver e bloquear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Audit Logs</h2>
            {auditLogs.length === 0 ? (
              <p className="admin-empty">Nenhum registro de auditoria.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="terreiros-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Ação</th>
                      <th>Entidade</th>
                      <th>Usuário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((l) => (
                      <tr key={l.id}>
                        <td>{new Date(l.createdAt).toLocaleString('pt-BR')}</td>
                        <td><strong>{l.acao}</strong></td>
                        <td>{l.entidadeTipo} ({l.entidadeId.slice(0, 8)}...)</td>
                        <td>{l.usuario?.nome ?? 'sistema'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'verificacao' && (
        <div className="admin-moderacao">
          <div className="admin-card">
            <h2 className="admin-card-title">Documentos de Verificação pendentes</h2>
            {loadingVerificacao ? (
              <p className="admin-empty">Carregando documentos...</p>
            ) : documentos.length === 0 ? (
              <p className="admin-empty">Nenhum documento aguardando análise.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {documentos.map((doc) => (
                  <div key={doc.id} className="claim-item">
                    <div>
                      <strong>{doc.tipo}</strong>{' '}
                      <span className={`status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                        Terreiro: {doc.terreiro.nome} · {new Date(doc.createdAt).toLocaleString('pt-BR')}
                      </div>
                      <a
                        href={doc.arquivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}
                      >
                        Ver documento
                      </a>
                    </div>
                    <div className="claim-actions">
                      <button className="btn-admin-approve" onClick={() => revisarDocumento(doc.id, 'APROVADO')}>
                        Aprovar
                      </button>
                      <button className="btn-admin-reject" onClick={() => revisarDocumento(doc.id, 'REJEITADO')}>
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'feature-flags' && (
        <div className="admin-flags">
          <div className="admin-card">
            <h2 className="admin-card-title">Nova Flag</h2>
            <form onSubmit={createFlag} className="flag-form">
              <input
                placeholder="Chave (ex: dark_mode)"
                value={flagForm.chave}
                onChange={(e) => setFlagForm({ ...flagForm, chave: e.target.value })}
                required
              />
              <input
                placeholder="Título"
                value={flagForm.titulo}
                onChange={(e) => setFlagForm({ ...flagForm, titulo: e.target.value })}
                required
              />
              <input
                placeholder="Descrição"
                value={flagForm.descricao}
                onChange={(e) => setFlagForm({ ...flagForm, descricao: e.target.value })}
              />
              <label className="flag-toggle-label">
                <input type="checkbox" checked={flagForm.ativo} onChange={(e) => setFlagForm({ ...flagForm, ativo: e.target.checked })} />
                Ativa por padrão
              </label>
              <button type="submit" className="btn-create">Criar Flag</button>
            </form>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Flags Existentes</h2>
            {flags.length === 0 ? (
              <p className="admin-empty">Nenhuma flag criada ainda.</p>
            ) : (
              <div className="flags-list">
                {flags.map((flag) => (
                  <div key={flag.id} className={`flag-item ${flag.ativo ? 'on' : 'off'}`}>
                    <div className="flag-info">
                      <strong>{flag.titulo}</strong>
                      <code>{flag.chave}</code>
                      {flag.descricao && <span className="flag-desc">{flag.descricao}</span>}
                    </div>
                    <button
                      className={`flag-toggle ${flag.ativo ? 'on' : 'off'}`}
                      onClick={() => toggleFlag(flag)}
                    >
                      {flag.ativo ? 'On' : 'Off'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="admin-feedback">
          <div className="admin-card">
            <h2 className="admin-card-title">Feedbacks Recebidos</h2>
            {feedbacks.length === 0 ? (
              <p className="admin-empty">Nenhum feedback recebido ainda.</p>
            ) : (
              <div className="feedbacks-list">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="feedback-item">
                    <div className="feedback-header">
                      <span className={`feedback-tipo tipo-${fb.tipo?.toLowerCase()}`}>{fb.tipo}</span>
                      <span className="feedback-data">{new Date(fb.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="feedback-mensagem">{fb.mensagem}</p>
                    <div className="feedback-meta">
                      {fb.usuario && <span>{fb.usuario.nome}</span>}
                      {fb.pagina && <span>{fb.pagina}</span>}
                      {fb.contato && <span>{fb.contato}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'trust' && <TrustDataPanel />}
      {tab === 'saas' && <SaasAdminPanel />}
    </div>
  );
}

/* ============================= Trust Ecosystem ============================= */

interface TrustDashboardData {
  perfisVerificados: number;
  solicitacoesPendentes: number;
  mediacoes: { emAndamento: number; publicadas: number };
  antifraude: { bloqueadas: number; criticasPendentes: number };
  certificacoes: number;
  trustScoreMedio: number;
  complianceConformes: number;
}

interface TrustCertificado {
  id: string;
  codigo: string;
  tipo: string;
  titulo?: string;
  status: string;
  concedidoEm: string;
  terreiro?: { nome: string; slug: string; cidade: string; estado: string } | null;
}

interface TrustMediacao {
  id: string;
  status: string;
  prioridade: string;
  assunto: string;
  origem?: string;
  resolucao?: string | null;
  createdAt: string;
  terreiro?: { nome: string; slug: string } | null;
  reclamante?: { nome: string } | null;
}

interface TrustComplianceItem {
  id: string;
  chave: string;
  titulo: string;
  categoria: string;
  conforme: boolean | null;
  observacao?: string | null;
}

interface TrustCompliance {
  id: string;
  periodo: string;
  status: string;
  score: number | null;
  terreiro?: { nome: string; slug: string } | null;
  itens: TrustComplianceItem[];
}

interface TrustAntifraude {
  id: string;
  tipo: string;
  risco: string;
  status: string;
  revisaoHumanaObrigatoria: boolean;
  detalhes?: any;
  decisaoHumana?: string | null;
  createdAt: string;
}

interface TrustEvidencia {
  id: string;
  tipo: string;
  referenciaTipo?: string | null;
  validada: boolean;
  createdAt: string;
}

const CERT_TIPOS: { value: string; label: string }[] = [
  { value: 'CASA_VERIFICADA', label: 'Casa Verificada' },
  { value: 'EXCELENCIA_TRUST', label: 'Excelência em Trust' },
  { value: 'RESPONSABILIDADE_SOCIAL', label: 'Responsabilidade Social' },
  { value: 'RESPEITO_AOS_PROTOCOLOS', label: 'Respeito aos Protocolos' },
  { value: 'INCENTIVO_CRIANCAS', label: 'Incentivo às Crianças' },
  { value: 'SALVAGUARDA_AMBIENTAL', label: 'Salvaguarda Ambiental' },
  { value: 'IGUALDADE_RACIAL', label: 'Igualdade Racial' },
];

function TrustDataPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dash, setDash] = useState<TrustDashboardData | null>(null);
  const [terreiros, setTerreiros] = useState<{ id: string; nome: string }[]>([]);

  const [certificados, setCertificados] = useState<TrustCertificado[]>([]);
  const [certTerreiroId, setCertTerreiroId] = useState('');
  const [certTipo, setCertTipo] = useState('CASA_VERIFICADA');

  const [mediacoes, setMediacoes] = useState<TrustMediacao[]>([]);
  const [compliance, setCompliance] = useState<TrustCompliance[]>([]);
  const [antifraude, setAntifraude] = useState<TrustAntifraude[]>([]);
  const [evidencias, setEvidencias] = useState<TrustEvidencia[]>([]);

  const [apAnaliseTipo, setApAnaliseTipo] = useState('MANIPULACAO_TRUST_SCORE');
  const [apAnaliseSinais, setApAnaliseSinais] = useState(2);
  const [apAnalise, setApAnalise] = useState<any>(null);

  const [formTerreiroId, setFormTerreiroId] = useState('');
  const [formCertTipo, setFormCertTipo] = useState('CASA_VERIFICADA');
  const [mediTerreiroId, setMediTerreiroId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [
        d, cert, med, comp, afraude, evid, terreirosList,
      ] = await Promise.all([
        api.get<TrustDashboardData>('/admin/trust/dashboard'),
        api.get<TrustCertificado[]>('/admin/trust/certificados?limit=100'),
        api.get<TrustMediacao[]>('/admin/trust/mediacoes?limit=100'),
        api.get<TrustCompliance[]>('/admin/trust/compliance'),
        api.get<TrustAntifraude[]>('/admin/trust/antifraude?limit=100'),
        api.get<TrustEvidencia[]>('/admin/trust/evidencias'),
        api.get<any>('/admin/terreiros?limit=100'),
      ]);
      setDash(d ?? null);
      setCertificados(Array.isArray(cert) ? cert : []);
      setMediacoes(Array.isArray(med) ? med : []);
      setCompliance(Array.isArray(comp) ? comp : []);
      setAntifraude(Array.isArray(afraude) ? afraude : []);
      setEvidencias(Array.isArray(evid) ? evid : []);
      setTerreiros((terreirosList?.data || []).map((t: any) => ({ id: t.id, nome: t.nome })));
    } catch (e) {
      setError('Erro ao carregar ecossistema de confiança');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const concederSelo = async () => {
    if (!formTerreiroId) return setError('Selecione um terreiro para conceder o selo.');
    setError('');
    await api.post('/admin/trust/certificados', { terreiroId: formTerreiroId, tipo: formCertTipo });
    setFormTerreiroId('');
    load();
  };

  const revogarSelo = async (id: string) => {
    await api.post(`/admin/trust/certificados/${id}/revogar`, {});
    load();
  };

  const iniciarMediacao = async (id: string) => {
    await api.post(`/admin/trust/mediacoes/${id}/iniciar`, {});
    load();
  };

  const encerrarMediacao = async (m: TrustMediacao) => {
    const publicar = window.confirm('Encerrar e PUBLICAR esta mediação (interesse público)?');
    const resolucao = window.prompt('Resolução final:') || '';
    await api.post(`/admin/trust/mediacoes/${m.id}/encerrar`, { publicar, resolucao });
    load();
  };

  const alternarConforme = async (checklistId: string, itens: TrustComplianceItem[], id: string) => {
    const atual = itens.find((i) => i.id === id);
    if (!atual) return;
    await api.post('/admin/trust/compliance/itens', {
      checklistId,
      itens: itens.map((i) => ({ id: i.id, conforme: i.id === id ? !atual.conforme : i.conforme })),
    });
    load();
  };

  const gerarCompliance = async () => {
    if (!mediTerreiroId) return setError('Selecione um terreiro.');
    setError('');
    await api.post('/admin/trust/compliance/gerar', { terreiroId: mediTerreiroId });
    load();
  };

  const arquivar = async (id: string) => {
    await api.post(`/admin/trust/mediacoes/${id}/arquivar`, {});
    load();
  };

  const rodarAnaliseIa = async () => {
    setError('');
    try {
      const r = await api.post('/admin/trust/antifraude/analisar', { tipo: apAnaliseTipo, sinais: apAnaliseSinais });
      setApAnalise(r);
    } catch {
      setError('Erro na análise antifraude');
    }
  };

  const revisarFraude = async (id: string, decisao: string) => {
    await api.post(`/admin/trust/antifraude/${id}/revisar`, { decisao });
    load();
  };

  const validarEvidencia = async (id: string) => {
    await api.post(`/admin/trust/evidencias/${id}/validar`, {});
    load();
  };

  const dt = (s?: string) => (s ? new Date(s).toLocaleDateString('pt-BR') : '—');

  if (loading && !dash) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Carregando ecossistema...</p>
      </div>
    );
  }

  return (
    <div className="trust-panel">
      {error && <div className="admin-error-msg">{error}</div>}

      {dash && (
        <div className="admin-card trust-stats">
          <h2 className="admin-card-title">Ecossistema de Confiança</h2>
          <div className="trust-stats-grid">
            <div className="trust-stat"><span className="trust-stat-value">{dash.perfisVerificados}</span><span className="trust-stat-label">Perfis verificados</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.solicitacoesPendentes}</span><span className="trust-stat-label">Solicitações pendentes</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.certificacoes}</span><span className="trust-stat-label">Selo(s) ativo(s)</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.trustScoreMedio}</span><span className="trust-stat-label">Trust médio</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.mediacoes.emAndamento}</span><span className="trust-stat-label">Mediações em curso</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.mediacoes.publicadas}</span><span className="trust-stat-label">Mediações publicadas</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.antifraude.criticasPendentes}</span><span className="trust-stat-label">Riscos críticos aguardando decisão</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.antifraude.bloqueadas}</span><span className="trust-stat-label">Fraudes bloqueadas</span></div>
            <div className="trust-stat"><span className="trust-stat-value">{dash.complianceConformes}</span><span className="trust-stat-label">Checklists conformes</span></div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h2 className="admin-card-title">Certificações (Selos)</h2>
        <div className="trust-form">
          <select value={formTerreiroId} onChange={(e) => setFormTerreiroId(e.target.value)} className="status-select">
            <option value="">Terreiro…</option>
            {terreiros.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <select value={formCertTipo} onChange={(e) => setFormCertTipo(e.target.value)} className="status-select">
            {CERT_TIPOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button className="btn-admin-approve" onClick={concederSelo}>Conceder selo</button>
          <p className="trust-hint">Selos são concedidos por equipe e verificáveis publicamente por código.</p>
        </div>
        {certificados.length === 0 ? (
          <p className="admin-empty">Nenhum selo emitido ainda.</p>
        ) : (
          <div className="trust-list">
            {certificados.map((c) => (
              <div key={c.id} className="trust-row">
                <div className="trust-row-main">
                  <strong className="trust-code">{c.titulo || c.tipo}</strong>
                  <code className="trust-codigo">{c.codigo}</code>
                </div>
                <div className="trust-row-side">
                  <span className="trust-terreiro">{c.terreiro?.nome || '—'}</span>
                  <span className="trust-date">{dt(c.concedidoEm)}</span>
                  <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
                  {c.status === 'ATIVO' && (
                    <button className="btn-admin-reject" onClick={() => revogarSelo(c.id)}>Revogar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Mediações</h2>
        <div className="trust-form">
          <select value={mediTerreiroId} onChange={(e) => setMediTerreiroId(e.target.value)} className="status-select">
            <option value="">Gerar compliance por terreiro…</option>
            {terreiros.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <button className="btn-admin-status" onClick={gerarCompliance}>Gerar checklist</button>
        </div>
        {mediacoes.length === 0 ? (
          <p className="admin-empty">Nenhuma mediação registrada.</p>
        ) : (
          <table className="terreiros-table">
            <thead>
              <tr><th>Terreiro</th><th>Assunto</th><th>Prioridade</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {mediacoes.map((m) => (
                <tr key={m.id}>
                  <td>{m.terreiro?.nome || '—'}</td>
                  <td>{m.assunto}</td>
                  <td><span className={`risk-pill risk-${m.prioridade.toLowerCase()}`}>{m.prioridade}</span></td>
                  <td><span className="status-badge">{m.status}</span></td>
                  <td>
                    {m.status === 'REGISTRADA' && <button className="btn-admin-approve" onClick={() => iniciarMediacao(m.id)}>Iniciar</button>}
                    {(m.status === 'EM_MEDIACAO' || m.status === 'AGUARDANDO_RESPOSTA') && <button className="btn-admin-status" onClick={() => encerrarMediacao(m)}>Encerrar</button>}
                    {m.status === 'REGISTRADA' && <button className="btn-admin-reject" onClick={() => arquivar(m.id)}>Arquivar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Compliance (checklist periódico)</h2>
        {compliance.length === 0 ? (
          <p className="admin-empty">Nenhum checklist gerado.</p>
        ) : (
          compliance.map((cl) => (
            <div key={cl.id} className="compliance-box">
              <div className="compliance-head">
                <strong>{cl.terreiro?.nome || 'Terreiro'}</strong>
                <span>Período {cl.periodo}</span>
                <span>Score {cl.score ?? 0}%</span>
                <span className={`status-badge ${cl.status.toLowerCase()}`}>{cl.status}</span>
              </div>
              <div className="compliance-itens">
                {cl.itens.map((i) => (
                  <button
                    key={i.id}
                    className={`compliance-item ${i.conforme ? 'ok' : 'pending'}`}
                    onClick={() => alternarConforme(cl.id, cl.itens, i.id)}
                    title={i.titulo}
                  >
                    {i.conforme ? '✓' : '○'} {i.titulo}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Antifraude (IA advisória + revisão humana)</h2>
        <div className="trust-form">
          <select value={apAnaliseTipo} onChange={(e) => setApAnaliseTipo(e.target.value)} className="status-select">
            <option value="MANIPULACAO_TRUST_SCORE">Manipulação trust score</option>
            <option value="ATAQUE_ORGANIZADO">Ataque organizado</option>
            <option value="CAMPANHA_FRAUDULENTA">Campanha fraudulenta</option>
            <option value="CONTEUDO_ILIOTO">Conteúdo ilícito</option>
          </select>
          <input type="number" value={apAnaliseSinais} min={1} max={8} onChange={(e) => setApAnaliseSinais(Number(e.target.value))} className="status-select" style={{ width: 90 }} />
          <button className="btn-admin-status" onClick={rodarAnaliseIa}>Analisar (IA advisory)</button>
          {apAnalise && (
            <span className={`risk-pill risk-${apAnalise.risco.toLowerCase()}`}>Risco {apAnalise.risco} · revisão humana {apAnalise.revisaoHumanaObrigatoria ? 'obrigatória' : 'dispensável'}</span>
          )}
        </div>
        {antifraude.length === 0 ? (
          <p className="admin-empty">Nenhum registro antifraude.</p>
        ) : (
          <table className="terreiros-table">
            <thead>
              <tr><th>Tipo</th><th>Risco</th><th>Decisão</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {antifraude.map((a) => (
                <tr key={a.id}>
                  <td>{a.tipo}</td>
                  <td><span className={`risk-pill risk-${a.risco.toLowerCase()}`}>{a.risco}</span></td>
                  <td>{a.decisaoHumana || '—'}</td>
                  <td><span className="status-badge">{a.status}</span></td>
                  <td>
                    {['ABERTO', 'EM_REVISAO'].includes(a.status) && (
                      <>
                        <button className="btn-admin-approve" onClick={() => revisarFraude(a.id, 'REVISTO')} title="Revisão humana concluída">Revisar</button>
                        <button className="btn-admin-reject" onClick={() => revisarFraude(a.id, 'BLOQUEAR')}>Bloquear</button>
                        <button className="btn-admin-status" onClick={() => revisarFraude(a.id, 'DESCARTAR')}>Descartar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-card-title">Evidências</h2>
        {evidencias.length === 0 ? (
          <p className="admin-empty">Nenhuma evidência registrada.</p>
        ) : (
          <div className="trust-list">
            {evidencias.map((e) => (
              <div key={e.id} className="trust-row">
                <div className="trust-row-main">
                  <strong>{e.tipo}</strong>
                  <code>{e.referenciaTipo || '—'}</code>
                </div>
                <div className="trust-row-side">
                  <span className={`status-badge ${e.validada ? 'verificado' : 'rascunho'}`}>{e.validada ? 'Validada' : 'Pendente'}</span>
                  {!e.validada && <button className="btn-admin-approve" onClick={() => validarEvidencia(e.id)}>Validar</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
