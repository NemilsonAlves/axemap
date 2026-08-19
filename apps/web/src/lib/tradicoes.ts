/**
 * AxéMap — Taxonomia Multidimensional
 * Tradições, Povos, Sistemas de Conhecimento e Expressões Culturais
 * da África e de suas diásporas.
 *
 * PRINCÍPIO: UNIÃO SEM UNIFICAÇÃO.
 * Cada entidade preserva sua própria identidade, terminologia e história.
 * Tipos conceituais NÃO são equivalentes entre si.
 */

export type TipoConceitual =
  | 'povo'
  | 'tradicao'
  | 'religiao'
  | 'sistema-conhecimento'
  | 'expressao-cultural'
  | 'diaspora'
  | 'espiritualidade'
  | 'culto-ancestral';

export interface TradicaoCatalogo {
  nome: string;
  label: string;
  descricao: string;
  /** Tipo conceitual — NÃO são equivalentes. */
  tipo: TipoConceitual;
  familia: string;
  regiao: string;
  continente: string;
  paises: string[];
  /**
   * Presença fora do continente africano.
   * NÃO é uma "cópia" — é continuidade, transformação e criação cultural soberana.
   */
  diaspora: string[];
  categoria: string;
  tags: string[];
  destaque?: boolean;
}

export const TRADICOES_CATALOGO: TradicaoCatalogo[] = [
  // ── SISTEMAS DE CONHECIMENTO ──────────────────────────────────────
  {
    nome: 'IFA',
    label: 'Ifá',
    descricao:
      'Sistema de conhecimento e adivinhação de tradição yorùbá. Orixá da sabedoria, Orúnmìlà; o corpus dos 256 Odù; filosofia, literatura oral, divinação e cosmologia transmitidas pelos babalaôs (Awo). Reconhecido pela UNESCO como Patrimônio Cultural Imaterial da Humanidade desde 2008, com prática entre comunidades yorùbá e na diáspora das Américas e do Caribe.',
    tipo: 'sistema-conhecimento',
    familia: 'Iorubá',
    regiao: 'África Ocidental',
    continente: 'África',
    paises: ['Nigéria', 'Benim'],
    diaspora: ['Brasil', 'Cuba', 'Estados Unidos', 'Caribe', 'Europa'],
    categoria: 'Sistema de conhecimento yorùbá',
    tags: ['africa', 'diaspora', 'brasil', 'caribe', 'america-latina', 'america-norte', 'europa', 'ifa', 'yoruba'],
    destaque: true,
  },

  // ── TRADIÇÃO YORÙBÁ AFRICANA ──────────────────────────────────────
  {
    nome: 'YORUBA_TRADICIONAL',
    label: 'Tradição Yorùbá',
    descricao:
      'Sistema cultural, espiritual e filosófico do povo yorùbá da África Ocidental (Nigéria, Benim, Togo). Os Orixás são divindades da religião tradicional yorùbá. O AxéMap diferencia a tradição yorùbá africana de suas expressões diaspóricas — Candomblé, Santería, Trinidad Orisha — que desenvolveram identidades próprias e soberanas.',
    tipo: 'tradicao',
    familia: 'Iorubá',
    regiao: 'África Ocidental (Nigéria, Benim, Togo)',
    continente: 'África',
    paises: ['Nigéria', 'Benim', 'Togo', 'Gana'],
    diaspora: ['Brasil', 'Cuba', 'Trinidad', 'Estados Unidos', 'Europa'],
    categoria: 'Tradição africana (yorùbá)',
    tags: ['africa', 'yoruba', 'ifa'],
  },

  // ── TRADIÇÕES AFRO-BRASILEIRAS ────────────────────────────────────
  {
    nome: 'CANDOMBLE_KETU',
    label: 'Candomblé de Ketu',
    descricao:
      'Tradição religiosa afro-brasileira de nação iorubá-nagô com culto aos Orixás, iniciados (yaôs) e forte preservação da língua e dos cantos rituais. Surgida no Brasil a partir das comunidades yorùbá escravizadas, desenvolveu identidade própria que preserva raízes africanas e cria novas expressões culturais.',
    tipo: 'religiao',
    familia: 'Iorubá',
    regiao: 'Brasil (com raízes em Ketu — Benim/Nigéria)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (iorubá-nagô)',
    tags: ['diaspora', 'brasil', 'yoruba', 'afro-brasileiras'],
  },
  {
    nome: 'EGUNGUN',
    label: 'Culto aos Egunguns',
    descricao:
      'Culto aos ancestrais masculinos (Bàbá Egúngún), originário do império de Oió, na Nigéria. Presente no Brasil desde o século XIX, com casas em Itaparica (Ilê Agboulá, Ilê Axipá) e em Recife. Uma das expressões mais diretas da continuidade cultural yorùbá nas Américas.',
    tipo: 'culto-ancestral',
    familia: 'Iorubá',
    regiao: 'África Ocidental (Oió — Nigéria)',
    continente: 'África',
    paises: ['Nigéria'],
    diaspora: ['Brasil'],
    categoria: 'Culto ancestral iorubá',
    tags: ['africa', 'diaspora', 'brasil', 'yoruba', 'afro-brasileiras'],
  },
  {
    nome: 'XANGO',
    label: 'Xangô',
    descricao:
      'Tradição nagô do Nordeste (Pernambuco e Alagoas), centrada no culto aos Orixás com intensa ritualística e musicalidade. Desenvolveu terminologia e práticas próprias, distinguindo-se de outras tradições iorubás no Brasil.',
    tipo: 'religiao',
    familia: 'Iorubá',
    regiao: 'Brasil (Nordeste)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (nagô)',
    tags: ['diaspora', 'brasil', 'yoruba', 'afro-brasileiras'],
  },
  {
    nome: 'BATUQUE',
    label: 'Batuque',
    descricao:
      'Tradição de matriz iorubá nascida no Sul do Brasil, especialmente no Rio Grande do Sul, com toques, batuques e o culto aos Orixás como eixo central. Expressão singular da diáspora yorùbá no extremo sul do Brasil.',
    tipo: 'religiao',
    familia: 'Iorubá',
    regiao: 'Brasil (Sul)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (iorubá)',
    tags: ['diaspora', 'brasil', 'yoruba', 'afro-brasileiras'],
  },
  {
    nome: 'CANDOMBLE_ANGOLA',
    label: 'Candomblé de Angola',
    descricao:
      'Tradição de raiz banta, com culto aos Inquices (Nkisis) e antepassados, forte presença do ritmo e da cosmologia centro-africana. Preserva terminologia kikongo e kimbundu, distinguindo-se das tradições de nação iorubá.',
    tipo: 'religiao',
    familia: 'Banta',
    regiao: 'Brasil (com raízes em Angola e Congo)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (banta)',
    tags: ['africa', 'diaspora', 'brasil', 'bantu', 'afro-brasileiras'],
  },
  {
    nome: 'OMOLOKO',
    label: 'Omolocô',
    descricao:
      'Tradição do candomblé que articula raízes bantas e iorubás, cultuando Inquices e Orixás em uma só matriz. Reflete a complexidade dos intercâmbios culturais africanos na diáspora brasileira.',
    tipo: 'religiao',
    familia: 'Banta',
    regiao: 'Brasil',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (banta-iorubá)',
    tags: ['diaspora', 'brasil', 'bantu', 'afro-brasileiras'],
  },
  {
    nome: 'CANDOMBLE_JEJE',
    label: 'Candomblé Jeje',
    descricao:
      'Tradição fon-ewé com culto aos Voduns, preservando língua fon, funções (vodunsis) e fundamentos originários do Golfo do Benim. Uma das tradições que melhor preserva a continuidade ritual africana no Brasil.',
    tipo: 'religiao',
    familia: 'Fon-Ewé',
    regiao: 'Brasil (com raízes no Golfo do Benim)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (fon-ewé)',
    tags: ['africa', 'diaspora', 'brasil', 'afro-brasileiras', 'fon-ewe'],
  },
  {
    nome: 'TAMBOR_DE_MINA',
    label: 'Tambor de Mina',
    descricao:
      'Tradição maranhense que integra elementos jejes, nagôs, caboclos e encantados, com destaque para as tocatas e os cultos das Minas. Expressão singular da diáspora africana no Nordeste do Brasil.',
    tipo: 'religiao',
    familia: 'Afro-indígena do Norte',
    regiao: 'Brasil (Maranhão)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (Maranhão)',
    tags: ['diaspora', 'brasil', 'afro-brasileiras', 'fon-ewe'],
  },
  {
    nome: 'ENCANTARIA',
    label: 'Encantaria',
    descricao:
      'Culto aos encantados, integrado ao universo do Tambor de Mina e das tradições amazônicas. Reverencia encantos de água, mata e reinos místicos — expressão de sínteses culturais únicas do Norte do Brasil.',
    tipo: 'espiritualidade',
    familia: 'Afro-indígena do Norte',
    regiao: 'Brasil (Maranhão, Pará e Amazônia)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-indígena',
    tags: ['diaspora', 'brasil', 'afro-brasileiras', 'outras'],
  },
  {
    nome: 'JUREMA',
    label: 'Jurema',
    descricao:
      'Tradição de raízes indígenas do Nordeste que se entrelaçou às matrizes africanas, centrada na planta sagrada da Jurema, nos mestres e nos encantados. Expressão de encontro entre culturas indígenas e africanas no contexto colonial brasileiro.',
    tipo: 'espiritualidade',
    familia: 'Afro-indígena do Nordeste',
    regiao: 'Brasil (Nordeste)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-indígena',
    tags: ['diaspora', 'brasil', 'afro-brasileiras', 'outras'],
  },
  {
    nome: 'CATIMBO',
    label: 'Catimbó',
    descricao:
      'Prática afro-indígena do Nordeste (Rio Grande do Norte e Paraíba), centrada nos mestres, na mesa e na força da herança ancestral indígena e africana.',
    tipo: 'espiritualidade',
    familia: 'Afro-indígena do Nordeste',
    regiao: 'Brasil (Nordeste)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-indígena',
    tags: ['diaspora', 'brasil', 'afro-brasileiras', 'outras'],
  },
  {
    nome: 'UMBANDA',
    label: 'Umbanda',
    descricao:
      'Religião nascida no Brasil no início do século XX, que acolhe matrizes africanas, indígenas e espíritas, com giras, incorporações e caridade como fundamento. Uma criação religiosa genuinamente brasileira, com presença crescente na diáspora.',
    tipo: 'religiao',
    familia: 'Universalista',
    regiao: 'Brasil',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: ['Argentina', 'Uruguai', 'Estados Unidos', 'Portugal'],
    categoria: 'Religião brasileira universalista',
    tags: ['diaspora', 'brasil', 'afro-brasileiras', 'america-latina'],
  },
  {
    nome: 'QUIMBANDA',
    label: 'Quimbanda',
    descricao:
      'Linha de trabalho das tradições afro-brasileiras dedicada aos Exus e Pombagiras, compreendida como caminho de cura, justiça e amparo. Possui história, terminologia e práticas próprias.',
    tipo: 'tradicao',
    familia: 'Universalista',
    regiao: 'Brasil',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: ['Argentina', 'Uruguai'],
    categoria: 'Tradição afro-brasileira',
    tags: ['diaspora', 'brasil', 'bantu', 'afro-brasileiras'],
  },

  // ── TRADIÇÕES DA DIÁSPORA CARIBENHA ──────────────────────────────
  {
    nome: 'SANTERIA',
    label: 'Santería / Regla de Ocha',
    descricao:
      'Tradição afro-cubana de culto aos Orixás (Orishas), nascida no encontro entre o povo yorùbá e o catolicismo em Cuba. Desenvolveu identidade, terminologia e práticas próprias na diáspora cubana, com forte presença nos Estados Unidos, México e América Latina.',
    tipo: 'religiao',
    familia: 'Diáspora Caribenha',
    regiao: 'Caribe (Cuba)',
    continente: 'Caribe',
    paises: ['Cuba'],
    diaspora: ['Estados Unidos', 'México', 'Colômbia', 'Venezuela', 'Europa'],
    categoria: 'Tradição afro-cubana',
    tags: ['diaspora', 'caribe', 'america-latina', 'america-norte', 'europa', 'afro-caribenhas', 'afro-americanas', 'yoruba'],
  },
  {
    nome: 'VODOU',
    label: 'Vodou Haitiano',
    descricao:
      'Tradição religiosa do Haiti formada na síntese criativa entre cultos fon, ewé, iorubá e bantos e o catolicismo. Desenvolveu língua, rituais, música e cosmologia próprias, sendo expressão soberana da identidade haitiana — distinta do Vodun africano continental.',
    tipo: 'religiao',
    familia: 'Diáspora Caribenha',
    regiao: 'Caribe (Haiti)',
    continente: 'Caribe',
    paises: ['Haiti'],
    diaspora: ['Estados Unidos', 'Canadá', 'França', 'República Dominicana'],
    categoria: 'Tradição afro-caribenha (haitiana)',
    tags: ['diaspora', 'caribe', 'america-latina', 'america-norte', 'europa', 'afro-caribenhas', 'afro-americanas', 'fon-ewe'],
  },
  {
    nome: 'PALO',
    label: 'Palo Monte',
    descricao:
      'Tradição afro-cubana de raiz banta (Kongo), centrada no culto aos espíritos da natureza (Nkisi). Preserva terminologia e práticas de origem centro-africana adaptadas ao contexto cubano.',
    tipo: 'religiao',
    familia: 'Diáspora Caribenha',
    regiao: 'Caribe (Cuba)',
    continente: 'Caribe',
    paises: ['Cuba'],
    diaspora: ['Estados Unidos', 'Europa', 'América Latina'],
    categoria: 'Tradição afro-cubana (banta)',
    tags: ['diaspora', 'caribe', 'america-latina', 'europa', 'afro-caribenhas', 'bantu'],
  },
  {
    nome: 'REGLA_DE_OCHA',
    label: 'Regla de Ocha / Santería',
    descricao:
      'Expressão cubana da religiosidade iorubá, também chamada Santería, com culto aos Orichas e à orixá regente (Regla de Ocha). Desenvolveu identidade e organização próprias em Cuba e na diáspora — não é uma simples cópia da tradição yorùbá africana.',
    tipo: 'religiao',
    familia: 'Diáspora Caribenha',
    regiao: 'Caribe (Cuba)',
    continente: 'Caribe',
    paises: ['Cuba'],
    diaspora: ['Estados Unidos', 'México', 'Venezuela', 'Europa'],
    categoria: 'Tradição afro-cubana (iorubá)',
    tags: ['diaspora', 'caribe', 'america-latina', 'america-norte', 'europa', 'afro-caribenhas', 'yoruba'],
  },
  {
    nome: 'ABAKUA',
    label: 'Abakuá',
    descricao:
      'Sociedade secreta afro-cubana originada de associações Ekpe/Efik da região de Calabar (Nigéria/Camarões), adaptada a Cuba no século XIX. Culto ao Leopardo e às divindades ancestrais com rituais iniciáticos fechados — no AxéMap, apenas informações públicas autorizadas.',
    tipo: 'expressao-cultural',
    familia: 'Diáspora Caribenha',
    regiao: 'Caribe (Cuba)',
    continente: 'Caribe',
    paises: ['Cuba'],
    diaspora: ['Estados Unidos', 'Europa'],
    categoria: 'Expressão cultural afro-cubana (Efik/Ekpe)',
    tags: ['diaspora', 'caribe', 'america-latina', 'europa', 'afro-caribenhas', 'outras'],
  },
  {
    nome: 'TERECO',
    label: 'Terecô',
    descricao:
      'Tradição afro-brasileira do Maranhão com forte presença de encantados e influências da Encantaria, do Tambor de Mina e do catolicismo popular. Também chamada de "Tambor da Mata" ou "Linha da Mata", possui terminologia e rituais próprios.',
    tipo: 'religiao',
    familia: 'Afro-indígena do Nordeste',
    regiao: 'Brasil (Maranhão)',
    continente: 'América do Sul',
    paises: ['Brasil'],
    diaspora: [],
    categoria: 'Tradição afro-brasileira (nordeste)',
    tags: ['diaspora', 'brasil', 'afro-brasileiras', 'outras'],
  },

  // ── TRADIÇÕES AFRICANAS CONTINENTAIS ─────────────────────────────
  {
    nome: 'VODUN_DAOME',
    label: 'Vodun (Benim/Togo)',
    descricao:
      'Sistema espiritual e cultural do povo Fon e Ewé, originário do antigo Reino do Daomé (atual Benim). Os Voduns são entidades espirituais que governam forças naturais e aspectos da vida. Tradição africana continental — distinta do Vodou haitiano.',
    tipo: 'tradicao',
    familia: 'Fon-Ewé',
    regiao: 'África Ocidental (Benim, Togo, Gana)',
    continente: 'África',
    paises: ['Benim', 'Togo', 'Gana', 'Nigéria'],
    diaspora: ['Brasil', 'Haiti', 'Cuba'],
    categoria: 'Tradição africana (fon-ewé)',
    tags: ['africa', 'diaspora', 'fon-ewe', 'outras'],
  },
  {
    nome: 'AKAN',
    label: 'Tradições Akan',
    descricao:
      'Conjunto de tradições espirituais e culturais dos povos Akan (Ashanti, Fante, Brong e outros) da África Ocidental (Gana, Costa do Marfim). Inclui o culto aos Abosom (divindades), Stools sagrados, o simbolismo Adinkra, os tecidos Kente e os sistemas filosóficos como o Sankofa.',
    tipo: 'tradicao',
    familia: 'Akan',
    regiao: 'África Ocidental (Gana, Costa do Marfim)',
    continente: 'África',
    paises: ['Gana', 'Costa do Marfim'],
    diaspora: ['Jamaica', 'Estados Unidos', 'Caribe', 'Europa'],
    categoria: 'Tradição africana (Akan)',
    tags: ['africa', 'akan', 'outras'],
  },
  {
    nome: 'KONGO',
    label: 'Tradições Kongo / Bantu',
    descricao:
      'Sistema espiritual e cultural dos povos do Congo (Bakongo, BaKuba e outros), com cultos aos ancestrais (Bakisi), símbolos cosmológicos (Dikenga) e práticas curativas. Influência central nas tradições bantas das Américas — Candomblé Angola, Palo Monte, Quimbanda.',
    tipo: 'tradicao',
    familia: 'Banta',
    regiao: 'África Central (Congo, Angola, Zâmbia)',
    continente: 'África',
    paises: ['República Democrática do Congo', 'Congo', 'Angola'],
    diaspora: ['Brasil', 'Cuba', 'Haiti', 'Estados Unidos'],
    categoria: 'Tradição africana (banta)',
    tags: ['africa', 'bantu', 'diaspora'],
  },
  {
    nome: 'IGBO',
    label: 'Tradições Igbo',
    descricao:
      'Sistema espiritual e cultural do povo Igbo da Nigéria, incluindo o Odinani (religião tradicional), com culto ao Chukwu (divindade suprema), Alusi (divindades menores) e ancestrais. Forte presença histórica na diáspora caribenha e norte-americana.',
    tipo: 'tradicao',
    familia: 'Igbo',
    regiao: 'África Ocidental (Nigéria)',
    continente: 'África',
    paises: ['Nigéria'],
    diaspora: ['Estados Unidos', 'Caribe', 'Europa'],
    categoria: 'Tradição africana (Igbo)',
    tags: ['africa', 'igbo', 'outras'],
  },
];

