'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { ShieldCheck, Scale, HeartHandshake, ClipboardCheck, Search } from 'lucide-react';
import '../institucional/legal.css';
import './transparencia-index.css';

interface Membro {
  id: string;
  nome: string;
  funcao: string | null;
  descricao: string | null;
}

interface RankingItem {
  id: string;
  nome: string;
  slug: string;
  trustScore: number;
}

export default function TransparenciaIndexPage() {
  const [totalTerreiros, setTotalTerreiros] = useState<number | null>(null);
  const [conselho, setConselho] = useState<Membro[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [slug, setSlug] = useState('');
  const [erroSlug, setErroSlug] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const t = await api.get<{ total: number }>('/terreiros?limit=1');
        setTotalTerreiros(t?.total ?? null);
      } catch {}
    })();
    (async () => {
      try {
        const c = await api.get<Membro[]>('/trust/governanca');
        setConselho(Array.isArray(c) ? c : []);
      } catch {}
    })();
    (async () => {
      try {
        const r = await api.get<any>('/ranking/trust-score?limit=8');
        setRanking(Array.isArray(r) ? r : r?.data ?? []);
      } catch {}
    })();
  }, []);

  const abrirCentral = () => {
    if (!slug.trim()) {
      setErroSlug('Informe o endereço do terreiro (slug).');
      return;
    }
    window.location.href = `/transparencia/${encodeURIComponent(slug.trim())}`;
  };

  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Transparência</h1>
        <p>
          Governar com transparência é um compromisso do AxéMap. Aqui você acompanha como a plataforma modera, verifica,
          mede confiança e presta contas à comunidade.
        </p>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>Os pilares</h2>
          <div className="tpix-grid">
            <div className="tpix-card">
              <ShieldCheck size={20} />
              <strong>Confiança & integridade</strong>
              <span>Trust Score explicável, verificação documentada e selos verificáveis por código.</span>
            </div>
            <div className="tpix-card">
              <Scale size={20} />
              <strong>Prestação de contas</strong>
              <span>Campanhas e arrecadações com números públicos e auditáveis por terreiro.</span>
            </div>
            <div className="tpix-card">
              <HeartHandshake size={20} />
              <strong>Mediações públicas</strong>
              <span>Conflitos com interesse público são resolvidos com método e publicados com direito de resposta.</span>
            </div>
            <div className="tpix-card">
              <ClipboardCheck size={20} />
              <strong>Compliance periódico</strong>
              <span>Checklists recorrentes de boas práticas, proteção e salvaguarda institucional.</span>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>Números da plataforma</h2>
          <ul>
            <li>
              <strong>{totalTerreiros ?? '—'}</strong> terreiros cadastrados na plataforma
              {totalTerreiros !== null && totalTerreiros === 0 ? ' (ainda em fase de cadastro)' : ''}
            </li>
            <li>
              <strong>{ranking.length}</strong> casas com melhor índice de confiança público (veja abaixo)
            </li>
            <li>
              Selos concedidos, mediações e checklists de compliance são publicados por terreiro na{' '}
              <strong>Central de Transparência</strong> de cada casa.
            </li>
          </ul>

          <h3>Casas de maior confiança pública</h3>
          {ranking.length === 0 ? (
            <p>Carregando ranking...</p>
          ) : (
            <ul>
              {ranking.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/transparencia/${item.slug}`}
                    style={{ fontWeight: 700, color: 'var(--color-primary)' }}
                  >
                    {item.nome}
                  </Link>
                  <span style={{ marginLeft: '0.5rem', color: 'var(--color-muted-foreground)' }}>
                    Trust Score {item.trustScore?.toFixed(1) ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="legal-section">
          <h2>Conselho de governança</h2>
          {conselho.length === 0 ? (
            <p>O conselho será formado a partir da comunidade. Acompanhe em <Link href="/governanca" style={{ textDecoration: 'underline' }}>Governança</Link>.</p>
          ) : (
            <ul>
              {conselho.map((m) => (
                <li key={m.id}>
                  <strong>{m.nome}</strong>
                  {m.funcao && <span style={{ marginLeft: '0.5rem' }}>— {m.funcao}</span>}
                  {m.descricao && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{m.descricao}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="legal-section">
          <h2>Central de Transparência de uma casa</h2>
          <p>Informe o endereço (slug) de um terreiro para abrir sua página pública de transparência.</p>
          <div className="tpix-code-row">
            <input
              className="tpix-input"
              placeholder="Ex: casa-ile-axe-oba"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setErroSlug(''); }}
              onKeyDown={(e) => e.key === 'Enter' && abrirCentral()}
              aria-label="Slug do terreiro"
            />
            <button className="tpix-btn" onClick={abrirCentral}>
              <Search size={16} /> Abrir
            </button>
          </div>
          {erroSlug && <p className="tpix-erro">{erroSlug}</p>}
          <p className="tpix-hint">
            Encontre o slug na URL do perfil de um terreiro (ex: <code>/terreiro/seu-slug</code>).
          </p>
        </section>

        <section className="legal-section">
          <h2>Documentos e governança</h2>
          <ul>
            <li><Link href="/governanca" style={{ textDecoration: 'underline' }}>Modelo de governança</Link> — verificação, mediação, certificação e índice de confiança.</li>
            <li><Link href="/termos" style={{ textDecoration: 'underline' }}>Termos de Uso</Link> e <Link href="/privacidade" style={{ textDecoration: 'underline' }}>Política de Privacidade</Link>.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
