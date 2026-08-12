'use client';

import { useMemo, useState } from 'react';
import {
  axegraphApi,
  RespostaVizinhanca,
  ResultadoBusca,
  GraphEntidadeTipo,
  TIPOS_ENTIDADE,
} from '@/lib/axegraph';
import './grafo.css';

const CORES: Record<string, string> = {
  TERREIRO: '#c2410c',
  INSTITUICAO: '#6366f1',
  EVENTO: '#db2777',
  CURSO: '#0d9488',
  CAMPANHA: '#d97706',
  ACAO_SOCIAL: '#16a34a',
  PROJETO: '#7c3aed',
  CONTEUDO: '#0284c7',
  PESQUISA: '#64748b',
  PATRIMONIO: '#a16207',
  PRODUTO: '#9333ea',
  PESSOA: '#e11d48',
  COMUNIDADE: '#2dd4bf',
};

function corPorTipo(t: string): string {
  return CORES[t] ?? '#94a3b8';
}

const TIPO_LABEL = new Map(TIPOS_ENTIDADE.map((t) => [t.value, t.label]));

function colocarNos(
  nos: { id: string; isRaiz?: boolean }[],
  arestas: { de: string; para: string }[],
): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  const raizId = nos.find((n) => n.isRaiz)?.id;

  if (!raizId) {
    const r = Math.max(220, nos.length * 30);
    nos.forEach((n, i) => {
      pos.set(n.id, {
        x: Math.cos((2 * Math.PI * i) / Math.max(1, nos.length)) * r,
        y: Math.sin((2 * Math.PI * i) / Math.max(1, nos.length)) * r,
      });
    });
    return pos;
  }

  pos.set(raizId, { x: 0, y: 0 });

  const vizinhoDeRaiz = new Set<string>();
  for (const e of arestas) {
    const outro = e.de === raizId ? e.para : e.para === raizId ? e.de : null;
    if (outro) vizinhoDeRaiz.add(outro);
  }

  const vizinhos = nos.filter((n) => vizinhoDeRaiz.has(n.id));
  const resto = nos.filter((n) => n.id !== raizId && !vizinhoDeRaiz.has(n.id));

  vizinhos.forEach((n, i) => {
    const ang = (2 * Math.PI * i) / Math.max(1, vizinhos.length) - Math.PI / 2;
    pos.set(n.id, { x: Math.cos(ang) * 200, y: Math.sin(ang) * 200 });
  });

  const semPos = resto.slice();
  const pilha = [...vizinhos];
  while (pilha.length && semPos.length) {
    const atual = pilha.shift()!;
    const pa = pos.get(atual.id)!;
    const ligados = new Set<string>();
    for (const e of arestas) {
      if (e.de === atual.id) ligados.add(e.para);
      if (e.para === atual.id) ligados.add(e.de);
    }
    const alvos = semPos.filter((n) => ligados.has(n.id));
    alvos.forEach((n, i) => {
      const ang = (2 * Math.PI * i) / Math.max(1, alvos.length);
      pos.set(n.id, { x: pa.x + Math.cos(ang) * 170, y: pa.y + Math.sin(ang) * 170 });
      pilha.push(n);
    });
    semPos.splice(
      0,
      semPos.length,
      ...semPos.filter((n) => !pos.has(n.id)),
    );
  }

  const sem = semPos.filter((n) => !pos.has(n.id));
  sem.forEach((n, i) => {
    const ang = (2 * Math.PI * i) / Math.max(1, sem.length);
    pos.set(n.id, { x: Math.cos(ang) * 420, y: Math.sin(ang) * 420 });
  });

  return pos;
}

