'use client';

import { useEffect, useState } from 'react';
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

export default function PerfilPage() {
  const { user, loading, logout, updateUser } = useAuth();
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregandoFavs, setCarregandoFavs] = useState(true);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/upload/avatar`, {
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
