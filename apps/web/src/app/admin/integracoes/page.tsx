'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Database,
  Server,
  HardDrive,
  Mail,
  MessageCircle,
  Map as MapIcon,
  BrainCircuit,
  KeyRound,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
} from 'lucide-react';
import { adminClient, type IntegracoesAdminData } from '@/lib/admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const DEFINICOES: Record<string, { label: string; icon: any; descricao: string }> = {
  database: { label: 'Banco de dados', icon: Database, descricao: 'PostgreSQL via Prisma' },
  redis: { label: 'Redis', icon: Server, descricao: 'Cache e sessões' },
  storage: { label: 'Storage', icon: HardDrive, descricao: 'Objetos e mídias (S3/MinIO)' },
  email: { label: 'E-mail', icon: Mail, descricao: 'Transacional e marketing' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, descricao: 'Mensagens e notificações' },
  maps: { label: 'Mapas', icon: MapIcon, descricao: 'Geocodificação e visualização' },
  ia: { label: 'IA', icon: BrainCircuit, descricao: 'Análise, moderação e sugestões' },
  oauth: { label: 'OAuth', icon: KeyRound, descricao: 'Login social (Google)' },
  pagamentos: { label: 'Pagamentos', icon: CreditCard, descricao: 'PIX, cartão e boleto' },
};

function EstadoBadge({ item }: { item: { status?: string; latency?: string; configurado?: boolean; provedor?: string | null } }) {
  if (item.status === 'ok') {
    return <Badge variant="success"><CheckCircle2 className="size-3" /> Operacional{item.latency ? ` · ${item.latency}` : ''}</Badge>;
  }
  if (item.status === 'not_configured' || item.configurado === false) {
    return <Badge variant="muted"><MinusCircle className="size-3" /> Não configurado</Badge>;
  }
  if (item.status === 'error') {
    return <Badge variant="danger"><XCircle className="size-3" /> Falha</Badge>;
  }
  if (item.configurado) {
    return <Badge variant="success"><CheckCircle2 className="size-3" /> Configurado{item.provedor ? ` (${item.provedor})` : ''}</Badge>;
  }
  if (item.status === 'not_available') {
    return <Badge variant="warning"><AlertTriangle className="size-3" /> Indisponível</Badge>;
  }
  return <Badge variant="muted"><MinusCircle className="size-3" /> Não configurado</Badge>;
}

export default function AdminIntegracoesPage() {
  const { toast } = useToast();
  const [data, setData] = useState<IntegracoesAdminData | null>(null);

  useEffect(() => {
    adminClient
      .integracoes()
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Integrações</h1>
        <p className="text-sm text-muted-foreground">
          Status real dos serviços ·{' '}
          <Badge variant={data.status === 'healthy' ? 'success' : 'warning'}>{data.status}</Badge>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(DEFINICOES).map(([chave, def]) => {
          const item = data.integracoes[chave] ?? {};
          const Icon = def.icon;
          return (
            <Card key={chave}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-5 text-copper" />
                  {def.label}
                </CardTitle>
                <EstadoBadge item={item} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{def.descricao}</p>
                {item.message && (
                  <p className="mt-2 truncate text-xs text-danger">{item.message}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
