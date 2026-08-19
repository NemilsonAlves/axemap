/**
 * AxéMap — Next.js Edge Middleware
 *
 * Provides server-side route protection as a first layer of defense.
 * The client-side AuthProvider is the primary auth source — this
 * middleware adds a fast edge-layer check based on the session cookie
 * set by AuthProvider (axemap_auth=1) without re-verifying JWT.
 *
 * Important:
 * - JWT verification requires the secret, which must NOT be read in
 *   Edge middleware for security reasons. The cookie presence check
 *   here protects against accidental direct-URL access; the API guards
 *   remain the authoritative security boundary.
 * - Admin routes additionally require the role cookie (axemap_role)
 *   to be set to ADMIN/SUPER_ADMIN/MODERATOR on the client side.
 *   Without the role, the middleware redirects to the home page.
 */

import { NextResponse, type NextRequest } from 'next/server';

/** Routes that require any authenticated session */
const AUTH_ROUTES = [
  '/painel',
  '/perfil',
  '/notificacoes',
  '/meus-dados',
];

/** Routes that require admin/moderator role */
const ADMIN_ROUTES = [
  '/admin',
];

/** Admin role values stored in the role cookie */
const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN', 'MODERATOR']);

/** Paths that should never be intercepted (static, API proxy routes, etc.) */
function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/og-') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/audio/') ||
    pathname.startsWith('/images/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) return NextResponse.next();

  const hasSession = request.cookies.get('axemap_auth')?.value === '1';
  const roleValue  = request.cookies.get('axemap_role')?.value ?? '';

  // ── Admin routes ──────────────────────────────────────────────────────────
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminRoute) {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!ADMIN_ROLES.has(roleValue)) {
      // Authenticated but not admin — redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // ── Authenticated routes ──────────────────────────────────────────────────
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  if (isAuthRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes except static assets and API routes.
   * The regex is intentionally broad — the isPublicAsset() guard
   * handles the per-path exclusions at runtime.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
