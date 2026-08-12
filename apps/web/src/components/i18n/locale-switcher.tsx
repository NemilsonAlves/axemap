'use client';

import * as React from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const { locale, setLocale, locales } = useI18n();
  const current = locales.find((l) => l.id === locale) ?? locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Selecionar idioma"
          title={current.label}
        >
          <Globe className="size-4" aria-hidden="true" />
          <span className="sr-only">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.id}
            onClick={() => setLocale(l.id)}
            className={l.id === locale ? 'font-semibold text-copper-strong' : ''}
          >
            <span className="mr-2 text-base" aria-hidden="true">{l.flag}</span>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
