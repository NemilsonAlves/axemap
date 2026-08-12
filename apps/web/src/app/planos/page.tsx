'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface Plano {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  precoMensal: number;
  precoAnual: number | null;
  destaque: boolean;
  funcionalidades: string[];
  ordem: number;
  ativo?: boolean;
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [ciclo, setCiclo] = useState<'MENSAL' | 'ANUAL'>('MENSAL');

  useEffect(() => {
    api
      .get<Plano[]>('/planos')
      .then((data) => setPlanos((data || []).filter((p) => p.ativo)))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const fmt = (v: number) =>
    v === 0 ? 'Grátis' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const preco = (p: Plano) => (ciclo === 'ANUAL' ? (p.precoAnual ?? p.precoMensal * 12) : p.precoMensal);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-amber-soft/50 to-card">
        <div className="container-page py-12 md:py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-copper/25 bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
            AxéMap Pro
          </span>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-card-foreground md:text-5xl">
            Ferramentas profissionais para o seu terreiro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Gerencie membros, agenda, fotos e finanças com ferramentas tão boas quanto de qualquer empresa,
            mas feitas para a realidade do axé.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              onClick={() => setCiclo('MENSAL')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${ciclo === 'MENSAL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-card-foreground'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCiclo('ANUAL')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${ciclo === 'ANUAL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-card-foreground'}`}
            >
              Anual <span className={ciclo === 'ANUAL' ? 'text-primary-foreground/80' : 'text-success'}>−2 meses</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        {carregando ? (
          <p className="py-16 text-center text-muted-foreground">Carregando planos...</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {planos.map((p) => {
              const atual = preco(p);
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-2xl border bg-card p-6 ${p.destaque ? 'border-primary shadow-lg' : 'border-border'}`}
                >
                  {p.destaque && (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">
                      Mais escolhido
                    </span>
                  )}
                  <h2 className="font-display text-lg font-bold text-card-foreground">{p.nome}</h2>
                  {p.descricao && <p className="mt-1 text-xs text-muted-foreground">{p.descricao}</p>}
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-card-foreground">{fmt(atual)}</span>
                    <span className="text-sm text-muted-foreground">/{ciclo === 'ANUAL' ? 'ano' : 'mês'}</span>
                  </div>

                  <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm text-card-foreground">
                    {p.funcionalidades.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-success">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/auth/cadastro"
                    className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${
                      p.destaque ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-card-foreground'
                    }`}
                  >
                    {atual === 0 ? 'Começar grátis' : 'Assinar'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Pagamento via PIX com confirmação manual. Em breve, cartão de crédito com cobrança automática.
        </p>
      </div>
    </>
  );
}