/** Ordem de exibição das famílias no catálogo */
export const ORDEM_FAMILIAS = [
  'Iorubá',
  'Banta',
  'Fon-Ewé',
  'Akan',
  'Igbo',
  'Afro-indígena do Norte',
  'Afro-indígena do Nordeste',
  'Universalista',
  'Diáspora Caribenha',
];

/** Label amigável por família */
export const LABEL_FAMILIA: Record<string, string> = {
  'Iorubá': 'Iorubá',
  'Banta': 'Banta / Kongo',
  'Fon-Ewé': 'Fon-Ewé',
  'Akan': 'Akan',
  'Igbo': 'Igbo',
  'Afro-indígena do Norte': 'Afro-indígena do Norte',
  'Afro-indígena do Nordeste': 'Afro-indígena do Nordeste',
  'Universalista': 'Universalista',
  'Diáspora Caribenha': 'Diáspora Caribenha',
  'Diáspora': 'Diáspora (todo culto fora da África)',
};

/**
 * Filtros de navegação para o carrossel e buscas.
 * "Diáspora" = todo culto africano praticado fora do continente.
 * NÃO é uma "cópia" — é continuidade, transformação e criação cultural soberana.
 */
export const FILTROS_TRADICOES: Array<{ id: string; label: string; descricao?: string }> = [
  { id: 'todas', label: 'Todas' },
  { id: 'africa', label: 'África (origem)' },
  {
    id: 'diaspora',
    label: 'Diáspora',
    descricao:
      'Todo culto de tradição africana praticado fora do continente africano — nas Américas, no Caribe, na Europa e em todo o mundo. Não uma cópia, mas continuidade, transformação e criação cultural soberana.',
  },
  { id: 'brasil', label: 'Brasil' },
  { id: 'caribe', label: 'Caribe' },
  { id: 'america-latina', label: 'América Latina' },
  { id: 'america-norte', label: 'América do Norte' },
  { id: 'europa', label: 'Europa' },
  { id: 'yoruba', label: 'Yorùbá' },
  { id: 'akan', label: 'Akan' },
  { id: 'fon-ewe', label: 'Fon-Ewé' },
  { id: 'igbo', label: 'Igbo' },
  { id: 'bantu', label: 'Bantu / Kongo' },
  { id: 'outras', label: 'Outras' },
];

