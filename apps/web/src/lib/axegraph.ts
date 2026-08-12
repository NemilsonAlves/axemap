import { api } from '@/lib/api-client';

export type GraphEntidadeTipo =
  | 'TERREIRO'
  | 'INSTITUICAO'
  | 'EVENTO'
  | 'CURSO'
  | 'CAMPANHA'
  | 'ACAO_SOCIAL'
  | 'PROJETO'
  | 'CONTEUDO'
  | 'PESQUISA'
  | 'PATRIMONIO'
  | 'PRODUTO'
  | 'PESSOA'
  | 'COMUNIDADE';

export type GraphRelacionamentoTipo =
  | 'PERTENCE_A'
  | 'LOCALIZADO_EM'
  | 'ORGANIZA'
  | 'PARTICIPA'
  | 'MINISTRA'
  | 'OFERECE'
  | 'PATROCINA'
  | 'APOIA'
  | 'COLABORA_COM'
  | 'RELACIONADO_A'
  | 'FAZ_PARTE_DE'
  | 'PESQUISA'
  | 'PUBLICOU'
  | 'PRESERVA'
  | 'PROMOVE'
  | 'REALIZA'
  | 'PARTICIPA_DE'
  | 'RECEBE_APOIO_DE'
  | 'GERENCIA'
  | 'CERTIFICADO_POR'
  | 'VERIFICADO_POR'
  | 'TEM_EVENTO'
  | 'TEM_CURSO'
  | 'TEM_PROJETO'
  | 'TEM_CAMPANHA'
  | 'TEM_CONTEUDO';

export type GraphStatus = 'PENDENTE' | 'VERIFICADO' | 'REJEITADO' | 'SUSPENSO';
export type GraphFonte = 'INSTITUICAO' | 'USUARIO' | 'ADMIN' | 'API_EXTERNA' | 'PESQUISA' | 'DOCUMENTO' | 'IA_SUGERIDO';
export type ConteudoStatus = 'NAO_VERIFICADA' | 'VERIFICADA' | 'OFICIAL';
export type DuplicidadeStatus = 'ABERTO' | 'CONFIRMADO' | 'REJEITADO' | 'IGNORADO';

export interface GrafoEntidade {
  id: string;
  entidadeTipo: GraphEntidadeTipo;
  entidadeId: string;
  nome: string;
  slug: string | null;
  descricaoCurta?: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number | null;
  longitude: number | null;
  tags?: string[];
  grau?: number;
}

export interface ResultadoBusca {
  entidade: GrafoEntidade;
  score: number;
  motivos: string[];
  conexoes: { tipo: string; rotulo: string; com: { nome: string; tipo: string } }[];
}

export interface RespostaBuscar {
  consulta: string;
  total: number;
  resultados: ResultadoBusca[];
  observacao: string;
}

export interface Recomendacao {
  entidade: { id: string; entidadeTipo: GraphEntidadeTipo; entidadeId: string; nome: string; slug: string | null; cidade: string | null; estado: string | null };
  score: number;
  motivos: string[];
}

export interface RespostaRecomendacoes {
  tipo: GraphEntidadeTipo | null;
  limite: number;
  recomendacoes: Recomendacao[];
  explicacao: string;
}

export interface NoGrafo {
  id: string;
  entidadeId: string;
  entidadeTipo: GraphEntidadeTipo;
  nome: string;
  cidade: string | null;
  estado: string | null;
  isRaiz?: boolean;
  emoji?: string;
}

export interface ArestaGrafo {
  id: string;
  tipo: GraphRelacionamentoTipo;
  rotulo: string;
  status: GraphStatus;
  de: string;
  para: string;
}

export interface RespostaVizinhanca {
  raiz: { id: string; entidadeTipo: GraphEntidadeTipo; entidadeId: string; nome: string };
  nos: NoGrafo[];
  arestas: ArestaGrafo[];
  totalRelacionamentos: number;
  apenasVerificados: boolean;
}

export interface Relacionamento {
  id: string;
  tipo: GraphRelacionamentoTipo;
  rotulo: string;
  status: GraphStatus;
  nivelConfianca: number | null;
  fonte: GraphFonte;
  evidencia: string | null;
  validoDe: string | null;
  validoAte: string | null;
  criadoEm: string;
  origem: { id: string; entidadeTipo: GraphEntidadeTipo; entidadeId: string; nome: string; cidade: string | null; estado: string | null };
  alvo: { id: string; entidadeTipo: GraphEntidadeTipo; entidadeId: string; nome: string; cidade: string | null; estado: string | null };
}

