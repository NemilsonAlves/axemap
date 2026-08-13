import {
  PrismaClient,
  UserRole,
  TerreiroStatus,
  EventType,
  VerificationLevel,
  GraphEntidadeTipo,
  GraphRelacionamentoTipo,
  GraphStatus,
  GraphFonte,
  ConteudoStatus,
  ConteudoCulturalTipo,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...\n');

  await cleanup();
  await createUsers();
  await createTerreiros();
  await createEvents();
  await createCourses();
  await createSocialActions();
  await createReviews();
  await createFeedback();
  await createFeatureFlags();
  await createMissions();
  await createAchievements();
  await createAnalyticsEvents();
  await createInstituicoes();
  await createCampaigns();
  await createHubContent();
  await createPlanos();
  await createAxegraph();

  console.log('\n✅ Seed concluído com sucesso!');
}

async function cleanup() {
  console.log('🧹 Limpando dados existentes...');
  const tables = [
    'axscore_history', 'acoes_evolucao', 'metas_evolucao',
    'usuario_missoes', 'missoes', 'usuario_conquistas', 'conquistas',
    'eventos_analytics', 'feedbacks', 'feature_flag_overrides', 'feature_flags',
    'avaliacao_respostas', 'avaliacoes', 'presenca_eventos', 'matriculas_curso',
    'seguidores_terreiro', 'favoritos', 'membros_terreiro', 'indicacoes',
    'acessos_qrcode', 'pedidos_reivindicacao',
    'terreiro_fotos', 'terreiro_videos', 'documentos_verificacao',
    'acoes_sociais', 'matriculas_curso', 'cursos',
    'presenca_eventos', 'eventos', 'produtos_marketplace', 'conteudos',
    'campanhas_documentos', 'campanhas_prestacao_contas', 'campanhas_comentarios',
    'campanhas_atualizacoes', 'campanhas_apoios', 'campanhas', 'instituicoes',
    'plano_pagamentos', 'plano_assinaturas', 'planos_saas',
    'transacoes_financeiras', 'pix_configuracoes',
    'certificacoes', 'mediacao_mensagens', 'mediacoes',
    'compliance_itens', 'compliance_checklists', 'antifraude_registros',
    'evidencias', 'governanca_membros',
    'graph_relacionamentos_historico', 'graph_duplicidades',
    'graph_relacionamentos', 'graph_entidades', 'conteudos_culturais', 'patrimonio_cultural',
    'notificacoes', 'audit_logs', 'denuncias', 'terreiros', 'usuarios',
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM ${table} CASCADE`);
  }
  console.log('  ✓ Dados limpos');
}

async function createUsers() {
  console.log('👤 Criando usuários...');
  const hash = await bcrypt.hash('senha123', 10);

  const users = [
    { email: 'admin@axemap.com.br', nome: 'Admin AxéMap', role: UserRole.ADMIN },
    { email: 'moderador@axemap.com.br', nome: 'Moderador AxéMap', role: UserRole.MODERATOR },
    { email: 'joao@umbanda.com', nome: 'João de Ogum', role: UserRole.DIRIGENTE },
    { email: 'maria@candomble.com', nome: 'Maria de Oxum', role: UserRole.DIRIGENTE },
    { email: 'carlos@jurema.com', nome: 'Carlos da Jurema', role: UserRole.PRACTITIONER },
    { email: 'ana@terreiro.com', nome: 'Ana de Iemanjá', role: UserRole.PRACTITIONER },
    { email: 'pedro@axemap.com', nome: 'Pedro de Xangô', role: UserRole.FILHO_DE_SANTO },
    { email: 'lucia@axemap.com', nome: 'Lúcia de Oxóssi', role: UserRole.VISITOR },
    { email: 'roberto@axemap.com', nome: 'Roberto de Omolu', role: UserRole.MEMBER },
    { email: 'fernanda@axemap.com', nome: 'Fernanda de Iansã', role: UserRole.VISITOR },
  ];

  const created = [];
  for (const u of users) {
    const user = await prisma.usuarios.create({
      data: {
        ...u,
        senhaHash: hash,
        isVerified: true,
        trustScore: Math.floor(Math.random() * 40) + 60,
      },
    });
    created.push(user);
  }
  console.log(`  ✓ ${created.length} usuários criados`);
}

async function createTerreiros() {
  console.log('🏛️  Criando terreiros...');

  const dirigentes = await prisma.usuarios.findMany({
    where: { role: { in: [UserRole.DIRIGENTE, UserRole.ADMIN] } },
  });

  const terreirosData = [
    { nome: 'Terreiro de Ogum', slug: 'terreiro-ogum', tradicao: 'UMBANDA', cidade: 'Rio de Janeiro', estado: 'RJ', latitude: -22.9068, longitude: -43.1729, descricaoCurta: 'Terreiro tradicional de Umbanda', descricaoLonga: 'Há mais de 50 anos servindo a comunidade com giras e passes.' },
    { nome: 'Ilê Axé Oxum', slug: 'ile-axe-oxum', tradicao: 'CANDOMBLE_KETU', cidade: 'Salvador', estado: 'BA', latitude: -12.9714, longitude: -38.5014, descricaoCurta: 'Casa de Candomblé Ketu', descricaoLonga: 'Tradicional terreiro de Candomblé na capital baiana.' },
    { nome: 'Terreiro de Jurema Sagrada', slug: 'jurema-sagrada', tradicao: 'JUREMA', cidade: 'Recife', estado: 'PE', latitude: -8.0476, longitude: -34.8770, descricaoCurta: 'Jurema Sagrada ancestral', descricaoLonga: 'Preservando a tradição da Jurema há gerações.' },
    { nome: 'Casa de Xangô', slug: 'casa-xango', tradicao: 'CANDOMBLE_ANGOLA', cidade: 'São Paulo', estado: 'SP', latitude: -23.5505, longitude: -46.6333, descricaoCurta: 'Casa de Candomblé Angola', descricaoLonga: 'Terreiro acolhedor na capital paulista.' },
    { nome: 'Terreiro de Iemanjá', slug: 'terreiro-iemanja', tradicao: 'UMBANDA', cidade: 'Santos', estado: 'SP', latitude: -23.9535, longitude: -46.3350, descricaoCurta: 'Terreiro à beira-mar', descricaoLonga: 'Tradicional festa de Iemanjá em Santos.' },
    { nome: 'Ilê Axé Oyá', slug: 'ile-axe-oya', tradicao: 'CANDOMBLE_KETU', cidade: 'Belo Horizonte', estado: 'MG', latitude: -19.9167, longitude: -43.9345, descricaoCurta: 'Casa de Oyá', descricaoLonga: 'Referência em Candomblé em Minas Gerais.' },
    { nome: 'Tambor de Mina Axé', slug: 'tambor-mina', tradicao: 'TAMBOR_DE_MINA', cidade: 'São Luís', estado: 'MA', latitude: -2.5297, longitude: -44.3028, descricaoCurta: 'Tambor de Mina tradicional', descricaoLonga: 'Casa tradicional de Tambor de Mina no Maranhão.' },
    { nome: 'Terreiro de Oxóssi', slug: 'terreiro-oxossi', tradicao: 'UMBANDA', cidade: 'Campinas', estado: 'SP', latitude: -22.9056, longitude: -47.0608, descricaoCurta: 'Terreiro de Oxóssi', descricaoLonga: 'Terreiro dedicado a Oxóssi, o caçador.' },
    { nome: 'Ilê Awo Ifá Òrúnmìlà', slug: 'ile-awo-ifa-orunmila', tradicao: 'IFA', cidade: 'Salvador', estado: 'BA', latitude: -12.9777, longitude: -38.5016, descricaoCurta: 'Casa de Ifá — Religião Tradicional Iorubá', descricaoLonga: 'Casa de Ifá que preserva a filosofia, os Odù e os ensinamentos dos babalaôs.' },
    { nome: 'Templo de Ifá de São Paulo', slug: 'templo-ifa-sao-paulo', tradicao: 'IFA', cidade: 'São Paulo', estado: 'SP', latitude: -23.5505, longitude: -46.6333, descricaoCurta: 'Ifaísmo em São Paulo', descricaoLonga: 'Templo dedicado ao Ifá, religião tradicional iorubá reconhecida pela UNESCO.' },
    { nome: 'Ilê dos Ancestrais', slug: 'ile-dos-ancestrais', tradicao: 'EGUNGUN', cidade: 'Itaparica', estado: 'BA', latitude: -12.8933, longitude: -38.6781, descricaoCurta: 'Casa de culto aos Egunguns', descricaoLonga: 'Comunidade que cultua os Bàbá Egúngún, ancestrais masculinos da tradição de Oió.' },
    { nome: 'Egbé Bàbá dos Ancestrais', slug: 'egbe-baba-ancestrais', tradicao: 'EGUNGUN', cidade: 'Recife', estado: 'PE', latitude: -8.0476, longitude: -34.8770, descricaoCurta: 'Egbé de culto aos ancestrais', descricaoLonga: 'Egbé dedicado ao culto dos ancestrais na tradição nagô do Recife.' },
    { nome: 'Sala de Batuque do Sul', slug: 'sala-batuque-sul', tradicao: 'BATUQUE', cidade: 'Porto Alegre', estado: 'RS', latitude: -30.0346, longitude: -51.2177, descricaoCurta: 'Batuque de matriz iorubá', descricaoLonga: 'Tradicional casa de Batuque do Rio Grande do Sul, com toques e batuques aos Orixás.' },
    { nome: 'Casa dos Encantados', slug: 'casa-encantados', tradicao: 'ENCANTARIA', cidade: 'São Luís', estado: 'MA', latitude: -2.5297, longitude: -44.3028, descricaoCurta: 'Culto aos encantados', descricaoLonga: 'Casa que cultua os encantados de água, mata e reinos místicos no universo da Encantaria.' },
    { nome: 'Mesa de Catimbó', slug: 'mesa-catimbo', tradicao: 'CATIMBO', cidade: 'Natal', estado: 'RN', latitude: -5.7945, longitude: -35.2110, descricaoCurta: 'Tradição afro-indígena do Catimbó', descricaoLonga: 'Mesa de Catimbó que preserva a herança dos mestres e a força ancestral do Nordeste.' },
    { nome: 'Ilê Omolocô', slug: 'ile-omoloco', tradicao: 'OMOLOKO', cidade: 'Rio de Janeiro', estado: 'RJ', latitude: -22.9068, longitude: -43.1729, descricaoCurta: 'Nação Omolocô', descricaoLonga: 'Casa de Omolocô, nação que articula as raízes bantas e iorubás.' },
    { nome: 'Casa de Exu e Pombagira', slug: 'casa-exu-pombagira', tradicao: 'QUIMBANDA', cidade: 'São Paulo', estado: 'SP', latitude: -23.5505, longitude: -46.6333, descricaoCurta: 'Quimbanda em São Paulo', descricaoLonga: 'Casa de Quimbanda que trabalha com Exus e Pombagiras como caminho de cura e justiça.' },
  ];

  const terreiros = [];
  for (let i = 0; i < terreirosData.length; i++) {
    const t = terreirosData[i];
    const dirigente = dirigentes[i % dirigentes.length];
    const terreiro = await prisma.terreiros.create({
      data: {
        ...t,
        status: TerreiroStatus.VERIFICADO,
        trustScore: Math.floor(Math.random() * 30) + 70,
        isPublished: true,
        isVerified: true,
        verificationLevel: VerificationLevel.COMUNITARIO,
        criadoPor: { connect: { id: dirigente.id } },
        dirigente: { connect: { id: dirigente.id } },
        instagram: `${t.slug}`,
        whatsapp: '5511999999999',
        acessibilidade: true,
        horarioFuncionamento: 'Seg-Sex: 18h-22h | Sáb: 15h-20h',
      },
    });
    await prisma.$executeRaw`UPDATE terreiros SET geo_point = ST_GeomFromText(${'POINT(' + t.longitude + ' ' + t.latitude + ')'}, 4326) WHERE id = ${terreiro.id}`;
    terreiros.push(terreiro);
  }
  console.log(`  ✓ ${terreiros.length} terreiros criados`);
}

async function createEvents() {
  console.log('📅 Criando eventos...');
  const terreiros = await prisma.terreiros.findMany();

  const events = [];
  for (const t of terreiros) {
    const e = await prisma.eventos.create({
      data: {
        titulo: `Gira de ${t.nome}`,
        descricao: `Gira aberta ao público no ${t.nome}. Todos são bem-vindos!`,
        tipo: EventType.GIRA,
        dataInicio: new Date(Date.now() + Math.random() * 30 * 86400000),
        capacidade: Math.floor(Math.random() * 50) + 20,
        isPublico: true,
        terreiro: { connect: { id: t.id } },
        criadoPor: { connect: { id: t.criadoPorId } },
      },
    });
    events.push(e);
  }
  console.log(`  ✓ ${events.length} eventos criados`);
}

async function createCourses() {
  console.log('📚 Criando cursos...');
  const terreiros = await prisma.terreiros.findMany();

  const courses = [];
  const courseNames = [
    'Introdução à Umbanda', 'Fundamentos do Candomblé', 'Curso de Ervas e Banhos',
    'Aprendendo a Jogar Búzios', 'Cânticos e Pontos Riscados', 'Desenvolvimento Mediúnico',
    'Curso de Atabaque', 'Oferendas e Alimentos Sagrados', 'Noções de Iorubá',
    'Ética e Convivência em Terreiro',
  ];

  for (let i = 0; i < 6; i++) {
    const t = terreiros[i % terreiros.length];
    const c = await prisma.cursos.create({
      data: {
        titulo: courseNames[i],
        descricao: `Curso completo sobre ${courseNames[i].toLowerCase()} no ${t.nome}.`,
        modalidade: i % 2 === 0 ? 'PRESENCIAL' : 'ONLINE',
        cargaHoraria: 8 + i * 4,
        vagas: 20 + i * 5,
        dataInicio: new Date(Date.now() + 15 * 86400000 + i * 7 * 86400000),
        terreiro: { connect: { id: t.id } },
      },
    });
    courses.push(c);
  }
  console.log(`  ✓ ${courses.length} cursos criados`);
}

async function createSocialActions() {
  console.log('🤝 Criando ações sociais...');
  const terreiros = await prisma.terreiros.findMany();

  const actions = [];
  const actionNames = [
    'Sopa Comunitária', 'Distribuição de Cestas Básicas', 'Oficina de Artesanato',
    'Aulas de Reforço Escolar', 'Atendimento Espiritual Gratuito', 'Mutirão de Limpeza',
  ];

  for (let i = 0; i < actionNames.length; i++) {
    const t = terreiros[i % terreiros.length];
    const a = await prisma.acoesSociais.create({
      data: {
        nome: actionNames[i],
        descricao: `Ação social promovida pelo ${t.nome}: ${actionNames[i].toLowerCase()}. Participe!`,
        tipo: i % 3 === 0 ? 'ALIMENTACAO' : i % 3 === 1 ? 'EDUCACAO' : 'CULTURA',
        data: new Date(Date.now() + Math.random() * 60 * 86400000),
        alcance: 50 + Math.floor(Math.random() * 200),
        terreiro: { connect: { id: t.id } },
      },
    });
    actions.push(a);
  }
  console.log(`  ✓ ${actions.length} ações sociais criadas`);
}

async function createReviews() {
  console.log('⭐ Criando avaliações...');
  const usuarios = await prisma.usuarios.findMany();
  const terreiros = await prisma.terreiros.findMany();
  const reviewTexts = [
    'Experiência maravilhosa, me senti acolhido desde o primeiro momento.',
    'Terreiro muito organizado e dirigente muito sábio. Recomendo!',
    'Gira emocionante. Saí de lá renovado espiritualmente.',
    'Poderia melhorar a pontualidade, mas o trabalho espiritual é muito bom.',
    'Ambiente familiar e acolhedor. Ótimo para quem está começando.',
    'Tradição preservada com muito respeito. Axé!',
    'Primeira vez que visitei e fui muito bem recebido. Voltarei com certeza.',
  ];

  let count = 0;
  for (const t of terreiros) {
    for (const u of usuarios) {
      if (count > 25) break;
      const already = await prisma.avaliacoes.findUnique({
        where: { usuarioId_terreiroId: { usuarioId: u.id, terreiroId: t.id } },
      });
      if (already) continue;

      await prisma.avaliacoes.create({
        data: {
          nota: Math.floor(Math.random() * 3) + 3,
          texto: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
          usuario: { connect: { id: u.id } },
          terreiro: { connect: { id: t.id } },
          pesoAvaliador: Math.floor(Math.random() * 10) + 1,
          utilCount: Math.floor(Math.random() * 15),
        },
      });
      count++;
    }
  }
  console.log(`  ✓ ${count} avaliações criadas`);
}

async function createFeedback() {
  console.log('💬 Criando feedbacks...');
  const usuarios = await prisma.usuarios.findMany();

  const feedbacks = [
    { tipo: 'SUGESTAO', mensagem: 'Seria ótimo ter um aplicativo mobile.', pagina: '/busca' },
    { tipo: 'ELOGIO', mensagem: 'Plataforma incrível, conectando a comunidade!', pagina: '/' },
    { tipo: 'CRITICA', mensagem: 'A busca poderia ser mais rápida.', pagina: '/busca' },
    { tipo: 'DUVIDA', mensagem: 'Como faço para reivindicar meu terreiro?', pagina: '/onboarding' },
    { tipo: 'SUGESTAO', mensagem: 'Incluir mais fotos nos perfis dos terreiros.', pagina: '/terreiro' },
  ];

  for (const f of feedbacks) {
    await prisma.feedback.create({
      data: {
        ...f,
        usuario: { connect: { id: usuarios[Math.floor(Math.random() * usuarios.length)].id } },
      },
    });
  }
  console.log(`  ✓ ${feedbacks.length} feedbacks criados`);
}

async function createFeatureFlags() {
  console.log('🚩 Criando feature flags...');

  const flags = [
    { chave: 'novo-onboarding', titulo: 'Novo Fluxo de Onboarding', descricao: 'Ativar novo fluxo de cadastro de terreiros', ativo: true },
    { chave: 'recomendacao-ia', titulo: 'Recomendação por IA', descricao: 'Usar IA para recomendar terreiros', ativo: false },
    { chave: 'marketplace', titulo: 'Marketplace', descricao: 'Ativar módulo de marketplace', ativo: false },
    { chave: 'mapa-termico', titulo: 'Mapa de Calor', descricao: 'Exibir mapa de calor na busca', ativo: true },
    { chave: 'modo-escuro', titulo: 'Modo Escuro', descricao: 'Ativar modo escuro no frontend', ativo: false },
    { chave: 'upload-video', titulo: 'Upload de Vídeos', descricao: 'Permitir upload de vídeos nos perfis', ativo: true },
  ];

  for (const f of flags) {
    await prisma.featureFlag.create({ data: f });
  }
  console.log(`  ✓ ${flags.length} feature flags criadas`);
}

async function createMissions() {
  console.log('🎯 Criando missões...');

  const missions = [
    { key: 'criar-terreiro', titulo: 'Criar Terreiro', descricao: 'Cadastre seu terreiro na plataforma', categoria: 'CADASTRO', requisitos: { acao: 'criar_terreiro' }, rewardAxScore: 100, rewardTrustScore: 10, ordem: 1, ativo: true },
    { key: 'primeira-avaliacao', titulo: 'Primeira Avaliação', descricao: 'Avalie um terreiro que você conhece', categoria: 'ENGAJAMENTO', requisitos: { acao: 'avaliar' }, rewardAxScore: 50, rewardTrustScore: 5, ordem: 2, ativo: true },
    { key: 'convidar-amigos', titulo: 'Convidar Amigos', descricao: 'Convide 3 amigos para a plataforma', categoria: 'CRESCIMENTO', requisitos: { acao: 'convidar', quantidade: 3 }, rewardAxScore: 200, rewardTrustScore: 20, ordem: 3, ativo: true },
    { key: 'evento-presente', titulo: 'Participar de Evento', descricao: 'Confirme presença em um evento', categoria: 'ENGAJAMENTO', requisitos: { acao: 'participar_evento' }, rewardAxScore: 75, rewardTrustScore: 8, ordem: 4, ativo: true },
    { key: 'fotos-terreiro', titulo: 'Fotos do Terreiro', descricao: 'Adicione 5 fotos ao perfil do terreiro', categoria: 'COMPLETUDE', requisitos: { acao: 'adicionar_fotos', quantidade: 5 }, rewardAxScore: 150, rewardTrustScore: 15, ordem: 5, ativo: true },
    { key: 'completar-perfil', titulo: 'Perfil Completo', descricao: 'Complete todas as informações do perfil', categoria: 'COMPLETUDE', requisitos: { acao: 'completar_perfil' }, rewardAxScore: 120, rewardTrustScore: 12, ordem: 6, ativo: true },
  ];

  for (const m of missions) {
    await prisma.mission.create({ data: m });
  }
  console.log(`  ✓ ${missions.length} missões criadas`);
}

async function createAchievements() {
  console.log('🏆 Criando conquistas...');

  const achievements = [
    { key: 'bem-vindo', titulo: 'Bem-vindo!', descricao: 'Faça seu cadastro na plataforma', icone: '🎉', categoria: 'CADASTRO', rewardAxScore: 50, ordem: 1, ativo: true },
    { key: 'avaliador-mirim', titulo: 'Avaliador Mirim', descricao: 'Faça 5 avaliações', icone: '⭐', categoria: 'ENGAJAMENTO', requisitos: { acao: 'avaliar', quantidade: 5 }, rewardAxScore: 100, ordem: 2, ativo: true },
    { key: 'conector', titulo: 'Conector', descricao: 'Convide 5 amigos para a plataforma', icone: '🔗', categoria: 'CRESCIMENTO', requisitos: { acao: 'convidar', quantidade: 5 }, rewardAxScore: 200, ordem: 3, ativo: true },
    { key: 'explorador', titulo: 'Explorador', descricao: 'Visite 10 terreiros diferentes', icone: '🧭', categoria: 'EXPLORACAO', requisitos: { acao: 'visitar', quantidade: 10 }, rewardAxScore: 300, ordem: 4, ativo: true },
    { key: 'frequentador', titulo: 'Frequentador', descricao: 'Participe de 10 eventos', icone: '📅', categoria: 'ENGAJAMENTO', requisitos: { acao: 'participar_evento', quantidade: 10 }, rewardAxScore: 250, ordem: 5, ativo: true },
    { key: 'veterano', titulo: 'Veterano', descricao: 'Mantenha-se ativo por 6 meses', icone: '🏅', categoria: 'LEALDADE', rewardAxScore: 500, ordem: 6, ativo: true },
  ];

  for (const a of achievements) {
    await prisma.achievement.create({ data: a });
  }
  console.log(`  ✓ ${achievements.length} conquistas criadas`);
}

async function createAnalyticsEvents() {
  console.log('📊 Criando eventos de analytics...');
  const usuarios = await prisma.usuarios.findMany();

  const events = [];
  const eventTypes = ['page_view', 'search', 'terreiro_view', 'event_click', 'signup', 'login', 'favorite_add', 'feedback_submit'];
  const pages = ['/', '/busca', '/mapa', '/admin', '/terreiro', '/eventos', '/cursos'];

  for (let i = 0; i < 50; i++) {
    const u = usuarios[Math.floor(Math.random() * usuarios.length)];
    const e = await prisma.analyticsEvent.create({
      data: {
        evento: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 86400000 * 1000),
        sessaoId: crypto.randomUUID(),
        origem: Math.random() > 0.5 ? 'DIRETO' : Math.random() > 0.5 ? 'GOOGLE' : 'REDES_SOCIAIS',
        dispositivo: Math.random() > 0.5 ? 'DESKTOP' : 'MOBILE',
        versao: '0.1.0',
        metadata: { page: pages[Math.floor(Math.random() * pages.length)] },
        usuario: u ? { connect: { id: u.id } } : undefined,
      },
    });
    events.push(e);
  }
  console.log(`  ✓ ${events.length} analytics events criados`);
}

async function createInstituicoes() {
  console.log('🏗️  Criando instituições parceiras...');
  const admin = await prisma.usuarios.findFirst({ where: { role: UserRole.ADMIN } });

  const data = [
    {
      nome: 'Instituto Axé de Cultura e Assistência',
      slug: 'instituto-axe-cultura-assistencia',
      tipo: 'ONG',
      cnpj: '12.345.678/0001-90',
      descricao: 'ONG dedicada à valorização das religiões de matriz africana, cultura Afro-Brasileira e ações comunitárias.',
      cidade: 'São Paulo',
      estado: 'SP',
      website: 'https://institutoaxe.example.org',
      isVerified: true,
      trustScore: 4.6,
    },
    {
      nome: 'Fundação Ilê Ser Coletivo',
      slug: 'fundacao-ile-ser-coletivo',
      tipo: 'FUNDACAO',
      descricao: 'Fundação que apoia projetos educacionais, alimentares e de preservação patrimonial em terreiros.',
      cidade: 'Salvador',
      estado: 'BA',
      website: 'https://ilesercoletivo.example.org',
      isVerified: true,
      trustScore: 4.2,
    },
  ];

  for (const i of data) {
    await prisma.instituicoes.create({
      data: { ...i, criadoPorId: admin.id },
    });
  }
  console.log(`  ✓ ${data.length} instituições criadas`);
}

async function createHubContent() {
  console.log('🛒 Criando marketplace e biblioteca do hub...');
  const terreiros = await prisma.terreiros.findMany({ select: { id: true } });
  const admin = await prisma.usuarios.findFirst({ where: { role: UserRole.ADMIN } });

  const produtos = [
    { nome: 'Camiseta do Terreiro', preco: 59.9, categoria: 'VESTUARIO' },
    { nome: 'Colar de Guias', preco: 45.0, categoria: 'ARTESANATO' },
    { nome: 'Incenso de Ervas', preco: 19.5, categoria: 'NATURAL' },
    { nome: 'Livro de Cânticos', preco: 39.9, categoria: 'LIVRO' },
    { nome: 'Baço de Atabaque', preco: 320.0, categoria: 'INSTRUMENTO' },
    { nome: 'Sabonetes Artesanais', preco: 15.0, categoria: 'ARTESANATO' },
    { nome: 'Ervas para Banho', preco: 12.9, categoria: 'NATURAL' },
    { nome: 'Tambor Infantil', preco: 150.0, categoria: 'INSTRUMENTO' },
  ];

  const conteudos = [
    { titulo: 'A História do Seu Santo', tipo: 'ARTIGO', conteudo: 'Texto de introdução à tradição.' },
    { titulo: 'Rito de Virada de Ano', tipo: 'ARTIGO', conteudo: 'Como vivemos a virada.' },
    { titulo: 'Cânticos para as Giras', tipo: 'DOCUMENTO', conteudo: 'Relação de pontos cantados.' },
    { titulo: 'Aula: Fundamentos da Umbanda', tipo: 'VIDEO', url: 'https://example.org/video-fundamentos' },
    { titulo: 'Entrevista com o Pai de Santo', tipo: 'PODCAST', url: 'https://example.org/podcast-entrevista' },
    { titulo: 'Receitas de Oferendas', tipo: 'ARTIGO', conteudo: 'Receitas tradicionais e seus significados.' },
    { titulo: 'Guia do Visitante', tipo: 'DOCUMENTO', conteudo: 'Como se preparar para a primeira visita.' },
    { titulo: 'Aula: Jogo de Búzios', tipo: 'VIDEO', url: 'https://example.org/video-buzios' },
  ];

  for (let i = 0; i < terreiros.length; i++) {
    const t = terreiros[i];
    const p = produtos[i % produtos.length];
    const c = conteudos[i % conteudos.length];
    await prisma.produtosMarketplace.create({
      data: { ...p, estoque: 5 + i, imagens: [], terreiroId: t.id },
    });
    await prisma.conteudos.create({
      data: { ...c, publicado: true, criadoPorId: admin.id, terreiroId: t.id },
    });
  }

  console.log(`  ✓ ${terreiros.length} produtos e ${terreiros.length} conteúdos criados (1 por terreiro)`);
}

async function createCampaigns() {
  console.log('💚 Criando campanhas (Axé Map Impacto)...');
  const admin = await prisma.usuarios.findFirst({ where: { role: UserRole.ADMIN } });

  const data = [
    {
      titulo: 'Restauro do Telhado do Terreiro de Ogum',
      descricao: 'Campanha para reformar o telhado do salão de giras. Ações sociais acontecem semanalmente e o local precisa de emergencial restauração.',
      categoria: 'INFRAESTRUTURA',
      modeloArrecad: 'META_FIXA',
      metaFinanceira: 25000,
      arrecadado: 12430,
      apoiadoresCount: 87,
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      latitude: -22.9068,
      longitude: -43.1729,
      nivelVerificacao: 'VERIFICADA',
      status: 'PUBLICADA',
      trustScore: 4.7,
      slug: 'restauro-salao-terreiro-ogum',
    },
    {
      titulo: 'Cestas Básicas para Famílias da Comunidade',
      descricao: 'Arrecadação recorrente para distribuir cestas básicas a famílias em vulnerabilidade atendidas pelo terreiro da Jurema Sagrada.',
      categoria: 'SOCIAL',
      modelo: 'RECORRENTE',
      metaFinanceira: 15000,
      arrecadado: 8100,
      apoiadoresCount: 96,
      cidade: 'Recife',
      estado: 'PE',
      latitude: -8.0476,
      longitude: -34.877,
      nivelVerificacao: 'OFICIAL',
      status: 'PUBLICADA',
      trustScore: 4.9,
      slug: 'cestas-basicas-comunidade-jurema',
    },
    {
      titulo: 'Bolsas de Estudo de Música e Canto Sacro',
      descricao: 'Projeto educativo para formar jovens percussionistas e cantores na tradição. Inclui manutenção de atabaques e aulas semanais.',
      categoria: 'CULTURAL',
      modelo: 'META_FIXA',
      metaFinanceira: 30000,
      arrecadado: 28000,
      apoiadoresCount: 182,
      cidade: 'Salvador',
      estado: 'BA',
      latitude: -12.9714,
      longitude: -38.5014,
      nivelVerificacao: 'VERIFICADA',
      status: 'PRESTACAO_CONTAS',
      trustScore: 4.5,
      slug: 'bolsas-estudo-musica-canto-sacro',
    },
    {
      titulo: 'Resposta Emergencial às Enchentes',
      descricao: 'Apoio emergencial às famílias do terreiro de Iemanjá atingidas pelas enchentes. Cobertores, roupas e itens de higiene.',
      categoria: 'EMERGENCIAL',
      modelo: 'EMERGENCIAL',
      metaFinanceira: 40000,
      arrecadado: 41100,
      apoiadoresCount: 310,
      cidade: 'Santos',
      estado: 'SP',
      latitude: -23.9535,
      longitude: -46.335,
      nivelVerificacao: 'OFICIAL',
      status: 'PUBLICADA',
      slug: 'resposta-emergencial-enchentes',
    },
    {
      titulo: 'Fundo de Preservação das Caças Ancestrais',
      descricao: 'Restauro e preservação de peças sagradas e registro documental da tradição da Casa de Xangô.',
      categoria: 'PATRIMONIO_HISTORICO',
      modelo: 'META_FIXA',
      metaFinanceira: 40000,
      arrecadado: 5120,
      cidade: 'São Paulo',
      estado: 'SP',
      latitude: -23.5505,
      longitude: -46.6333,
      nivelVerificacao: 'NAO_VERIFICADA',
      status: 'PENDENTE_ANALISE',
      slug: 'fundo-preservacao-cacas-ancestrais',
    },
    {
      titulo: 'Curso de Ervas e Alimentação Ayurvédica Afro',
      descricao: 'Projeto educacional sobre o uso sustentável de ervas e alimentação da tradição, com prevenção ao extrativismo.',
      categoria: 'EDUCACIONAL',
      modelo: 'META_FIXA',
      metaFinanceira: 22000,
      arrecadado: 1890,
      cidade: 'Belo Horizonte',
      estado: 'MG',
      latitude: -19.9167,
      longitude: -43.9345,
      nivelVerificacao: 'NAO_VERIFICADA',
      status: 'EM_REVISAO_HUMANA',
      slug: 'curso-ervas-alimentacao-afro',
    },
  ];

  const terreiros = await prisma.terreiros.findMany({ select: { id: true, cidade: true, estado: true } });

  for (const c of data) {
    const { categoria, modelo, status, ...rest } = c;
    const ativa = !status || ['PUBLICADA', 'PRESTACAO_CONTAS'].includes(status);
    const tv = terreiros.find((t) => t.cidade === c.cidade && t.estado === c.estado);
    const campanha = await prisma.campanhas.create({
      data: {
        ...rest,
        slug: rest.slug ?? `campanha-${Math.random().toString(36).slice(2, 8)}`,
        criadoPorId: admin.id,
        status: status ?? 'PUBLICADA',
        categoria: categoria ?? 'SOCIAL',
        modeloArrecad: modelo ?? 'META_FIXA',
        dataInicio: new Date(),
        publicadoEm: ativa ? new Date() : null,
        responsavelNome: 'Equipe Comunitária',
        terreiroId: ativa && tv ? tv.id : null,
      } as any,
    });
  }
  console.log(`  ✓ ${data.length} campanhas criadas`);
}

async function createPlanos() {
  console.log('💎 Criando planos SaaS...');
  const planos = [
    {
      slug: 'GRATIS',
      nome: 'Grátis',
      descricao: 'Para casas que estão começando no diretório.',
      precoMensal: 0,
      precoAnual: 0,
      destaque: false,
      ordem: 0,
      funcionalidades: [
        'Perfil público no diretório',
        'Até 5 membros',
        '5 eventos públicos/mês',
        '1 foto no perfil',
        'Botão WhatsApp',
      ],
      limites: { membros: 5, eventosMensais: 5, fotos: 1 },
    },
    {
      nome: 'Básico',
      slug: 'BASICO',
      descricao: 'Gestão essencial para o dia a dia do terreiro.',
      precoMensal: 49,
      precoAnual: 470,
      destaque: false,
      ordem: 1,
      funcionalidades: [
        'Tudo do plano Grátis',
        '10 membros com cargos',
        'Eventos ilimitados',
        'Histórico de frequência',
        'Pix integrado (QR Code)',
        'Controle de receitas e despesas',
        '10 fotos no perfil',
      ],
      limites: { membros: 10, eventosMensais: -1, fotos: 10 },
    },
    {
      nome: 'Profissional',
      slug: 'PROFISSIONAL',
      descricao: 'Ferramentas profissionais para crescimento.',
      precoMensal: 99,
      precoAnual: 950,
      destaque: true,
      ordem: 2,
      funcionalidades: [
        'Tudo do plano Básico',
        'Membros ilimitados com hierarquia',
        'Subdomínio próprio (terreiro.axemap.com.br)',
        'Notificações push',
        'Extrato mensal e relatórios',
        'Vídeos no perfil',
        'Sincronia Google Calendar',
      ],
      limites: { membros: -1, eventosMensais: -1, fotos: -1, videos: 10 },
    },
    {
      nome: 'Enterprise',
      slug: 'ENTERPRISE',
      descricao: 'Para federações, grandes casas e organizações.',
      precoMensal: 299,
      precoAnual: 2870,
      destaque: false,
      ordem: 3,
      funcionalidades: [
        'Tudo do plano Profissional',
        'Domínio próprio',
        'Múltiplas contas com cargos',
        'API do terreiro',
        'Relatórios avançados',
        'Suporte prioritário via WhatsApp',
        'Onboarding assistido',
      ],
      limites: { membros: -1, eventosMensais: -1, fotos: -1, videos: -1 },
    },
  ];

  for (const p of planos) {
    const data = {
      ...p,
      slug: p.slug ?? p.nome.toUpperCase(),
      funcionalidades: p.funcionalidades ?? [],
    };
    const { funcionalidades, ...rest } = data as any;
    await prisma.planoSaaS.upsert({
      where: { slug: rest.slug },
      create: { ...rest, funcionalidades },
      update: { ...rest, funcionalidades },
    });
  }
  console.log(`  ✓ ${planos.length} planos criados`);
}

async function createAxegraph() {
  console.log('🕸️  Criando Axé Graph (grafo de conhecimento)...');
  const admin = await prisma.usuarios.findFirst({ where: { role: UserRole.ADMIN } });
  const adminId = admin?.id ?? null;

  const upsertGrafo = (
    tipo: GraphEntidadeTipo,
    row: {
      id: string;
      nome: string;
      slug?: string | null;
      descricao?: string | null;
      cidade?: string | null;
      estado?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    },
  ) =>
    prisma.graphEntidade.upsert({
      where: { entidadeTipo_entidadeId: { entidadeTipo: tipo, entidadeId: row.id } },
      create: {
        entidadeTipo: tipo,
        entidadeId: row.id,
        nome: row.nome,
        slug: row.slug ?? null,
        descricaoCurta: row.descricao?.slice(0, 500) ?? null,
        cidade: row.cidade ?? null,
        estado: row.estado ?? null,
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
        origem: GraphFonte.INSTITUICAO,
        statusIndexado: 'INDEXADO',
        indexedAt: new Date(),
      },
      update: {
        nome: row.nome,
        slug: row.slug ?? undefined,
        descricaoCurta: row.descricao?.slice(0, 500) ?? null,
        cidade: row.cidade ?? null,
        estado: row.estado ?? null,
        latitude: row.latitude ?? null,
        longitude: row.longitude ?? null,
        origem: GraphFonte.INSTITUICAO,
        statusIndexado: 'INDEXADO',
        indexedAt: new Date(),
        visivel: true,
        deletedAt: null,
      },
    });

  const [terreiros, instituicoes, eventos, cursos, campanhas, acoes, conteudos, produtos, culturais, patrimonio] = await Promise.all([
    prisma.terreiros.findMany({ select: { id: true, nome: true, slug: true, descricaoCurta: true, cidade: true, estado: true, latitude: true, longitude: true } }),
    prisma.instituicoes.findMany({ select: { id: true, nome: true, slug: true, descricao: true, cidade: true, estado: true } }),
    prisma.eventos.findMany({ where: { isPublico: true }, select: { id: true, titulo: true, descricao: true, terreiroId: true } }),
    prisma.cursos.findMany({ select: { id: true, titulo: true, descricao: true, terreiroId: true } }),
    prisma.campanhas.findMany({ select: { id: true, titulo: true, descricao: true, cidade: true, estado: true, terreiroId: true } }),
    prisma.acoesSociais.findMany({ select: { id: true, nome: true, descricao: true, terreiroId: true } }),
    prisma.conteudos.findMany({ where: { publicado: true }, select: { id: true, titulo: true, conteudo: true, terreiroId: true } }),
    prisma.produtosMarketplace.findMany({ select: { id: true, nome: true, descricao: true, terreiroId: true } }),
    prisma.conteudoCultural.findMany({ where: { deletedAt: null }, select: { id: true, titulo: true, resumo: true, tipo: true, cidade: true, estado: true } }),
    prisma.patrimonioCultural.findMany({ where: { deletedAt: null }, select: { id: true, nome: true, descricao: true, cidade: true, estado: true, latitude: true, longitude: true } }),
  ]);

  await Promise.all([
    ...terreiros.map((t) => upsertGrafo(GraphEntidadeTipo.TERREIRO, { ...t, descricao: t.descricaoCurta })),
    ...instituicoes.map((i) => upsertGrafo(GraphEntidadeTipo.INSTITUICAO, i)),
    ...eventos.map((e) => upsertGrafo(GraphEntidadeTipo.EVENTO, { id: e.id, nome: e.titulo, descricao: e.descricao })),
    ...cursos.map((c) => upsertGrafo(GraphEntidadeTipo.CURSO, { id: c.id, nome: c.titulo, descricao: c.descricao })),
    ...campanhas.map((c) => upsertGrafo(GraphEntidadeTipo.CAMPANHA, { id: c.id, nome: c.titulo, descricao: c.descricao, cidade: c.cidade, estado: c.estado })),
    ...acoes.map((a) => upsertGrafo(GraphEntidadeTipo.ACAO_SOCIAL, a)),
    ...conteudos.map((c) => upsertGrafo(GraphEntidadeTipo.CONTEUDO, { id: c.id, nome: c.titulo, descricao: c.conteudo })),
    ...produtos.map((p) => upsertGrafo(GraphEntidadeTipo.PRODUTO, p)),
    ...culturais.map((c) => upsertGrafo(c.tipo === ConteudoCulturalTipo.PESQUISA ? GraphEntidadeTipo.PESQUISA : GraphEntidadeTipo.CONTEUDO, { id: c.id, nome: c.titulo, descricao: c.resumo, cidade: c.cidade, estado: c.estado })),
    ...patrimonio.map((p) => upsertGrafo(GraphEntidadeTipo.PATRIMONIO, p)),
  ]);

  const entidades = await prisma.graphEntidade.findMany({
    where: { deletedAt: null },
    select: { id: true, entidadeTipo: true, entidadeId: true },
  });
  const por = (tipo: GraphEntidadeTipo, id: string) => entidades.find((e) => e.entidadeTipo === tipo && e.entidadeId === id)?.id;

  const rel = (tipo: GraphRelacionamentoTipo, origemTipo: GraphEntidadeTipo, origemId: string, alvoTipo: GraphEntidadeTipo, alvoId: string, confianca: number) => {
    const o = por(origemTipo, origemId);
    const a = por(alvoTipo, alvoId);
    if (!o || !a || o === a) return;
    return prisma.graphRelacionamento.upsert({
      where: { tipo_origemEntidadeId_alvoEntidadeId: { tipo, origemEntidadeId: o, alvoEntidadeId: a } },
      create: { tipo, status: GraphStatus.VERIFICADO, nivelConfianca: confianca, fonte: GraphFonte.INSTITUICAO, origemEntidadeId: o, alvoEntidadeId: a, criadoPorId: adminId, verificadoPorId: adminId, verificadoEm: new Date() },
      update: { status: GraphStatus.VERIFICADO, nivelConfianca: confianca, fonte: GraphFonte.INSTITUICAO, deletedAt: null },
    });
  };

  let vinculados = 0;
  const criarRels = async (lotes: (Promise<unknown> | undefined)[]) => {
    const r = await Promise.all(lotes.filter(Boolean) as Promise<unknown>[]);
    vinculados += r.length;
  };

  await criarRels([
    ...eventos.map((e) => e.terreiroId && rel(GraphRelacionamentoTipo.ORGANIZA, GraphEntidadeTipo.TERREIRO, e.terreiroId, GraphEntidadeTipo.EVENTO, e.id, 0.9)),
    ...cursos.map((c) => c.terreiroId && rel(GraphRelacionamentoTipo.TEM_CURSO, GraphEntidadeTipo.TERREIRO, c.terreiroId, GraphEntidadeTipo.CURSO, c.id, 0.9)),
    ...acoes.map((a) => a.terreiroId && rel(GraphRelacionamentoTipo.OFERECE, GraphEntidadeTipo.TERREIRO, a.terreiroId, GraphEntidadeTipo.ACAO_SOCIAL, a.id, 0.85)),
    ...conteudos.map((c) => c.terreiroId && rel(GraphRelacionamentoTipo.PUBLICOU, GraphEntidadeTipo.TERREIRO, c.terreiroId, GraphEntidadeTipo.CONTEUDO, c.id, 0.8)),
    ...campanhas.map((c) => c.terreiroId && rel(GraphRelacionamentoTipo.TEM_CAMPANHA, GraphEntidadeTipo.TERREIRO, c.terreiroId, GraphEntidadeTipo.CAMPANHA, c.id, 0.9)),
  ]);

  await criarRels(
    instituicoes.flatMap((i) =>
      terreiros.filter((t) => t.estado === i.estado).slice(0, 3).map((t) =>
        rel(GraphRelacionamentoTipo.APOIA, GraphEntidadeTipo.INSTITUICAO, i.id, GraphEntidadeTipo.TERREIRO, t.id, 0.75)),
    ),
  );

  await criarRels(
    terreiros.flatMap((t, i) =>
      terreiros.slice(i + 1).filter((o) => o.cidade === t.cidade && o.cidade).slice(0, 2).map((o) =>
        rel(GraphRelacionamentoTipo.COLABORA_COM, GraphEntidadeTipo.TERREIRO, t.id, GraphEntidadeTipo.TERREIRO, o.id, 0.5)),
    ),
  );

  await criarRels([
    ...culturais.map((c) => {
      const t = terreiros.find((x) => (x.cidade ?? '').toLowerCase() === (c.cidade ?? '').toLowerCase());
      return t && rel(GraphRelacionamentoTipo.RELACIONADO_A, GraphEntidadeTipo.CONTEUDO, c.id, GraphEntidadeTipo.TERREIRO, t.id, 0.4);
    }),
    ...patrimonio.map((p) => {
      const t = terreiros.find((x) => (x.cidade ?? '').toLowerCase() === (p.cidade ?? '').toLowerCase());
      return t && rel(GraphRelacionamentoTipo.PRESERVA, GraphEntidadeTipo.TERREIRO, t.id, GraphEntidadeTipo.PATRIMONIO, p.id, 0.7);
    }),
  ]);

  const adminSeed = adminId ?? undefined;
  await prisma.conteudoCultural.createMany({
    data: [
      { titulo: 'A História do Ilê Axé Oxum', tipo: ConteudoCulturalTipo.HISTORIA, resumo: 'Registro oral da fundação da casa, suas ialorixás e principais rituais.', autorNome: 'Maria de Oxum', fonte: 'Entrevista comunitária', licenca: 'CC-BY-4.0', cidade: 'Salvador', estado: 'BA', status: ConteudoStatus.VERIFICADA, tags: ['historia', 'salvador'], criadoPorId: adminSeed },
      { titulo: 'Toque de Atabaque: Rhythms do Ketu', tipo: ConteudoCulturalTipo.MUSICA, resumo: 'Vídeo-documentário sobre os toques (alujá, bravum, ijexá).', fonte: 'Gravação autorizada', licenca: 'CC-BY-NC-4.0', cidade: 'São Paulo', estado: 'SP', status: ConteudoStatus.VERIFICADA, tags: ['musica', 'atabaque'], criadoPorId: adminSeed },
      { titulo: 'Levantamento dos Terreiros do Recife', tipo: ConteudoCulturalTipo.PESQUISA, resumo: 'Pesquisa acadêmica mapeando casas de Jurema Sagrada e Xangô no Recife.', autorNome: 'Núcleo de Estudos Afro', fonte: 'Artigo científico', licenca: 'CC-BY-4.0', cidade: 'Recife', estado: 'PE', status: ConteudoStatus.OFICIAL, tags: ['pesquisa', 'recife'], criadoPorId: adminSeed },
    ],
  });

  await prisma.patrimonioCultural.createMany({
    data: [
      { nome: 'Assentamento de Xangô da Casa de Xangô', tipo: 'MATERIAL', descricao: 'Assentamento sagrado tombado pela comunidade.', cidade: 'São Paulo', estado: 'SP', latitude: -23.5505, longitude: -46.6333, ano: 1960, fonte: 'Registro comunitário', status: ConteudoStatus.VERIFICADA, criadoPorId: adminSeed },
      { nome: 'Tambor Sagrado de São Luís', tipo: 'MATERIAL', descricao: 'Tambor chamado no Tambor de Mina por gerações.', cidade: 'São Luís', estado: 'MA', latitude: -2.5297, longitude: -44.3028, fonte: 'Acervo da casa', status: ConteudoStatus.VERIFICADA, criadoPorId: adminSeed },
    ],
  });

  const contagens = await prisma.graphEntidade.groupBy({ by: ['entidadeTipo'], _count: true });
  console.log(`  ✓ Grafo: ${entidades.length} entidades, ${vinculados} relacionamentos verificados`);
  contagens.forEach((c) => console.log(`    • ${c.entidadeTipo}: ${c._count}`));
}

main()
  .catch((e) => {    console.error('❌ Seed falhou:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
