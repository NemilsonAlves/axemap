'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n/i18n-context';
import { ShieldCheck, Scale, HeartHandshake, MessageSquareText, ClipboardCheck, History, CheckCircle2, Search } from 'lucide-react';import './transparencia.css';

interface TransparenciaData {
  instituicao: { nome: string; slug: string };
  confianca: {
    trustScore: number;
    isVerified: boolean;
    verificationLevel: string | null;
    certificadosAtivos: number;
    evidenciasValidadas: number;
  };
  projetosSociais: number;
  avaliacoes: number;
  prestacaoDeContas: {
    totalCampanhas: number;
    arrecadadoTotal: number;
    campanhas: { titulo: string; arrecadado: number; apoiadores: number; status: string }[];
  };
  mediacoes: {
    totalPublicadas: number;
    tempoMedioResolucaoDias: number | null;
    historico: { assunto: string; prioridade: string; resolucao: string | null }[];
  };
  compliance: { periodo: string; status: string; score: number; conformes: number; total: number } | null;
  mudancasRecentes: { acao: string; createdAt: string }[];
  ultimaAtualizacao: string;
}

export default function TransparenciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [slug, setSlug] = useState<string | null>(null);
  const [data, setData] = useState<TransparenciaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [verificacao, setVerificacao] = useState<any>(null);
  const { formatCurrency } = useI18n();

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await api.get<TransparenciaData>(`/trust/terreiros/${slug}/central-transparencia`);
        setData(res);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [slug]);

  const verificar = async () => {
    if (!codigo.trim()) return;
    setVerificando(true);
    setVerificacao(null);
    try {
      setVerificacao(await api.get(`/trust/certificados/verificar/${codigo.trim()}`));
    } catch {
      setVerificacao({ valido: false, status: 'NAO_ENCONTRADO' });
    }
    setVerificando(false);
  };

  if (loading) {
    return (
      <main className="tp-page">
        <div className="tp-loading">Carregando Central de Transparência...</div>
      </main>
    );
  }

  if (notFound || !data) {
    return (
      <main className="tp-page">
        <div className="tp-card tp-empty">
          <h1>Terreiro não encontrado</h1>
          <button className="tp-btn" onClick={() => router.push('/')}>Voltar ao início</button>
        </div>
      </main>
    );
  }

  const t = data;
  const hue = Math.min(t.confianca.trustScore * 1.2, 120);

  return (
    <main className="tp-page">
      <header className="tp-hero">
        <div className="tp-hero-inner">
          <div className="tp-hero-label">
            <ShieldCheck className="tp-icon" size={18} />
            Central de Transparência
          </div>
          <h1 className="tp-hero-title">{t.instituicao.nome}</h1>
          <p className="tp-hero-sub">
            Dados públicos de confiança, prestação de contas e governança
            <Link href={`/terreiro/${t.instituicao.slug}`} className="tp-link">Ver perfil da casa</Link>
          </p>
        </div>
      </header>

      <div className="tp-grid">
        <section className="tp-card">
          <h2 className="tp-title"><CheckCircle2 size={16} /> Verificar selo</h2>
          <p className="tp-desc">Digite o código impresso em um certificado/selo para confirmar sua autenticidade.</p>
          <div className="tp-code-row">
            <input
              className="tp-input"
              placeholder="Ex: SEL-AB12CD34EF56"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verificar()}
              aria-label="Código do selo para verificação"
            />
            <button className="tp-btn-primary" onClick={verificar} disabled={verificando}>
              <Search size={16} /> {verificando ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
          {verificacao && (
            <div className={`tp-verif ${verificacao.valido ? 'ok' : 'fail'}`}>
              {verificacao.valido
                ? `Válido — selo ${verificacao.codigo || codigo} está ativo (${verificacao.titulo ?? ''}).`
                : `Não encontrado ou inativo para o código informado.`}
            </div>
          )}
        </section>

        <section className="tp-card">
          <h2 className="tp-title"><ShieldCheck size={18} /> Confiança & integridade</h2>
          <div className="tp-metrics">
            <div className="tp-metric tp-score">
              <div className="tp-ring" style={{ background: `conic-gradient(hsl(${hue} 50% 45%) ${t.confianca.trustScore}%, var(--color-gray-200) 0)` }}>
                <div className="tp-ring-inner">
                  <span>{t.confianca.trustScore}</span>
                </div>
              </div>
              <span className="tp-metric-label">Índice de Confiança</span>
            </div>
            <div className="tp-metric">
              <span className="tp-metric-value">{t.confianca.certificadosAtivos}</span>
              <span className="tp-metric-label">Selos ativos</span>
            </div>
            <div className="tp-metric">
              <span className="tp-metric-value">{t.confianca.evidenciasValidadas}</span>
              <span className="tp-metric-label">Evidências validadas</span>
            </div>
            <div className="tp-metric">
              <span className="tp-metric-value">{t.confianca.isVerified ? 'Sim' : 'Em análise'}</span>
              <span className="tp-metric-label">Perfil verificado</span>
            </div>
          </div>
        </section>

        <section className="tp-card">
          <h2 className="tp-title"><HeartHandshake size={18} /> Impacto social</h2>
          <div className="tp-metrics">
            <div className="tp-metric">
              <span className="tp-metric-value">{t.projetosSociais}</span>
              <span className="tp-metric-label">Projetos sociais</span>
            </div>
            <div className="tp-metric">
              <span className="tp-metric-value">{t.avaliacoes}</span>
              <span className="tp-metric-label">Avaliações</span>
            </div>
          </div>
        </section>

        <section className="tp-card">
          <h2 className="tp-title"><Scale size={18} /> Prestação de contas</h2>
          <div className="tp-metrics">
            <div className="tp-metric">
              <span className="tp-metric-value">{t.prestacaoDeContas.totalCampanhas}</span>
              <span className="tp-metric-label">Campanhas</span>
            </div>
            <div className="tp-metric">
              <span className="tp-metric-value">
                {formatCurrency(t.prestacaoDeContas.arrecadadoTotal, 'BRL').replace(/,\d{2}/, '')}
              </span>
              <span className="tp-metric-label">Total arrecadado</span>
            </div>
          </div>
          {t.prestacaoDeContas.campanhas.length > 0 ? (
            <ul className="tp-list">
              {t.prestacaoDeContas.campanhas.map((c) => (
                <li key={c.titulo} className="tp-list-item">
                  <div>
                    <strong>{c.titulo}</strong>
                    <span className="tp-muted">{c.apoiadores} apoiador(es) · {c.status}</span>
                  </div>
                  <span className="tp-money">{formatCurrency(c.arrecadado, 'BRL').replace(/,\d{2}/, '')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tp-empty">Nenhuma campanha ativa registrada.</p>
          )}
        </section>

        <section className="tp-card">
          <h2 className="tp-title"><MessageSquareText size={18} /> Mediações públicas</h2>
          <div className="tp-metrics">
            <div className="tp-metric">
              <span className="tp-metric-value">{t.mediacoes.totalPublicadas}</span>
              <span className="tp-metric-label">Concluídas com interesse público</span>
            </div>
            <div className="tp-metric">
              <span className="tp-metric-value">{t.mediacoes.tempoMedioResolucaoDias ?? '—'}</span>
              <span className="tp-metric-label">Tempo médio de resolução (dias)</span>
            </div>
          </div>
          {t.mediacoes.historico.length > 0 ? (
            <ul className="tp-list">
              {t.mediacoes.historico.map((m) => (
                <li key={m.assunto} className="tp-list-item">
                  <div>
                    <strong>{m.assunto}</strong>
                    <span className="tp-item">{m.resolucao}</span>
                  </div>
                  <span className={`tp-pill risk-${m.prioridade.toLowerCase()}`}>{m.prioridade}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tp-empty">Nenhuma mediação publicada até o momento.</p>
          )}
        </section>

        <section className="tp-card">
          <h2 className="tp-title"><ClipboardCheck size={18} /> Compliance institucional</h2>
          {t.compliance ? (
            <>
              <div className="tp-metrics">
                <div className="tp-metric">
                  <span className="tp-metric-value">{t.compliance.score}%</span>
                  <span className="tp-metric-label">Conformidade ({t.compliance.conformes}/{t.compliance.total})</span>
                </div>
                <div className="tp-metric">
                  <span className="tp-metric-value">{t.compliance.periodo}</span>
                  <span className="tp-metric-label">Período avaliado</span>
                </div>
                <div className="tp-metric">
                  <span className="tp-metric-value">{t.compliance.status}</span>
                  <span className="tp-metric-label">Status</span>
                </div>
              </div>
              <div className="tp-bar">
                <div className="tp-bar-fill" style={{ width: `${t.compliance.score}%` }} />
              </div>
            </>
          ) : (
            <p className="tp-empty">Checklist de compliance ainda não publicado.</p>
          )}
        </section>

        <section className="tp-card">
          <h2 className="tp-title"><History size={18} /> Mudanças recentes</h2>
          {t.mudancasRecentes.length > 0 ? (
            <ul className="tp-list">
              {t.mudancasRecentes.map((m) => (
                <li key={m.createdAt} className="tp-list-item">
                  <span className="tp-item">{m.acao}</span>
                  <span className="tp-date">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="tp-empty">Nenhuma alteração auditada até o momento.</p>
          )}
          <p className="tp-foot">Última atualização: {new Date(t.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
        </section>
      </div>
    </main>
  );
}