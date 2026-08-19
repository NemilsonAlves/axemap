import * as React from 'react';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  id?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = 'center',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        centered && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-copper/25 bg-copper-soft/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-copper-strong">
          <span
            className="size-1.5 shrink-0 rounded-full bg-copper"
            aria-hidden="true"
          />
          {eyebrow}
        </span>
      )}
      <h2
        id={id}
        className="max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-4xl lg:text-[2.75rem]"
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}