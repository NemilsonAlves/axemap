import { PrismaClient, RegiaoTipo } from '@prisma/client';

const prisma = new PrismaClient();

const TRADICOES_POR_ESTADO: Record<string, string[]> = {
  acre: ['UMBANDA', 'CANDOMBLE_ANGOLA', 'JUREMA'],
  alagoas: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA'],
  amapa: ['UMBANDA', 'CANDOMBLE_ANGOLA'],
  amazonas: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'JUREMA'],
  bahia: ['CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'IFA', 'EGUNGUN', 'UMBANDA'],
  ceara: ['CATIMBO', 'JUREMA', 'UMBANDA'],
  'distrito-federal': ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  'espirito-santo': ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  goias: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  maranhao: ['TAMBOR_DE_MINA', 'ENCANTARIA', 'CATIMBO', 'UMBANDA'],
  'mato-grosso': ['UMBANDA', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  'mato-grosso-do-sul': ['UMBANDA', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  'minas-gerais': ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  para: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA'],
  paraiba: ['CATIMBO', 'JUREMA', 'UMBANDA'],
  parana: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  pernambuco: ['JUREMA', 'CATIMBO', 'UMBANDA', 'EGUNGUN'],
  piaui: ['CATIMBO', 'JUREMA', 'UMBANDA'],
  'rio-de-janeiro': ['UMBANDA', 'CANDOMBLE_KETU', 'OMOLOKO', 'QUIMBANDA'],
  'rio-grande-do-norte': ['CATIMBO', 'JUREMA', 'UMBANDA'],
  'rio-grande-do-sul': ['BATUQUE', 'UMBANDA', 'QUIMBANDA'],
  rondonia: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA'],
  roraima: ['UMBANDA', 'CANDOMBLE_ANGOLA'],
  'santa-catarina': ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA'],
  'sao-paulo': ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'QUIMBANDA', 'IFA'],
  sergipe: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA'],
  tocantins: ['UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'JUREMA'],
};

const CONTINENTES: { slug: string; nome: string }[] = [
  { slug: 'africa', nome: 'África' },
  { slug: 'americas', nome: 'Américas' },
  { slug: 'europa', nome: 'Europa' },
  { slug: 'asia', nome: 'Ásia' },
  { slug: 'oceania', nome: 'Oceania' },
];

const PAISES: { slug: string; nome: string; continente: string }[] = [
  { slug: 'nigeria', nome: 'Nigéria', continente: 'africa' },
  { slug: 'benim', nome: 'Benim', continente: 'africa' },
  { slug: 'brasil', nome: 'Brasil', continente: 'americas' },
  { slug: 'cuba', nome: 'Cuba', continente: 'americas' },
  { slug: 'haiti', nome: 'Haiti', continente: 'americas' },
  { slug: 'estados-unidos', nome: 'Estados Unidos', continente: 'americas' },
  { slug: 'portugal', nome: 'Portugal', continente: 'europa' },
];

const REGIOES_BRASIL: { slug: string; nome: string; territorios: { slug: string; nome: string }[] }[] = [
  {
    slug: 'norte',
    nome: 'Norte',
    territorios: [
      { slug: 'acre', nome: 'Acre' },
      { slug: 'amapa', nome: 'Amapá' },
      { slug: 'amazonas', nome: 'Amazonas' },
      { slug: 'para', nome: 'Pará' },
      { slug: 'rondonia', nome: 'Rondônia' },
      { slug: 'roraima', nome: 'Roraima' },
      { slug: 'tocantins', nome: 'Tocantins' },
    ],
  },
  {
    slug: 'nordeste',
    nome: 'Nordeste',
    territorios: [
      { slug: 'alagoas', nome: 'Alagoas' },
      { slug: 'bahia', nome: 'Bahia' },
      { slug: 'ceara', nome: 'Ceará' },
      { slug: 'maranhao', nome: 'Maranhão' },
      { slug: 'paraiba', nome: 'Paraíba' },
      { slug: 'pernambuco', nome: 'Pernambuco' },
      { slug: 'piaui', nome: 'Piauí' },
      { slug: 'rio-grande-do-norte', nome: 'Rio Grande do Norte' },
      { slug: 'sergipe', nome: 'Sergipe' },
    ],
  },
  {
    slug: 'centro-oeste',
    nome: 'Centro-Oeste',
    territorios: [
      { slug: 'distrito-federal', nome: 'Distrito Federal' },
      { slug: 'goias', nome: 'Goiás' },
      { slug: 'mato-grosso', nome: 'Mato Grosso' },
      { slug: 'mato-grosso-do-sul', nome: 'Mato Grosso do Sul' },
    ],
  },
  {
    slug: 'sudeste',
    nome: 'Sudeste',
    territorios: [
      { slug: 'espirito-santo', nome: 'Espírito Santo' },
      { slug: 'minas-gerais', nome: 'Minas Gerais' },
      { slug: 'rio-de-janeiro', nome: 'Rio de Janeiro' },
      { slug: 'sao-paulo', nome: 'São Paulo' },
    ],
  },
  {
    slug: 'sul',
    nome: 'Sul',
    territorios: [
      { slug: 'parana', nome: 'Paraná' },
      { slug: 'rio-grande-do-sul', nome: 'Rio Grande do Sul' },
      { slug: 'santa-catarina', nome: 'Santa Catarina' },
    ],
  },
];

async function upsertRegiao(
  slug: string,
  nome: string,
  tipo: RegiaoTipo,
  ordenacao: number,
  parentSlug: string | undefined,
  ids: Record<string, string>,
) {
  const regiao = await prisma.regioes.upsert({
    where: { slug },
    create: {
      slug,
      nome,
      tipo,
      ordenacao,
      isPublished: true,
      ...(parentSlug ? { parent: { connect: { id: ids[parentSlug] } } } : {}),
    },
    update: { nome, tipo, ordenacao, isPublished: true },
  });
  ids[slug] = regiao.id;
  return regiao;
}

async function main() {
  console.log('🌍 Seed de taxonomia (regiões e tradições)...');

  const ids: Record<string, string> = {};

  let totalRegioes = 0;
  let totalTradicoes = 0;

  for (const [i, c] of CONTINENTES.entries()) {
    await upsertRegiao(c.slug, c.nome, RegiaoTipo.CONTINENTE, i + 1, undefined, ids);
    totalRegioes++;
  }

  for (const [i, p] of PAISES.entries()) {
    await upsertRegiao(p.slug, p.nome, RegiaoTipo.PAIS, i + 1, p.continente, ids);
    totalRegioes++;
  }

  for (const [i, r] of REGIOES_BRASIL.entries()) {
    await upsertRegiao(r.slug, r.nome, RegiaoTipo.REGIAO, i + 1, 'brasil', ids);
    totalRegioes++;

    for (const [j, t] of r.territorios.entries()) {
      await upsertRegiao(t.slug, t.nome, RegiaoTipo.TERRITORIO, j + 1, r.slug, ids);
      totalRegioes++;

      const tradicoes = TRADICOES_POR_ESTADO[t.slug] ?? [];
      if (tradicoes.length === 0) continue;

      const result = await prisma.regiaoTradicoes.createMany({
        data: tradicoes.map((tradicao) => ({ regiaoId: ids[t.slug], tradicao })),
        skipDuplicates: true,
      });
      totalTradicoes += result.count;
    }
  }

  console.log(`  ✓ ${totalRegioes} regiões asseguradas`);
  console.log(`  ✓ ${totalTradicoes} relações de tradição criadas/adicionadas`);
}

main()
  .catch((e) => {
    console.error('❌ Seed de taxonomia falhou:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());