export interface RespostaRelacionamentos {
  data: Relacionamento[];
  total: number;
}

export interface ConteudoCultural {
  id: string;
  titulo: string;
  tipo: string;
  resumo: string | null;
  corpo: string | null;
  url: string | null;
  autorNome: string | null;
  fonte: string | null;
  dataPublicacao: string | null;
  licenca: string | null;
  status: ConteudoStatus;
  cidade: string | null;
  estado: string | null;
  tags: string[];
  createdAt: string;
}

export interface PatrimonioCultural {
  id: string;
  nome: string;
  tipo: string | null;
  descricao: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number | null;
  longitude: number | null;
  ano: number | null;
  fonte: string | null;
  status: ConteudoStatus;
  fotos: string[];
  createdAt: string;
}

export interface CandidataDuplicidade {
  id: string;
  entidadeTipo: GraphEntidadeTipo;
  entidadeIdA: string;
  entidadeIdB: string;
  score: number;
  motivo: string;
  status: DuplicidadeStatus;
  createdAt: string;
  criadoPor: { id: string; nome: string } | null;
  resolvidoPor: { id: string; nome: string } | null;
}

export interface GrafoEstatisticas {
  entidades: number;
  entidadesPorTipo: Record<string, number>;
  relacionamentos: number;
  relacionamentosPorStatus: Record<string, number>;
  relacionamentosVerificados: number;
  relacionamentosPendentes: number;
  duplicidadesAbertas: number;
  conteudosCulturais: number;
  patrimonio: number;
}

export interface RotaCultural {
  roteiro: { dia: string; paradas: { tipo: string; nome: string; slug?: string | null; cidade?: string | null; estado?: string | null; data?: string | null }[] }[];
  conteudos: { nome: string; cidade?: string | null; estado?: string | null }[];
  patrimonio: PatrimonioCultural[];
  aviso: string;
}

export type TipoEntidade = { value: GraphEntidadeTipo; label: string };
export type TipoRelacionamento = { value: GraphRelacionamentoTipo; label: string };

export const TIPOS_ENTIDADE: TipoEntidade[] = [
  { value: 'TERREIRO', label: 'Terreiro' },
  { value: 'INSTITUICAO', label: 'Instituição' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'CURSO', label: 'Curso' },
  { value: 'CAMPANHA', label: 'Campanha' },
  { value: 'ACAO_SOCIAL', label: 'Ação social' },
  { value: 'PROJETO', label: 'Projeto' },
  { value: 'CONTEUDO', label: 'Conteúdo' },
  { value: 'PESQUISA', label: 'Pesquisa' },
  { value: 'PATRIMONIO', label: 'Patrimônio' },
  { value: 'PRODUTO', label: 'Produto' },
  { value: 'PESSOA', label: 'Pessoa' },
  { value: 'COMUNIDADE', label: 'Comunidade' },
];

export const TIPOS_RELACIONAMENTO: TipoRelacionamento[] = [
  { value: 'PERTENCE_A', label: 'pertence a' },
  { value: 'LOCALIZADO_EM', label: 'localizado em' },
  { value: 'ORGANIZA', label: 'organiza' },
  { value: 'PARTICIPA', label: 'participa' },
  { value: 'MINISTRA', label: 'ministra' },
  { value: 'OFERECE', label: 'oferece' },
  { value: 'PATROCINA', label: 'patrocina' },
  { value: 'APOIA', label: 'apoia' },
  { value: 'COLABORA_COM', label: 'colabora com' },
  { value: 'RELACIONADO_A', label: 'relacionado a' },
  { value: 'FAZ_PARTE_DE', label: 'faz parte de' },
  { value: 'PESQUISA', label: 'pesquisa' },
  { value: 'PUBLICOU', label: 'publicou' },
  { value: 'PRESERVA', label: 'preserva' },
  { value: 'PROMOVE', label: 'promove' },
  { value: 'REALIZA', label: 'realiza' },
  { value: 'PARTICIPA_DE', label: 'participa de' },
  { value: 'RECEBE_APOIO_DE', label: 'recebe apoio de' },
  { value: 'GERENCIA', label: 'gerencia' },
  { value: 'CERTIFICADO_POR', label: 'certificado por' },
  { value: 'VERIFICADO_POR', label: 'verificado por' },
  { value: 'TEM_EVENTO', label: 'tem evento' },
  { value: 'TEM_CURSO', label: 'tem curso' },
  { value: 'TEM_PROJETO', label: 'tem projeto' },
  { value: 'TEM_CAMPANHA', label: 'tem campanha' },
  { value: 'TEM_CONTEUDO', label: 'tem conteúdo' },
];

