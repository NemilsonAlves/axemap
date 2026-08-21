'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

/**
 * AxéMap — CTA Hierarchy System
 *
 * Conversion-focused call-to-action components with clear visual hierarchy:
 * - Primary: "Cadastrar Minha Casa" (main conversion)
 * - Secondary: "Quero Fazer Parte" (engagement)
 * - Ghost: "Saiba Mais" (exploration)
 * - Outline: "Ver no Mapa" (navigation)
 */

type CTAVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'map-action';
type CTASize = 'sm' | 'md' | 'lg';

interface CTAButtonProps {
  variant?: CTAVariant;
  size?: CTASize;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const variantStyles: Record<CTAVariant, string> = {
  primary:
    'bg-cta-primary hover:bg-cta-primary-hover text-cta-primary-fg shadow-copper hover:shadow-lg transition-all duration-200',
  secondary:
    'bg-cta-secondary hover:bg-cta-secondary-hover text-cta-secondary-fg border border-border/50 hover:border-border transition-all duration-200',
  ghost:
    'bg-cta-ghost hover:bg-cta-ghost-hover text-cta-ghost-fg transition-all duration-200',
  outline:
    'border-2 border-cta-outline text-cta-outline-fg hover:bg-cta-outline-hover hover:text-white transition-all duration-200',
  'map-action':
    'bg-cta-map-action hover:bg-cta-map-action-hover text-white shadow-lg hover:shadow-xl transition-all duration-200',
};

const sizeStyles: Record<CTASize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export function CTAButton({
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  children,
  icon,
  className,
  disabled,
}: CTAButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-semibold rounded-lg whitespace-nowrap',
    variantStyles[variant],
    sizeStyles[size],
    disabled && 'opacity-50 pointer-events-none',
    className,
  );

  const content = (
    <>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <Button onClick={onClick} className={classes} disabled={disabled}>
      {content}
    </Button>
  );
}

interface MapCTAProps {
  className?: string;
}

/**
 * Floating CTA on the map — "Cadastrar Minha Casa"
 */
export function MapPrimaryCTA({ className }: MapCTAProps) {
  return (
    <div
      className={cn(
        'absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]',
        'bg-white rounded-2xl shadow-xl border border-border/50 p-4',
        'flex flex-col items-center gap-3 text-center',
        'max-w-xs w-[calc(100%-2rem)]',
        'animate-in fade-in slide-in-from-bottom-4 duration-500',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path d="M12 3l9 8v9a1 1 0 01-1 1h-5v-6H8v6H4a1 1 0 01-1-1v-9l9-8z" fill="currentColor"/>
        </svg>
      </div>
      <div>
        <h3 className="font-bold text-foreground text-sm">Cadastrar Minha Casa</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fortaleça a rede de terreiros do AxéMap
        </p>
      </div>
      <CTAButton variant="primary" size="md" href="/cadastrar" className="w-full">
        Cadastrar Agora
      </CTAButton>
      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        Já tenho conta
      </button>
    </div>
  );
}

interface JoinCTAProps {
  className?: string;
}

/**
 * "Quero Fazer Parte" section — secondary conversion
 */
export function JoinSection({ className }: JoinCTAProps) {
  return (
    <section
      className={cn(
        'py-16 px-4 bg-gradient-to-b from-background to-secondary/30',
        className,
      )}
    >
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
          Faça Parte da Rede
        </div>

        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          Junte-se a{' '}
          <span className="text-primary">centenas de terreiros</span>{' '}
          em todo o Brasil
        </h2>

        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Cadastre seu terreiro, conecte-se com a comunidade e ajude a
          fortalecer as tradições de matriz africana.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <CTAButton variant="primary" size="lg" href="/cadastrar">
            Cadastrar Meu Terreiro
          </CTAButton>
          <CTAButton variant="secondary" size="lg" href="/sobre">
            Saiba Mais
          </CTAButton>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Gratuito
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Verificação inclusa
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sem burocracia
          </div>
        </div>
      </div>
    </section>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

/**
 * Contextual empty state with CTA
 */
export function MapEmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-empty-icon">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <h3 className="font-semibold text-foreground text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-empty-text max-w-sm overflow-wrap-break-word">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <CTAButton variant="primary" size="md" href={action.href} onClick={action.onClick}>
            {action.label}
          </CTAButton>
        </div>
      )}
    </div>
  );
}
