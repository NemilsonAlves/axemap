'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';

export const WEEKDAYS_FULL = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSelect'> {
  /** Data selecionada (modo controlado ou não). */
  value?: Date;
  /** Callback disparado ao selecionar um dia. */
  onSelect?: (date: Date) => void;
  /** Limite inferior selecionável. */
  min?: Date;
  /** Limite superior selecionável. */
  max?: Date;
  /** Destaque visual para datas de interesse (ex.: dias com evento). */
  highlightedDates?: Date[];
  /** Dia de início da semana: 0 = domingo, 1 = segunda. */
  weekStartsOn?: 0 | 1;
}

const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calendar — seletor de data em grade mensal.
 * Sistema 8pt, raios suaves, cobre como cor de seleção.
 * Acessível por teclado: setas, Enter, Home/End, PageUp/PageDown.
 */
export function Calendar({
  value,
  onSelect,
  min,
  max,
  highlightedDates,
  weekStartsOn = 0,
  className,
  ...props
}: CalendarProps) {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const [viewYear, setViewYear] = React.useState(() => (value ?? today).getFullYear());
  const [viewMonth, setViewMonth] = React.useState(() => (value ?? today).getMonth());
  const [hovered, setHovered] = React.useState<Date | null>(null);

  const selected = value ? startOfDay(value) : null;

  React.useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
    }
  }, [value]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const offset = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  const cells = React.useMemo(() => {
    const list: Date[] = [];
    for (let i = 0; i < totalCells; i++) {
      const day = i - offset + 1;
      list.push(
        day < 1
          ? new Date(viewYear, viewMonth - 1, daysInPrevMonth + day)
          : day > daysInMonth
            ? new Date(viewYear, viewMonth + 1, day - daysInMonth)
            : new Date(viewYear, viewMonth, day),
      );
    }
    return list;
  }, [viewYear, viewMonth, offset, daysInMonth, daysInPrevMonth, totalCells]);

  const isInRange = (date: Date) => {
    const d = startOfDay(date);
    if (min && d < startOfDay(min)) return false;
    if (max && d > startOfDay(max)) return false;
    return true;
  };

  function shiftView(delta: number) {
    const base = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
  }

  function select(date: Date) {
    if (!isInRange(date)) return;
    onSelect?.(date);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!selected) return;
    const current = selected;
    let next: Date | null = null;
    switch (e.key) {
      case 'ArrowLeft':
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1);
        break;
      case 'ArrowRight':
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
        break;
      case 'ArrowUp':
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7);
        break;
      case 'ArrowDown':
        next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7);
        break;
      case 'Home':
        next = new Date(current.getFullYear(), current.getMonth(), 1);
        break;
      case 'End':
        next = new Date(current.getFullYear(), current.getMonth(), daysInMonth);
        break;
      case 'PageUp':
        shiftView(-1);
        return;
      case 'PageDown':
        shiftView(1);
        return;
      case 'Enter':
      case ' ':
        onSelect?.(current);
        return;
      default:
        return;
    }
    if (next && isInRange(next)) {
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
      onSelect?.(next);
    }
    e.preventDefault();
  }

  const dayLabels = Array.from({ length: 7 }, (_, i) => WEEKDAYS_SHORT[(i + weekStartsOn) % 7]);

  return (
    <div className={cn('w-full max-w-[19rem] p-2', className)} role="application" {...props}>
      {/* Cabeçalho do mês */}
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Mês anterior"
          onClick={() => shiftView(-1)}
          className="text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-display text-sm font-semibold text-foreground">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Próximo mês"
          onClick={() => shiftView(1)}
          className="text-muted-foreground"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="mb-1 grid grid-cols-7 gap-1" aria-hidden="true">
        {dayLabels.map((label, i) => (
          <div
            key={i}
            className="flex h-7 items-center justify-center text-xs font-semibold text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div
        role="grid"
        aria-label="Dias do mês"
        aria-readonly="false"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="grid grid-cols-7 gap-1 outline-none"
      >
        {cells.map((date, i) => {
          const inCurrentMonth = date.getMonth() === viewMonth;
          const isSelected = selected !== null && sameDay(date, selected);
          const isToday = sameDay(date, today);
          const isHighlighted = highlightedDates?.some((h) => sameDay(h, date)) ?? false;
          const isOut = !isInRange(date);
          const isHovered = hovered !== null && sameDay(hovered, date);

          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              aria-label={`${date.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}${inCurrentMonth ? '' : ', fora do mês atual'}`}
              aria-current={isToday ? 'date' : undefined}
              aria-selected={isSelected}
              disabled={isOut}
              onClick={() => select(date)}
              onMouseEnter={() => setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-30',
                inCurrentMonth ? 'text-foreground' : 'text-muted-foreground/60',
                isSelected
                  ? 'bg-copper text-primary-foreground shadow-sm shadow-copper/30'
                  : isToday
                    ? 'border border-copper/50 text-copper-strong'
                    : isHovered
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent',
                isHighlighted && !isSelected && 'ring-1 ring-copper/50',
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
