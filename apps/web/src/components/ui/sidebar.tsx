'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronsUpDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/* ════════════════════════════════════════════════════════════════
   Sidebar — navegação lateral com grupos, colapso e modo mobile.
   ════════════════════════════════════════════════════════════════ */

export interface SidebarItem {
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  badge?: string | number;
  disabled?: boolean;
  onClick?: () => void;
}

export interface SidebarGroup {
  label?: string;
  items: SidebarItem[];
}

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  groups: SidebarGroup[];
  /** Usuário/footer exibido ao fim da lista. */
  footer?: React.ReactNode;
  collapsed?: boolean;
  /** Rótulo para a área de navegação. */
  ariaLabel?: string;
}

function SidebarItemRow({ item, collapsed }: { item: SidebarItem; collapsed?: boolean }) {
  const { icon: Icon } = item;
  const content = (
    <>
      {Icon && (
        <Icon
          className={cn('size-4 shrink-0 transition-colors', item.active ? 'text-copper' : 'text-muted-foreground group-hover:text-foreground')}
          aria-hidden="true"
        />
      )}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">{item.label}</span>
          {item.badge !== undefined && (
            <Badge
              variant={item.active ? 'copper' : 'muted'}
              className="h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]"
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </>
  );

  const classes = cn(
    'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-45',
    item.active
      ? 'bg-copper-soft text-copper-strong font-semibold shadow-xs'
      : 'text-foreground/80 hover:bg-accent hover:text-foreground',
    collapsed && 'justify-center px-0',
  );

  if (item.href && !item.disabled) {
    return (
      <Link
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        className={classes}
        onClick={item.onClick}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-current={item.active ? 'page' : undefined}
      disabled={item.disabled}
      onClick={item.onClick}
      className={classes}
    >
      {content}
    </button>
  );
}

export function Sidebar({ groups, footer, collapsed, ariaLabel = 'Navegação principal', className, ...props }: SidebarProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex h-full flex-col gap-1 overflow-y-auto p-3', className)}
      {...props}
    >
      {groups.map((group, gi) => (
        <div key={gi} className="mb-1 flex flex-col gap-0.5">
          {group.label && !collapsed && (
            <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {group.label}
            </p>
          )}
          {group.items.map((item, ii) =>
            collapsed ? (
              <Tooltip key={ii}>
                <TooltipTrigger asChild>
                  <span className="flex justify-center">
                    <SidebarItemRow item={item} collapsed />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <SidebarItemRow key={ii} item={item} />
            ),
          )}
        </div>
      ))}
      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </nav>
  );
}

/* ── Sidebar Mobile (Sheet) ──────────────────────────────────── */

interface MobileSidebarProps extends SidebarProps {
  children: React.ReactNode;
}

export function MobileSidebar({ children, ...props }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-[17rem] p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <Sidebar {...props} />
      </SheetContent>
    </Sheet>
  );
}

/* ── Sidebar Switcher (ex.: troca de terreiros/painéis) ──────── */

export function SidebarSwitcher({ label, icon: Icon, children }: { label: string; icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="mb-2 border-b border-border px-1 pb-3">
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        )}
        <span className="inline-flex h-9 w-full items-center justify-between rounded-lg bg-accent/60 px-3 text-sm font-medium">
          {label}
        </span>
        <ChevronsUpDown className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