export const GRADIENTE_POR_FAMILIA: Record<string, string> = {
  'Iorubá':                  'from-copper to-terracota',
  'Banta':                   'from-verde-floresta to-verde-ancestral',
  'Fon-Ewé':                 'from-areia to-dourado-sol',
  'Akan':                    'from-dourado-sol to-areia',
  'Igbo':                    'from-verde-ancestral to-fern',
  'Afro-indígena do Norte':  'from-turquesa-cinza to-ancestral',
  'Afro-indígena do Nordeste':'from-verde-floresta to-terra',
  'Universalista':           'from-terracota to-dourado-sol',
  'Diáspora Caribenha':      'from-ancestral to-terra',
};

export function labelTradicao(value: string): string {
  const item = TRADICOES_CATALOGO.find((t) => t.nome === value);
  if (item) return item.label;
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function slugTradicao(nome: string): string {
  return nome.toLowerCase().replace(/_/g, '-');
}

export function descricaoTradicao(nome: string): string | undefined {
  return TRADICOES_CATALOGO.find((t) => t.nome === nome)?.descricao;
}

export function tradicoesPorFiltro(filtro: string): TradicaoCatalogo[] {
  if (!filtro || filtro === 'todas') return TRADICOES_CATALOGO;
  return TRADICOES_CATALOGO.filter((t) => t.tags.includes(filtro));
}

/** Filtra por tipo conceitual — sistemas de conhecimento, povos, religiões, etc. */
export function tradicoesPorTipo(tipo: TipoConceitual): TradicaoCatalogo[] {
  return TRADICOES_CATALOGO.filter((t) => t.tipo === tipo);
}
