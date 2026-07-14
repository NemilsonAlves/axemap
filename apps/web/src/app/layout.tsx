import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './busca/page.css';
import { AuthProvider } from '@/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AxéMap - Plataforma de Religiões Afro-Brasileiras',
  description: 'Conecte-se com terreiros, eventos e comunidade de religiões afro-brasileiras.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <header className="header">
            <nav className="nav">
              <a href="/" className="logo">AxéMap</a>
              <div className="nav-links">
                <a href="/busca">Buscar</a>
                <a href="/mapa">Mapa</a>
                <a href="/onboarding" className="nav-cta">Cadastrar Terreiro</a>
                <a href="/auth/login">Entrar</a>
              </div>
            </nav>
          </header>
          <main className="main">{children}</main>
          <footer className="footer">
            <p>AxéMap — Conectando tradições</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
