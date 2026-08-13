'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Lock,
  Unlock,
  Loader2,
  Eye,
  UserCheck,
} from 'lucide-react';
import { adminClient, type UsuarioAdmin, type UsuarioAdminDetalhe } from '@/lib/admin-client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const ALL_ROLES = [
  'SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'VERIFIER', 'MODERATOR', 'CURATOR', 'CO_ADMIN',
  'MEMBER', 'FILHO_DE_SANTO', 'EKEDI', 'OGA', 'DIRIGENTE', 'PRACTITIONER', 'VISITOR',
];

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

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

export default function AdminUsuariosPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<UsuarioAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('TODOS');
  const [status, setStatus] = useState('TODOS');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const [detalhe, setDetalhe] = useState<UsuarioAdminDetalhe | null>(null);
  const [alvo, setAlvo] = useState<UsuarioAdmin | null>(null);
  const [motivo, setMotivo] = useState('');
  const [novaRole, setNovaRole] = useState('');

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminClient.listarUsuarios({ q: q || undefined, role, status, limit, offset });
      setRows(res.data);
      setTotal(res.total);
    } catch (e: any) {
      toast({ title: 'Erro ao carregar usuários', description: e.message, variant: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [q, role, status, offset, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const bloquear = async () => {
    if (!alvo) return;
    if (!motivo.trim()) {
      toast({ title: 'Informe o motivo', variant: 'danger' });
      return;
    }
    try {
      await adminClient.bloquearUsuario(alvo.id, motivo);
      toast({ title: 'Usuário bloqueado', description: `${alvo.nome} não pode mais acessar a plataforma.` });
      setAlvo(null);
      setMotivo('');
      load();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'danger' });
    }
  };

  const desbloquear = async (u: UsuarioAdmin) => {
    try {
      await adminClient.desbloquearUsuario(u.id);
      toast({ title: 'Usuário desbloqueado', description: `${u.nome} voltou a ter acesso.` });
      load();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'danger' });
    }
  };

  const alterarRole = async (u: UsuarioAdmin, nova: string) => {
    try {
      await adminClient.alterarRole(u.id, nova);
      toast({ title: 'Papel atualizado', description: `${u.nome} agora é ${ROLE_LABEL[nova] ?? nova}.` });
      setNovaRole('');
      load();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'danger' });
    }
  };

  const verDetalhe = async (u: UsuarioAdmin) => {
    try {
      const d = await adminClient.detalharUsuario(u.id);
      setDetalhe(d);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'danger' });
    }
  };

  const paginas = Math.max(1, Math.ceil(total / limit));
  const paginaAtual = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gestão de contas · {total} usuário(s) encontrado(s)
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Nome ou e-mail..."
              value={q}
              onChange={(e) => { setQ(e.target.value); setOffset(0); }}
            />
          </div>
        </div>
        <div className="w-44">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Papel</label>
          <Select value={role} onValueChange={(v) => { setRole(v); setOffset(0); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABEL[r] ?? r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
          <Select value={status} onValueChange={(v) => { setStatus(v); setOffset(0); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="ATIVO">Ativos</SelectItem>
              <SelectItem value="BLOQUEADO">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={load}>Aplicar</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-copper" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-copper-soft text-sm font-semibold text-copper-strong">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{u.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ADMIN_ROLES.includes(u.role) ? 'copper' : 'muted'}>{ROLE_LABEL[u.role] ?? u.role}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{u.trustScore.toFixed(1)}</TableCell>
                    <TableCell>
                      {u.bloqueadoEm ? (
                        <Badge variant="danger">Bloqueado</Badge>
                      ) : u.isVerified ? (
                        <Badge variant="success"><UserCheck className="size-3" /> Verificado</Badge>
                      ) : (
                        <Badge variant="muted">Ativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title="Ver detalhes" onClick={() => verDetalhe(u)}>
                          <Eye className="size-4" />
                        </Button>
                        {u.bloqueadoEm ? (
                          <Button variant="ghost" size="icon-sm" title="Desbloquear" onClick={() => desbloquear(u)}>
                            <Unlock className="size-4 text-success" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon-sm" title="Bloquear" onClick={() => { setAlvo(u); setMotivo(''); }}>
                            <Lock className="size-4 text-danger" />
                          </Button>
                        )}
                        {isSuperAdmin && (
                          <Select value={novaRole === '' ? u.role : novaRole} onValueChange={(v) => alterarRole(u, v)}>
                            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ALL_ROLES.map((r) => (
                                <SelectItem key={r} value={r}>{ROLE_LABEL[r] ?? r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
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
          <p className="text-sm text-muted-foreground">
            Página {paginaAtual} de {paginas}
          </p>
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

      <Dialog open={!!alvo} onOpenChange={(o) => !o && setAlvo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear {alvo?.nome}</DialogTitle>
            <DialogDescription>
              O usuário perderá o acesso imediatamente (sessão e refresh token invalidados). A ação ficará registrada na auditoria.
            </DialogDescription>
          </DialogHeader>
          <label className="text-xs font-medium text-muted-foreground">Motivo do bloqueio *</label>
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex.: violação repetida das diretrizes" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAlvo(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={bloquear} disabled={!motivo.trim()}>
              <Lock className="size-4" /> Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-w-2xl">
          {detalhe && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-copper-soft font-semibold text-copper-strong">
                    {detalhe.nome.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    {detalhe.nome}
                    <span className="block text-sm font-normal text-muted-foreground">{detalhe.email}</span>
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Papel</p>
                  <Badge variant={ADMIN_ROLES.includes(detalhe.role) ? 'copper' : 'muted'} className="mt-1">{ROLE_LABEL[detalhe.role] ?? detalhe.role}</Badge>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Trust score</p>
                  <p className="mt-1 font-semibold">{detalhe.trustScore.toFixed(1)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Terreiros criados</p>
                  <p className="mt-1 font-semibold">{detalhe._count.terreirosCriados}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Avaliações</p>
                  <p className="mt-1 font-semibold">{detalhe._count.avaliacoes}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Conteúdos</p>
                  <p className="mt-1 font-semibold">{detalhe._count.conteudosCriados}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Eventos</p>
                  <p className="mt-1 font-semibold">{detalhe._count.eventosCriados}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Campanhas</p>
                  <p className="mt-1 font-semibold">{detalhe._count.campanhasCriadas}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Denúncias feitas</p>
                  <p className="mt-1 font-semibold">{detalhe._count.denunciasFeitas}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Notificações</p>
                  <p className="mt-1 font-semibold">{detalhe._count.notificacoes}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Mediações iniciadas</p>
                  <p className="mt-1 font-semibold">{detalhe._count.mediacoesIniciadas}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Registrado em</p>
                  <p className="mt-1 font-semibold">{new Date(detalhe.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                {detalhe.bloqueadoEm && (
                  <div className="col-span-2 rounded-lg bg-danger/10 p-3">
                    <p className="text-xs text-muted-foreground">Bloqueado em {new Date(detalhe.bloqueadoEm).toLocaleString('pt-BR')}</p>
                    <p className="mt-1 font-semibold">{detalhe.motivoBloqueio}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
