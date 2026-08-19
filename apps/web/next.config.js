/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

/**
 * API URL — used to build the CSP connect-src directive dynamically.
 * In dev this is usually http://localhost:3001; in prod https://api.axemap.com.br.
 */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Parse origin (scheme + host) from a URL string for CSP use.
 * e.g. "http://localhost:3001/api/v1" → "http://localhost:3001"
 */
function originOf(url) {
  try {
    const { origin } = new URL(url);
    return origin;
  } catch {
    return url;
  }
}

const apiOrigin = originOf(apiUrl);

/**
 * connect-src sources:
 * - 'self'                         — same-origin fetch / XHR
 * - apiOrigin                      — backend API (dynamic from env)
 * - https://axemap.com.br          — production domain
 * - https://*.axemap.com.br        — CDN / subdomains
 * - ws://localhost:* (dev only)    — Next.js HMR WebSocket
 * - http://localhost:* (dev only)  — local API during development
 */
const connectSrcSources = [
  "'self'",
  apiOrigin,
  'https://axemap.com.br',
  'https://*.axemap.com.br',
  ...(isDev
    ? [
        'ws://localhost:*',    // Next.js Fast Refresh / HMR
        'http://localhost:*',  // any local service (API, MinIO, etc.)
      ]
    : []),
];

const securityHeaders = [
  // Previne MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Impede que a página seja carregada em iframe (proteção contra clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Controla como o referer é enviado
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Força HTTPS por 1 ano (incluindo subdomínios) — omitir em dev para não quebrar HTTP local
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]),
  // Desabilita recursos não necessários
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval necessário para Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      `connect-src ${connectSrcSources.join(' ')}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.axemap.com.br' },
      { protocol: 'https', hostname: 'axemap.com.br' },
      ...(isDev
        ? [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'http', hostname: '127.0.0.1' },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        // Aplica os headers de segurança em todas as rotas
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
