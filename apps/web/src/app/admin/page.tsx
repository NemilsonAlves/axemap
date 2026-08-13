'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Star,
  ShieldAlert,
  HeartHandshake,
  Wallet,
  Crown,
  Network,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { adminClient, type DashboardData } from '@/lib/admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (v: number) => v.toLocaleString('pt-BR');

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  SUPPORT: 'Suporte',
  VERIFIER: 'Verificador',
  MODERATOR: 'Moderador',
  CURATOR: 'Curador',
  CO_ADMIN: 'Co-admin',
  MEMBER: 'Membro',
  FILHO_DE_SANTO: 'Filho(a) de santo',
  EKEDI: 'Ekédi',
  OGA: 'Ogan',
  DIRIGENTE: 'Dirigente',
  PRACTITIONER: 'Praticante',
  VISITOR: 'Visitante',
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adminClient.dashboard();
      setData(d);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar o dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    load();
    toast({ title: 'Dashboard atualizado', description: 'Dados recarregados em tempo real.' });
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-copper" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
        <p className="font-semibold text-danger">Erro ao carregar o dashboard</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const financeiroLiquido = data.financeiro.receitas - data.financeiro.despesas;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-muted-foreground">
            Dados reais do AxéMap · atualizado {new Date(data.geradoEm).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
          <Link href="/admin/central">
            <Button variant="soft" size="sm">Central de Moderação</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuários" value={num(data.usuarios.total)} icon={Users}
          hint={`+${num(data.usuarios.novos7d)} novos em 7d`} />
        <StatCard label="Terreiros" value={num(data.terreiros.total)} icon={Building2}
          hint={`${num(data.terreiros.publicados)} publicados`} />
        <StatCard label="Avaliações" value={num(data.conteudo.avaliacoes)} icon={Star}
          hint="de usuários verificados" />
        <StatCard label="Rede Axé Graph" value={num(data.conteudo.graphEntidades)} icon={Network}
          hint={`${num(data.conteudo.graphRelacionamentos)} relações`} />
        <StatCard label="Denúncias abertas" value={num(data.moderacao.denunciasAbertas)} icon={ShieldAlert}
          hint={`${num(data.moderacao.denuncias)} no total`} />
        <StatCard label="Campanhas" value={num(data.impacto.campanhas)} icon={HeartHandshake}
          hint={`${num(data.impacto.campanhasPublicadas)} publicadas`} />
        <StatCard label="Assinaturas ativas" value={num(data.financeiro.assinaturasAtivas)} icon={Crown}
          hint={`${brl.format(data.financeiro.receitaAssinaturas)}/mês`} />
        <StatCard label="Financeiro" value={brl.format(financeiroLiquido)} icon={Wallet}
          hint={`${brl.format(data.financeiro.receitas)} receitas · ${brl.format(data.financeiro.despesas)} despesas`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usuários por papel</CardTitle>
            <CardDescription>{num(data.usuarios.total)} contas ativas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(data.usuarios.porRole)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([role, total]) => {
                const max = Math.max(...Object.values(data.usuarios.porRole), 1);
                return (
                  <div key={role} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-sm">{ROLE_LABEL[role] ?? role}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-copper" style={{ width: `${(total / max) * 100}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">{total}</span>
                  </div>
                );
              })}
            <div className="flex gap-4 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">
                <Badge variant="success" className="mr-1">{num(data.usuarios.verificados)}</Badge> verificado(s)
              </span>
              <span className="text-muted-foreground">
                <Badge variant={data.usuarios.bloqueados > 0 ? 'danger' : 'muted'} className="mr-1">{num(data.usuarios.bloqueados)}</Badge> bloqueado(s)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terreiros por status</CardTitle>
            <CardDescription>{num(data.terreiros.total)} registros na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.terreiros.porStatus
              .sort((a, b) => b._count._all - a._count._all)
              .map((s) => (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 truncate text-sm">{s.status}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-copper"
                      style={{ width: `${(s._count._all / Math.max(data.terreiros.total, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">{s._count._all}</span>
                </div>
              ))}
            <div className="border-t border-border pt-3 text-sm text-muted-foreground">
              {num(data.terreiros.verificados)} verificados · +{num(data.terreiros.novos7d)} novos em 7d
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top terreiros por Trust Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.terreiros.topPorTrustScore.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum terreiro registrado.</p>
            )}
            {data.terreiros.topPorTrustScore.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-copper-soft text-xs font-semibold text-copper-strong">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.cidade} · {t.estado}</p>
                </div>
                <Badge variant={t.trustScore >= 70 ? 'success' : 'muted'}>{t.trustScore.toFixed(1)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moderação</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-display text-2xl font-semibold">{num(data.moderacao.denunciasAbertas)}</p>
              <p className="text-xs text-muted-foreground">Denúncias abertas</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-display text-2xl font-semibold">{num(data.moderacao.mediacoesAtivas)}</p>
              <p className="text-xs text-muted-foreground">Mediações ativas</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-display text-2xl font-semibold">{num(data.moderacao.reivindicacoesPendentes)}</p>
              <p className="text-xs text-muted-foreground">Reivindicações pendentes</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="font-display text-2xl font-semibold">{num(data.moderacao.documentosPendentes)}</p>
              <p className="text-xs text-muted-foreground">Docs de verificação</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ecossistema</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Cursos</span><p className="font-semibold">{num(data.conteudo.cursos)}</p></div>
            <div><span className="text-muted-foreground">Matrículas</span><p className="font-semibold">{num(data.conteudo.matriculas)}</p></div>
            <div><span className="text-muted-foreground">Conteúdos</span><p className="font-semibold">{num(data.conteudo.conteudos)}</p></div>
            <div><span className="text-muted-foreground">Ações sociais</span><p className="font-semibold">{num(data.conteudo.acoesSociais)}</p></div>
            <div><span className="text-muted-foreground">Conteúdo cultural</span><p className="font-semibold">{num(data.conteudo.conteudoCultural)}</p></div>
            <div><span className="text-muted-foreground">Patrimônio</span><p className="font-semibold">{num(data.conteudo.patrimonioCultural)}</p></div>
            <div><span className="text-muted-foreground">Organizações</span><p className="font-semibold">{num(data.organizacoes.total)}</p></div>
            <div><span className="text-muted-foreground">Certificados</span><p className="font-semibold">{num(data.conteudo.certificados)}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas ações de auditoria</CardTitle>
          <CardDescription>{num(data.sistema.auditLogs)} registros no total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.sistema.ultimosAudits.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma ação administrativa registrada ainda.</p>
          )}
          {data.sistema.ultimosAudits.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.acao}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.usuario?.nome ?? 'Sistema'} · {a.entidadeTipo}:{a.entidadeId.slice(0, 8)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
