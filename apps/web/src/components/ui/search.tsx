'use client';

import * as React from 'react';
import { Search as SearchIcon, ArrowRight, CornerDownLeft, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

/* ════════════════════════════════════════════════════════════════
   Search — comando global de busca (style command/spotlight).
   Atalho global: Ctrl/Cmd+K. Setas navegam, Enter abre, Esc fecha.
   ════════════════════════════════════════════════════════════════ */

export interface SearchResult {
  id: string;
  label: string;
  subtitle?: string;
  icon?: LucideIcon;
  group?: string;
  keywords?: string[];
  onSelect?: () => void;
}

export interface SearchProps {
  /** Resultados filtrados pela consulta. */
  results?: SearchResult[];
  /** Ações rápidas exibidas com a busca vazia. */
  quickActions?: SearchResult[];
  placeholder?: string;
  emptyText?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
  showCommand?: boolean;
}

/** Input clicável que abre a palette (ex.: barra do cabeçalho). */
export function SearchTrigger({
  onClick,
  placeholder = 'Buscar terreiros, eventos, cursos…',
  className,
  showCommand = true,
}: {
  onClick?: () => void;
  placeholder?: string;
  className?: string;
  showCommand?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-11 w-full items-center gap-2.5 rounded-lg border border-input bg-card px-3.5 text-sm text-muted-foreground shadow-xs transition-all duration-[var(--duration-base)] hover:border-copper/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate text-left">{placeholder}</span>
      {showCommand && (
        <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      )}
    </button>
  );
}

function SearchCommandHint() {
  return (
    <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 font-semibold">↑↓</kbd> navegar
      </span>
      <span className="inline-flex items-center gap-1">
        <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 font-semibold">
          <CornerDownLeft className="size-2.5" aria-hidden="true" />
        </kbd>{' '}
        abrir
      </span>
      <span className="ml-auto inline-flex items-center gap-1">
        <kbd className="rounded border border-border bg-accent px-1.5 py-0.5 font-semibold">esc</kbd> fechar
      </span>
    </div>
  );
}

export function Search({
  results = [],
  quickActions = [],
  placeholder = 'Buscar…',
  emptyText = 'Nenhum resultado encontrado.',
  loading = false,
  onSearch,
  showCommand,
}: SearchProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const flattened = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickActions;
    return results.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        (r.subtitle?.toLowerCase().includes(q) ?? false) ||
        (r.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false),
    );
  }, [query, results, quickActions]);

  const groups = React.useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const r of flattened) {
      const key = r.group ?? 'Resultados';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [flattened]);

  React.useEffect(() => {
    if (open) {
      setHighlighted(0);
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function move(dir: 1 | -1) {
    setHighlighted((h) => {
      const next = h + dir;
      if (next < 0) return flattened.length - 1;
      if (next >= flattened.length) return 0;
      return next;
    });
  }

  function select(result: SearchResult) {
    setOpen(false);
    setQuery('');
    result.onSelect?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-muted-foreground">
          <SearchIcon className="size-4" aria-hidden="true" />
          {placeholder}
          {showCommand && (
            <kbd className="ml-auto hidden rounded border border-border bg-accent px-1.5 py-0.5 text-[10px] font-semibold sm:block">
              ⌘K
            </kbd>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <SearchIcon className="size-4 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(0);
              onSearch?.(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                move(1);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                move(-1);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const r = flattened[highlighted];
                if (r) select(r);
              }
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-controls="search-results"
            role="combobox"
            aria-expanded="true"
            aria-activedescendant={flattened[highlighted] ? `search-${flattened[highlighted].id}` : undefined}
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setQuery('')}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div id="search-results" role="listbox" className="max-h-[22rem] overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            groups.map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-2 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {group}
                </p>
                {items.map((r) => {
                  const globalIndex = flattened.indexOf(r);
                  const { icon: Icon } = r;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="option"
                      id={`search-${r.id}`}
                      aria-selected={globalIndex === highlighted}
                      onClick={() => select(r)}
                      onMouseMove={() => setHighlighted(globalIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-[var(--duration-fast)]',
                        globalIndex === highlighted ? 'bg-accent text-accent-foreground' : 'text-foreground',
                      )}
                    >
                      {Icon && (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-copper-soft/50 text-copper-strong">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.label}</span>
                        {r.subtitle && (
                          <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>
                        )}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <SearchCommandHint />
      </DialogContent>
    </Dialog>
  );
}
