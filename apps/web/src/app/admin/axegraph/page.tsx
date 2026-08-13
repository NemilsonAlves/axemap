'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { axegraphApi, GrafoEstatisticas, Relacionamento, CandidataDuplicidade, ConteudoCultural, GraphRelacionamentoTipo, GraphStatus, ConteudoStatus, DuplicidadeStatus, TIPOS_RELACIONAMENTO, ResultadoBusca } from '@/lib/axegraph';
import '../admin.css';
import './axegraph-admin.css';

type Tab = 'dashboard' | 'relacionamentos' | 'duplicidades' | 'conteudos';

const STATUS_LABEL: Record<string, string> = {
  VERIFICADO: 'Verificado',
  PENDENTE: 'Pendente',
  REJEITADO: 'Rejeitado',
  SUSPENSO: 'Suspenso',
};

export default function AxegraphAdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');

  const [dash, setDash] = useState<GrafoEstatisticas | null>(null);
  const [rels, setRels] = useState<Relacionamento[]>([]);
  const [dups, setDups] = useState<CandidataDuplicidade[]>([]);
  const [conteudos, setConteudos] = useState<ConteudoCultural[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [sincronizando, setSincronizando] = useState(false);

  const isAdmin = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  const loadDashboard = useCallback(async () => {
    try {
      const d = await axegraphApi.admin.dashboard();
      setDash(d);
    } catch {
      setErro('Erro ao carregar dashboard do Axé Graph.');
    }
  }, []);

  const loadRels = useCallback(async (status?: GraphStatus) => {
    setLoading(true);
    try {
      const r = await axegraphApi.admin.relacionamentos({ status, limit: 60 });
      setRels(r.data);
    } catch {
      setErro('Erro ao carregar relacionamentos.');
    }
    setLoading(false);
  }, []);

  const loadDups = useCallback(async (status?: DuplicidadeStatus) => {
    setLoading(true);
    try {
      const d = await axegraphApi.admin.duplicidades({ status });
      setDups(d);
    } catch {
      setErro('Erro ao carregar duplicidades.');
    }
    setLoading(false);
  }, []);

  const loadConteudos = useCallback(async () => {
    setLoading(true);
    try {
      const c = await axegraphApi.admin.conteudos({ limit: 60 });
      setConteudos(c.data);
    } catch {
      setErro('Erro ao carregar conteúdos.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadDashboard();
  }, [isAdmin, loadDashboard]);

  useEffect(() => {
    if (tab === 'relacionamentos') loadRels();
    if (tab === 'duplicidades') loadDups();
    if (tab === 'conteudos') loadConteudos();
  }, [tab, loadRels, loadDups, loadConteudos]);

  const flash = (msg: string, e: unknown = null) => {
    if (e) {
      setErro((e as Error).message || 'Ação falhou.');
      setMsg('');
      setTimeout(() => setErro(''), 4000);
    } else {
      setMsg(msg);
      setErro('');
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const doSincronizar = async () => {
    setSincronizando(true);
    try {
      const r = await axegraphApi.admin.sincronizar();
      flash(`Sincronização concluída: ${r.total} entidades indexadas.`);
      loadDashboard();
    } catch (e) {
      flash('', e);
    }
    setSincronizando(false);
  };

  const revisar = async (id: string, decisao: 'VERIFICAR' | 'REJEITAR' | 'SUSPENDER') => {
    await axegraphApi.admin.revisarRelacionamento(id, decisao);
    flash('Relacionamento atualizado.');
    loadRels();
  };

  const remover = async (id: string) => {
    if (!window.confirm('Remover este relacionamento (soft delete)?')) return;
    await axegraphApi.admin.removerRelacionamento(id);
    flash('Relacionamento removido.');
    loadRels();
  };

  const doDetectar = async () => {
    try {
      const r = await axegraphApi.admin.detectarDuplicidades();
      flash(`Detecção concluída: ${r.novasCandidaturas} nova(s), ${r.totalPendentes} pendente(s).`);
      loadDups();
    } catch (e) {
      flash('', e);
    }
  };

  const resolverDup = async (d: CandidataDuplicidade, decisao: 'CONFIRMAR' | 'REJEITAR') => {
    const canonical = decisao === 'CONFIRMAR'
      ? window.prompt('Entidade canônica (entidadeId a manter visível):', d.entidadeIdA) || undefined
      : undefined;
    await axegraphApi.admin.resolverDuplicidade(d.id, decisao, canonical);
    flash(`Duplicidade ${decisao === 'CONFIRMAR' ? 'confirmada' : 'rejeitada'}.`);
    loadDups();
  };

  const revisarConteudo = async (id: string, status: ConteudoStatus) => {
    await axegraphApi.admin.revisarConteudo(id, status);
    flash('Conteúdo atualizado.');
    loadConteudos();
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Acesso restrito</h2>
          <p>Você precisa ser administrador para acessar o Axé Graph Admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Axé Graph — Admin</h1>
        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={`admin-tab ${tab === 'relacionamentos' ? 'active' : ''}`} onClick={() => setTab('relacionamentos')}>Relacionamentos</button>
          <button className={`admin-tab ${tab === 'duplicidades' ? 'active' : ''}`} onClick={() => setTab('duplicidades')}>Duplicidades</button>
          <button className={`admin-tab ${tab === 'conteudos' ? 'active' : ''}`} onClick={() => setTab('conteudos')}>Cultura &amp; Memória</button>
        </div>
      </div>

      {erro && <div className="admin-error-msg">{erro}</div>}
      {msg && <div className="axegraph-ok">{msg}</div>}

      {tab === 'dashboard' && (
        <div className="admin-card">
          <div className="admin-card-title">Visão geral do grafo</div>
          {!dash ? (
            <p className="admin-empty">Carregando métricas…</p>
          ) : (
            <>
              <div className="trust-stats-grid">
                <div className="trust-stat"><span className="trust-stat-value">{dash.entidades}</span><span className="trust-stat-label">Entidades</span></div>
                <div className="trust-stat"><span className="trust-stat-value">{dash.relacionamentos}</span><span className="trust-stat-label">Relacionamentos</span></div>
                <div className="trust-stat"><span className="trust-stat-value">{dash.relacionamentosVerificados}</span><span className="trust-stat-label">Verificados</span></div>
                <div className="trust-stat"><span className="trust-stat-value">{dash.relacionamentosPendentes}</span><span className="trust-stat-label">Pendentes</span></div>
                <div className="trust-stat"><span className="trust-stat-value">{dash.duplicidadesAbertas}</span><span className="trust-stat-label">Duplicidades abertas</span></div>
                <div className="trust-stat"><span className="trust-stat-value">{dash.conteudosCulturais}</span><span className="trust-stat-label">Conteúdos culturais</span></div>
                <div className="trust-stat"><span className="trust-stat-value">{dash.patrimonio}</span><span className="trust-stat-label">Patrimônios</span></div>
              </div>
              <div className="axegraph-por-tipo">
                {Object.entries(dash.entidadesPorTipo).map(([t, n]) => (
                  <span key={t} className="axegraph-chip">{t.replace(/_/g, ' ')}: <strong>{n}</strong></span>
                ))}
                {Object.entries(dash.relacionamentosPorStatus).map(([s, n]) => (
                  <span key={s} className="axegraph-chip axegraph-chip-status">{STATUS_LABEL[s] ?? s}: <strong>{n}</strong></span>
                ))}
              </div>
              <button className="btn-admin-approve" onClick={doSincronizar} disabled={sincronizando}>
                {sincronizando ? 'Sincronizando…' : 'Sincronizar entidades das fontes'}
              </button>
              <p className="trust-hint">Reindexa terreiros, instituições, eventos, cursos, campanhas, ações, conteúdos e produtos como nós do grafo.</p>
            </>
          )}
        </div>
      )}

      {tab === 'relacionamentos' && <RelacionamentosPanel rels={rels} loading={loading} onRevisar={revisar} onRemover={remover} onFlash={flash} />}

      {tab === 'duplicidades' && (
        <>
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <div className="admin-card-title">Entity Resolution</div>
            <button className="btn-admin-approve" onClick={doDetectar}>Detectar duplicidades</button>
            <p className="trust-hint">Compara nomes de entidades do mesmo tipo em mesma cidade/estado. Sem consolidação automática — a decisão é humana.</p>
          </div>
          <div className="admin-card">
            <div className="admin-card-title">Candidaturas</div>
            {dups.length === 0 ? (
              <p className="admin-empty">Nenhuma candidatura até o momento.</p>
            ) : (
              <table className="terreiros-table">
                <thead>
                  <tr><th>Tipo</th><th>Entidade A</th><th>Entidade B</th><th>Score</th><th>Motivo</th><th>Status</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {dups.map((d) => (
                    <tr key={d.id}>
                      <td>{d.entidadeTipo.replace(/_/g, ' ')}</td>
                      <td>{d.entidadeIdA}</td>
                      <td>{d.entidadeIdB}</td>
                      <td>{d.score}</td>
                      <td style={{ fontSize: '0.8rem' }}>{d.motivo}</td>
                      <td><span className={`status-badge ${d.status.toLowerCase()}`}>{d.status}</span></td>
                      <td>
                        {d.status === 'ABERTO' && (
                          <>
                            <button className="btn-admin-approve" onClick={() => resolverDup(d, 'CONFIRMAR')}>Confirmar</button>
                            <button className="btn-admin-reject" onClick={() => resolverDup(d, 'REJEITAR')}>Rejeitar</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'conteudos' && (
        <div className="admin-card">
          <div className="admin-card-title">Conteúdo cultural e memória</div>
          {conteudos.length === 0 ? (
            <p className="admin-empty">Nenhum conteúdo cadastrado.</p>
          ) : (
            <table className="terreiros-table">
              <thead>
                <tr><th>Título</th><th>Tipo</th><th>Autor</th><th>Local</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {conteudos.map((c) => (
                  <tr key={c.id}>
                    <td>{c.titulo}</td>
                    <td>{c.tipo}</td>
                    <td>{c.autorNome || '—'}</td>
                    <td>{c.cidade ? `${c.cidade}${c.estado ? `/${c.estado}` : ''}` : '—'}</td>
                    <td><span className={`status-badge ${c.status.toLowerCase()}`}>{c.status.replace(/_/g, ' ')}</span></td>
                    <td>
                      <button className="btn-admin-approve" onClick={() => revisarConteudo(c.id, 'VERIFICADA')}>Verificar</button>
                      <button className="btn-admin-status" onClick={() => revisarConteudo(c.id, 'OFICIAL')}>Marcar oficial</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function RelacionamentosPanel({
  rels,
  loading,
  onRevisar,
  onRemover,
  onFlash,
}: {
  rels: Relacionamento[];
  loading: boolean;
  onRevisar: (id: string, decisao: 'VERIFICAR' | 'REJEITAR' | 'SUSPENDER') => void;
  onRemover: (id: string) => void;
  onFlash: (msg: string, e?: unknown) => void;
}) {
  const [filtro, setFiltro] = useState('');
  const [modal, setModal] = useState(false);
  const [buscaOrigem, setBuscaOrigem] = useState('');
  const [buscaAlvo, setBuscaAlvo] = useState('');
  const [origens, setOrigens] = useState<ResultadoBusca[]>([]);
  const [alvos, setAlvos] = useState<ResultadoBusca[]>([]);
  const [selOrigem, setSelOrigem] = useState<ResultadoBusca | null>(null);
  const [selAlvo, setSelAlvo] = useState<ResultadoBusca | null>(null);
  const [selTipo, setSelTipo] = useState<GraphRelacionamentoTipo>('RELACIONADO_A');
  const [evidencia, setEvidencia] = useState('');

  const visiveis = rels.filter((r) => !filtro || r.status === filtro);

  const doBuscar = async (lado: 'origem' | 'alvo') => {
    const q = lado === 'origem' ? buscaOrigem : buscaAlvo;
    const data = await axegraphApi.buscar({ q: q || undefined, limit: 8 });
    if (lado === 'origem') setOrigens(data.resultados);
    else setAlvos(data.resultados);
  };

  const salvar = async () => {
    if (!selOrigem || !selAlvo) {
      onFlash('', new Error('Selecione origem e alvo.'));
      return;
    }
    if (selOrigem.entidade.id === selAlvo.entidade.id) {
      onFlash('', new Error('Origem e alvo devem ser diferentes.'));
      return;
    }
    try {
      await axegraphApi.admin.criarRelacionamento({
        origemTipo: selOrigem.entidade.entidadeTipo,
        origemId: selOrigem.entidade.id,
        alvoTipo: selAlvo.entidade.entidadeTipo,
        alvoId: selAlvo.entidade.id,
        tipo: selTipo,
        evidencia: evidencia || undefined,
      });
      setModal(false);
      setSelOrigem(null);
      setSelAlvo(null);
      setEvidencia('');
      onFlash('Relacionamento criado como verificado (admin).');
      window.location.reload();
    } catch (e) {
      onFlash('', e);
    }
  };

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-title">Fila de revisão</div>
        <div className="trust-form">
          <select className="status-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendentes</option>
            <option value="VERIFICADO">Verificados</option>
            <option value="REJEITADO">Rejeitados</option>
            <option value="SUSPENSO">Suspensos</option>
          </select>
          <button className="btn-admin-approve" onClick={() => setModal(true)}>+ Criar relacionamento</button>
        </div>

        {loading ? (
          <p className="admin-empty">Carregando relacionamentos…</p>
        ) : visiveis.length === 0 ? (
          <p className="admin-empty">Nenhum relacionamento encontrado.</p>
        ) : (
          <table className="terreiros-table">
            <thead>
              <tr><th>Origem</th><th>Tipo</th><th>Alvo</th><th>Confiança</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {visiveis.map((r) => (
                <tr key={r.id}>
                  <td>{r.origem.nome} <small style={{ color: 'var(--color-gray-400)' }}>({r.origem.entidadeTipo})</small></td>
                  <td>{r.rotulo}</td>
                  <td>{r.alvo.nome} <small style={{ color: 'var(--color-gray-400)' }}>({r.alvo.entidadeTipo})</small></td>
                  <td>{r.nivelConfianca != null ? `${(r.nivelConfianca * 100).toFixed(0)}%` : '—'}</td>
                  <td><span className={`status-badge ${r.status.toLowerCase()}`}>{STATUS_LABEL[r.status] ?? r.status}</span></td>
                  <td>
                    {r.status === 'PENDENTE' && (
                      <>
                        <button className="btn-admin-approve" onClick={() => onRevisar(r.id, 'VERIFICAR')}>Verificar</button>
                        <button className="btn-admin-reject" onClick={() => onRevisar(r.id, 'REJEITAR')}>Rejeitar</button>
                      </>
                    )}
                    {r.status === 'VERIFICADO' && (
                      <>
                        <button className="btn-admin-reject" onClick={() => onRevisar(r.id, 'SUSPENDER')}>Suspender</button>
                        <button className="btn-admin-status" onClick={() => onRemover(r.id)}>Remover</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="axegraph-modal">
          <div className="axegraph-modal-box">
            <h3>Criar relacionamento</h3>
            <div className="axegraph-modal-grid">
              <div>
                <label>Origem</label>
                <input value={buscaOrigem} onChange={(e) => setBuscaOrigem(e.target.value)} placeholder="Buscar entidade…" aria-label="Buscar entidade de origem" />
                <button className="btn-admin-status" onClick={() => doBuscar('origem')}>Buscar</button>
                <div className="axegraph-opcoes">
                  {selOrigem && <div className="axegraph-escolhida">✓ {selOrigem.entidade.nome}</div>}
                  {origens.filter((o) => o.entidade.id !== selAlvo?.entidade.id).map((o) => (
                    <button key={o.entidade.id} className="axegraph-opcao" onClick={() => { setSelOrigem(o); setOrigens([]); }}>
                      {o.entidade.nome} <small>({o.entidade.entidadeTipo})</small>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Tipo</label>
                <select className="status-select" value={selTipo} onChange={(e) => setSelTipo(e.target.value as GraphRelacionamentoTipo)}>
                  {TIPOS_RELACIONAMENTO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <label style={{ marginTop: '0.75rem' }}>Evidência (proveniência)</label>
                <input value={evidencia} onChange={(e) => setEvidencia(e.target.value)} placeholder="URL, documento ou descrição" aria-label="Evidência (proveniência)" />
              </div>
              <div>
                <label>Alvo</label>
                <input value={buscaAlvo} onChange={(e) => setBuscaAlvo(e.target.value)} placeholder="Buscar entidade…" aria-label="Buscar entidade de destino" />
                <button className="btn-admin-status" onClick={() => doBuscar('alvo')}>Buscar</button>
                <div className="axegraph-opcoes">
                  {selAlvo && <div className="axegraph-escolhida">✓ {selAlvo.entidade.nome}</div>}
                  {alvos.filter((a) => a.entidade.id !== selOrigem?.entidade.id).map((a) => (
                    <button key={a.entidade.id} className="axegraph-opcao" onClick={() => { setSelAlvo(a); setAlvos([]); }}>
                      {a.entidade.nome} <small>({a.entidade.entidadeTipo})</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="trust-form" style={{ marginTop: '1rem' }}>
              <button className="btn-admin-approve" onClick={salvar}>Salvar</button>
              <button className="btn-admin-reject" onClick={() => setModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
