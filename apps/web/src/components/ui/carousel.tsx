'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  itemsPerView?: number;
  gap?: number;
  showControls?: boolean;
  children: React.ReactNode;
}

export function Carousel({
  itemsPerView = 3,
  gap = 16,
  showControls = true,
  children,
  className,
  ...props
}: CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  const updateArrows = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    updateArrows();
    const el = viewportRef.current;
    el?.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el?.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  function scrollBy(dir: 1 | -1) {
    const el = viewportRef.current;
    if (!el) return;
    const card = el.querySelector('[data-slide]') as HTMLElement | null;
    const step = card ? card.offsetWidth + gap : el.clientWidth;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    el.scrollBy({
      left: dir * step,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  return (
    <div className={cn('group relative', className)} {...props}>
      {showControls && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            aria-label="Anterior"
            className="absolute -left-3 top-1/2 z-[var(--z-raised)] hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-all duration-[var(--duration-base)] hover:border-copper/40 hover:text-copper-strong disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:flex"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            aria-label="Próximo"
            className="absolute -right-3 top-1/2 z-[var(--z-raised)] hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-all duration-[var(--duration-base)] hover:border-copper/40 hover:text-copper-strong disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:flex"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
      <div
        ref={viewportRef}
        data-carousel
        role="region"
        aria-roledescription="carrossel"
        aria-label="Carrossel de conteúdo"
        className="flex snap-x snap-mandatory overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ gap }}
      >
        {React.Children.map(children, (child) => (
          <div data-slide className="min-w-0 shrink-0" style={{ width: `calc((100% - ${gap * (itemsPerView - 1)}px) / ${itemsPerView})` }}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}