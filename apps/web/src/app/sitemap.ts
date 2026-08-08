import { MetadataRoute } from 'next';
import type { DadosSitemap } from '@/lib/seo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API_URL}/landing/sitemap`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data: DadosSitemap = await res.json();

      for (const uf of data.estados) {
        entries.push({
          url: `https://axemap.com.br/estado/${uf.toLowerCase()}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }

      for (const cidade of data.cidades) {
        entries.push({
          url: `https://axemap.com.br/cidade/${cidade.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }

      for (const tradicao of data.tradicoes) {
        entries.push({
          url: `https://axemap.com.br/tradicao/${encodeURIComponent(tradicao)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }

      for (const terreiro of data.terreiros) {
        entries.push({
          url: `https://axemap.com.br/terreiro/${terreiro.slug}`,
          lastModified: new Date(terreiro.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }
  } catch {
    // Continue with static entries even if API fails
  }

  // Static pages (always included, added after dynamic so priority order is maintained)
  entries.unshift(
    { url: 'https://axemap.com.br', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://axemap.com.br/eventos', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://axemap.com.br/cursos', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://axemap.com.br/acoes-sociais', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://axemap.com.br/terreiros-verificados', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://axemap.com.br/terreiros/top', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://axemap.com.br/novos-terreiros', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  );

  return entries;
}
