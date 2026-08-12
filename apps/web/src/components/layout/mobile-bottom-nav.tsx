'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutGrid, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/translations';

const items: Array<{ href: string; labelKey: TranslationKey; icon: typeof Search }> = [
  { href: '/busca',     labelKey: 'nav.explorar', icon: Search },
  { href: '/mapa',      labelKey: 'nav.mapa',     icon: MapPin },
  { href: '/terreiros', labelKey: 'nav.casas',    icon: LayoutGrid },
  { href: '/tradicao',  labelKey: 'nav.tradicao', icon: BookOpen },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav
      aria-label="Navegação principal móvel"
      className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-border/70 bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                active ? 'text-copper-strong' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
