import type { TerreiroPerfil } from '@/types/terreiro';
import { Store, Zap } from 'lucide-react';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const CATEGORIA_POR_TIPO: Record<string, string> = {
  LIVRO: 'Livros',
  ARTESANATO: 'Artesanato',
  VESTUARIO: 'Vestimentas',
  SERVICO: 'Serviços',
  OUTROS: 'Outros',
};

export function MarketplaceSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  if (!terreiro.produtos.length) return null;

  return (
    <section className="section-card" id="marketplace">
      <div className="flex items-center gap-2">
        <Store className="size-5 text-copper" />
        <h2 className="section-title">Marketplace da Comunidade</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {terreiro.produtos.map((p) => (
          <div key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-square bg-gradient-to-br from-copper-soft to-card">
              {p.imagens?.length ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imagens[0]} alt={p.nome} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">✦</div>
              )}
            </div>
            <div className="p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {CATEGORIA_PRODUCT_TYPE[p.categoria ?? ''] ?? p.categoria}
              </div>
              <h3 className="mt-0.5 text-sm font-semibold text-card-foreground line-clamp-1">{p.nome}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold text-copper-strong">{brl.format(p.preco)}</span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Zap className="size-3" /> {p.estoque}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const CATEGORIA_PRODUCT_TYPE: Record<string, string> = {
  VELA: 'Velas',
  ERVA: 'Ervas',
  DEFUMADOR: 'Defumadores',
  GUIA: 'Guias',
  FIO_DE_CONTA: 'Fio de contas',
  VESTUARIO: 'Vestuário',
  INSTRUMENTO: 'Instrumentos',
  IMAGEM_SACRA: 'Imagens sacras',
  LIVRO: 'Livros',
  SERVICO: 'Serviços',
};