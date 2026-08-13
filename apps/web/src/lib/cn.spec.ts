import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('une classes simples', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filtra valores falsos', () => {
    expect(cn('a', undefined, null, false, 'b')).toBe('a b');
  });

  it('resolver conflitos de Tailwind (twMerge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
