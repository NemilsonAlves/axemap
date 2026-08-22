'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
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
import { LocationLanguageSelector } from '@/components/i18n/location-language-selector';
import {
  Menu,
  MapPin,
  BookOpen,
  Search,
  ChevronDown,
  Network,
  CalendarDays,
  ShieldCheck,
  HeartHandshake,
  HandCoins,
  Building2,
  Users,
  Landmark,
  Handshake,
  Info,
  Play,
  ArrowRight,
  MoreHorizontal,
  Palette,
  Home,
  HousePlus,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Navegação principal do AxéMap.
 *
 * Desktop (lg+): LOGO · [Mapa · Tradição · Eventos · Rede▾ · Mais▾] · [busca · tema · entrar · cadastrar]
 * Mobile: menu hamburger com todos os itens
 *
 * Itens primários visíveis (4): Mapa, Tradição, Eventos, Rede (dropdown)
 * Itens secundários em "Mais" (dropdown): Quem Somos, Cultura, Confiança, Impacto, Apoie
 */
export function AppHeader() {
  const { user, loading, logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Itens primários — sempre visíveis no desktop
  const primaryNav = [
    { labelKey: 'nav.inicio' as const,   href: '/',          icon: Home },
    { labelKey: 'nav.mapa' as const,     href: '/mapa',      icon: MapPin },
    { labelKey: 'nav.tradicao' as const, href: '/tradicao',  icon: BookOpen },
    { labelKey: 'nav.eventos' as const,  href: '/eventos',   icon: CalendarDays },
  ];

  // Itens secundários — agrupados no dropdown "Mais"
  const moreItems = [
    { labelKey: 'nav.quem_somos' as const, href: '/sobre',           icon: Info,          desc: 'Missão, valores e história do AxéMap' },
    { labelKey: 'nav.cultura' as const,    href: '/central-evolucao', icon: Palette,       desc: 'Conteúdo cultural e evolução' },
    { labelKey: 'nav.confianca' as const,  href: '/transparencia',    icon: ShieldCheck,   desc: 'Transparência e sistema de confiança' },
    { labelKey: 'nav.impacto' as const,    href: '/campanhas',        icon: HeartHandshake,desc: 'Campanhas e projetos sociais' },
    { labelKey: 'nav.apoie' as const,      href: '/apoie',            icon: HandCoins,     desc: 'Círculo de Apoiadores AxéMap' },
  ];

  // Dropdown Rede AxéMap
  const redeItems = [
    { labelKey: 'nav.rede' as const,        href: '/rede',         icon: Network,   desc: 'Visão geral da Rede AxéMap' },
    { labelKey: 'nav.federacoes' as const,   href: '/federacoes',   icon: Building2, desc: 'Estruturas de representação e articulação' },
    { labelKey: 'nav.associacoes' as const,  href: '/organizacoes', icon: Handshake, desc: 'Coletivos e entidades associativas' },
    { labelKey: 'nav.comunidades' as const,  href: '/terreiros',    icon: Users,     desc: 'Casas, templos e comunidades' },
  ];

  const redeLinks = [
    { labelKey: 'nav.tv_axemap' as const, href: '/tv', icon: Play, desc: 'Documentários, entrevistas e cultura afro-brasileira', external: false },
  ];

  // Todos os itens para o menu mobile (primários + mais + rede)
  const allMobileNav = [
    { labelKey: 'nav.inicio' as const,    href: '/',                 icon: Home },
    { labelKey: 'nav.mapa' as const,      href: '/mapa',             icon: MapPin },
    { labelKey: 'nav.tradicao' as const,  href: '/tradicao',         icon: BookOpen },
    { labelKey: 'nav.eventos' as const,   href: '/eventos',          icon: CalendarDays },
    { labelKey: 'nav.quem_somos' as const,href: '/sobre',            icon: Info },
    { labelKey: 'nav.cultura' as const,   href: '/central-evolucao', icon: Palette },
    { labelKey: 'nav.confianca' as const, href: '/transparencia',    icon: ShieldCheck },
    { labelKey: 'nav.impacto' as const,   href: '/campanhas',        icon: HeartHandshake },
    { labelKey: 'nav.apoie' as const,     href: '/apoie',            icon: HandCoins },
  ];

  const isAdmin     = !!user && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role);
  const isDirigente = !!user && ['DIRIGENTE', 'OGA', 'EKEDI'].includes(user.role);
  const initials    = user?.nome
    ? user.nome.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isMoreActive = moreItems.some((i) => isActive(i.href));
  const isRedeActive = isActive('/organizacoes') || isActive('/federacoes') || isActive('/terreiros');

  // Estilos reutilizáveis
  const navLinkCls = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
      active
        ? 'bg-accent text-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  const dropdownTriggerCls = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
      active
        ? 'bg-accent text-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-[var(--z-sticky)] border-b border-border/60 bg-background/95 backdrop-blur-xl transition-all duration-300',
      )}
    >
      <div className="container-page flex h-[4.25rem] items-center gap-2">

        {/* ── CENTRO: Navegação principal ── */}
        <nav
          aria-label="Principal"
          className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
        >
          {/* Links primários */}
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkCls(isActive(item.href))}
            >
              <item.icon className="size-3.5 shrink-0" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          ))}

          {/* Dropdown: Rede AxéMap */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={dropdownTriggerCls(isRedeActive)} aria-haspopup="menu">
                <Network className="size-3.5 shrink-0" aria-hidden="true" />
                {t('nav.rede_short')}
                <ChevronDown className="size-3 opacity-50" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72 p-2">
              <DropdownMenuLabel className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-roxo-ancestral">
                {t('nav.rede')}
              </DropdownMenuLabel>
              {redeItems.map((item) => (
                <DropdownMenuItem key={item.labelKey} asChild>
                  <Link href={item.href} className="flex items-start gap-3 rounded-lg px-3 py-2.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-roxo-ancestral/10 text-roxo-ancestral">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {redeLinks.map((item) => (
                <DropdownMenuItem key={item.labelKey} asChild>
                  <Link
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-copper-soft/50 text-copper-strong">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/organizacoes" className="justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-copper-strong">
                  {t('nav.ver_toda_rede')}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown: Mais */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={dropdownTriggerCls(isMoreActive)} aria-haspopup="menu">
                <MoreHorizontal className="size-3.5 shrink-0" aria-hidden="true" />
                Mais
                <ChevronDown className="size-3 opacity-50" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72 p-2">
              {moreItems.map((item) => (
                <DropdownMenuItem key={item.labelKey} asChild>
                  <Link href={item.href} className="flex items-start gap-3 rounded-lg px-3 py-2.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{t(item.labelKey)}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* ── DIREITA: idioma · busca · tema · conta · cadastrar · mobile ── */}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {/* Language selector — compact */}
          <LocationLanguageSelector compact />

          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label={t('nav.busca')}
          >
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
                  className="ml-1 flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-label="Menu da conta"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden size-3 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="normal-case tracking-normal text-foreground">{user.nome || 'Usuário'}</span>
                  <span className="text-xs font-normal normal-case tracking-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil">{t('nav.perfil')}</Link>
                </DropdownMenuItem>
                {isDirigente && (
                  <DropdownMenuItem asChild>
                    <Link href="/painel">{t('nav.painel')}</Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">{t('nav.admin')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/notificacoes">{t('nav.notificacoes')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} destructive>
                  {t('nav.sair')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden lg:inline-flex"
              >
                <Link href="/auth/login">{t('nav.entrar')}</Link>
              </Button>

              {/* CTA principal — Cadastrar Casa de Axé */}
              <Link
                href="/auth/cadastro"
                className={cn(
                  'hidden lg:inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acafrao/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--obsidiana-deep)/0.72)]',
                  'text-[hsl(var(--obsidiana-deep))] shadow-md',
                )}
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                  boxShadow: '0 3px 14px hsl(var(--copper)/0.35)',
                }}
              >
                <HousePlus className="size-3.5" aria-hidden="true" />
                Cadastrar Casa de Axé
                <span
                  className="rounded-full bg-[hsl(var(--obsidiana-deep)/0.18)] px-1.5 py-0.5 text-[10px] font-black"
                  aria-label="Gratuito"
                >
                  Grátis
                </span>
              </Link>
            </>
          )}

          {/* Hamburger mobile */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-end">
                  <LocationLanguageSelector compact />
                </div>

                {/* Mobile — CTA destaque */}
                {!user && (
                  <Link
                    href="/auth/cadastro"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[hsl(var(--obsidiana-deep))] shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <HousePlus className="size-4" aria-hidden="true" />
                      Cadastrar Casa de Axé
                    </span>
                    <span className="rounded-full bg-black/15 px-2 py-0.5 text-[10px] font-black">Grátis</span>
                  </Link>
                )}

                <nav aria-label="Menu mobile" className="flex flex-col gap-1">
                  {allMobileNav.map((item) => (
                    <Link
                      key={item.href + item.labelKey}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      <item.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                      {t(item.labelKey)}
                    </Link>
                  ))}

                  <div className="my-2 flex items-center gap-2 px-3">
                    <Network className="size-4 text-roxo-ancestral" aria-hidden="true" />
                    <span className="text-xs font-bold uppercase tracking-wider text-roxo-ancestral">{t('nav.rede')}</span>
                  </div>
                  {redeItems.map((item) => (
                    <Link
                      key={item.labelKey}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-roxo-ancestral/10"
                    >
                      <item.icon className="size-4 text-roxo-ancestral" aria-hidden="true" />
                      {t(item.labelKey)}
                    </Link>
                  ))}

                  {redeLinks.map((item) => (
                    <Link
                      key={item.labelKey}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-copper-strong transition-colors hover:bg-copper-soft/40"
                    >
                      <item.icon className="size-4 text-copper" aria-hidden="true" />
                      {t(item.labelKey)}
                    </Link>
                  ))}

                  <Separator className="my-3" />
                  {!user && (
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      {t('nav.entrar')}
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
