'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/* ════════════════════════════════════════════════════════════════
   Mega Menu — navegação expansiva por colunas (desktop).
   Padrão de IA: trigger → painel amplo com grupos e call-to-action.
   ════════════════════════════════════════════════════════════════ */

export interface MegaMenuItem {
  label: string;
  description?: string;
  icon?: LucideIcon;
  href?: string;
  badge?: string;
  onClick?: () => void;
}

export interface MegaMenuColumn {
  title?: string;
  items: MegaMenuItem[];
}

export interface MegaMenuProps {
  trigger: React.ReactNode;
  columns: MegaMenuColumn[];
  /** Bloco de destaque (imagem, CTA) exibido à direita do painel. */
  aside?: React.ReactNode;
  /** Largura máxima do painel. */
  panelWidth?: string;
  align?: 'start' | 'center' | 'end';
}

export function MegaMenu({ trigger, columns, aside, panelWidth = 'w-[46rem]', align = 'start' }: MegaMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span>
          {React.isValidElement(trigger)
            ? React.cloneElement(trigger as React.ReactElement<{ 'aria-expanded'?: boolean }>, {
                'aria-expanded': open,
              })
            : trigger}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className={cn('w-screen max-w-full p-0', panelWidth)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-6 sm:grid-cols-2">
            {columns.map((column, ci) => (
              <div key={ci} className="flex flex-col gap-1.5">
                {column.title && (
                  <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {column.title}
                  </p>
                )}
                {column.items.map((item, ii) => {
                  const { icon: Icon } = item;
                  const row = (
                    <span
                      className={cn(
                        'flex items-start gap-3 rounded-xl p-2.5 transition-colors duration-[var(--duration-fast)] hover:bg-accent',
                        item.description && 'group',
                      )}
                    >
                      {Icon && (
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-copper-soft/60 text-copper-strong">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          {item.label}
                          {item.badge && (
                            <span className="rounded-full bg-copper-soft px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-copper-strong">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        {item.description && (
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground group-hover:text-foreground/80">
                            {item.description}
                          </span>
                        )}
                      </span>
                    </span>
                  );
                  const cls = 'rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/40';
                  return item.href ? (
                    <Link key={ii} href={item.href} onClick={item.onClick} className={cls}>
                      {row}
                    </Link>
                  ) : (
                    <button key={ii} type="button" onClick={item.onClick} className={cn(cls, 'text-left')}>
                      {row}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {aside && <div className="hidden w-56 flex-col justify-between lg:flex">{aside}</div>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Trigger pronto para o cabeçalho ─────────────────────────── */

export function MegaMenuTrigger({ label, className }: { label: string; className?: string }) {
  return (
    <Button
      variant="ghost"
      size="md"
      className={cn('font-medium text-foreground/80 data-[state=open]:text-copper-strong', className)}
    >
      {label}
      <ChevronDown className="size-3.5 text-muted-foreground transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180" aria-hidden="true" />
    </Button>
  );
}

/* ── Aside padrão para call-to-action ────────────────────────── */

export function MegaMenuCTA({
  title,
  description,
  actionLabel,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-2xl bg-brand-gradient p-5 text-white shadow-lg shadow-copper/20">
      {Icon && (
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-display text-base font-bold leading-snug">{title}</p>
        <p className="text-xs leading-relaxed text-white/80">{description}</p>
      </div>
      <Link
        href={href}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-white/95 px-4 text-sm font-semibold text-copper-strong transition-all duration-[var(--duration-base)] hover:bg-white"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
