import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário de classe do Design System.
 * Une classnames e resolve conflitos de Tailwind de forma determinística.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}