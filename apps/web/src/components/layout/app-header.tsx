'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, LayoutGrid, BookOpen, GraduationCap, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const mainNav = [
  { label: 'Explorar', href: '/busca', icon: Search },
  { label: 'Mapa', href: '/mapa', icon: MapPin },
  { label: 'Terreiros', href: '/terreiros', icon: LayoutGrid },
  { label: 'Cursos', href: '/cursos', icon: GraduationCap },
  { label: 'Tradição', href: '/tradicao', icon: BookOpen },
];

export function AppHeader() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isAdmin = !!user && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role);
  const isDirigente = !!user && ['DIRIGENTE', 'OGA', 'EKEDI'].includes(user.role);
  const initials = user?.nome
    ? user.nome
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase();

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    active
                      ? 'text-copper-strong'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon-sm" aria-label="Buscar terreiros, eventos e cursos">
            <Link href="/busca">
              <Search className="size-4" />
            </Link>
          </Button>

          <ThemeToggle />

          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-label="Menu da conta"
                >
                  <Avatar className="size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="normal-case tracking-normal text-foreground">{user.nome || 'Usuário'}</span>
                  <span className="text-xs font-normal normal-case tracking-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil">Perfil</Link>
                </DropdownMenuItem>
                {isDirigente && (
                  <DropdownMenuItem asChild>
                    <Link href="/painel">Painel</Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Administração</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/notificacoes">Notificações</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} destructive>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/onboarding">
                  Cadastrar Terreiro
                  <Badge className="ml-1 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                    Grátis
                  </Badge>
                </Link>
              </Button>
            </>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-6">
              <div className="flex flex-col gap-6">
                <Logo />
                <nav aria-label="Menu mobile" className="flex flex-col gap-1">
                  {mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <item.icon className="size-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  ))}
                  <Separator className="my-3" />
                  <Link
                    href="/onboarding"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-copper-strong transition-colors hover:bg-copper-soft/40"
                  >
                    Cadastrar Terreiro
                  </Link>
                  {!user && (
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      Entrar
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}