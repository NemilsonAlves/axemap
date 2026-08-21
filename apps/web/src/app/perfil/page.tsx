'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import { labelTradicao } from '@/lib/tradicoes';

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

interface MeuTerreiro {
  id: string;
  nome: string;
  slug: string;
  tradicao: string;
  cidade: string;
  estado: string;
  status: string;
  trustScore: number;
  isPublished: boolean;
  isVerified: boolean;
  verificationLevel: string;
  fotoUrl: string | null;
  _count?: {
    eventos: number;
    cursos: number;
    acoesSociais: number;
    avaliacoes: number;
    fotos: number;
  };
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

const perfilSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

function trustBadgeColor(score: number): { bg: string; fg: string; label: string } {
  if (score >= 80) return { bg: 'hsl(150,42%,36%)', fg: 'white', label: 'Lendário' };
  if (score >= 60) return { bg: 'hsl(150,46%,44%)', fg: 'white', label: 'Autoridade' };
  if (score >= 40) return { bg: 'hsl(36,85%,44%)', fg: 'white', label: 'Estabelecido' };
  if (score >= 20) return { bg: 'hsl(38,90%,40%)', fg: 'white', label: 'Emergente' };
  return { bg: 'hsl(18,66%,47%)', fg: 'white', label: 'Iniciante' };
}

function verificationBadge(level: string): { label: string; color: string } | null {
  switch (level) {
    case 'VERIFIED': return { label: 'Verificado', color: 'hsl(150,42%,36%)' };
    case 'TRUSTED': return { label: 'Confiável', color: 'hsl(150,46%,44%)' };
    case 'DOCUMENTED': return { label: 'Documentado', color: 'hsl(36,85%,44%)' };
    case 'BASIC': return { label: 'Básico', color: 'hsl(28,14%,50%)' };
    default: return null;
  }
}

export default function PerfilPage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregandoFavs, setCarregandoFavs] = useState(true);
  const [terreiros, setTerreiros] = useState<MeuTerreiro[]>([]);
  const [carregandoTerreiros, setCarregandoTerreiros] = useState(true);
  const [erroTerreiros, setErroTerreiros] = useState('');
  const [cursos, setCursos] = useState<MeuCurso[]>([]);
  const [carregandoCursos, setCarregandoCursos] = useState(true);
  const [editando, setEditando] = useState(false);
  const [erroEdit, setErroEdit] = useState('');
  const [salvoEdit, setSalvoEdit] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: user?.nome || '' },
  });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) reset({ nome: user.nome });
  }, [user, reset]);

  const carregarTerreiros = useCallback(() => {
    if (!user) return;
    setCarregandoTerreiros(true);
    setErroTerreiros('');
    api
      .get<{ data: MeuTerreiro[] }>('/terreiros/meus')
      .then((res) => setTerreiros(res.data || []))
      .catch(() => setErroTerreiros('Não foi possível carregar suas casas de axé.'))
      .finally(() => setCarregandoTerreiros(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get<{ data: Favorito[] }>('/growth/favoritos')
      .then((res) => setFavoritos(res.data || []))
      .catch(() => setFavoritos([]))
      .finally(() => setCarregandoFavs(false));
    carregarTerreiros();
    api
      .get<MeuCurso[]>('/cursos/meus')
      .then((res) => setCursos(Array.isArray(res) ? res : []))
      .catch(() => setCursos([]))
      .finally(() => setCarregandoCursos(false));
  }, [user, carregarTerreiros]);

  const onEditSubmit = async (data: PerfilFormData) => {
    setErroEdit('');
    setSalvoEdit(false);
    try {
      const res = await api.patch<{ nome: string; email: string; role: string; avatarUrl: string | null }>('/auth/me', { nome: data.nome });
      updateUser({ nome: res.nome, avatarUrl: res.avatarUrl });
      setEditando(false);
      setSalvoEdit(true);
    } catch (err) {
      setErroEdit(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErroEdit('Formato inválido. Use JPEG, PNG ou WebP.');
      return;
    }

    setUploadingAvatar(true);
    setErroEdit('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1/upload/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('axemap_auth') ? JSON.parse(localStorage.getItem('axemap_auth')!).accessToken : ''}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Erro ao fazer upload');
      const data = await res.json();
      updateUser({ avatarUrl: data.url });
      setSalvoEdit(true);
    } catch (err) {
      setErroEdit(err instanceof Error ? err.message : 'Erro ao fazer upload do avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Meu Perfil</h1>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        {salvoEdit && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 70%, transparent)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--success-foreground)' }}>
            Perfil atualizado com sucesso!
          </div>
        )}

        {editando ? (
          <form onSubmit={handleSubmit(onEditSubmit)}>
            {erroEdit && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--danger)', borderRadius: 8, fontSize: '0.85rem', color: 'white' }}>{erroEdit}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>Nome</label>
                <input
                  {...register('nome')}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
                {errors.nome && <span style={{ color: 'var(--color-danger)', fontSize: '0.75rem' }}>{errors.nome.message}</span>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>E-mail</label>
                <input
                  value={user.email}
                  disabled
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', opacity: 0.6 }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>E-mail não pode ser alterado</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="painel-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditando(false); reset({ nome: user.nome }); }}>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.nome}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
                    fontSize: '1.5rem', fontWeight: 700,
                  }}>
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '0.75rem',
                    border: '2px solid var(--background)',
                  }}
                >
                  {uploadingAvatar ? '...' : '+'}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingAvatar}
                />
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <h2 style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{user.nome}</h2>
                <p style={{ color: 'var(--color-muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  background: 'hsl(var(--primary) / 0.12)',
                  color: 'var(--color-primary)',
                  marginTop: '0.5rem',
                }}>
                  {user.role}
                </span>
              </div>
            </div>
            <button className="btn btn-secondary" onClick={() => setEditando(true)}>
              Editar Perfil
            </button>
          </div>
        )}
      </div>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.25rem' }}>Minhas Casas de Axé</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-foreground)', marginBottom: '1rem' }}>
          Casas de axé vinculadas à sua conta. Gerencie perfil, eventos, cursos e fotos.
        </p>
        {carregandoTerreiros ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', opacity: 0.5 }}>
                <div style={{ height: 14, width: '60%', background: 'var(--color-muted)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 12, width: '40%', background: 'var(--color-muted)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : erroTerreiros ? (
          <div style={{ padding: '1rem', background: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 70%, transparent)', borderRadius: 8, fontSize: '0.85rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>{erroTerreiros}</span>
            <button onClick={carregarTerreiros} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.25rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' }}>
              Tentar novamente
            </button>
          </div>
        ) : terreiros.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#127961;</div>
            <p style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Você ainda não cadastrou uma Casa de Axé.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted-foreground)', marginBottom: '1rem' }}>
              Cadastre seu terreiro para aparecer no mapa e começar a construir seu trust score.
            </p>
            <Link href="/onboarding" className="painel-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Cadastrar minha Casa de Axé
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {terreiros.map((t) => <TerreiroCard key={t.id} terreiro={t} />)}
          </div>
        )}
      </div>

      <div className="feature-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.75rem' }}>Meus Favoritos</h2>
        {carregandoFavs ? (
          <p style={{ color: 'var(--color-muted-foreground)' }}>Carregando...</p>
        ) : favoritos.length === 0 ? (
          <p style={{ color: 'var(--color-muted-foreground)' }}>
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
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
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
                    width: 56, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
                  }}>
                    {f.nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <strong style={{ display: 'block', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{f.nome}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-foreground)' }}>
                    {labelTradicao(f.tradicao)} &middot; {f.cidade}, {f.estado}
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
          <p style={{ color: 'var(--color-muted-foreground)' }}>Carregando...</p>
        ) : cursos.length === 0 ? (
          <p style={{ color: 'var(--color-muted-foreground)' }}>
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
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <strong style={{ display: 'block', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{m.curso.titulo}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-foreground)' }}>
                    <Link href={`/t/${m.curso.terreiro.slug}`} style={{ textDecoration: 'underline' }}>
                      {m.curso.terreiro.nome}
                    </Link>{' '}
                    &middot; {m.curso.terreiro.cidade}, {m.curso.terreiro.estado}
                  </div>
                  {m.curso.modalidade && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>{m.curso.modalidade}</div>
                  )}
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  color: 'var(--color-fern)', background: 'hsl(var(--fern) / 0.14)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
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
          style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

function TerreiroCard({ terreiro: t }: { terreiro: MeuTerreiro }) {
  const trust = trustBadgeColor(t.trustScore ?? 0);
  const vBadge = verificationBadge(t.verificationLevel);

  return (
    <div style={{
      padding: '0.75rem',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {t.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.fotoUrl} alt={t.nome} style={{ width: 56, height: 56, borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-sm)', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-primary)', color: 'var(--color-primary-foreground)',
            fontSize: '1.5rem', flexShrink: 0,
          }}>
            {t.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
          <div style={{ fontWeight: 600, overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: 1.3 }}>{t.nome}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted-foreground)' }}>
            {labelTradicao(t.tradicao)} &middot; {t.cidade}, {t.estado}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.25rem' }}>
            <span style={{ padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, background: trust.bg, color: trust.fg }}>
              Trust {t.trustScore?.toFixed(0)} &middot; {trust.label}
            </span>
            {vBadge && (
              <span style={{ padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, background: vBadge.color, color: 'white' }}>
                {vBadge.label}
              </span>
            )}
            <span style={{
              padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600,
              color: t.isPublished ? 'hsl(150,42%,36%)' : 'var(--color-muted-foreground)',
              background: t.isPublished ? 'hsl(150,42%,36%,0.12)' : 'var(--color-muted)',
            }}>
              {t.isPublished ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
        <Link
          href={`/t/${t.slug}`}
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', color: 'inherit', textDecoration: 'none', fontWeight: 500 }}
        >
          Ver perfil
        </Link>
        <Link
          href={`/painel/terreiros/${t.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="painel-btn"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', textDecoration: 'none' }}
        >
          Editar terreiro
        </Link>
      </div>
    </div>
  );
}
