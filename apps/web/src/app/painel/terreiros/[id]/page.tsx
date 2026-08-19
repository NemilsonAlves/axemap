'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { EditarTerreiro } from '@/components/painel/editar-terreiro';
import { GerenciarEventos } from '@/components/painel/gerenciar-eventos';
import { GerenciarCursos } from '@/components/painel/gerenciar-cursos';
import { GerenciarAcoes } from '@/components/painel/gerenciar-acoes';
import { GerenciarAvaliacoes } from '@/components/painel/gerenciar-avaliacoes';
import { GerenciarFotos } from '@/components/painel/gerenciar-fotos';
import { GerenciarVerificacao } from '@/components/painel/gerenciar-verificacao';
import { GerenciarEstatisticas } from '@/components/painel/gerenciar-estatisticas';
import { GerenciarMembros } from '@/components/painel/gerenciar-membros';
import { GerenciarPlano } from '@/components/painel/gerenciar-plano';
import { GerenciarFinanceiro } from '@/components/painel/gerenciar-financeiro';
import '../../painel.css';

export interface TerreiroPainel {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  cidade: string;
  estado: string;
  status: string;
  isPublished: boolean;
  isVerified: boolean;
  fotoUrl: string | null;
}

type Tab = 'visao-geral' | 'editar' | 'eventos' | 'cursos' | 'acoes' | 'avaliacoes' | 'fotos' | 'verificacao' | 'estatisticas' | 'membros' | 'plano' | 'financeiro';

export default function TerreiroPainelPage() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [terreiro, setTerreiro] = useState<TerreiroPainel | null>(null);
  const [tab, setTab] = useState<Tab>('visao-geral');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    api
      .get<{ data: TerreiroPainel[] }>('/terreiros/meus')
      .then((res) => {
        const t = (res.data || []).find((x) => x.id === params.id);
        if (t) setTerreiro(t);
        else router.push('/painel');
      })
      .catch(() => router.push('/painel'));
  }, [user, loading, router, params.id]);

  if (!terreiro) {
    return <div className="painel-container"><p className="painel-empty">Carregando...</p></div>;
  }

  return (
    <div className="painel-container">
      <div className="painel-header">
        <div>
          <Link href="/painel" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', textDecoration: 'none' }}>← Minhas Casas de Axé</Link>
          <h1 className="painel-title">{terreiro.nome}</h1>
          <p className="painel-subtitle">{terreiro.cidade}, {terreiro.estado} · <Link href={`/t/${terreiro.slug}`} style={{ color: 'var(--color-accent)' }}>ver página pública</Link></p>
        </div>
      </div>

      <div className="painel-tabs">
        <button className={`painel-tab ${tab === 'visao-geral' ? 'active' : ''}`} onClick={() => setTab('visao-geral')}>Visão geral</button>
        <button className={`painel-tab ${tab === 'editar' ? 'active' : ''}`} onClick={() => setTab('editar')}>Editar perfil</button>
        <button className={`painel-tab ${tab === 'eventos' ? 'active' : ''}`} onClick={() => setTab('eventos')}>Eventos</button>
        <button className={`painel-tab ${tab === 'cursos' ? 'active' : ''}`} onClick={() => setTab('cursos')}>Cursos</button>
        <button className={`painel-tab ${tab === 'acoes' ? 'active' : ''}`} onClick={() => setTab('acoes')}>Ações sociais</button>
        <button className={`painel-tab ${tab === 'avaliacoes' ? 'active' : ''}`} onClick={() => setTab('avaliacoes')}>Avaliações</button>
        <button className={`painel-tab ${tab === 'fotos' ? 'active' : ''}`} onClick={() => setTab('fotos')}>Fotos</button>
        <button className={`painel-tab ${tab === 'verificacao' ? 'active' : ''}`} onClick={() => setTab('verificacao')}>Verificação</button>
        <button className={`painel-tab ${tab === 'estatisticas' ? 'active' : ''}`} onClick={() => setTab('estatisticas')}>Estatísticas</button>
        <button className={`painel-tab ${tab === 'membros' ? 'active' : ''}`} onClick={() => setTab('membros')}>Membros</button>
        <button className={`painel-tab ${tab === 'plano' ? 'active' : ''}`} onClick={() => setTab('plano')}>Plano</button>
        <button className={`painel-tab ${tab === 'financeiro' ? 'active' : ''}`} onClick={() => setTab('financeiro')}>Financeiro</button>
      </div>

      {tab === 'visao-geral' && <VisaoGeral terreiroId={terreiro.id} nome={terreiro.nome} />}
      {tab === 'editar' && <EditarTerreiro terreiroId={terreiro.id} slug={terreiro.slug} />}
      {tab === 'eventos' && <GerenciarEventos terreiroId={terreiro.id} />}
      {tab === 'cursos' && <GerenciarCursos terreiroId={terreiro.id} />}
      {tab === 'acoes' && <GerenciarAcoes terreiroId={terreiro.id} />}
      {tab === 'avaliacoes' && <GerenciarAvaliacoes terreiroId={terreiro.id} />}
      {tab === 'fotos' && <GerenciarFotos terreiroId={terreiro.id} slug={terreiro.slug} />}
      {tab === 'verificacao' && <GerenciarVerificacao terreiroId={terreiro.id} isVerified={terreiro.isVerified} />}
      {tab === 'estatisticas' && <GerenciarEstatisticas terreiroId={terreiro.id} />}
      {tab === 'membros' && <GerenciarMembros terreiroId={terreiro.id} />}
      {tab === 'plano' && <GerenciarPlano terreiroId={terreiro.id} />}
      {tab === 'financeiro' && <GerenciarFinanceiro terreiroId={terreiro.id} />}
    </div>
  );
}

function VisaoGeral({ terreiroId: _terreiroId, nome }: { terreiroId: string; nome: string }) {
  return (
    <div>
      <div className="painel-form-card">
        <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
          Bem-vindo ao gerenciamento de <strong>{nome}</strong>.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)', lineHeight: 1.6 }}>
          Use as abas acima para completar seu perfil. Preencher descrição, telefone, WhatsApp, horário de funcionamento,
          adicionar fotos e cadastrar eventos aumenta a <strong>completude</strong> e o <strong>trust score</strong> da sua casa de axé.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)', lineHeight: 1.6, marginTop: '0.5rem' }}>
          Nas abas <strong>Estatísticas</strong> e <strong>Membros</strong> você acompanha seguidores, favoritos, presenças,
          acessos via QR code e gerencia sua equipe.
        </p>
      </div>
    </div>
  );
}
