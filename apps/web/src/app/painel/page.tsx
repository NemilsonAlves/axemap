'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import './painel.css';

interface MeuTerreiro {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  cidade: string;
  estado: string;
  status: string;
  isPublished: boolean;
  fotoUrl: string | null;
  trustScore: number;
  _count: {
    eventos: number;
    cursos: number;
    acoesSociais: number;
    avaliacoes: number;
    fotos: number;
  };
}

export default function PainelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [terreiros, setTerreiros] = useState<MeuTerreiro[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    api
      .get<{ data: MeuTerreiro[] }>('/terreiros/meus')
      .then((res) => setTerreiros(res.data || []))
      .catch(() => setTerreiros([]))
      .finally(() => setCarregando(false));
  }, [user, loading, router]);

  return (
    <div className="painel-container">
      <div className="painel-header">
        <div>
          <h1 className="painel-title">Painel do Dirigente</h1>
          <p className="painel-subtitle">
            Gerencie os terreiros que você dirige: perfil, eventos, cursos, ações sociais, avaliações e fotos.
          </p>
        </div>
        <Link href="/onboarding" className="painel-btn">+ Cadastrar terreiro</Link>
      </div>

      {carregando ? (
        <p className="painel-empty">Carregando seus terreiros...</p>
      ) : terreiros.length === 0 ? (
        <div className="painel-card" style={{ textAlign: 'center' }}>
          <p className="painel-empty" style={{ padding: '1rem' }}>
            Você ainda não dirige nenhum terreiro cadastrado.
          </p>
          <Link href="/onboarding" className="painel-btn" style={{ margin: '0 auto' }}>Cadastrar meu terreiro</Link>
        </div>
      ) : (
        <div className="painel-grid">
          {terreiros.map((t) => (
            <Link key={t.id} href={`/painel/terreiros/${t.id}`} className="painel-card link" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {t.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.fotoUrl} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10 }} />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: 10,
                    background: 'var(--color-gray-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>🛖</div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div className="painel-card-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.nome}</div>
                  <div className="painel-card-sub">{t.cidade}, {t.estado} · {t.tradicao.replace(/_/g, ' ')}</div>
                </div>
              </div>
              <div className="painel-stats">
                <span className="painel-stat"><strong>{t._count.avaliacoes}</strong> avaliações</span>
                <span className="painel-stat"><strong>{t._count.eventos}</strong> eventos</span>
                <span className="painel-stat"><strong>{t._count.cursos}</strong> cursos</span>
                <span className="painel-stat"><strong>{t._count.acoesSociais}</strong> ações</span>
                <span className="painel-stat"><strong>{t._count.fotos}</strong> fotos</span>
              </div>
              <div style={{ marginTop: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`painel-status ${t.isPublished ? '' : ''}`}>{t.status.replace(/_/g, ' ')}</span>
                <span className="painel-stat">Trust {t.trustScore.toFixed(0)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
