export enum UserRole {
  VISITOR = 'VISITOR',
  PRACTITIONER = 'PRACTITIONER',
  DIRIGENTE = 'DIRIGENTE',
  OGA = 'OGA',
  EKEDI = 'EKEDI',
  FILHO_DE_SANTO = 'FILHO_DE_SANTO',
  MEMBER = 'MEMBER',
  CO_ADMIN = 'CO_ADMIN',
  CURATOR = 'CURATOR',
  MODERATOR = 'MODERATOR',
  VERIFIER = 'VERIFIER',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum TerreiroStatus {
  RASCUNHO = 'RASCUNHO',
  PENDENTE_REVISAO = 'PENDENTE_REVISAO',
  EM_REVISAO = 'EM_REVISAO',
  AGUARDANDO_DIRIGENTE = 'AGUARDANDO_DIRIGENTE',
  PUBLICADO = 'PUBLICADO',
  EM_EDICAO = 'EM_EDICAO',
  RECUSADO = 'RECUSADO',
  BLOQUEADO = 'BLOQUEADO',
  ARQUIVADO = 'ARQUIVADO',
  SUSPENSO = 'SUSPENSO',
  VERIFICADO = 'VERIFICADO',
}

export enum Tradicao {
  IFA = 'IFA',
  CANDOMBLE_KETU = 'CANDOMBLE_KETU',
  EGUNGUN = 'EGUNGUN',
  XANGO = 'XANGO',
  BATUQUE = 'BATUQUE',
  CANDOMBLE_ANGOLA = 'CANDOMBLE_ANGOLA',
  OMOLOKO = 'OMOLOKO',
  CANDOMBLE_JEJE = 'CANDOMBLE_JEJE',
  TAMBOR_DE_MINA = 'TAMBOR_DE_MINA',
  ENCANTARIA = 'ENCANTARIA',
  JUREMA = 'JUREMA',
  CATIMBO = 'CATIMBO',
  UMBANDA = 'UMBANDA',
  QUIMBANDA = 'QUIMBANDA',
  SANTERIA = 'SANTERIA',
  VODOU = 'VODOU',
  PALO = 'PALO',
}

export enum EventType {
  GIRA = 'GIRA',
  TOQUE = 'TOQUE',
  FESTA_RELIGIOSA = 'FESTA_RELIGIOSA',
  PALESTRA = 'PALESTRA',
  CURSO = 'CURSO',
  DESENVOLVIMENTO_MEDIUNICO = 'DESENVOLVIMENTO_MEDIUNICO',
  ACAO_SOCIAL = 'ACAO_SOCIAL',
}

export enum TrustScoreLevel {
  INITIATE = 'INITIATE',
  EMERGING = 'EMERGING',
  ESTABLISHED = 'ESTABLISHED',
  AUTHORITY = 'AUTHORITY',
  LEGENDARY = 'LEGENDARY',
}

export enum VerificationLevel {
  BASICO = 'BASICO',
  DOCUMENTAL = 'DOCUMENTAL',
  COMUNITARIO = 'COMUNITARIO',
  AVANCADO = 'AVANCADO',
  COMPLETO = 'COMPLETO',
}

export enum ProductCategory {
  VELA = 'VELA',
  ERVA = 'ERVA',
  DEFUMADOR = 'DEFUMADOR',
  GUIA = 'GUIA',
  FIO_DE_CONTA = 'FIO_DE_CONTA',
  VESTUARIO = 'VESTUARIO',
  INSTRUMENTO = 'INSTRUMENTO',
  IMAGEM_SACRA = 'IMAGEM_SACRA',
  LIVRO = 'LIVRO',
  SERVICO = 'SERVICO',
}

export enum CampaignStatus {
  RASCUNHO = 'RASCUNHO',
  PENDENTE_ANALISE = 'PENDENTE_ANALISE',
  EM_ANALISE_IA = 'EM_ANALISE_IA',
  AGUARDANDO_DOCUMENTOS = 'AGUARDANDO_DOCUMENTOS',
  EM_REVISAO_HUMANA = 'EM_REVISAO_HUMANA',
  APROVADA = 'APROVADA',
  PUBLICADA = 'PUBLICADA',
  ENCERRADA = 'ENCERRADA',
  PRESTACAO_CONTAS = 'PRESTACAO_CONTAS',
  RECUSADA = 'RECUSADA',
  BLOQUEADA = 'BLOQUEADA',
  ARQUIVADA = 'ARQUIVADA',
}

export enum CampaignCategory {
  SOCIAL = 'SOCIAL',
  CULTURAL = 'CULTURAL',
  EDUCACIONAL = 'EDUCACIONAL',
  AMBIENTAL = 'AMBIENTAL',
  EMERGENCIAL = 'EMERGENCIAL',
  INFRAESTRUTURA = 'INFRAESTRUTURA',
  PATRIMONIO_HISTORICO = 'PATRIMONIO_HISTORICO',
  PESQUISA = 'PESQUISA',
  JUVENTUDE = 'JUVENTUDE',
  INCLUSAO = 'INCLUSAO',
  EVENTOS = 'EVENTOS',
}

export enum CampaignFundingModel {
  META_FIXA = 'META_FIXA',
  RECORRENTE = 'RECORRENTE',
  EMERGENCIAL = 'EMERGENCIAL',
}

export enum CampaignVerificationLevel {
  NAO_VERIFICADA = 'NAO_VERIFICADA',
  VERIFICADA = 'VERIFICADA',
  OFICIAL = 'OFICIAL',
}

export enum CampaignApoioStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  FALHADO = 'FALHADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export enum DocumentoCampanhaStatus {
  PENDENTE = 'PENDENTE',
  VALIDO = 'VALIDO',
  REJEITADO = 'REJEITADO',
}

