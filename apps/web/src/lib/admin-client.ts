import { api } from '@/lib/api-client';

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export function isAdminRole(role?: string | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export interface UsuarioAdmin {
  id: string;
  email: string;
  nome: string;
  role: string;
  avatarUrl: string | null;
  isVerified: boolean;
  trustScore: number;
  bloqueadoEm: string | null;
  motivoBloqueio: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsuarioAdminDetalhe extends UsuarioAdmin {
  _count: {
    terreirosCriados: number;
    avaliacoes: number;
    denunciasFeitas: number;
    conteudosCriados: number;
    campanhasCriadas: number;
    eventosCriados: number;
    notificacoes: number;
    mediacoesIniciadas: number;
    certificadosConcedidos: number;
    feedbacks: number;
  };
}

export interface AuditLogItem {
  id: string;
  acao: string;
  entidadeTipo: string;
  entidadeId: string;
  antes: any;
  depois: any;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  usuario: { id: string; nome: string; email: string } | null;
}

export interface DashboardData {
  geradoEm: string;
  usuarios: {
    total: number;
    porRole: Record<string, number>;
    verificados: number;
    bloqueados: number;
    novos7d: number;
    novos30d: number;
  };
  terreiros: {
    total: number;
    porStatus: { status: string; _count: { _all: number } }[];
    publicados: number;
    verificados: number;
    novos7d: number;
    topPorTrustScore: {
      id: string;
      nome: string;
      slug: string;
      cidade: string;
      estado: string;
      trustScore: number;
      status: string;
    }[];
  };
  organizacoes: { total: number; publicadas: number };
  eventos: { total: number; proximos: number };
  conteudo: {
    avaliacoes: number;
    cursos: number;
    matriculas: number;
    conteudos: number;
    acoesSociais: number;
    feedbacks: number;
    certificados: number;
    conteudoCultural: number;
    patrimonioCultural: number;
    graphEntidades: number;
    graphRelacionamentos: number;
  };
  comunidade: { membrosTerreiro: number; seguidores: number; notificacoes: number; indicacoes: number };
  moderacao: {
    denuncias: number;
    denunciasAbertas: number;
    mediacoes: number;
    mediacoesAtivas: number;
    reivindicacoesPendentes: number;
    documentosPendentes: number;
  };
  impacto: { campanhas: number; campanhasPublicadas: number; valorArrecadado: number };
  financeiro: {
    assinaturas: number;
    assinaturasAtivas: number;
    receitaAssinaturas: number;
    transacoes: number;
    receitas: number;
    despesas: number;
  };
  sistema: { auditLogs: number; flagsAtivas: number; ultimosAudits: AuditLogItem[] };
}

export interface MapaAdminData {
  terreiros: {
    publicados: number;
    comFoto: number;
    porEstado: { estado: string; total: number }[];
    topCidades: { cidade: string; estado: string; total: number }[];
  };
  grafo: { entidadesSemCoordenadas: number; porEstado: { estado: string; total: number }[] };
}

export interface IntegracoesAdminData {
  status: string;
  timestamp: string;
  integracoes: Record<
    string,
    { status?: string; latency?: string; message?: string; configurado?: boolean; provedor?: string | null }
  >;
}

export interface JobsAdminData {
  queues: unknown[];
  filaAguardandoAcao: {
    denunciasAbertas: number;
    reivindicacoesPendentes: number;
    documentosPendentes: number;
    mediacoesAtivas: number;
    campanhasEmAnalise: number;
    total: number;
  };
}

export interface Paginado<T> {
  data: T[];
  total: number;
}

export const adminClient = {
  dashboard: () => api.get<DashboardData>('/admin/dashboard'),
  listarUsuarios: (params: { q?: string; role?: string; status?: string; limit?: number; offset?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.role && params.role !== 'TODOS') qs.set('role', params.role);
    if (params.status) qs.set('status', params.status);
    qs.set('limit', String(params.limit ?? 50));
    qs.set('offset', String(params.offset ?? 0));
    return api.get<Paginado<UsuarioAdmin>>(`/admin/usuarios?${qs.toString()}`);
  },
  detalharUsuario: (id: string) => api.get<UsuarioAdminDetalhe>(`/admin/usuarios/${id}`),
  bloquearUsuario: (id: string, motivo: string) => api.post<UsuarioAdmin>(`/admin/usuarios/${id}/bloquear`, { motivo }),
  desbloquearUsuario: (id: string) => api.post<UsuarioAdmin>(`/admin/usuarios/${id}/desbloquear`, {}),
  alterarRole: (id: string, role: string) => api.patch<UsuarioAdmin>(`/admin/usuarios/${id}/role`, { role }),
  mapa: () => api.get<MapaAdminData>('/admin/mapa'),
  integracoes: () => api.get<IntegracoesAdminData>('/admin/integracoes'),
  jobs: () => api.get<JobsAdminData>('/admin/jobs'),
  auditLogs: (params: { limit?: number; offset?: number; entidadeTipo?: string } = {}) => {
    const qs = new URLSearchParams();
    qs.set('limit', String(params.limit ?? 50));
    qs.set('offset', String(params.offset ?? 0));
    if (params.entidadeTipo) qs.set('entidadeTipo', params.entidadeTipo);
    return api.get<Paginado<AuditLogItem>>(`/admin/audit-logs?${qs.toString()}`);
  },
};
