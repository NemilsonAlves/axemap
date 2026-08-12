'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { NotificationsBell } from '@/components/notifications-bell';

export function Nav() {
  const { user, loading, logout } = useAuth();

  const isAdmin = !!user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  return (
    <nav className="nav">
      <a href="/" className="logo">AxéMap</a>
      <div className="nav-links">
        <a href="/busca">Buscar</a>
        <a href="/mapa">Mapa</a>
        <a href="/central-evolucao">Evolução</a>
        <a href="/onboarding" className="nav-cta">Cadastrar Casa de Axé</a>
        {loading ? null : user ? (
          <>
            {isAdmin && <a href="/admin">Admin</a>}
            {user.role === 'DIRIGENTE' && <a href="/painel">Painel</a>}
            <NotificationsBell />
            <a href="/perfil">Perfil</a>
            <button onClick={logout} className="nav-btn-logout">Sair</button>
          </>
        ) : (
          <a href="/auth/login">Entrar</a>
        )}
      </div>
    </nav>
  );
}