// ============================================================
// TRUST ECOSYSTEM — PROMPT 06
// ============================================================

export enum CertificadoTipo {
  CASA_VERIFICADA = 'CASA_VERIFICADA',
  COMPROMISSO_COMUNIDADE = 'COMPROMISSO_COMUNIDADE',
  PROJETO_SOCIAL_ATIVO = 'PROJETO_SOCIAL_ATIVO',
  EDUCACAO_FORMACAO = 'EDUCACAO_FORMACAO',
  ACESSIBILIDADE = 'ACESSIBILIDADE',
  PATRIMONIO_CULTURAL = 'PATRIMONIO_CULTURAL',
  BOAS_PRATICAS_ADMINISTRATIVAS = 'BOAS_PRATICAS_ADMINISTRATIVAS',
  PRESTACAO_CONTAS_EM_DIA = 'PRESTACAO_CONTAS_EM_DIA',
  EVENTOS_TRANSPARENTES = 'EVENTOS_TRANSPARENTES',
  SUSTENTABILIDADE = 'SUSTENTABILIDADE',
}

export enum CertificadoStatus {
  ATIVO = 'ATIVO',
  EXPIRADO = 'EXPIRADO',
  REVOGADO = 'REVOGADO',
}

export enum MediacaoStatus {
  REGISTRADA = 'REGISTRADA',
  EM_MEDIACAO = 'EM_MEDIACAO',
  AGUARDANDO_RESPOSTA = 'AGUARDANDO_RESPOSTA',
  ENCERRADA = 'ENCERRADA',
  PUBLICADA = 'PUBLICADA',
  ARQUIVADA = 'ARQUIVADA',
}

export enum MediacaoOrigem {
  USUARIO = 'USUARIO',
  DENUNCIA = 'DENUNCIA',
  AUTOMATICA = 'AUTOMATICA',
  MODERACAO = 'MODERACAO',
}

export enum AntifraudeRisco {
  BAIXO = 'BAIXO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
  CRITICO = 'CRITICO',
}

export enum AntifraudeStatus {
  ABERTO = 'ABERTO',
  EM_REVISAO = 'EM_REVISAO',
  REVISTO = 'REVISTO',
  DESCARTADO = 'DESCARTADO',
  BLOQUEADO = 'BLOQUEADO',
}

