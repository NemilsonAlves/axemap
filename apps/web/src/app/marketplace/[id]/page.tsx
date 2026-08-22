'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { ArrowLeft, ShieldCheck, MapPin, Store } from 'lucide-react';

interface Produto {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  estoque: number;
  imagens: string[];
  createdAt: string;
  terreiro: {
    id: string;
    nome: string;
    slug: string;
    cidade: string;
    estado: string;
    trustScore: number;
    isVerified: boolean;
    fotoUrl: string | null;
  };
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

export default function ProdutoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Produto>(`/marketplace/${id}`);
        setProduto(res);
      } catch {
        setError('Produto não encontrado.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded-xl bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded-xl bg-muted" />
            <div className="h-12 w-1/3 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Link href="/marketplace" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper">
          <ArrowLeft className="size-4" /> Voltar ao Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-page max-w-5xl py-10">
        <Link href="/marketplace" className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            {produto.imagens && produto.imagens.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={produto.imagens[0]}
                alt={produto.nome}
                className="w-full rounded-3xl object-cover"
                style={{ maxHeight: 500 }}
              />
            ) : (
              <div className="flex h-96 items-center justify-center rounded-3xl bg-muted text-6xl font-bold text-muted-foreground/30">
                {produto.nome.charAt(0)}
              </div>
            )}
            {produto.imagens && produto.imagens.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {produto.imagens.slice(1, 5).map((img: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`${produto.nome} ${i + 2}`}
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            {produto.categoria && (
              <span className="inline-block rounded-full bg-copper-soft/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-copper-strong">
                {produto.categoria}
              </span>
            )}

            <h1 className="mt-3 font-display text-3xl font-black tracking-tight">{produto.nome}</h1>

            <p className="mt-4 font-display text-4xl font-black text-copper">
              {formatCurrency(produto.preco)}
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              {produto.estoque > 0 ? (
                <span className="font-semibold text-verde-floresta">{produto.estoque} em estoque</span>
              ) : (
                <span className="font-semibold text-destructive">Esgotado</span>
              )}
            </div>

            {produto.descricao && (
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{produto.descricao}</p>
            )}

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Store className="size-4" /> Vendido por
              </div>
              <Link
                href={`/t/${produto.terreiro.slug}`}
                className="mt-3 flex items-center gap-3 transition hover:opacity-80"
              >
                {produto.terreiro.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={produto.terreiro.fotoUrl}
                    alt={produto.terreiro.nome}
                    className="size-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {produto.terreiro.nome.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{produto.terreiro.nome}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {produto.terreiro.cidade}, {produto.terreiro.estado}
                    {produto.terreiro.isVerified && (
                      <ShieldCheck className="size-3.5 text-verde-floresta" />
                    )}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
