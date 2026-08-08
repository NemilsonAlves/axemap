import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
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
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-copper/25 bg-copper-soft/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-copper-strong">
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