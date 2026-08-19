import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/painel',
          '/perfil',
          '/onboarding',
          '/notificacoes',
          '/central-evolucao',
          '/auth/login',
          '/auth/cadastro',
          '/auth/esqueci-senha',
          '/auth/recuperar-senha',
          '/grafo',
        ],
      },
    ],
    sitemap: 'https://axemap.com.br/sitemap.xml',
    host: 'https://axemap.com.br',
  };
}