export default function GrafoPage() {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [grafo, setGrafo] = useState<RespostaVizinhanca | null>(null);
  const [selNode, setSelNode] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  const pos = useMemo(
    () =>
      grafo
        ? colocarNos(grafo.nos, grafo.arestas)
        : new Map<string, { x: number; y: number }>(),
    [grafo],
  );

  async function doBuscar() {
    setBuscando(true);
    setErro('');
    try {
      const data = await axegraphApi.buscar({
        q: busca || undefined,
        tipo: (tipoFiltro as GraphEntidadeTipo) || undefined,
        limit: 20,
      });
      setResultados(data.resultados);
    } catch {
      setErro('Não foi possível consultar o Axé Graph.');
    } finally {
      setBuscando(false);
    }
  }

  async function abrir(entidade: { entidadeId?: string; entidadeTipo: GraphEntidadeTipo; id?: string }) {
    setErro('');
    try {
      const data = await axegraphApi.vizinhanca(
        entidade.entidadeTipo,
        entidade.id ?? entidade.entidadeId!,
        2,
      );
      setGrafo(data);
      setSelNode(null);
    } catch {
      setErro('Não foi possível carregar a vizinhança desta entidade.');
    }
  }

  const noSel = grafo?.nos.find((n) => n.id === selNode) ?? null;
  const largura = 900;
  const altura = 620;

  return (
    <div className="grafo-page">
      <header className="grafo-header">
        <h1>Axé Graph</h1>
        <p>
          O grafo de conhecimento vivo da comunidade de matriz africana — terreiros, instituições, eventos, cursos,
          campanhas, patrimônio cultural e memória, com conexões verificadas e explicáveis.
        </p>
      </header>

      <div className="grafo-layout">
        <aside className="grafo-sidebar">
          <div className="grafo-search">
            <input
              placeholder="Terreiro, instituição, evento, curso…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doBuscar()}
              aria-label="Buscar no grafo de conhecimento"
            />
            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
              <option value="">Todos os tipos</option>
              {TIPOS_ENTIDADE.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <button onClick={doBuscar} disabled={buscando}>
              {buscando ? 'Consultando…' : 'Buscar'}
            </button>
          </div>

          <div className="grafo-resultados">
            {resultados.length === 0 && !buscando && (
              <p className="grafo-empty">Busque por uma entidade para começar a explorar o grafo.</p>
            )}
            {resultados.map((r) => (
              <button
                key={r.entidade.id}
                className="grafo-resultado"
                onClick={() => abrir(r.entidade)}
              >
                <span className="grafo-badge" style={{ background: corPorTipo(r.entidade.entidadeTipo) }}>
                  {TIPO_LABEL.get(r.entidade.entidadeTipo) ?? r.entidade.entidadeTipo}
                </span>
                <strong>{r.entidade.nome}</strong>
                {r.entidade.cidade && <em>{r.entidade.cidade}{r.entidade.estado ? `, ${r.entidade.estado}` : ''}</em>}
                {r.motivos.length > 0 && <span className="grafo-motivo">{r.motivos[0]}</span>}
              </button>
            ))}
          </div>

          {noSel && (
            <div className="grafo-detalhe">
              <h3>{noSel.emoji} {noSel.nome}</h3>
              <p>
                {TIPO_LABEL.get(noSel.entidadeTipo) ?? noSel.entidadeTipo}
                {noSel.cidade ? ` · ${noSel.cidade}${noSel.estado ? `, ${noSel.estado}` : ''}` : ''}
              </p>
              {noSel.isRaiz && <span className="grafo-raiz-badge">entidade central</span>}
              <button onClick={() => noSel && abrir(noSel)}>Expandir este nó</button>
            </div>
          )}
        </aside>

        <main className="grafo-canvas-wrap">
          {erro && <div className="grafo-erro">{erro}</div>}
          {!grafo ? (
            <div className="grafo-placeholder">
              <div className="grafo-placeholder-hex">✦</div>
              <p>Explore o mapa vivo das conexões da comunidade.</p>
            </div>
          ) : (
            <svg viewBox={`${-largura / 2} ${-altura / 2} ${largura} ${altura}`} className="grafo-svg">
              {grafo.arestas.map((e) => {
                const a = pos.get(e.de);
                const b = pos.get(e.para);
                if (!a || !b) return null;
                return (
                  <g key={e.id}>
                    <line
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      className={`grafo-aresta ${e.status === 'VERIFICADO' ? 'verificada' : ''}`}
                    />
                    <text
                      x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4}
                      textAnchor="middle" className="grafo-rotulo"
                    >
                      {e.rotulo}
                    </text>
                  </g>
                );
              })}
              {grafo.nos.map((n) => {
                const p = pos.get(n.id);
                if (!p) return null;
                const cor = corPorTipo(n.entidadeTipo);
                const isSel = selNode === n.id;
                return (
                  <g
                    key={n.id}
                    className="grafo-no"
                    transform={`translate(${p.x} ${p.y})`}
                    onClick={() => setSelNode(n.id)}
                  >
                    <circle
                      r={n.isRaiz ? 26 : 20}
                      fill={cor}
                      fillOpacity={0.25}
                      stroke={cor}
                      strokeWidth={isSel || n.isRaiz ? 3 : 2}
                    />
                    <text y={5} textAnchor="middle" className="grafo-no-emoji">
                      {n.emoji}
                    </text>
                    <text
                      y={n.isRaiz ? 40 : 34}
                      textAnchor="middle"
                      className="grafo-no-nome"
                    >
                      {n.nome.length > 22 ? `${n.nome.slice(0, 21)}…` : n.nome}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
          {grafo && (
            <div className="grafo-rodape">
              {grafo.nos.length} entidades · {grafo.totalRelacionamentos} relações verificadas · apenas conteúdo público
            </div>
          )}
        </main>
      </div>
    </div>
  );
}