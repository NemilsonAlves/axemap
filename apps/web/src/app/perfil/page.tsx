'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';

interface Favorito {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  cidade: string;
  estado: string;
  trustScore: number;
  isVerified: boolean;
  fotoUrl: string | null;
  descricaoCurta: string | null;
}

interface MeuCurso {
  id: string;
  status: string;
  curso: {
    id: string;
    titulo: string;
    descricao: string | null;
    modalidade: string | null;
    dataInicio: string | null;
    terreiro: { id: string; nome: string; slug: string; cidade: string; estado: string };
  };
}

export default function PerfilPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregandoFavs, setCarregandoFavs] = useState(true);
  const [cursos, setCursos] = useState<MeuCurso[]>([]);
  const [carregandoCursos, setCarregandoCursos] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ data: Favorito[] }>('/growth/favoritos')
      .then((res) => setFavoritos(res.data || []))
      .catch(() => setFavoritos([]))
      .finally(() => setCarregandoFavs(false));
    api
      .get<MeuCurso[]>('/cursos/meus')
      .then((res) => setCursos(Array.isArray(res) ? res : []))
      .catch(() => setCursos([]))
      .finally(() => setCarregandoCursos(false));
  }, [user]);

  if (loading) return <p>Carregando...</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Meu Perfil</h1>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{user.nome}</h2>
            <p style={{ color: 'var(--color-gray-300)' }}>{user.email}</p>
            <span style={{
              display: 'inline-block',
              padding: '0.25rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              background: 'var(--color-secondary)',
              color: 'white',
              marginTop: '0.5rem',
            }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Meus Favoritos</h2>
        {carregandoFavs ? (
          <p style={{ color: 'var(--color-gray-300)' }}>Carregando...</p>
        ) : favoritos.length === 0 ? (
          <p style={{ color: 'var(--color-gray-300)' }}>
            Você ainda não favoritou nenhum terreiro.{' '}
            <Link href="/busca" style={{ textDecoration: 'underline' }}>Explorar terreiros</Link>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {favoritos.map((f) => (
              <Link
                key={f.id}
                href={`/t/${f.slug}`}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: '1px solid var(--color-gray-200, #e5e7eb)',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {f.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.fotoUrl}
                    alt={f.nome}
                    style={{ width: 56, height: 56, borderRadius: '0.5rem', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-secondary)', color: 'white',
                  }}>
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <strong>{f.nome}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                    {f.tradicao.replace(/_/g, ' ')} &middot; {f.cidade}, {f.estado}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                    {f.isVerified && '✔ Verificado '}Trust Score {f.trustScore?.toFixed(1)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Meus Cursos</h2>
        {carregandoCursos ? (
          <p style={{ color: 'var(--color-gray-300)' }}>Carregando...</p>
        ) : cursos.length === 0 ? (
          <p style={{ color: 'var(--color-gray-300)' }}>
            Você ainda não está matriculado em nenhum curso.{' '}
            <Link href="/cursos" style={{ textDecoration: 'underline' }}>Ver cursos disponíveis</Link>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cursos.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  border: '1px solid var(--color-gray-200, #e5e7eb)',
                  borderRadius: '0.5rem',
                }}
              >
                <div>
                  <strong>{m.curso.titulo}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-gray-300)' }}>
                    <Link href={`/t/${m.curso.terreiro.slug}`} style={{ textDecoration: 'underline' }}>
                      {m.curso.terreiro.nome}
                    </Link>{' '}
                    &middot; {m.curso.terreiro.cidade}, {m.curso.terreiro.estado}
                  </div>
                  {m.curso.modalidade && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-300)' }}>{m.curso.modalidade}</div>
                  )}
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  color: '#16a34a', background: '#d4edda', padding: '0.2rem 0.5rem', borderRadius: 4,
                }}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="btn btn-secondary"
          style={{ borderColor: '#c00', color: '#c00' }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
