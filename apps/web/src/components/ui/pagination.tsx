import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '@/components/ui/button';

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  pageSizeLabel?: string;
  totalItems?: number;
}

function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function getPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return range(1, total);
  const items: (number | '…')[] = [1];
  if (current > 3) items.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  items.push(...range(start, end));
  if (current < total - 2) items.push('…');
  items.push(total);
  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSizeLabel,
  totalItems,
  className,
  ...props
}: PaginationProps) {
  const items = getPageItems(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
      {...props}
    >
      {(pageSizeLabel || totalItems !== undefined) && (
        <p className="text-sm text-muted-foreground">
          {pageSizeLabel ?? `${totalItems} itens`}
        </p>
      )}
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon-sm' }),
              'disabled:opacity-40',
            )}
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
        </li>
        {items.map((item, i) =>
          item === '…' ? (
            <li key={`e${i}`} className="flex size-8 items-center justify-center">
              <MoreHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Mais páginas</span>
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange?.(item)}
                aria-current={item === currentPage ? 'page' : undefined}
                className={cn(
                  buttonVariants({
                    variant: item === currentPage ? 'soft' : 'ghost',
                    size: 'icon-sm',
                  }),
                  'font-display text-sm',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'icon-sm' }),
              'disabled:opacity-40',
            )}
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}