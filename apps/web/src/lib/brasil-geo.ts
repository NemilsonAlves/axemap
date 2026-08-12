/**
 * Lista estática de estados brasileiros (UF) e suas cidades.
 * Fonte: IBGE — municípios mais relevantes por estado.
 * Para produção, usar a API IBGE: https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios
 */

export interface Estado {
  uf: string;
  nome: string;
}

export const ESTADOS_BR: Estado[] = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'TO', nome: 'Tocantins' },
];

/** Busca cidades via API IBGE (runtime, sem bundle pesado). */
export async function fetchCidadesPorEstado(uf: string): Promise<string[]> {
  if (!uf) return [];
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      { cache: 'force-cache' },
    );
    if (!res.ok) throw new Error('IBGE unavailable');
    const data: Array<{ nome: string }> = await res.json();
    return data.map((m) => m.nome);
  } catch {
    return CIDADES_FALLBACK[uf] ?? [];
  }
}

/**
 * Fallback offline com as principais cidades de cada estado.
 * Usado apenas se a API IBGE estiver indisponível.
 */
export const CIDADES_FALLBACK: Record<string, string[]> = {
  AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
  AL: ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'União dos Palmares', 'Penedo'],
  AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari'],
  AP: ['Macapá', 'Santana', 'Laranjal do Jari'],
  BA: [
    'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna',
    'Juazeiro', 'Ilhéus', 'Lauro de Freitas', 'Jequié', 'Teixeira de Freitas',
    'Santo Antônio de Jesus', 'Alagoinhas', 'Barreiras', 'Porto Seguro', 'Simões Filho',
  ],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca'],
  DF: ['Brasília', 'Ceilândia', 'Taguatinga', 'Samambaia', 'Gama', 'Planaltina'],
  ES: ['Vitória', 'Serra', 'Vila Velha', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares', 'São Mateus'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás'],
  MA: ['São Luís', 'Imperatriz', 'Caxias', 'Timon', 'Codó', 'Bacabal', 'Açailândia'],
  MG: [
    'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim',
    'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga',
    'Sete Lagoas', 'Divinópolis', 'Santa Luzia', 'Ibirité', 'Coronel Fabriciano',
  ],
  MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Grande Dourados'],
  MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
  PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal', 'Parauapebas', 'Altamira'],
  PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux', 'Sousa'],
  PE: ['Recife', 'Caruaru', 'Olinda', 'Petrolina', 'Paulista', 'Jaboatão dos Guararapes', 'Garanhuns'],
  PI: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Campo Maior'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo'],
  RJ: [
    'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói',
    'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda',
    'Mesquita', 'Nilópolis', 'Magé', 'Angra dos Reis', 'Macaé',
  ],
  RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Caicó'],
  RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
  RR: ['Boa Vista', 'Rorainópolis', 'Caracaraí'],
  RS: [
    'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria',
    'Gravataí', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande', 'Alvorada',
    'Passo Fundo', 'Sapucaia do Sul', 'Uruguaiana', 'Cachoeirinha', 'Viamão',
  ],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages'],
  SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão'],
  SP: [
    'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
    'São José dos Campos', 'Ribeirão Preto', 'Osasco', 'Sorocaba', 'Mauá',
    'Santos', 'São José do Rio Preto', 'Mogi das Cruzes', 'Betim', 'Jundiaí',
    'Piracicaba', 'Carapicuíba', 'Bauru', 'Itaquaquecetuba', 'Franca',
    'São Vicente', 'Guarujá', 'Taubaté', 'Limeira', 'Praia Grande',
  ],
  TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins'],
};