export enum ComplianceCategoria {
  LGPD = 'LGPD',
  SEGURANCA = 'SEGURANCA',
  DOCUMENTACAO = 'DOCUMENTACAO',
  PRESTACAO_CONTAS = 'PRESTACAO_CONTAS',
  POLITICAS = 'POLITICAS',
  CONSENTIMENTOS = 'CONSENTIMENTOS',
  AUDITORIA = 'AUDITORIA',
  TREINAMENTOS = 'TREINAMENTOS',
}

export enum EvidenciaTipo {
  DOCUMENTO = 'DOCUMENTO',
  FOTO = 'FOTO',
  RELATO = 'RELATO',
  VINCULO = 'VINCULO',
  REGISTRO = 'REGISTRO',
}

// ============================================================
// SAAS — PROMPT 07 (Planos, Assinatura e Financeiro)
// ============================================================

export enum PlanoCiclo {
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
}

export enum PlanoAssinaturaStatus {
  PENDENTE = 'PENDENTE',
  ATIVO = 'ATIVO',
  ATRASADO = 'ATRASADO',
  EXPIRADO = 'EXPIRADO',
  CANCELADO = 'CANCELADO',
}

export enum PlanoPagamentoMetodo {
  PIX = 'PIX',
  CARTAO = 'CARTAO',
  BOLETO = 'BOLETO',
}

export enum PlanoPagamentoStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  FALHADO = 'FALHADO',
  REEMBOLSADO = 'REEMBOLSADO',
  CANCELADO = 'CANCELADO',
}

