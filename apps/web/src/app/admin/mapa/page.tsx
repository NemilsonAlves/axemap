'use client';

import { useEffect, useState } from 'react';
import { Loader2, Building2, Network, MapPin } from 'lucide-react';
import { adminClient, type MapaAdminData } from '@/lib/admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/components/ui/use-toast';

const num = (v: number) => v.toLocaleString('pt-BR');

export default function AdminMapaPage() {
  const { toast } = useToast();
  const [data, setData] = useState<MapaAdminData | null>(null);

  useEffect(() => {
    adminClient
      .mapa()
      .then(setData)
      .catch((e: any) => toast({ title: 'Erro', description: e.message, variant: 'danger' }));
  }, [toast]);

  if (!data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-copper" />
      </div>
    );
  }

  const maxEstado = Math.max(...data.terreiros.porEstado.map((e) => e.total), 1);
  const maxCidade = Math.max(...data.terreiros.topCidades.map((c) => c.total), 1);
  const maxGrafo = Math.max(...data.grafo.porEstado.map((e) => e.total), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Mapa</h1>
        <p className="text-sm text-muted-foreground">Distribuição geográfica real de terreiros e da rede Axé Graph</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Terreiros publicados" value={num(data.terreiros.publicados)} icon={Building2} hint="visíveis no mapa" />
        <StatCard label="Entidades sem coordenadas" value={num(data.grafo.entidadesSemCoordenadas)} icon={MapPin} hint="precisam de geolocalização" />
        <StatCard label="Estados cobertos" value={data.terreiros.porEstado.length} icon={Network} hint="unidades federativas" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Terreiros por estado</CardTitle>
            <CardDescription>{num(data.terreiros.publicados)} publicados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.terreiros.porEstado.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum terreiro registrado.</p>
            )}
            {data.terreiros.porEstado.map((e) => (
              <div key={e.estado} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-sm font-semibold">{e.estado}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-copper" style={{ width: `${(e.total / maxEstado) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-sm tabular-nums">{e.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top cidades</CardTitle>
            <CardDescription>por número de terreiros publicados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.terreiros.topCidades.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem dados de cidades.</p>
            )}
            {data.terreiros.topCidades.map((c) => (
              <div key={`${c.cidade}-${c.estado}`} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm">{c.cidade} · {c.estado}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-copper" style={{ width: `${(c.total / maxCidade) * 100}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-sm tabular-nums">{c.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rede Axé Graph por estado</CardTitle>
          <CardDescription>
            {num(data.grafo.entidadesSemCoordenadas)} entidades aguardando coordenadas geográficas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.grafo.porEstado.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma entidade no grafo.</p>
          )}
          {data.grafo.porEstado.map((e) => (
            <div key={e.estado} className="flex items-center gap-3">
              <span className="w-8 shrink-0 text-sm font-semibold">{e.estado || '—'}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-copper" style={{ width: `${(e.total / maxGrafo) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right text-sm tabular-nums">{e.total}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3">
            <Badge variant="muted">Estado vazio significa entidades sem UF informada</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
