import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { generateSlug } from '@axemap/shared';

const terreiroBasico = {
  id: true, nome: true, slug: true, tradicao: true,
  trustScore: true, isVerified: true, cidade: true, estado: true,
  latitude: true, longitude: true, descricaoCurta: true,
  fotoUrl: true, whatsapp: true, instagram: true,
  acessibilidade: true, estacionamento: true,
  publicadoEm: true,
} as const;

const NOME_TRADICOES: Record<string, string> = {
  IFA: 'Ifá',
  CANDOMBLE_KETU: 'Candomblé de Ketu',
  EGUNGUN: 'Culto aos Egunguns',
  XANGO: 'Xangô',
  BATUQUE: 'Batuque',
  CANDOMBLE_ANGOLA: 'Candomblé de Angola',
  OMOLOKO: 'Omolocô',
  CANDOMBLE_JEJE: 'Candomblé Jeje',
  TAMBOR_DE_MINA: 'Tambor de Mina',
  ENCANTARIA: 'Encantaria',
  JUREMA: 'Jurema',
  CATIMBO: 'Catimbó',
  UMBANDA: 'Umbanda',
  QUIMBANDA: 'Quimbanda',
  SANTERIA: 'Santería / Regla de Ocha',
  VODOU: 'Vodou Haitiano',
  PALO: 'Palo Monte',
  REGLA_DE_OCHA: 'Regla de Ocha / Santería',
  ABAKUA: 'Abakuá',
  TERECO: 'Terecô',
};

const DESCRICOES_TRADICOES: Record<string, string> = {
  IFA: 'Ifaísmo: religião tradicional iorubá e sistema oracular dos 256 Odù, reconhecido pela UNESCO como patrimônio imaterial da humanidade. Filosofia, teologia e cosmologia transmitidas pelos babalaôs (Awo).',
  CANDOMBLE_KETU: 'Nação iorubá-nagô com culto aos Orixás e forte preservação da língua e dos cantos rituais.',
  EGUNGUN: 'Culto aos ancestrais masculinos (Bàbá Egúngún), originário do império de Oió, na Nigéria. Presente no Brasil desde o século XIX, com casas em Itaparica (Ilê Agboulá, Ilê Axipá) e em Recife (egbé Bàbá Oba Èrín).',
  XANGO: 'Tradição nagô do Nordeste (Pernambuco e Alagoas), centrada no culto aos Orixás com intensa ritualística e musicalidade.',
  BATUQUE: 'Tradição de matriz iorubá nascida no Sul do Brasil, especialmente no Rio Grande do Sul, com toques, batuques e o culto aos Orixás como eixo central.',
  CANDOMBLE_ANGOLA: 'Raiz banta, com culto aos Inquices, Nkisis e antepassados, forte presença do ritmo e da cosmologia centro-africana.',
  OMOLOKO: 'Nação do candomblé que articula raízes bantas e iorubás, cultuando Inquices e Orixás em uma só matriz.',
  CANDOMBLE_JEJE: 'Tradição fon-ewé com culto aos Voduns, preservando língua, funções e fundamentos originários do Golfo do Benim.',
  TAMBOR_DE_MINA: 'Tradição maranhense que integra elementos jejes, nagôs, caboclos e encantados, com destaque para as tocatas e os cultos das Minas.',
  ENCANTARIA: 'Culto aos encantados, integrado ao universo do Tambor de Mina e das tradições amazônicas, que reverencia encantos de água, mata e reinos místicos.',
  JUREMA: 'Tradição de raízes indígenas do Nordeste que se entrelaçou às matrizes africanas, centrada na planta sagrada da Jurema, nos mestres e nos encantados.',
  CATIMBO: 'Prática afro-indígena do Nordeste (Rio Grande do Norte e Paraíba), irmã da Jurema, centrada nos mestres, na mesa e na força da herança ancestral.',
  UMBANDA: 'Religião brasileira que acolhe matrizes africanas, indígenas e espíritas, com giras, incorporações e caridade como fundamento.',
  QUIMBANDA: 'Linha de trabalho das tradições afro-brasileiras dedicada aos Exus e Pombagiras, compreendida como caminho de cura, justiça e amparo.',
  SANTERIA: 'Tradição afro-cubana de culto aos Orixás (Orishas), nascida no encontro entre o povo yorùbá e o catolicismo em Cuba, com forte presença na diáspora cubana.',
  VODOU: 'Tradição do Haiti formada na síntese entre cultos fon, ewé, iorubá e bantos e o catolicismo, presente na diáspora haitiana em vários territórios.',
  PALO: 'Tradição afro-cubana de raiz banta (Kongo), centrada no culto aos espíritos da natureza (Nkisi), presente na diáspora cubana.',
  REGLA_DE_OCHA: 'Expressão cubana da religiosidade iorubá com culto aos Orichas, também chamada Santería, com identidade e organização próprias em Cuba e na diáspora.',
  ABAKUA: 'Sociedade secreta afro-cubana originada das associações Ekpe/Efik de Calabar, adaptada a Cuba desde o século XIX. No AxéMap, apenas informações públicas autorizadas.',
  TERECO: 'Tradição afro-brasileira do Maranhão, também chamada Tambor da Mata, com forte presença de encantados e influências do Tambor de Mina e do catolicismo popular.',
};

