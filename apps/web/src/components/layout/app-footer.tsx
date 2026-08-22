'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { Separator } from '@/components/ui/separator';
import { Camera, Mail } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/translations';
import { CookiePreferencesButton } from '@/components/cookies/cookie-preferences-button';

const socials = [
  { icon: Camera, label: 'Instagram', href: 'https://instagram.com/axemap' },
  { icon: Mail, label: 'Contato', href: 'mailto:contato@axemap.com.br' },
];

type FooterLink = { href: string; label?: string; labelKey?: TranslationKey };
type FooterColumn = { title: string; links: FooterLink[] };

const footerColumns: FooterColumn[] = [
  {
    title: 'Explorar',
    links: [
      { labelKey: 'busca.titulo', href: '/busca' },
      { labelKey: 'nav.mapa', href: '/mapa' },
      { labelKey: 'nav.casas', href: '/terreiros' },
      { labelKey: 'nav.tradicao', href: '/tradicao' },
      { labelKey: 'nav.eventos', href: '/eventos' },
      { labelKey: 'nav.cursos', href: '/cursos' },
    ],
  },
  {
    title: 'Rede',
    links: [
      { labelKey: 'nav.rede', href: '/rede' },
      { labelKey: 'nav.federacoes', href: '/federacoes' },
      { labelKey: 'nav.organizacoes', href: '/organizacoes' },
      { labelKey: 'nav.comunidades', href: '/terreiros' },
      { labelKey: 'nav.tv_axemap', href: '/tv' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { labelKey: 'sobre', href: '/sobre' },
      { labelKey: 'governanca', href: '/governanca' },
      { labelKey: 'transparencia', href: '/transparencia' },
      { labelKey: 'imprensa', href: '/imprensa' },
    ],
  },
  {
    title: 'Ajuda',
    links: [
      { labelKey: 'nav.apoie', href: '/apoie' },
      { labelKey: 'protecao', href: '/protecao' },
      { labelKey: 'privacidade', href: '/privacidade' },
      { label: 'Contato', href: 'mailto:contato@axemap.com.br' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { labelKey: 'termos', href: '/termos' },
      { labelKey: 'cookies.politica', href: '/cookies' },
      { labelKey: 'meus.dados', href: '/meus-dados' },
    ],
  },
];

export function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/70 bg-surface-2/60">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr]">
          {/* ── Marca AxéMap ── */}
          <div className="flex max-w-sm flex-col gap-4 sm:col-span-2 lg:col-span-1 lg:max-w-xs">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-8 rounded-xl" />
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Axé<span className="text-copper-strong">Map</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A tecnologia a serviço da tradição. Um mapa vivo das tradições
              africanas e de suas diásporas — da África para o mundo,
              conectando comunidades, territórios, conhecimento e memória.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
                  aria-label={s.label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-copper/50 hover:text-copper-strong"
                >
                  <s.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Colunas de navegação ── */}
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3.5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded text-sm text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-copper-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      {link.labelKey ? t(link.labelKey) : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AxéMap — {t('footer.copyright')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span>Dados protegidos conforme a LGPD</span>
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-copper-strong">
              Política de Privacidade
            </Link>
            <Link href="/cookies" className="underline underline-offset-2 hover:text-copper-strong">
              Política de Cookies
            </Link>
            <Link href="/termos" className="underline underline-offset-2 hover:text-copper-strong">
              Termos
            </Link>
            <CookiePreferencesButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
