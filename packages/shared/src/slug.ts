/**
 * AxéMap — Centralized slug generation.
 *
 * Single source of truth for all slug generation across the codebase.
 * Produces URL-safe, lowercase slugs with diacritics removed.
 *
 * Rules:
 * 1. trim
 * 2. lowercase
 * 3. NFD normalize
 * 4. remove diacritics
 * 5. replace invalid chars with hyphens
 * 6. collapse multiple hyphens
 * 7. trim hyphens from ends
 * 8. never return empty string (fallback: 'item')
 */
export function generateSlug(value: string, fallback = 'item'): string {
  if (!value || typeof value !== 'string') return fallback;

  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || fallback;
}
