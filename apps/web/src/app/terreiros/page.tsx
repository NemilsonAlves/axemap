'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { labelTradicao } from '@/lib/tradicoes';
import { useI18n } from '@/lib/i18n/i18n-context';
import '../institucional/legal.css';

export default function TerreirosIndexPage() {
  const { t } = useI18n();
  const [terreiros, setTerreiros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ data: any[] }>('/terreiros?limit=60');
        setTerreiros(res?.data ?? []);
      } catch {
        setError('Não foi possível carregar os terreiros.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="legal-page" style={{ maxWidth: 1080 }}>
      <div className="legal-hero">
        <h1>{t('casa.titulo')}</h1>
        <p>{t('casa.descricao_index')}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
        <Link href="/busca" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Buscar Casas de Axé →</Link>
        <Link href="/mapa" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Ver no mapa →</Link>
        <Link href="/terreiros-verificados" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('casa.verificadas')} →</Link>
        <Link href="/novos-terreiros" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('casa.novo')} →</Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive" role="alert">
          {error}
        </div>
      ) : terreiros.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum terreiro encontrado ainda. Se você é dirigente, cadastre o seu!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {terreiros.map((t) => (
            <Link key={t.id} href={`/terreiro/${t.slug ?? t.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">{t.nome}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[t.cidade, t.estado].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <Badge variant="secondary">{t.tradicao ? labelTradicao(t.tradicao) : 'Tradição'}</Badge>
                  </div>
                  {t.descricaoCurta && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.descricaoCurta}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
