'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import './page.css';

export default function BuscaPage() {
  const [query, setQuery] = useState('');
  const [cidade, setCidade] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function buscar() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (cidade) params.set('cidade', cidade);
      params.set('limit', '20');

      const data = await api.get<{ data: any[] }>(`/terreiros?${params}`);
      setResultados(data.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="busca-page">
      <h1>Buscar Terreiros</h1>

      <div className="search-form">
        <input
          type="text"
          placeholder="Nome, tradição..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input"
        />
        <input
          type="text"
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="input"
        />
        <button onClick={buscar} className="btn btn-primary" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <div className="results">
        {resultados.map((terreiro: any) => (
          <a key={terreiro.id} href={`/terreiro/${terreiro.slug}`} className="terreiro-card">
            <div className="terreiro-card-header">
              <h3>{terreiro.nome}</h3>
              <span className="trust-score-badge">{terreiro.trustScore}</span>
            </div>
            <p>{terreiro.tradicao} — {terreiro.cidade}, {terreiro.estado}</p>
            {terreiro.descricaoCurta && (
              <p className="descricao">{terreiro.descricaoCurta}</p>
            )}
          </a>
        ))}

        {!loading && resultados.length === 0 && (
          <p className="empty-state">Nenhum terreiro encontrado. Tente ajustar sua busca.</p>
        )}
      </div>
    </div>
  );
}
