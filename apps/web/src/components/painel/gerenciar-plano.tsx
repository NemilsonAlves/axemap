'use client';

import { useCallback, useEffect, useState } from 'react';
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
  ativo: boolean;
}

interface Assinatura {
  id: string;
  status: string;
  ciclo: string;
  valor: number;
  iniciadoEm: string;
  renovarEm: string | null;
  canceladoEm: string | null;
  plano: Plano;
  pagamentos: {
    id: string;
    valor: number;
    metodo: string;
    status: string;
    referencia: string | null;
    pagoEm: string | null;
  }[];
}

export function GerenciarPlano({ terreiroId }: { terreiroId: string }) {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [assinando, setAssinando] = useState(false);
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [selecionado, setSelecionado] = useState<string>('GRATIS');
  const [ciclo, setCiclo] = useState<'MENSAL' | 'ANUAL'>('MENSAL');

  const carregar = useCallback(async () => {
    try {
      const [planosData, assinaturaData] = await Promise.all([
        api.get<Plano[]>('/planos'),
        api.get<Assinatura | null>(`/planos/assinatura/${terreiroId}`),
      ]);
      setPlanos((planosData || []).filter((p) => p.ativo));
      setAssinatura(assinaturaData);
      if (assinaturaData) setSelecionado(assinaturaData.plano.slug);
    } catch {}
    setCarregando(false);
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const assinar = async (plano: Plano) => {
    setErro('');
    setOk('');
    setAssinando(true);
    try {
      const res = await api.post<{ pagamento: { pix: string }; assinatura: { status: string } }>('/planos/assinatura', {
        terreiroId,
        planoSlug: plano.slug,
        ciclo,
      });
      setAssinatura(null);
      await carregar();
      if (plano.precoMensal === 0 || res.assinatura.status === 'ATIVO') {
        setOk('Plano atualizado com sucesso!');
      } else {
        const pix = res.pagamento?.pix;
        setOk(pix ? `Assinatura criada. Realize o PIX com o código para ativar o plano.` : 'Assinatura criada. Aguardando confirmação do pagamento.');
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao assinar o plano');
    } finally {
      setAssinando(false);
    }
  };

  const cancelar = async () => {
    if (!window.confirm('Cancelar a assinatura atual? O plano Grátis será reativado.')) return;
    setErro('');
    setOk('');
    try {
      await api.delete(`/planos/assinatura/${terreiroId}`);
      setAssinatura(null);
      await carregar();
      setOk('Assinatura cancelada.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao cancelar assinatura');
    }
  };

  const fmt = (v: number) =>
    v === 0 ? 'Grátis' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (carregando) return <p className="painel-empty">Carregando planos...</p>;

  const nomeAtual = assinatura?.status === 'ATIVO' ? assinatura.plano.nome : null;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>Plano de assinatura</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)', marginTop: '0.25rem' }}>
          {nomeAtual
            ? `Plano atual: ${nomeAtual} (${assinatura!.ciclo === 'ANUAL' ? 'anual' : 'mensal'})`
            : 'Você está no plano Grátis. Desbloqueie ferramentas profissionais da sua Casa de Axé.'}
        </p>
      </div>

      {erro && <div className="painel-error">{erro}</div>}
      {ok && <div className="painel-ok">{ok}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          className={`painel-btn ${ciclo === 'MENSAL' ? '' : 'ghost'}`}
          onClick={() => setCiclo('MENSAL')}
        >
          Mensal
        </button>
        <button
          className={`painel-btn ${ciclo === 'ANUAL' ? '' : 'ghost'}`}
          onClick={() => setCiclo('ANUAL')}
        >
          Anual <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>−2 meses</span>
        </button>
      </div>

      <div className="painel-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {planos.map((p) => {
          const preco = ciclo === 'ANUAL' ? (p.precoAnual ?? p.precoMensal * 12) : p.precoMensal;
          const ativo = assinatura?.plano.slug === p.slug && (assinatura?.status === 'ATIVO' || assinatura?.status === 'ATIVA');
          return (
            <div key={p.id} className={`painel-card plano-card ${p.destaque ? 'destaque' : ''} ${ativo ? 'ativo' : ''}`} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1rem' }}>{p.nome}</strong>
                {ativo && <span className="painel-status" style={{ color: 'var(--color-success)' }}>✓ Ativo</span>}
              </div>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>{fmt(preco)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>/{ciclo === 'ANUAL' ? 'ano' : 'mês'}</span>
              </div>
              {p.descricao && <p style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>{p.descricao}</p>}
              <ul style={{ fontSize: '0.8rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                {p.funcionalidades.slice(0, 5).map((f) => (
                  <li key={f} style={{ display: 'flex', gap: '0.4rem', color: 'var(--color-gray-200)' }}>
                    <span style={{ color: 'var(--color-success)' }}>✓</span> {f}
                  </li>
                ))}
                {p.funcionalidades.length > 5 && (
                  <li style={{ color: 'var(--color-gray-300)', fontSize: '0.75rem' }}>+{p.funcionalidades.length - 5} recursos</li>
                )}
              </ul>
              {ativo ? (
                <button className="painel-btn ghost" onClick={cancelar}>Cancelar assinatura</button>
              ) : (
                <button
                  className="painel-btn"
                  disabled={assinando}
                  onClick={() => assinar(p)}
                >
                  {assinando && selecionado === p.slug ? 'Assinando...' : p.precoMensal === 0 ? 'Usar plano Grátis' : 'Assinar'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
        Pagamento via PIX com confirmação manual pela equipe. Em breve, cartão de crédito e débito com cobrança automática.
      </div>
    </div>
  );
}