'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'defaultValue'> {
  /** Estado pressionado (modo controlado). */
  pressed?: boolean;
  /** Valor inicial quando não controlado. */
  defaultValue?: boolean;
  /** Callback de alteração de estado. */
  onPressedChange?: (pressed: boolean) => void;
  variant?: 'default' | 'outline' | 'soft';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
} as const;

const variantMap = {
  default: 'bg-primary text-primary-foreground shadow-sm hover:bg-copper-strong',
  outline: 'border border-input bg-card text-foreground shadow-xs hover:bg-accent',
  soft: 'bg-copper-soft text-copper-strong hover:bg-copper-soft/70',
} as const;

/**
 * Toggle — botão de estado único (pressionado/não pressionado).
 * Reutilizado para ações de filtro, favorito e seguidores.
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      pressed,
      defaultValue = false,
      onPressedChange,
      variant = 'outline',
      size = 'md',
      type = 'button',
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalPressed, setInternalPressed] = React.useState(defaultValue);
    const isPressed = pressed ?? internalPressed;

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      const next = !isPressed;
      if (pressed === undefined) setInternalPressed(next);
      onPressedChange?.(next);
      onClick?.(e);
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={isPressed}
        data-state={isPressed ? 'on' : 'off'}
        onClick={handleClick}
        className={cn(
          'inline-flex select-none items-center justify-center rounded-lg font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0',
          isPressed ? variantMap[variant] : 'bg-transparent text-foreground hover:bg-accent',
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Toggle.displayName = 'Toggle';

export { Toggle };