export enum TransacaoTipo {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

export enum TransacaoOrigem {
  PIX = 'PIX',
  DOACAO = 'DOACAO',
  MENSALIDADE = 'MENSALIDADE',
  VENDA = 'VENDA',
  TAXA_EVENTO = 'TAXAS_EVENTO',
  OUTRO = 'OUTRO',
}

export enum PixChaveTipo {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  TELEFONE = 'TELEFONE',
  EMAIL = 'EMAIL',
  ALEATORIA = 'ALEATORIA',
}

export enum PlanoSlug {
  GRATIS = 'GRATIS',
  BASICO = 'BASICO',
  PROFISSIONAL = 'PROFISSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

// ============================================================
// SUSTENTABILIDADE — PROMPT 14 (Círculo de Apoiadores)
// ============================================================

/**
 * Níveis de apoio à plataforma (seção 04 do Prompt 14).
 * Valores fixos — nunca alteram Trust/verificação/autoridade/posição.
 */
export enum ApoioNivel {
  SEMENTE = 'SEMENTE',
  GUARDIAO = 'GUARDIAO',
  AXE = 'AXE',
  MEMORIA = 'MEMORIA',
  ANCESTRALIDADE = 'ANCESTRALIDADE',
  MANTENEDOR = 'MANTENEDOR',
}

/** Periodicidade do apoio à plataforma. */
export enum ApoioPeriodicidade {
  AVULSO = 'AVULSO',
  MENSAL = 'MENSAL',
}

/** Status de um apoio à plataforma. */
export enum ApoioPlataformaStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  FALHADO = 'FALHADO',
  REEMBOLSADO = 'REEMBOLSADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Visibilidade da localização de um terreiro (seção 11–12 do Prompt 14).
 * PUBLICO: coordenadas exatas; APROXIMADA: cidade/estado + coords arredondadas;
 * PRIVADA: sem coordenadas públicas (apenas cidade/estado quando aplicável).
 */
export enum LocalizacaoVisibilidade {
  PUBLICO = 'PUBLICO',
  APROXIMADA = 'APROXIMADA',
  PRIVADA = 'PRIVADA',
}

// ============================================================
// TRUST & SAFETY — PROMPT 14 (Central de Segurança)
// ============================================================

/**
 * Motivos estruturados de denúncia (seção 25 do Prompt 14).
 * Substitui os sets livres do moderation service por enum centralizado.
 */
export enum DenunciaMotivo {
  PERFIL_FALSO = 'PERFIL_FALSO',
  FRAUDE = 'FRAUDE',
  IMPERSONIFICACAO = 'IMPERSONIFICACAO',
  INTOLERANCIA_RELIGIOSA = 'INTOLERANCIA_RELIGIOSA',
  ASSEDIO = 'ASSEDIO',
  INFORMACAO_FALSA = 'INFORMACAO_FALSA',
  VIOLACAO_PRIVACIDADE = 'VIOLACAO_PRIVACIDADE',
  USO_INDEVIDO_IDENTIDADE = 'USO_INDEVIDO_IDENTIDADE',
  CONTEUDO_INADEQUADO = 'CONTEUDO_INADEQUADO',
  SPAM = 'SPAM',
  OUTRO = 'OUTRO',
}

/** Tipos de entidade denunciável. */
export enum DenunciaTipo {
  TERREIRO = 'TERREIRO',
  EVENTO = 'EVENTO',
  CURSO = 'CURSO',
  CONTEUDO = 'CONTEUDO',
  USUARIO = 'USUARIO',
  ORGANIZACAO = 'ORGANIZACAO',
  PERFIL = 'PERFIL',
  CAMPANHA = 'CAMPANHA',
}

/** Status do ciclo de uma denúncia. */
export enum DenunciaStatus {
  PENDENTE = 'PENDENTE',
  EM_TRIAGEM = 'EM_TRIAGEM',
  EM_ANALISE = 'EM_ANALISE',
  RESOLVIDA = 'RESOLVIDA',
  ARQUIVADA = 'ARQUIVADA',
}

// ============================================================
// AXÉ GRAPH — PROMPT 07 (Knowledge Graph)
// ============================================================

export enum GraphEntidadeTipo {
  TERREIRO = 'TERREIRO',
  INSTITUICAO = 'INSTITUICAO',
  EVENTO = 'EVENTO',
  CURSO = 'CURSO',
  CAMPANHA = 'CAMPANHA',
  ACAO_SOCIAL = 'ACAO_SOCIAL',
  PROJETO = 'PROJETO',
  CONTEUDO = 'CONTEUDO',
  PESQUISA = 'PESQUISA',
  PATRIMONIO = 'PATRIMONIO',
  PRODUTO = 'PRODUTO',
  PESSOA = 'PESSOA',
  COMUNIDADE = 'COMUNIDADE',
}

export enum GraphRelacionamentoTipo {
  PERTENCE_A = 'PERTENCE_A',
  LOCALIZADO_EM = 'LOCALIZADO_EM',
  ORGANIZA = 'ORGANIZA',
  PARTICIPA = 'PARTICIPA',
  MINISTRA = 'MINISTRA',
  OFERECE = 'OFERECE',
  PATROCINA = 'PATROCINA',
  APOIA = 'APOIA',
  COLABORA_COM = 'COLABORA_COM',
  RELACIONADO_A = 'RELACIONADO_A',
  FAZ_PARTE_DE = 'FAZ_PARTE_DE',
  PESQUISA = 'PESQUISA',
  PUBLICOU = 'PUBLICOU',
  PRESERVA = 'PRESERVA',
  PROMOVE = 'PROMOVE',
  REALIZA = 'REALIZA',
  PARTICIPA_DE = 'PARTICIPA_DE',
  RECEBE_APOIO_DE = 'RECEBE_APOIO_DE',
  GERENCIA = 'GERENCIA',
  CERTIFICADO_POR = 'CERTIFICADO_POR',
  VERIFICADO_POR = 'VERIFICADO_POR',
  TEM_EVENTO = 'TEM_EVENTO',
  TEM_CURSO = 'TEM_CURSO',
  TEM_PROJETO = 'TEM_PROJETO',
  TEM_CAMPANHA = 'TEM_CAMPANHA',
  TEM_CONTEUDO = 'TEM_CONTEUDO',
}

export enum GraphStatus {
  PENDENTE = 'PENDENTE',
  VERIFICADO = 'VERIFICADO',
  REJEITADO = 'REJEITADO',
  SUSPENSO = 'SUSPENSO',
}

export enum GraphFonte {
  INSTITUICAO = 'INSTITUICAO',
  USUARIO = 'USUARIO',
  ADMIN = 'ADMIN',
  API_EXTERNA = 'API_EXTERNA',
  PESQUISA = 'PESQUISA',
  DOCUMENTO = 'DOCUMENTO',
  IA_SUGERIDO = 'IA_SUGERIDO',
}

export enum ConteudoCulturalTipo {
  PATRIMONIO = 'PATRIMONIO',
  HISTORIA = 'HISTORIA',
  TRADICOES = 'TRADICOES',
  MUSICA = 'MUSICA',
  DANCA = 'DANCA',
  ARTE = 'ARTE',
  LITERATURA = 'LITERATURA',
  GASTRONOMIA = 'GASTRONOMIA',
  ARTESANATO = 'ARTESANATO',
  DOCUMENTARIO = 'DOCUMENTARIO',
  ENTREVISTA = 'ENTREVISTA',
  PESQUISA = 'PESQUISA',
}

export enum ConteudoStatus {
  NAO_VERIFICADA = 'NAO_VERIFICADA',
  VERIFICADA = 'VERIFICADA',
  OFICIAL = 'OFICIAL',
}

export enum NivelPrivacidade {
  PUBLICO = 'PUBLICO',
  COMUNITARIO = 'COMUNITARIO',
  RESTRITO = 'RESTRITO',
  PRIVADO = 'PRIVADO',
  SENSIVEL = 'SENSIVEL',
}

/**
 * Níveis de verificação de Organizações (seção 15).
 * Refletem o que foi verificado — nunca legitimidade espiritual/religiosa.
 */
export enum OrganizationVerificationLevel {
  NAO_VERIFICADA = 'NAO_VERIFICADA',
  REIVINDICADA = 'REIVINDICADA',
  VERIFICADA = 'VERIFICADA',
  ORGANIZACAO_VERIFICADA = 'ORGANIZACAO_VERIFICADA',
  PARCEIRO_INSTITUCIONAL = 'PARCEIRO_INSTITUCIONAL',
}

export enum DuplicidadeStatus {
  ABERTO = 'ABERTO',
  CONFIRMADO = 'CONFIRMADO',
  REJEITADO = 'REJEITADO',
  IGNORADO = 'IGNORADO',
}

/**
 * Níveis de categoria da taxonomia multidimensional (prompt 03)
 * POVO: grupos étnicos, nações africanas e diásporas
 * TRADICAO: práticas, rituais e saberes transmitidos
 * RELIGIAO: sistemas de crenças e culto
 * ESPALTALIDADE: graus de iniciação e autoridade espiritual
 * SISTEMA_CONHECIMENTO: estruturas epistemológicas
 * SISTEMA_ADIVINHACAO: métodos de adivinhação e adivinhos
 * EXPRESSAO_CULTURAL: artes, música, dança, literatura
 * LINGUA: línguas africanas e afro-brasileiras
 * TERRITORIO: terras sagradas, quilombos, terreiros
 * REGIAO: sub-divisões geográficas (estados, províncias)
 * PAIS: países africanos e de diáspora
 * DIASPORA: comunidades africanas fora do continente
 * COMUNIDADE: grupos locais de prática
 * INSTITUICAO: templos, centros, instituições formais
 * PATRIMONIO: bens culturais, imóveis, objetos
 * EVENTO: rituais, festas, cerimônias
 * CONTEUDO: artigos, vídeos, podcasts, materiais didáticos
 */
export enum TaxonomyCategory {
  POVO = 'POVO',
  TRADICAO = 'TRADICAO',
  RELIGIAO = 'RELIGIAO',
  ESPALTALIDADE = 'ESPALTALIDADE',
  SISTEMA_CONHECIMENTO = 'SISTEMA_CONHECIMENTO',
  SISTEMA_ADIVINHACAO = 'SISTEMA_ADIVINHACAO',
  EXPRESSAO_CULTURAL = 'EXPRESSAO_CULTURAL',
  LINGUA = 'LINGUA',
  TERRITORIO = 'TERRITORIO',
  REGIAO = 'REGIAO',
  PAIS = 'PAIS',
  DIASPORA = 'DIASPORA',
  COMUNIDADE = 'COMUNIDADE',
  INSTITUICAO = 'INSTITUICAO',
  PATRIMONIO = 'PATRIMONIO',
  EVENTO = 'EVENTO',
  CONTEUDO = 'CONTEUDO',
}
