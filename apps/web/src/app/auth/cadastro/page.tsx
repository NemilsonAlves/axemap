'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function CadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signup } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('Senhas não conferem');
      return;
    }

    if (senha.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return;
    }

    try {
      await signup(email, nome, senha);
      router.push('/perfil');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Criar Conta</h1>

      {error && (
        <div style={{ background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Nome</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="input" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={8} required className="input" />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Confirmar Senha</label>
          <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} minLength={8} required className="input" />
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          Criar Conta
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <a href="/auth/login" style={{ color: 'var(--color-secondary)' }}>Já tem conta? Entrar</a>
      </p>
    </div>
  );
}