const ESTADOS_BR: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
  GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
  SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
};

export interface FAQ { pergunta: string; resposta: string }
export interface CriterioSEO { nome: string; passou: boolean; mensagem: string }

@Injectable()
export class LandingService {
  constructor(private prisma: PrismaService) {}

  async landingEstado(uf: string) {
    const estado = uf.toUpperCase();
    const [
      terreiros, stats, tradicoes, cidades,
      totalEventos, totalCursos, totalAcoesSociais,
      statsAvaliacoes, totalDirigentes, evolucaoCadastros,
      cidadesVizinhas,
    ] = await Promise.all([
      this.prisma.terreiros.findMany({
        where: { estado, deletedAt: null, isPublished: true },
        orderBy: { trustScore: 'desc' },
        take: 50, select: terreiroBasico,
      }),
      this.prisma.terreiros.aggregate({
        where: { estado, deletedAt: null, isPublished: true },
        _count: true, _avg: { trustScore: true },
      }),
      this.prisma.$queryRaw<Array<{ tradicao: string; count: bigint }>>`
        SELECT tradicao, COUNT(*) as count
        FROM terreiros WHERE estado = ${estado}
          AND deleted_at IS NULL AND is_published = true
        GROUP BY tradicao ORDER BY count DESC
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; count: bigint }>>`
        SELECT cidade, COUNT(*) as count
        FROM terreiros WHERE estado = ${estado}
          AND deleted_at IS NULL AND is_published = true
        GROUP BY cidade ORDER BY count DESC
      `,
      this.prisma.eventos.count({
        where: { dataInicio: { gte: new Date() }, terreiro: { estado, deletedAt: null, isPublished: true } },
      }),
      this.prisma.cursos.count({
        where: { terreiro: { estado, deletedAt: null, isPublished: true } },
      }),
      this.prisma.acoesSociais.count({
        where: { terreiro: { estado, deletedAt: null, isPublished: true } },
      }),
      this.prisma.avaliacoes.aggregate({
        where: { terreiro: { estado, deletedAt: null, isPublished: true } },
        _count: true, _avg: { nota: true },
      }),
      this.prisma.usuarios.count({
        where: {
          dirigenteDe: { some: { estado, deletedAt: null, isPublished: true } },
        },
      }),
      this.prisma.$queryRaw<Array<{ mes: string; count: bigint }>>`
        SELECT TO_CHAR(publicado_em, 'YYYY-MM') as mes, COUNT(*) as count
        FROM terreiros WHERE estado = ${estado}
          AND deleted_at IS NULL AND is_published = true
        GROUP BY mes ORDER BY mes ASC
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; count: bigint }>>`
        SELECT cidade, COUNT(*) as count
        FROM terreiros WHERE estado = ${estado}
          AND deleted_at IS NULL AND is_published = true
          AND cidade NOT IN (
            SELECT cidade FROM terreiros WHERE estado = ${estado}
            GROUP BY cidade ORDER BY COUNT(*) DESC LIMIT 1
          )
        GROUP BY cidade ORDER BY count DESC LIMIT 5
      `,
    ]);

    const totalVerificados = terreiros.filter(t => t.isVerified).length;
    const ufNome = ESTADOS_BR[estado] || estado;
    const dados = {
      estado: { uf: estado, nome: ufNome },
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      tradicoes: tradicoes.map(t => ({ nome: t.tradicao, count: Number(t.count), label: NOME_TRADICOES[t.tradicao] || t.tradicao })),
      cidades: cidades.map(c => ({
        nome: c.cidade, count: Number(c.count),
        slug: this.toSlug(`${c.cidade}-${estado.toLowerCase()}`),
      })),
      terreiros,
    };

    const tradicoesNum = tradicoes.map(t => ({ tradicao: t.tradicao, count: Number(t.count) }));

    const estatisticas = {
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      totalAvaliacoes: statsAvaliacoes._count,
      mediaAvaliacoes: Number(statsAvaliacoes._avg.nota?.toFixed(1) || 0),
      totalEventos,
      totalCursos,
      totalAcoesSociais,
      totalDirigentes,
      evolucaoCadastros: evolucaoCadastros.map(e => ({ mes: e.mes, count: Number(e.count) })),
      distribuicaoTradicoes: tradicoes.map(t => ({ nome: t.tradicao, label: NOME_TRADICOES[t.tradicao] || t.tradicao, count: Number(t.count) })),
    };

