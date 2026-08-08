'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Selecione…',
  emptyText = 'Nenhum resultado encontrado.',
  searchPlaceholder = 'Buscar…',
  className,
  disabled,
  loading,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(value);
  const [highlighted, setHighlighted] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  React.useEffect(() => {
    setSelected(value);
  }, [value]);

  React.useEffect(() => {
    if (open) {
      setHighlighted(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const current = options.find((o) => o.value === selected || o.value === value);

  function moveHighlight(dir: 1 | -1) {
    setHighlighted((h) => {
      const next = Math.min(filtered.length - 1, Math.max(0, h + dir));
      return next;
    });
  }

  function select(option: ComboboxOption) {
    setSelected(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    setQuery('');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="combobox-options"
          aria-activedescendant={open ? `combobox-option-${filtered[highlighted]?.value}` : undefined}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
            if (e.key === 'Enter' && open && filtered[highlighted]) {
              e.preventDefault();
              select(filtered[highlighted]);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
          className={cn('h-11 w-full justify-between font-normal', !current && 'text-muted-foreground', className)}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {current?.icon}
            {current?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" sideOffset={6}>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveHighlight(1);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveHighlight(-1);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const option = filtered[highlighted];
                if (option) select(option);
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-controls="combobox-options"
            aria-activedescendant={filtered[highlighted] ? `combobox-option-${filtered[highlighted].value}` : undefined}
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul id="combobox-options" role="listbox" aria-label="Opções" className="max-h-72 overflow-y-auto p-1.5">
          {loading ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              Carregando…
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            filtered.map((option, i) => (
              <li
                key={option.value}
                id={`combobox-option-${option.value}`}
                role="option"
                aria-selected={option.value === selected || i === highlighted}
                onMouseMove={() => setHighlighted(i)}
                onClick={() => select(option)}
                className={cn(
                  'flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors duration-[var(--duration-fast)]',
                  highlighted === i ? 'bg-accent text-accent-foreground' : 'text-foreground',
                  option.value === selected && 'text-copper-strong',
                )}
              >
                {option.icon}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{option.label}</span>
                  {option.description && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
                {option.value === selected && <Check className="size-4 shrink-0" strokeWidth={3} />}
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}