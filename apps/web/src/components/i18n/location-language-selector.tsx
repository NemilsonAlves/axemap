'use client';

import * as React from 'react';
import { useGeo } from '@/lib/i18n/geo-context';
import { Flag } from './flag';
import { COUNTRIES, countryName, WORLD_CODE } from '@/lib/geo/countries';
import { ChevronDown, MapPin, Languages, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/cn';

/**
 * LocationLanguageSelector — seletor premium de país + idioma.
 *
 * PAÍS e IDIOMA são independentes: escolher o país NÃO muda o idioma
 * automaticamente quando há preferência manual persistida.
 *
 * Desktop: pill discreta no navbar. Mobile: resumido `[🇧🇷 PT]`.
 */
export function LocationLanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, country, setCountry, countryManual, t } = useGeo();
  const [open, setOpen] = React.useState(false);

  const flagLabel = country.flagLabel;
  const countryLabel = countryName(country, locale);

  const languageLabel = React.useMemo(() => {
    return (
      {
        'pt-BR': 'Português',
        'pt-PT': 'Português',
        en: 'English',
        es: 'Español',
        fr: 'Français',
        yo: 'Yorùbá',
      } as Record<string, string>
    )[locale] ?? locale;
  }, [locale]);

  /** Código curto do idioma para exibição compacta: PT, EN, ES… */
  const localeCode = React.useMemo(() => {
    const map: Record<string, string> = {
      'pt-BR': 'PT',
      'pt-PT': 'PT',
      en: 'EN',
      es: 'ES',
      fr: 'FR',
      yo: 'YO',
    };
    return map[locale] ?? locale.slice(0, 2).toUpperCase();
  }, [locale]);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-copper/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          compact && 'px-2.5',
        )}
        aria-haspopup="dialog"
        aria-label={`${t('loc.selecionar_pais')} · ${countryLabel}`}
        title={`${t('loc.localizacao')}: ${countryLabel} · ${t('loc.idioma')}: ${languageLabel}`}
      >
        <Flag code={country.code} label={flagLabel} className="size-4" />
        {!compact && (
          <>
            <span className="hidden md:inline">{countryLabel}</span>
            <span className="hidden text-muted-foreground/70 md:inline">·</span>
            <span className="hidden text-muted-foreground md:inline">{languageLabel}</span>
          </>
        )}
        {compact && <span className="text-muted-foreground">{localeCode}</span>}
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl gap-0 p-0 sm:max-w-3xl" aria-describedby="loc-desc">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              {t('loc.localizacao')}
            </DialogTitle>
            <DialogDescription id="loc-desc" className="text-sm text-muted-foreground">
              {t('loc.voce_esta_em')} <strong className="text-copper-strong">{countryLabel}</strong>
              {countryManual ? '' : ` · ${t('loc.detectado')}`}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* País */}
            <section aria-labelledby="loc-pais-titulo">
              <h3 id="loc-pais-titulo" className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3.5 text-copper" aria-hidden="true" />
                {t('loc.selecionar_pais')}
              </h3>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setCountry(WORLD_CODE)}
                  aria-pressed={country.code === WORLD_CODE}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                    country.code === WORLD_CODE
                      ? 'border-copper/50 bg-copper-soft/40 text-copper-strong'
                      : 'border-border bg-card text-foreground hover:border-copper/40',
                  )}
                >
                  <Flag code={WORLD_CODE} label={t('loc.mundo')} className="size-5" />
                  {t('loc.mundo')}
                </button>
                {COUNTRIES.map((c) => {
                  const active = country.code === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCountry(c.code)}
                      aria-pressed={active}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                        active
                          ? 'border-copper/50 bg-copper-soft/40 text-copper-strong'
                          : 'border-border bg-card text-foreground hover:border-copper/40',
                      )}
                    >
                      <Flag code={c.code} label={c.flagLabel} className="size-5" />
                      {countryName(c, locale)}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Idioma */}
            <section aria-labelledby="loc-idioma-titulo" className="mt-8">
              <h3 id="loc-idioma-titulo" className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Languages className="size-3.5 text-copper" aria-hidden="true" />
                {t('loc.selecionar_idioma')}
              </h3>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { id: 'pt-BR' as const, label: 'Português (Brasil)' },
                  { id: 'pt-PT' as const, label: 'Português (Portugal)' },
                  { id: 'en' as const, label: 'English' },
                  { id: 'es' as const, label: 'Español' },
                  { id: 'fr' as const, label: 'Français' },
                  { id: 'yo' as const, label: 'Yorùbá' },
                ].map((l) => {
                  const active = locale === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLocale(l.id)}
                      aria-pressed={active}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                        active
                          ? 'border-copper/50 bg-copper-soft/40 text-copper-strong'
                          : 'border-border bg-card text-foreground hover:border-copper/40',
                      )}
                    >
                      <span className="flex size-5 items-center justify-center rounded-full bg-copper-soft/50 text-[10px] font-bold text-copper-strong">
                        {l.label.charAt(0).toUpperCase()}
                      </span>
                      {l.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {t('loc.explore_mundo')} — {t('loc.detectado')}.
              </p>
            </section>
          </div>

          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <span className="text-xs text-muted-foreground">
              {t('loc.voce_esta_em')} <strong className="text-copper-strong">{countryLabel}</strong> · {languageLabel}
            </span>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              <X className="size-4" aria-hidden="true" />
              {t('geral.voltar')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}