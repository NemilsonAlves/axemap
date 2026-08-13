'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  ShieldAlert,
  FileText,
  Stethoscope,
  MessagesSquare,
  HeartHandshake,
  Inbox,
} from 'lucide-react';
import { adminClient, type JobsAdminData } from '@/lib/admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const num = (v: number) => v.toLocaleString('pt-BR');

const ITENS = [
  { chave: 'denunciasAbertas', label: 'Denúncias abertas', icon: ShieldAlert },
  { chave: 'reivindicacoesPendentes', label: 'Reivindicações pendentes', icon: FileText },
  { chave: 'documentosPendentes', label: 'Documentos de verificação', icon: Stethoscope },
  { chave: 'mediacoesAtivas', label: 'Mediações ativas', icon: MessagesSquare },
  { chave: 'campanhasEmAnalise', label: 'Campanhas em análise', icon: HeartHandshake },
] as const;

export default function AdminJobsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<JobsAdminData | null>(null);

  useEffect(() => {
    adminClient
      .jobs()
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

  const fila = data.filaAguardandoAcao;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Jobs & Fila</h1>
        <p className="text-sm text-muted-foreground">
          Trabalho pendente de ação humana ·{' '}
          <Badge variant={fila.total > 0 ? 'warning' : 'success'}>{fila.total} pendência(s)</Badge>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITENS.map(({ chave, label, icon: Icon }) => (
          <Card key={chave}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-5 text-copper" />
                {label}
              </CardTitle>
              <span className="font-display text-2xl font-semibold tabular-nums">{num(fila[chave])}</span>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="size-5 text-copper" /> Filas de processamento
          </CardTitle>
          <CardDescription>
            As dependências de fila (BullMQ) e agendador estão instaladas, mas nenhuma fila de processamento em
            background foi registrada nesta instância.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Toda a fila de moderação é resolvida de forma síncrona pelos administradores. A infraestrutura está
            pronta para adoção de jobs assíncronos (envio de e-mail, verificação documental, indexação do grafo).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
