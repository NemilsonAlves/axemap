'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { adminClient, type AuditLogItem } from '@/lib/admin-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

const num = (v: number) => v.toLocaleString('pt-BR');

export default function AdminAuditoriaPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminClient.auditLogs({ limit, offset });
      setRows(res.data);
      setTotal(res.total);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [offset, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const paginas = Math.max(1, Math.ceil(total / limit));
  const paginaAtual = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          <ShieldCheck className="mr-1 inline size-4 text-copper" />
          {num(total)} ações administrativas registradas · trilha imutável de todas as alterações sensíveis
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ação</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Quando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-copper" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhuma ação registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="copper" className="font-mono">{a.acao}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{a.usuario?.nome ?? 'Sistema'}</p>
                      <p className="text-xs text-muted-foreground">{a.usuario?.email ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{a.entidadeTipo}</p>
                      <p className="font-mono text-xs text-muted-foreground">{a.entidadeId.slice(0, 12)}…</p>
                    </TableCell>
                    <TableCell>
                      {a.depois && (
                        <pre className="max-w-64 truncate text-xs text-muted-foreground">
                          {JSON.stringify(a.depois)}
                        </pre>
                      )}
                      {!a.depois && <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Página {paginaAtual} de {paginas}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={paginaAtual >= paginas} onClick={() => setOffset(offset + limit)}>
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