function qs(params: Record<string, string | number | undefined>) {
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!clean.length) return '';
  return '?' + new URLSearchParams(clean.map(([k, v]) => [k, String(v)])).toString();
}

export const axegraphApi = {
  buscar: (p: { q?: string; tipo?: GraphEntidadeTipo; estado?: string; cidade?: string; lat?: number; lon?: number; raio?: number; limit?: number }) =>
    api.get<RespostaBuscar>(`/graph/buscar${qs({ ...p })}`),

  recomendacoes: (p: { tipo?: GraphEntidadeTipo; interesse?: string; estado?: string; cidade?: string; limit?: number }) =>
    api.get<RespostaRecomendacoes>(`/graph/recomendacoes${qs({ ...p })}`),

  vizinhanca: (tipo: GraphEntidadeTipo, id: string, profundidade?: number) =>
    api.get<RespostaVizinhanca>(`/graph/vizinhanca/${tipo}/${encodeURIComponent(id)}${qs({ profundidade })}`),

  relacionamentos: (p: { tipo?: GraphRelacionamentoTipo; origemTipo?: string; origemId?: string; limit?: number; offset?: number }) =>
    api.get<RespostaRelacionamentos>(`/graph/relacionamentos${qs({ ...p })}`),

  conteudos: (p: { tipo?: string; q?: string; limit?: number; offset?: number }) =>
    api.get<{ data: ConteudoCultural[]; total: number }>(`/graph/conteudos${qs({ ...p })}`),

  patrimonios: (p: { estado?: string; cidade?: string; q?: string; limit?: number }) =>
    api.get<PatrimonioCultural[]>(`/graph/patrimonios${qs({ ...p })}`),

  rotas: (p: { cidade?: string; estado?: string; dias?: number; lat?: number; lon?: number; raio?: number }) =>
    api.get<RotaCultural>(`/graph/rotas${qs({ ...p })}`),

  admin: {
    dashboard: () => api.get<GrafoEstatisticas>('/admin/graph/dashboard'),
    sincronizar: () => api.post<{ total: number }>('/admin/graph/sincronizar', {}),
    relacionamentos: (p: { tipo?: GraphRelacionamentoTipo; status?: GraphStatus; limit?: number; offset?: number }) =>
      api.get<RespostaRelacionamentos>(`/admin/graph/relacionamentos${qs({ ...p })}`),
    criarRelacionamento: (body: {
      origemTipo: GraphEntidadeTipo; origemId: string; alvoTipo: GraphEntidadeTipo; alvoId: string;
      tipo: GraphRelacionamentoTipo; fonte?: GraphFonte; evidencia?: string; rotulo?: string; validoDe?: string; validoAte?: string;
    }) => api.post<any>('/admin/graph/relacionamentos', body),
    revisarRelacionamento: (id: string, decisao: 'VERIFICAR' | 'REJEITAR' | 'SUSPENDER') =>
      api.post<any>(`/admin/graph/relacionamentos/${id}/revisar`, { decisao }),
    removerRelacionamento: (id: string) => api.post(`/admin/graph/relacionamentos/${id}/remover`, {}),
    duplicidades: (p: { status?: DuplicidadeStatus }) =>
      api.get<CandidataDuplicidade[]>(`/admin/graph/duplicidades${qs({ ...p })}`),
    detectarDuplicidades: () => api.post<{ novasCandidaturas: number; totalPendentes: number }>('/admin/graph/duplicidades/detectar', {}),
    resolverDuplicidade: (id: string, decisao: 'CONFIRMAR' | 'REJEITAR', entidadeCanonicaId?: string) =>
      api.post<any>(`/admin/graph/duplicidades/${id}/resolver`, { decisao, entidadeCanonicaId }),
    conteudos: (p: { status?: ConteudoStatus; limit?: number }) =>
      api.get<{ data: ConteudoCultural[]; total: number }>(`/admin/graph/conteudos${qs({ ...p })}`),
    revisarConteudo: (id: string, status: ConteudoStatus) =>
      api.post<any>(`/admin/graph/conteudos/${id}/revisar`, { status }),
  },
};