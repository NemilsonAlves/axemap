'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  estoque: number;
  imagens: string[];
  terreiro: {
    id: string;
    nome: string;
    slug: string;
    cidade: string;
    estado: string;
    trustScore: number;
    isVerified: boolean;
  };
}

interface Categoria {
  categoria: string;
  count: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function MarketplacePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 24;

  useEffect(() => {
    api
      .get<{ categoria: string; count: number }[]>('/marketplace/categorias')
      .then((res) => setCategorias(res))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params = new URLSearchParams();
    if (busca) params.set('q', busca);
    if (categoriaFiltro) params.set('categoria', categoriaFiltro);
    if (estadoFiltro) params.set('estado', estadoFiltro);
    params.set('limit', String(limit));
    params.set('offset', String(offset));

    api
      .get<{ data: Produto[]; total: number }>(`/marketplace?${params.toString()}`)
      .then((res) => {
        setProdutos(res.data || []);
        setTotal(res.total || 0);
      })
      .catch(() => {
        setProdutos([]);
        setTotal(0);
      })
      .finally(() => setCarregando(false));
  }, [busca, categoriaFiltro, estadoFiltro, offset]);

  const paginas = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Marketplace</h1>
      <p style={{ color: 'var(--color-muted-foreground)', marginBottom: '1.5rem' }}>
        Produtos e artesanatos das Casas de Axé
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input
          type="search"
          placeholder="Buscar produtos..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setOffset(0); }}
          style={{ flex: '1 1 200px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => { setCategoriaFiltro(e.target.value); setOffset(0); }}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
        >
          <option value="">Todas categorias</option>
          {categorias.map((c) => (
            <option key={c.categoria} value={c.categoria!}>{c.categoria} ({c.count})</option>
          ))}
        </select>
        <select
          value={estadoFiltro}
          onChange={(e) => { setEstadoFiltro(e.target.value); setOffset(0); }}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
        >
          <option value="">Todos estados</option>
          <option value="SP">São Paulo</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="BA">Bahia</option>
          <option value="MG">Minas Gerais</option>
          <option value="PE">Pernambuco</option>
          <option value="CE">Ceará</option>
          <option value="AM">Amazonas</option>
          <option value="GO">Goiás</option>
          <option value="PA">Pará</option>
          <option value="MA">Maranhão</option>
        </select>
      </div>

      {carregando ? (
        <p style={{ color: 'var(--color-muted-foreground)' }}>Carregando produtos...</p>
      ) : produtos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-muted-foreground)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nenhum produto encontrado</p>
          <p>Tente ajustar os filtros ou volte mais tarde.</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-foreground)', marginBottom: '1rem' }}>
            {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {produtos.map((p) => (
              <Link
                key={p.id}
                href={`/t/${p.terreiro.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {p.imagens && p.imagens.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagens[0]}
                    alt={p.nome}
                    style={{ width: '100%', height: 180, objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 180,
                    background: 'var(--color-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-muted-foreground)',
                    fontSize: '2rem',
                  }}>
                    {p.nome.charAt(0)}
                  </div>
                )}

                <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{p.nome}</h3>
                  {p.descricao && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted-foreground)', marginBottom: '0.5rem', flex: 1 }}>
                      {p.descricao.length > 80 ? p.descricao.slice(0, 80) + '...' : p.descricao}
                    </p>
                  )}
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                    {formatCurrency(p.preco)}
                  </div>
                  {p.categoria && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted-foreground)', marginBottom: '0.25rem' }}>
                      {p.categoria}
                    </span>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
                    {p.terreiro.nome}
                    {p.terreiro.isVerified && ' ✔'}
                    {' · '}{p.terreiro.cidade}, {p.terreiro.estado}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {paginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="btn btn-secondary"
                style={{ opacity: offset === 0 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--color-muted-foreground)' }}>
                {Math.floor(offset / limit) + 1} / {paginas}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="btn btn-secondary"
                style={{ opacity: offset + limit >= total ? 0.5 : 1 }}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