    return {
      ...dados,
      estatisticas,
      panorama: this.gerarPanoramaEstado(ufNome, estado, stats._count, totalVerificados, tradicoesNum),
      perfilComunidade: this.gerarPerfilComunidade(stats._count, totalVerificados, totalDirigentes),
      faqs: this.gerarFAQsEstado(ufNome, estado, stats._count, totalVerificados, tradicoesNum, totalEventos, totalCursos),
      discovery: {
        cidadesVizinhas: cidadesVizinhas.map(c => ({
          nome: c.cidade, count: Number(c.count),
          slug: this.toSlug(`${c.cidade}-${estado.toLowerCase()}`),
        })),
      },
      seo: this.validarQualidade({ totalTerreiro: stats._count, totalVerificados, totalEventos, totalCursos, totalAvaliacoes: statsAvaliacoes._count, temConteudoEditorial: true, diversidadeTradicoes: tradicoes.length }),
    };
  }

  async landingCidade(cidadeSlug: string) {
    const partes = cidadeSlug.split('-');
    const uf = partes[partes.length - 1].toUpperCase();
    const nomeCidade = partes.slice(0, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase());

    const [terreiros, stats, tradicoes, totalEventos, totalCursos, totalAcoesSociais, statsAvaliacoes, totalDirigentes, evolucaoCadastros, cidadesVizinhas] = await Promise.all([
      this.prisma.terreiros.findMany({
        where: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true },
        orderBy: { trustScore: 'desc' },
        take: 50, select: terreiroBasico,
      }),
      this.prisma.terreiros.aggregate({
        where: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true },
        _count: true, _avg: { trustScore: true },
      }),
      this.prisma.$queryRaw<Array<{ tradicao: string; count: bigint }>>`
        SELECT tradicao, COUNT(*) as count
        FROM terreiros WHERE cidade = ${nomeCidade}
          AND estado = ${uf} AND deleted_at IS NULL AND is_published = true
        GROUP BY tradicao ORDER BY count DESC
      `,
      this.prisma.eventos.count({
        where: { dataInicio: { gte: new Date() }, terreiro: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true } },
      }),
      this.prisma.cursos.count({
        where: { terreiro: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true } },
      }),
      this.prisma.acoesSociais.count({
        where: { terreiro: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true } },
      }),
      this.prisma.avaliacoes.aggregate({
        where: { terreiro: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true } },
        _count: true, _avg: { nota: true },
      }),
      this.prisma.usuarios.count({
        where: { dirigenteDe: { some: { cidade: nomeCidade, estado: uf, deletedAt: null, isPublished: true } } },
      }),
      this.prisma.$queryRaw<Array<{ mes: string; count: bigint }>>`
        SELECT TO_CHAR(publicado_em, 'YYYY-MM') as mes, COUNT(*) as count
        FROM terreiros WHERE cidade = ${nomeCidade}
          AND estado = ${uf} AND deleted_at IS NULL AND is_published = true
        GROUP BY mes ORDER BY mes ASC
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; estado: string; count: bigint; dist: number }>>`
        SELECT v.cidade, v.estado, COUNT(*) as count,
          ST_DistanceSphere(
            (SELECT ST_Centroid(ST_Collect(geo_point::geometry)) FROM terreiros WHERE cidade = ${nomeCidade} AND estado = ${uf} AND deleted_at IS NULL AND is_published = true),
            ST_Centroid(ST_Collect(v.geo_point::geometry))
          ) / 1000 as dist
        FROM terreiros v
        WHERE v.estado = ${uf}
          AND v.cidade != ${nomeCidade}
          AND v.deleted_at IS NULL AND v.is_published = true
        GROUP BY v.cidade, v.estado
        ORDER BY dist ASC
        LIMIT 5
      `,
    ]);

    const totalVerificados = terreiros.filter(t => t.isVerified).length;
    const ufNome = ESTADOS_BR[uf] || uf;
    const tradicoesNum = tradicoes.map(t => ({ tradicao: t.tradicao, count: Number(t.count) }));
    const dados = {
      cidade: { nome: nomeCidade, uf, ufNome, slug: cidadeSlug },
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      tradicoes: tradicoesNum.map(t => ({ nome: t.tradicao, count: t.count, label: NOME_TRADICOES[t.tradicao] || t.tradicao })),
      terreiros,
    };

    const estatisticas = {
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      totalAvaliacoes: statsAvaliacoes._count,
      mediaAvaliacoes: Number(statsAvaliacoes._avg.nota?.toFixed(1) || 0),
      totalEventos,
      totalCursos,
      totalAcoesSociais,
      totalDirigentes,
      evolucaoCadastros: evolucaoCadastros.map(e => ({ mes: e.mes, count: Number(e.count) })),
      distribuicaoTradicoes: tradicoes.map(t => ({ nome: t.tradicao, label: NOME_TRADICOES[t.tradicao] || t.tradicao, count: Number(t.count) })),
    };

    return {
      ...dados,
      estatisticas,
      panorama: this.gerarPanoramaCidade(nomeCidade, ufNome, stats._count, totalVerificados, tradicoesNum),
      perfilComunidade: this.gerarPerfilComunidade(stats._count, totalVerificados, totalDirigentes),
      faqs: this.gerarFAQsCidade(nomeCidade, stats._count, totalVerificados, tradicoesNum, totalEventos, totalCursos),
      discovery: {
        cidadesVizinhas: cidadesVizinhas.map(c => ({
          nome: c.cidade, count: Number(c.count),
          distanciaKm: Math.round(c.dist),
          slug: this.toSlug(`${c.cidade}-${c.estado.toLowerCase()}`),
        })),
      },
      seo: this.validarQualidade({ totalTerreiro: stats._count, totalVerificados, totalEventos, totalCursos, totalAvaliacoes: statsAvaliacoes._count, temConteudoEditorial: true, diversidadeTradicoes: tradicoes.length }),
    };
  }

  async landingTradicao(tradicao: string) {
    const nomeTradicao = tradicao.toUpperCase().replace(/-/g, '_');
    const labelTradicao = NOME_TRADICOES[nomeTradicao] || nomeTradicao;

    const [terreiros, stats, estados, cidades, totalEventos, totalCursos, statsAvaliacoes, evolucaoCadastros] = await Promise.all([
      this.prisma.terreiros.findMany({
        where: { tradicao: nomeTradicao, deletedAt: null, isPublished: true },
        orderBy: { trustScore: 'desc' },
        take: 50, select: terreiroBasico,
      }),
      this.prisma.terreiros.aggregate({
        where: { tradicao: nomeTradicao, deletedAt: null, isPublished: true },
        _count: true, _avg: { trustScore: true },
      }),
      this.prisma.$queryRaw<Array<{ estado: string; count: bigint }>>`
        SELECT estado, COUNT(*) as count
        FROM terreiros WHERE tradicao = ${nomeTradicao}
          AND deleted_at IS NULL AND is_published = true
        GROUP BY estado ORDER BY count DESC
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; estado: string; count: bigint }>>`
        SELECT cidade, estado, COUNT(*) as count
        FROM terreiros WHERE tradicao = ${nomeTradicao}
          AND deleted_at IS NULL AND is_published = true
        GROUP BY cidade, estado ORDER BY count DESC LIMIT 20
      `,
      this.prisma.eventos.count({
        where: { dataInicio: { gte: new Date() }, terreiro: { tradicao: nomeTradicao, deletedAt: null, isPublished: true } },
      }),
      this.prisma.cursos.count({
        where: { terreiro: { tradicao: nomeTradicao, deletedAt: null, isPublished: true } },
      }),
      this.prisma.avaliacoes.aggregate({
        where: { terreiro: { tradicao: nomeTradicao, deletedAt: null, isPublished: true } },
        _count: true, _avg: { nota: true },
      }),
      this.prisma.$queryRaw<Array<{ mes: string; count: bigint }>>`
        SELECT TO_CHAR(publicado_em, 'YYYY-MM') as mes, COUNT(*) as count
        FROM terreiros WHERE tradicao = ${nomeTradicao}
          AND deleted_at IS NULL AND is_published = true
        GROUP BY mes ORDER BY mes ASC
      `,
    ]);

    const totalVerificados = terreiros.filter(t => t.isVerified).length;
    const estadosNum = estados.map(e => ({ estado: e.estado, count: Number(e.count) }));
    const outrasTradicoes = Object.entries(NOME_TRADICOES)
      .filter(([key]) => key !== nomeTradicao)
      .map(([key, label]) => ({ nome: key, label, slug: key.toLowerCase().replace(/_/g, '-') }));

    const dados = {
      tradicao: { nome: nomeTradicao, label: labelTradicao, slug: tradicao, descricao: DESCRICOES_TRADICOES[nomeTradicao] || '' },
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      estados: estados.map(e => ({ uf: e.estado, nome: ESTADOS_BR[e.estado] || e.estado, count: Number(e.count) })),
      cidades: cidades.map(c => ({
        nome: c.cidade, uf: c.estado, count: Number(c.count),
        slug: this.toSlug(`${c.cidade}-${c.estado.toLowerCase()}`),
      })),
      terreiros,
    };

    const estatisticas = {
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      totalAvaliacoes: statsAvaliacoes._count,
      mediaAvaliacoes: Number(statsAvaliacoes._avg.nota?.toFixed(1) || 0),
      totalEventos,
      totalCursos,
      totalAcoesSociais: 0,
      totalDirigentes: 0,
      evolucaoCadastros: evolucaoCadastros.map(e => ({ mes: e.mes, count: Number(e.count) })),
      distribuicaoTradicoes: [{ nome: nomeTradicao, label: labelTradicao, count: stats._count }],
    };

    return {
      ...dados,
      estatisticas,
      panorama: this.gerarPanoramaTradicao(labelTradicao, stats._count, estadosNum),
      perfilComunidade: this.gerarPerfilComunidade(stats._count, totalVerificados, 0),
      faqs: this.gerarFAQsTradicao(labelTradicao, stats._count, totalVerificados, estadosNum),
      discovery: {
        tradicoesRelacionadas: outrasTradicoes,
        estados: estadosNum,
      },
      seo: this.validarQualidade({ totalTerreiro: stats._count, totalVerificados, totalEventos, totalCursos, totalAvaliacoes: statsAvaliacoes._count, temConteudoEditorial: true, diversidadeTradicoes: 1 }),
    };
  }

  async landingCidadeTradicao(cidadeSlug: string, tradicao: string) {
    const partes = cidadeSlug.split('-');
    const uf = partes[partes.length - 1].toUpperCase();
    const nomeCidade = partes.slice(0, -1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
    const nomeTradicao = tradicao.toUpperCase().replace(/-/g, '_');
    const labelTradicao = NOME_TRADICOES[nomeTradicao] || nomeTradicao;

    const [terreiros, stats, statsAvaliacoes, totalEventos, totalCursos] = await Promise.all([
      this.prisma.terreiros.findMany({
        where: { cidade: nomeCidade, estado: uf, tradicao: nomeTradicao, deletedAt: null, isPublished: true },
        orderBy: { trustScore: 'desc' },
        take: 50, select: terreiroBasico,
      }),
      this.prisma.terreiros.aggregate({
        where: { cidade: nomeCidade, estado: uf, tradicao: nomeTradicao, deletedAt: null, isPublished: true },
        _count: true, _avg: { trustScore: true },
      }),
      this.prisma.avaliacoes.aggregate({
        where: { terreiro: { cidade: nomeCidade, estado: uf, tradicao: nomeTradicao, deletedAt: null, isPublished: true } },
        _count: true, _avg: { nota: true },
      }),
      this.prisma.eventos.count({
        where: { dataInicio: { gte: new Date() }, terreiro: { cidade: nomeCidade, estado: uf, tradicao: nomeTradicao, deletedAt: null, isPublished: true } },
      }),
      this.prisma.cursos.count({
        where: { terreiro: { cidade: nomeCidade, estado: uf, tradicao: nomeTradicao, deletedAt: null, isPublished: true } },
      }),
    ]);

    const totalVerificados = terreiros.filter(t => t.isVerified).length;

    return {
      cidade: { nome: nomeCidade, uf, slug: cidadeSlug },
      tradicao: { nome: nomeTradicao, label: labelTradicao, slug: tradicao },
      totalTerreiro: stats._count,
      totalVerificados,
      trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
      terreiros,
      estatisticas: {
        totalTerreiro: stats._count,
        totalVerificados,
        trustScoreMedio: Number(stats._avg.trustScore?.toFixed(1) || 0),
        totalAvaliacoes: statsAvaliacoes._count,
        mediaAvaliacoes: Number(statsAvaliacoes._avg.nota?.toFixed(1) || 0),
        totalEventos,
        totalCursos,
      },
      panorama: `${nomeCidade} conta com ${stats._count} terreiro${stats._count !== 1 ? 's' : ''} de ${labelTradicao} cadastrado${stats._count !== 1 ? 's' : ''} no AxéMap${totalVerificados > 0 ? `, sendo ${totalVerificados} verificado${totalVerificados !== 1 ? 's' : ''}` : ''}.`,
      faqs: [
        { pergunta: `Quantos terreiros de ${labelTradicao} existem em ${nomeCidade}?`, resposta: `Atualmente existem ${stats._count} terreiro${stats._count !== 1 ? 's' : ''} de ${labelTradicao} cadastrado${stats._count !== 1 ? 's' : ''} no AxéMap em ${nomeCidade}.` },
        { pergunta: `Onde encontrar terreiros de ${labelTradicao} em ${nomeCidade}?`, resposta: `Utilize o mapa interativo do AxéMap ou a lista abaixo para explorar os terreiros de ${labelTradicao} em ${nomeCidade}.` },
      ],
      seo: this.validarQualidade({ totalTerreiro: stats._count, totalVerificados, totalEventos, totalCursos, totalAvaliacoes: statsAvaliacoes._count, temConteudoEditorial: true, diversidadeTradicoes: 1 }),
    };
  }

  async eventos(local?: string) {
    const where: any = { deletedAt: null, dataInicio: { gte: new Date() } };
    if (local) {
      const uf = local.split('-').pop()?.toUpperCase();
      where.terreiro = { estado: uf, deletedAt: null, isPublished: true };
    }

    const [eventos, total, porTipo] = await Promise.all([
      this.prisma.eventos.findMany({
        where,
        orderBy: { dataInicio: 'asc' },
        take: 50,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true, tradicao: true } },
        },
      }),
      this.prisma.eventos.count({ where }),
      this.prisma.$queryRaw<Array<{ tipo: string; count: bigint }>>`
        SELECT tipo, COUNT(*) as count FROM eventos
        WHERE deleted_at IS NULL AND data_inicio >= NOW()
        GROUP BY tipo ORDER BY count DESC
      `,
    ]);

    return { eventos, total, porTipo: porTipo.map(t => ({ tipo: t.tipo, count: Number(t.count) })) };
  }

  async cursos(tradicao?: string) {
    const where: any = { deletedAt: null };
    if (tradicao) {
      const nomeTradicao = tradicao.toUpperCase().replace(/-/g, '_');
      where.terreiro = { tradicao: nomeTradicao, deletedAt: null, isPublished: true };
    }

    const [cursos, porModalidade] = await Promise.all([
      this.prisma.cursos.findMany({
        where,
        take: 50,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true, tradicao: true } },
        },
      }),
      this.prisma.$queryRaw<Array<{ modalidade: string; count: bigint }>>`
        SELECT modalidade, COUNT(*) as count FROM cursos
        WHERE deleted_at IS NULL GROUP BY modalidade ORDER BY count DESC
      `,
    ]);

    return { cursos, total: cursos.length, porModalidade: porModalidade.map(m => ({ modalidade: m.modalidade, count: Number(m.count) })) };
  }

  async acoesSociais() {
    const [acoes, porTipo] = await Promise.all([
      this.prisma.acoesSociais.findMany({
        where: { deletedAt: null },
        take: 50,
        include: {
          terreiro: { select: { id: true, nome: true, slug: true, cidade: true, estado: true } },
        },
      }),
      this.prisma.$queryRaw<Array<{ tipo: string; count: bigint }>>`
        SELECT tipo, COUNT(*) as count FROM acoes_sociais
        WHERE deleted_at IS NULL GROUP BY tipo ORDER BY count DESC
      `,
    ]);

    return { acoes, total: acoes.length, porTipo: porTipo.map(t => ({ tipo: t.tipo, count: Number(t.count) })) };
  }

  async verificados() {
    const terreiros = await this.prisma.terreiros.findMany({
      where: { isVerified: true, deletedAt: null, isPublished: true },
      orderBy: { trustScore: 'desc' },
      take: 50,
      select: terreiroBasico,
    });
    const total = await this.prisma.terreiros.count({
      where: { isVerified: true, deletedAt: null, isPublished: true },
    });
    return { terreiros, total };
  }

  async topAvaliados() {
    const terreiros = await this.prisma.terreiros.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { trustScore: 'desc' },
      take: 50,
      select: terreiroBasico,
    });
    return { terreiros, total: terreiros.length };
  }

  async recentes() {
    const terreiros = await this.prisma.terreiros.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { publicadoEm: 'desc' },
      take: 50,
      select: terreiroBasico,
    });
    return { terreiros, total: terreiros.length };
  }

  async stats() {
    const [total, verificados, porEstado, porTradicao, porCidade, totalEventos, totalCursos, totalAcoesSociais, statsAvaliacoes] = await Promise.all([
      this.prisma.terreiros.count({ where: { deletedAt: null, isPublished: true } }),
      this.prisma.terreiros.count({ where: { isVerified: true, deletedAt: null, isPublished: true } }),
      this.prisma.$queryRaw<Array<{ estado: string; count: bigint }>>`
        SELECT estado, COUNT(*) as count FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true
        GROUP BY estado ORDER BY count DESC
      `,
      this.prisma.$queryRaw<Array<{ tradicao: string; count: bigint }>>`
        SELECT tradicao, COUNT(*) as count FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true
        GROUP BY tradicao ORDER BY count DESC
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; estado: string; count: bigint }>>`
        SELECT cidade, estado, COUNT(*) as count FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true
        GROUP BY cidade, estado ORDER BY count DESC LIMIT 30
      `,
      this.prisma.eventos.count({ where: { deletedAt: null, dataInicio: { gte: new Date() } } }),
      this.prisma.cursos.count({ where: { deletedAt: null } }),
      this.prisma.acoesSociais.count({ where: { deletedAt: null } }),
      this.prisma.avaliacoes.aggregate({ _count: true, _avg: { nota: true } }),
    ]);

    return {
      totalTerreiro: total,
      totalVerificados: verificados,
      totalEventos,
      totalCursos,
      totalAcoesSociais,
      totalAvaliacoes: statsAvaliacoes._count,
      mediaAvaliacoes: Number(statsAvaliacoes._avg.nota?.toFixed(1) || 0),
      estados: porEstado.map(e => ({ uf: e.estado, nome: ESTADOS_BR[e.estado] || e.estado, count: Number(e.count) })),
      tradicoes: porTradicao.map(t => ({ nome: t.tradicao, label: NOME_TRADICOES[t.tradicao] || t.tradicao, count: Number(t.count) })),
      cidades: porCidade.map(c => ({
        nome: c.cidade, uf: c.estado, count: Number(c.count),
        slug: this.toSlug(`${c.cidade}-${c.estado.toLowerCase()}`),
      })),
    };
  }

  async sitemapData() {
    const [terreiros, estados, cidades, tradicoes] = await Promise.all([
      this.prisma.terreiros.findMany({
        where: { deletedAt: null, isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.$queryRaw<Array<{ estado: string }>>`
        SELECT DISTINCT estado FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true ORDER BY estado
      `,
      this.prisma.$queryRaw<Array<{ cidade: string; estado: string }>>`
        SELECT DISTINCT cidade, estado FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true ORDER BY cidade
      `,
      this.prisma.$queryRaw<Array<{ tradicao: string }>>`
        SELECT DISTINCT tradicao FROM terreiros
        WHERE deleted_at IS NULL AND is_published = true ORDER BY tradicao
      `,
    ]);

    return {
      terreiros: terreiros.map(t => ({ slug: t.slug, updatedAt: t.updatedAt })),
      estados: estados.map(e => e.estado),
      cidades: cidades.map(c => ({ nome: c.cidade, uf: c.estado, slug: this.toSlug(`${c.cidade}-${c.estado.toLowerCase()}`) })),
      tradicoes: tradicoes.map(t => t.tradicao.toLowerCase().replace(/_/g, '-')),
    };
  }

  private gerarPanoramaEstado(ufNome: string, uf: string, total: number, verificados: number, tradicoes: Array<{ tradicao: string; count: number }>): string {
    const tradicoesTexto = tradicoes.slice(0, 3).map((t, i) =>
      `${i === tradicoes.slice(0, 3).length - 1 ? 'e ' : ''}${NOME_TRADICOES[t.tradicao] || t.tradicao} (${t.count} casa${t.count !== 1 ? 's' : ''})`
    ).join(', ');
    const pVerificados = total > 0 ? Math.round((verificados / total) * 100) : 0;
    return `${ufNome} conta atualmente com ${total} comunidade${total !== 1 ? 's' : ''} de tradições de matriz africana cadastrada${total !== 1 ? 's' : ''} no AxéMap. Destas, ${verificados} (${pVerificados}%) têm perfil verificado, garantindo maior confiabilidade para quem busca conhecer e frequentar essas casas. As principais tradições presentes no estado são ${tradicoesTexto}. O AxéMap é um mapa vivo das tradições africanas e de suas diásporas, conectando visitantes a comunidades de axé no Brasil e no mundo.`;
  }

  private gerarPanoramaCidade(cidade: string, uf: string, total: number, verificados: number, tradicoes: Array<{ tradicao: string; count: number }>): string {
    const tradicoesTexto = tradicoes.slice(0, 3).map(t => NOME_TRADICOES[t.tradicao] || t.tradicao).join(', ');
    const pVerificados = total > 0 ? Math.round((verificados / total) * 100) : 0;
    return `${cidade}, ${uf}, possui ${total} terreiro${total !== 1 ? 's' : ''} de matriz africana cadastrado${total !== 1 ? 's' : ''} no AxéMap${verificados > 0 ? `, sendo ${verificados} (${pVerificados}%) com perfil verificado` : ''}. As tradições encontradas na cidade incluem ${tradicoesTexto}. A plataforma permite explorar cada terreiro com informações detalhadas, fotos, avaliações e geolocalização para facilitar a visitação.`;
  }

  private gerarPanoramaTradicao(label: string, total: number, estados: Array<{ estado: string; count: number }>): string {
    const topEstados = estados.slice(0, 3).map(e => `${ESTADOS_BR[e.estado] || e.estado} (${e.count} casa${e.count !== 1 ? 's' : ''})`).join(', ');
    return `A tradição ${label} está presente em ${total} comunidade${total !== 1 ? 's' : ''} cadastrada${total !== 1 ? 's' : ''} no AxéMap, distribuída${total !== 1 ? 's' : ''} por ${estados.length} estado${estados.length !== 1 ? 's' : ''} brasileiro${estados.length !== 1 ? 's' : ''}. Os estados com maior concentração são ${topEstados}. O AxéMap é um mapa vivo das tradições africanas e de suas diásporas, ajudando a descobrir e conectar-se com comunidades de ${label} no Brasil e no mundo.`;
  }

  private gerarPerfilComunidade(total: number, verificados: number, dirigentes: number): string {
    return `A comunidade cadastrada no AxéMap nesta região é composta por ${total} comunidade${total !== 1 ? 's' : ''}, das quais ${verificados} ${verificados !== 1 ? 'são' : 'é'} verificada${verificados !== 1 ? 's' : ''}${dirigentes > 0 ? `, e conta com aproximadamente ${dirigentes} dirigente${dirigentes !== 1 ? 's' : ''} vinculado${dirigentes !== 1 ? 's' : ''}` : ''}. A plataforma segue crescendo e fortalecendo a rede de tradições de matriz africana no Brasil e nas diásporas.`;
  }

  private gerarFAQsEstado(ufNome: string, uf: string, total: number, verificados: number, tradicoes: Array<{ tradicao: string; count: number }>, eventos: number, cursos: number): FAQ[] {
    const faqs: FAQ[] = [];
    if (total > 0) faqs.push({ pergunta: `Quantos terreiros existem em ${ufNome}?`, resposta: `Atualmente existem ${total} terreiros cadastrados no AxéMap em ${ufNome}.` });
    if (verificados > 0) faqs.push({ pergunta: `Quantos terreiros verificados existem em ${ufNome}?`, resposta: `Existem ${verificados} terreiros com perfil verificado em ${ufNome}, representando ${Math.round((verificados / total) * 100)}% do total.` });
    if (tradicoes.length > 0) {
      const lista = tradicoes.map(t => NOME_TRADICOES[t.tradicao] || t.tradicao).join(', ');
      faqs.push({ pergunta: `Quais tradições estão presentes em ${ufNome}?`, resposta: `Em ${ufNome} você encontra terreiros das seguintes tradições: ${lista}.` });
    }
    if (eventos > 0) faqs.push({ pergunta: `Quais eventos estão acontecendo em ${ufNome}?`, resposta: `Atualmente há ${eventos} evento${eventos !== 1 ? 's' : ''} previsto${eventos !== 1 ? 's' : ''} em ${ufNome}. Consulte a seção de eventos para mais detalhes.` });
    if (cursos > 0) faqs.push({ pergunta: `Quais cursos estão disponíveis em ${ufNome}?`, resposta: `Há ${cursos} curso${cursos !== 1 ? 's' : ''} disponível${cursos !== 1 ? 's' : ''} em ${ufNome}. Acesse a seção de cursos para conferir.` });
    faqs.push(
      { pergunta: 'Como cadastrar meu terreiro no AxéMap?', resposta: 'O cadastro é gratuito. Basta criar uma conta e acessar a central de evolução para seguir o passo a passo do onboarding.' },
      { pergunta: 'O AxéMap é gratuito?', resposta: 'Sim, o AxéMap é uma plataforma gratuita para dirigentes e visitantes. Nosso objetivo é conectar pessoas às casas de religiões afro-brasileiras.' },
    );
    return faqs;
  }

  private gerarFAQsCidade(cidade: string, total: number, verificados: number, tradicoes: Array<{ tradicao: string; count: number }>, eventos: number, cursos: number): FAQ[] {
    const faqs: FAQ[] = [];
    if (total > 0) faqs.push({ pergunta: `Quantos terreiros existem em ${cidade}?`, resposta: `Atualmente existem ${total} terreiros cadastrados no AxéMap em ${cidade}.` });
    if (verificados > 0) faqs.push({ pergunta: `Quantos terreiros verificados existem em ${cidade}?`, resposta: `Existem ${verificados} terreiros verificados em ${cidade}.` });
    if (tradicoes.length > 0) {
      const lista = tradicoes.map(t => NOME_TRADICOES[t.tradicao] || t.tradicao).join(', ');
      faqs.push({ pergunta: `Quais tradições religiosas em ${cidade}?`, resposta: `Em ${cidade} você encontra terreiros de: ${lista}.` });
    }
    if (eventos > 0) faqs.push({ pergunta: `Quais eventos estão acontecendo em ${cidade}?`, resposta: `Atualmente há ${eventos} evento${eventos !== 1 ? 's' : ''} previsto${eventos !== 1 ? 's' : ''} em ${cidade}.` });
    if (cursos > 0) faqs.push({ pergunta: `Quais cursos estão disponíveis em ${cidade}?`, resposta: `Há ${cursos} curso${cursos !== 1 ? 's' : ''} disponível${cursos !== 1 ? 's' : ''} em ${cidade}.` });
    return faqs;
  }

  private gerarFAQsTradicao(label: string, total: number, verificados: number, estados: Array<{ estado: string; count: number }>): FAQ[] {
    const faqs: FAQ[] = [];
    if (total > 0) faqs.push({ pergunta: `O que é ${label}?`, resposta: `${label} é uma das tradições de matriz africana presentes no Brasil, com ${total} terreiro${total !== 1 ? 's' : ''} cadastrado${total !== 1 ? 's' : ''} no AxéMap.` });
    if (estados.length > 0) {
      const top = estados.slice(0, 3).map(e => `${ESTADOS_BR[e.estado] || e.estado}`).join(', ');
      faqs.push({ pergunta: `Onde encontrar terreiros de ${label}?`, resposta: `Terreiros de ${label} estão presentes em ${estados.length} estados brasileiros, com maior concentração em ${top}.` });
    }
    if (verificados > 0) faqs.push({ pergunta: `Como identificar um terreiro de ${label} de confiança?`, resposta: `No AxéMap você pode verificar o Trust Score de cada terreiro, que considera avaliações, completude do perfil e verificação documental. Atualmente ${verificados} terreiro${verificados !== 1 ? 's' : ''} de ${label} ${verificados !== 1 ? 'são' : 'é'} verificado${verificados !== 1 ? 's' : ''}.` });
    return faqs;
  }

  private validarQualidade(opts: {
    totalTerreiro: number; totalVerificados: number;
    totalEventos: number; totalCursos: number;
    totalAvaliacoes: number;
    temConteudoEditorial: boolean;
    diversidadeTradicoes: number;
  }): { pontuacao: number; noindex: boolean; criterios: CriterioSEO[] } {
    const criterios: CriterioSEO[] = [
      { nome: 'Mínimo de terreiros', passou: opts.totalTerreiro >= 3, mensagem: opts.totalTerreiro >= 3 ? `${opts.totalTerreiro} terreiros cadastrados` : 'Menos de 3 terreiros cadastrados' },
      { nome: 'Perfis verificados', passou: opts.totalVerificados > 0, mensagem: opts.totalVerificados > 0 ? `${opts.totalVerificados} terreiros verificados` : 'Nenhum terreiro verificado' },
      { nome: 'Conteúdo editorial', passou: opts.temConteudoEditorial, mensagem: opts.temConteudoEditorial ? 'Texto editorial gerado' : 'Sem conteúdo editorial' },
      { nome: 'Diversidade de tradições', passou: opts.diversidadeTradicoes >= 1, mensagem: `${opts.diversidadeTradicoes} tradição(ões) representada(s)` },
      { nome: 'Avaliações de usuários', passou: opts.totalAvaliacoes > 0, mensagem: opts.totalAvaliacoes > 0 ? `${opts.totalAvaliacoes} avaliações registradas` : 'Nenhuma avaliação' },
      { nome: 'Eventos relacionados', passou: opts.totalEventos > 0, mensagem: opts.totalEventos > 0 ? `${opts.totalEventos} eventos previstos` : 'Nenhum evento' },
      { nome: 'Cursos disponíveis', passou: opts.totalCursos > 0, mensagem: opts.totalCursos > 0 ? `${opts.totalCursos} cursos disponíveis` : 'Nenhum curso' },
    ];
    const pontuacao = Math.round((criterios.filter(c => c.passou).length / criterios.length) * 100);
    return { pontuacao, noindex: pontuacao < 40, criterios };
  }

  private toSlug(texto: string): string {
    return generateSlug(texto);
  }
}
