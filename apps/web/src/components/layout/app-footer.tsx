'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { Separator } from '@/components/ui/separator';
import { Camera, Mail } from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';

const socials = [
  { icon: Camera, label: 'Instagram', href: 'https://instagram.com/axemap' },
  { icon: Mail, label: 'Contato', href: 'mailto:contato@axemap.com.br' },
];

export function AppFooter() {
  const { t } = useI18n();

  const footerColumns = [
    {
      titleKey: 'footer.plataforma' as const,
      links: [
        { label: 'Buscar Casas de Axé', href: '/busca' },
        { label: 'Mapa', href: '/mapa' },
        { label: 'Casas Verificadas', href: '/terreiros-verificados' },
        { label: 'Novas Casas', href: '/novos-terreiros' },
        { label: 'Eventos', href: '/eventos' },
        { label: 'Planos e Assinatura', href: '/planos' },
      ],
    },
    {
      titleKey: 'footer.comunidade' as const,
      links: [
        { label: 'Cursos', href: '/cursos' },
        { label: 'Ações Sociais', href: '/acoes-sociais' },
        { label: 'Central de Evolução', href: '/central-evolucao' },
        { label: 'Tradição', href: '/tradicao' },
        { label: 'Cadastrar Casa de Axé', href: '/onboarding' },
      ],
    },
    {
      titleKey: 'footer.institucional' as const,
      links: [
        { label: 'Sobre o AxéMap', href: '/sobre' },
        { label: 'Governança', href: '/governanca' },
        { label: 'Transparência', href: '/transparencia' },
        { label: 'Privacidade (LGPD)', href: '/privacidade' },
        { label: 'Termos de Uso', href: '/termos' },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/70 bg-surface-2/60">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex max-w-sm flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Axé<span className="text-copper-strong">Map</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A tecnologia a serviço da tradição. Um mapa vivo das tradições
              africanas e de suas diásporas — da África para o mundo,
              conectando comunidades, territórios, conhecimento e memória.
            </p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.titleKey} aria-label={t(col.titleKey)} className="flex flex-col gap-3.5">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                {t(col.titleKey)}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-copper-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
                    >
                      {link.label}
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

        <div className="mt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t('footer.feito_com')}
          </p>
          <p className="text-xs text-muted-foreground">
            Dados protegidos conforme a LGPD ·{' '}
            <Link href="/privacidade" className="underline underline-offset-2 hover:text-copper-strong">
              Política de Privacidade
            </Link>{' '}
            ·{' '}
            <Link href="/termos" className="underline underline-offset-2 hover:text-copper-strong">
              Termos
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}