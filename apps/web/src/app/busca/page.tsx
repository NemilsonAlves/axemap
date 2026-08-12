'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { labelTradicao } from '@/lib/tradicoes';
import { ESTADOS_BR, fetchCidadesPorEstado } from '@/lib/brasil-geo';
import { useI18n } from '@/lib/i18n/i18n-context';
import './page.css';

export default function BuscaPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [estado, setEstado] = useState('');
  const [cidade, setCidade] = useState('');
  const [cidades, setCidades] = useState<string[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega cidades quando o estado muda
  useEffect(() => {
    if (!estado) {
      setCidades([]);
      setCidade('');
      return;
    }
    setCidade('');
    setLoadingCidades(true);
    fetchCidadesPorEstado(estado).then((lista) => {
      setCidades(lista);
      setLoadingCidades(false);
    });
  }, [estado]);

  const buscar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (estado) params.set('estado', estado);
      if (cidade) params.set('cidade', cidade);
      params.set('limit', '30');

      const data = await api.get<{ data: any[] }>(`/terreiros?${params}`);
      setResultados(data.data);
    } finally {
      setLoading(false);
    }
  }, [query, estado, cidade]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') buscar();
  }

  return (
    <div className="busca-page">
      <h1>{t('busca.titulo')}</h1>

      <div className="search-form">
        {/* Campo livre: nome / tradição */}
        <input
          type="text"
          placeholder={t('busca.placeholder_nome')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={t('busca.placeholder_nome')}
          className="input"
        />

        {/* Seletor de Estado */}
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          aria-label={t('busca.placeholder_estado')}
          className="input"
          style={{ flex: '0 0 auto', minWidth: 180 }}
        >
          <option value="">{t('busca.todos_estados')}</option>
          {ESTADOS_BR.map((uf) => (
            <option key={uf.uf} value={uf.uf}>
              {uf.uf} — {uf.nome}
            </option>
          ))}
        </select>

        {/* Seletor de Cidade (só exibido quando há estado selecionado) */}
        {estado && (
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            aria-label={t('busca.placeholder_cidade')}
            className="input"
            style={{ flex: '0 0 auto', minWidth: 200 }}
            disabled={loadingCidades || cidades.length === 0}
          >
            <option value="">
              {loadingCidades ? t('busca.carregando_cidades') : t('busca.todas_cidades')}
            </option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={buscar}
          className="btn btn-primary"
          disabled={loading}
          aria-label={t('busca.botao')}
        >
          {loading ? t('busca.buscando') : t('busca.botao')}
        </button>
      </div>

      <div className="results" role="region" aria-live="polite" aria-label="Resultados">
        {resultados.map((terreiro: any) => (
          <a
            key={terreiro.id}
            href={`/terreiro/${terreiro.slug}`}
            className="terreiro-card"
          >
            <div className="terreiro-card-header">
              <h3>{terreiro.nome}</h3>
              {terreiro.trustScore != null && (
                <span className="trust-score-badge">
                  ★ {terreiro.trustScore}
                </span>
              )}
            </div>
            <p>
              {labelTradicao(terreiro.tradicao)} —{' '}
              {[terreiro.cidade, terreiro.estado].filter(Boolean).join(', ')}
            </p>
            {terreiro.descricaoCurta && (
              <p className="descricao">{terreiro.descricaoCurta}</p>
            )}
          </a>
        ))}

        {!loading && resultados.length === 0 && (
          <p className="empty-state">{t('busca.vazio')}</p>
        )}
      </div>
    </div>
  );
}
