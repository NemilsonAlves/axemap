# 88 — UX Research, Personas e Empatia

## Contexto

Este documento detalha o programa de pesquisa UX e aprofunda as personas introduzidas no doc 10. O objetivo é transformar conhecimento de domínio em decisões de produto verificáveis: cada dor é atribuída a um segmento, cada necessidade ligada a um módulo, e cada anti-persona define o que não se deve construir. As personas primárias expandem as do doc 10 (mesmos nomes e contexto), sem criar versões conflitantes.

---

## 1. Metodologia da Pesquisa

### O que será validado

| Hipótese | Como testar | Doc base |
|----------|-------------|----------|
| **H1 — Confiança reduz o medo de escolher:** Trust Score e verificação diminuem a insegurança ao escolher um terreiro desconhecido | Entrevista com protótipo de busca mostrando score vs. sem score; survey de tolerância ao risco | 26, 28 |
| **H2 — Adoção pelo dirigente:** um pai de santo sem letramento técnico completa cadastro e verificação Nível 1 sozinho | Teste de usabilidade do fluxo de cadastro/verificação com Seu Padre e Mãe Beata | 36, 50 |
| **H3 — Fronteira da avaliação:** usuários reconhecem a linha entre "avaliar a experiência" e "avaliar a fé" | Grupos focais revisando exemplos de avaliações | 37 |
| **H4 — Sigilo e consentimento:** como fotografar e exibir rituais respeitando o sigilo iniciático | Grupos focais com lideranças + protótipo de consentimento | 36, 47 |
| **H5 — Anti-adoção:** motivos de recusa legítima e portas de uso indevido | Entrevistas + Portugal de moderação/denúncia | 39, 38 |

### Técnicas e combos

| Técnica | Para quê | Público | Quando |
|---------|----------|---------|--------|
| **Entrevistas semiestruturadas** (45-60min) | Mapear dores, motivações e linguagem de cada segmento | 12-15 dirigentes, 15-20 praticantes, 8 curiosos | Descoberta contínua |
| **Shadowing** (acompanhar visita real) | Observar como um visitante chega, o que pergunta e onde hesita | Visitantes reais de terreiros que aceitam observação | Antes do MVP de busca |
| **Diário (diary studies, 2 semanas)** | Capturar rotina de gestão do dirigente e momentos de busca do praticante | 8-12 dirigentes, 10 praticantes | Validação do SaaS |
| **Grupos focais com lideranças religiosas** | Co-criar política de avaliação, verificação e limites do sigilo iniciático | Babalorixás, iyalorixás, zeladores, federações | Marcos de política (módulos 36-39) |
| **Survey quantitativo** | Priorizar dores e dimensionar segmentos por tradição/região | n ≥ 250 por segmento | Após entrevistas |
| **Testes de usabilidade** | Validar fluxos críticos (cadastro, verificação, avaliação) | 5-8 por fluxo (modelo Nielsen) | Sprints de UI |
| **Teste de moderação / mistério** | Validar denúncia e moderação sob o ponto de vista de uso indegido | Voluntários monitorados com protocolo ético | Antes de liberar denúncias ao público |

Recrutamento por federações e redes de terreiros (doc 31), efeito de rede (doc 54) e LGPD (doc 56). Todo instrumento passa por consentimento informado e anonimização.

---

## 2. Personas primárias (expandidas do doc 10)

### Persona 1 — Carla, visitante curiosa

| Atributo | Detalhe |
|----------|---------|
| **Idade** | 28 anos |
| **Profissão** | Designer gráfica (freelance) |
| **Cidade** | São Paulo, SP |
| **Religião/tradição** | Católica não praticante; curiosidade genuína pela Umbanda; nenhum contato anterior |

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivos** | Encontrar espiritualidade que a acolha sem julgamento; aprender a visitar com respeito; começar aos poucos |
| **Necessidades** | Clareza de "como começar"; garantia de que a casa aceita visitantes; linguagem simples sem jargão |
| **Dores** | Medo de preconceito (família e círculo social); desinformação sobre rituais; insegurança entre "casa séria" e "casa duvidosa" |
| **Frustrações** | Conteúdo sensacionalista nas buscas; nenhuma plataforma neutra e simples; medo do julgamento |
| **Motivações** | Autoconhecimento, conexão, comunidade |
| **Comportamento** | Pesquisa muito antes de agir; lê avaliações e perfis; prefere contato por WhatsApp; verifica credibilidade |
| **Expectativa** | Caminho guiado e humano; perfil transparente; contexto e etiqueta |
| **Gatilho de uso** | Momento de busca de sentido; convite de um amigo engajado |
| **Frase** | "Sempre tive curiosidade, mas não sabia por onde começar." |

**Papel no produto:** converte o atrator "curioso → visitante"; valida onboarding, busca e chat IA. O filtro "aceita visitantes" é o gate crítico.

### Persona 2 — Seu Jorge, pai de santo experiente

| Atributo | Detalhe |
|----------|---------|
| **Idade** | 55 anos |
| **Profissional** | Pai de santo há 30 anos, aposentado |
| **Cidade** | Salvador, BA |
| **Terreiro** | Ilê Axé Oyá, Candomblé Ketu; conjunto de filhos, ogans e membros |

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivos** | Dar visibilidade à casa e atrair novos filhos; preservar a tradição; deixar a raiz sem se afastar do digital |
| **Necessidades** | Simplicidade (sem planos de manutenção); apoio de filho mais jovem para tecnologia; perfil respeitador |
| **Dores** | Não tem site; depende só do boca-a-boca; receio de perder o controle sobre o que se publica; medo de golpes usando o nome da tradição |
| **Frustrações** | Ferramentas genéricas que não entendem seus costa; necessidade de técnico; intelectual detrás do cotidiano |
| **Motivações** | Deixar um legado; proteger os filhos; ser visto como legítimo |
| **Comportamento** | Vive no WhatsApp; delega tecnologia a filho de santo; decide por confiança e caráter |
| **Expectativa** | Presença digital sem esforço; notificações simples; documentação da história |
| **Gatilho** | Filho jovem indica; federação convida; medo de golpe no nome da casa |
| **Frase** | "Meu terreiro é aberto a quem chega com coração aberto." |

**Papel no produto:** legitima o SDK e a verificação; exige onboarding humano, delegação de acesso a outro filho, e proteção da memória.

---

### Persona 3 — Mariana, filha de santo engajada

| Atributo | Detalhe |
|----------|---------|
| **Idade** | 32 anos |
| **Profissional** | Professora universitária |
| **Cidade** | Porto Alegre, RS |
| **Religião/tradição** | Umbanda; frequenta o terreiro há 5 anos; ativa na comunidade |

| Dimensão | Conteúdo |
|----------|----------|
| **Objetivos** | Fortalecer a comunidade; descobrir eventos de outras casas; trocar experiência; combater a desinformação |
| **Necessidades** | Calendário unificado; recomendação com justificativa; grupos de diálogo; canal de denúncia rápida e mediada |
| **Dores** | Comunidade dispersa e vulnerável; poucas oportunidades de troca entre casas; risco diante da intolerância |
| **Frustrações** | Calendário fragmentado; vários apps; pouco espaço seguro de diálogo espiritual |
| **Motivações** | Pertencimento, defesa coletiva, educação cultural |
| **Comportamento** | Participa ativamente; avalia casas que visita; recomenda; digitalmente fluente |
| **Expectativa** | Comunidade moderada; eventos por cidade; recomendação explicada |
| **Gatilho** | Evento de outra casa; sinal de intolerância; convite de troca |
| **Frase** | "Precisamos nos conectar enquanto comunidade. Sozinhos somos vulneráveis." |

**Papel no produto:** é a ponta viral e de retenção; impulsiona eventos, avaliações e o feedback social da confiança (doc 55). Valida o módulo de denúncia/mediação.

---

## 3. Personas secundárias

### Persona 4 — Dra. Araci, pesquisadora acadêmica

| Campo | Detalhe |
|-------|---------|
| **Idade** | 45 anos |
| **Perfil** | Antropóloga, docente |
| **Cidade** | Brasília, DF |
| **Objetivo** | Pesquisar a organização socioespacial dos terreiros |
| **Como usa** | Acessa API pública, baixa datasets agregados e anonimizados |
| **Decisão** | LGPD, anonimização, atribuição, qualidade dos dados |

Valida o módulo Enterprise/API (doc 21) e dados geo-referenciados (doc 86).

### Persona 5 — Rafael, turista religioso

| Campo | Detalhe |
|-------|---------|
| **Idade** | 34 anos |
| **Perfil** | Turismólogo, planejador de rotas de afroturismo |
| **Cidade** | Salvador, BA |
| **Objetivo** | Montar roteiro afro-religioso respeitoso, com terreiros abertos à visita |
| **Como usa** | Busca por cidade + filtro "aceita visitantes", lê etiqueta e histórico |
| **Decisão** | respeito aos protocolos, contexto histórico, segurança |

Apoia afroturismo (doc 02) e o filtro "aceita visitantes".

### Persona 6 — Marlene, lojista de artigos religiosos

| Campo | Detalhe |
|-------|---------|
| **Idade** | 41 anos |
| **Perfil** | Loja física em mercado popular + artesanato próprio |
| **Cidade** | São Luís, MA |
| **Objetivo** | Vender para o país inteiro sem abandonar a loja física |
| **Como usa** | Mantém catálogo, estoque, envio e "selo de origem" |
| **Dor** | Alcance limitado; autenticidade de produtos; falta de canal especializado |

Valida o marketplace (doc 18). O "selo de origem" reforça a confiança.

### Persona 7 — Tata Tião, professor de tambor/oficinas

| Campo | Detalhe |
|-------|---------|
| **Idade** | 40 anos |
| **Perfil** | Tocador, professor de ritmos, oficineiro |
| **Objetivo** | Divulgar cursos e/oficinas para o público interessado |
| **Como usa** | Publica curso, matrícula, agenda, pagamento |
| **Decisão** | Simplicidade de publicar e receber; calendário |

Valida o módulo de cursos/matrículas e pagamento (docs 17, 20).

---

## 4. Anti-personas (quem a plataforma NÃO atende)

| Anti-persona | Por que não atende | O que a plataforma faz para não servir |
|--------------|--------------------|----------------------------------------|
| **Buscador de entretenimento sensacionalista** (quer conteúdo gráfico de rituais, curiosidade mórbida) | O produto é respeito e neutralidade, não exotização (doc 27 "não coisificar") | Moderação; avaliação sobre experiência e não sobre fé; **nunca** publicar fotos de rituais sem consentimento; design que valoriza contexto |
| **Agente de intolerância religiosa** (atacar, denunciar falsamente, derrubar terreiros) | A plataforma é construção de proteção e liberdade religiosa | Denúncia com validação do denunciante; moderação de discurso de ódio; bloqueio/denúncia publicada sem exposição do terreiro |
| **Terreiro que quer esconder práticas ilegais ou enganosas** (charlatanismo, exploração de pessoas) | Transparência verificável é o posicionamento nº 1 (doc 28) | Trust Score transparente, verificação do dirigente, política de avaliação e denúncia, vedação a ocultar informações estruturais |

**Por que definir anti-personas importa:** elas atuam como critério de não-definição do escopo. Toda feature request que serviria a um anti-persona (publicar live de ritual fechado ao público; deletar qualquer avaliação) é recusada na triagem do backlog (doc 22).

---

## 5. Mapa de empatia (personas primárias)

### Carla

| Pergunta | Resposta |
|----------|----------|
| **Pensa e sente** | "Tenho medo de não ser bem-vinda"; curiosidade misturada a culpa; vontade de direção sem exposição |
| **Ouve** | "É macumba, cuidado" de parentes; "vai com respeito, lá é sério" de um amigo; ruído de desinformação online |
| **Vê** | Terreiros invisíveis nas buscas; conteúdo sensacionalista; amigos que usam apps de espiritualidade |
| **Fala e faz** | Pesquisa em vários lugares, pergunta pouco, lê muito, decide quando se sente acolhida |
| **Dores** | Escolher sem confiança; ignorância sobre protocolos; medo de julgamento |
| **Ganhos** | Acolhimento; permissão segura; etiqueta; contato humano |

### Seu Jorge

| Campo | Resposta |
|-------|----------|
| **Pensa e sente** | "Minha casa é do povo"; orgulho e vigilância sobre o que se publica sobre a casa |
| **Ouve** | Filhos que pedem para "verificar na internet"; notícias de intolerância; elogios |
| **Vê** | A casa sem site; grupos de WhatsApp saturados; que a busca nasce pela internet |
| **Fala e faz** | Atende pelo WhatsApp, delega tecnologia, narra a história da casa |
| **Dores** | Invisibilidade; não entender tecnologia; medo de golpe; tempo |
| **Ganhos** | Visibilidade sem esforço; legitimidade; memória documentada; novos filhos |

### Mariana

| Campo | Resposta |
|-------|----------|
| **Pensa e sente** | "Somos vulneráveis sozinhos"; vontade de encontrar a comunidade |
| **Ouve** | Notícias de intolerância; convites de eventos de outras casas; "não há lugar para unir a comunidade" |
| **Vê** | Eventos dispersos; força da comunidade cristã; vulnerabilidade da sua |
| **Fala e faz** | Recomenda, avalia, participa, indica casas; defende a tradição |
| **Dores** | Fragmentação, falta de calendário único, exposição à intolerância |
| **Ganhos** | Calendário unificado; rede de apoio; denúncias eficazes; pertencimento |

---

## 6. User Needs consolidadas

| Necessidade | Persona | Módulo/feature que resolve |
|-------------|---------|----------------------------|
| Encontrar terreiro confiável perto de mim | Carla, Mariana, Rafael | Busca geográfica + filtro de score + match (docs 26, 20) |
| Saber que uma casa é verificável | Carla, Seu Jorge | Selos e verificação (doc 36), score |
| Navegar sem jargão / contexto cultural | Carla, Dona Rosa | Guia de etiqueta, glossário, chat IA (docs 20, 93) |
| Visibilidade digital sem esforço | Seu Jorge, Mãe Beata | SaaS de perfil + onboarding WhatsApp (doc 50) |
| Gestão de agenda, membros e Pix | Seu Jorge, Pai Ricardo | SaaS (doc 17) |
| Documentar memória e história | Mãe Beata | Galeria histórica, linha do tempo |
| Calendário religioso / eventos | Mariana, Dona rosa | Calendário inteligente, eventos (doc 20) |
| Avaliar a experiência e responder | Mariana | Política de avaliação (doc 37), respostas |
| Denunciar com segurança e mediação | Mariana, Mãe Beata | Validação de denúncia, mediação (doc 39) |
| Segregação por tradição | Carla, visitantes | Filtros e ontologia (doc 66) |
| Acessibilidade (rampa, banheiro) | Dona Rosa | Filtro "acessibilidade" |
| Compra de artigos com origem | Marlene, dirigentes | Marketplace + selo de origem (doc 18) |

---

## 7. Pain points transversais (inclui temas culturais sensíveis)

| Dor transversal | Impacto | Solução proposta |
|-----------------|---------|------------------|
| Incerteza entre "casa séria" e "casa falsa" | Risco de fraude; perda de confiança | TrustScore + verificação + filtro de score (docs 28, 36) |
| Medo de preconceito ao ser vista/visto | Abandono antes da primeira visita | Ambiente moderado, conteúdo neutro, onboarding acolhedor (doc 26) |
| Comunidade fragmentada sem calendário | Isolamento, perda de participação | Eventos unificados e grupos (doc 07) |
| Complexidade tecnológica do dirigente | Baixa adoção | Onboarding humano via WhatsApp (doc 32), delegação de acesso |
| Golpes e charlatanismo com o nome da tradição | Confiança nasceu da plataforma | Verificação do dirigente, selo, denúncia ágil |
| **Sigilo iniciático** (o que pode ser mostrado) | Quebra de confiança, apropriação | Nunca mostrar ritual que não seja aberto; consentimento do dirigente para o que for mostrado |
| **Consentimento de fotos de rituais** | Exposição à desautorização / risco | Política de fotos com autorização + moderação (doc 36), regra de consentimento de rituais |
| Discurso de ódio / intolerância | Risco à plataforma e à comunidade | Moderação IA + humano < 4h (doc 39), triagem para crime |
| Avaliação sobre a fé (invasiva) | Controvérsia e fragilidade | Política de avaliação de experiência, não da fé (doc 37) |
| Manipulação de score / avaliações | Crise de confiança | Anti-fraude, meta-análise (docs 38, 41) |
| Dados de religião (LGPD) | Confiança e risco legal | LGPD nativa, anonimização (doc 56) |

Temas sensíveis são **não negociáveis** de política antes do lançamento: fotos de rituais **nunca** sem consentimento; matérias sobre iniciados (quem, o que, quando) **nunca** são publicadas por padrão (docs 36, 47).

---

## 8. Segmentação

### Por comportamento

| Perfil | Característica | Ação prioritária |
|--------|-----------------|------------------|
| **Buscador cauteloso** | Lê muito, decide por confiança | Onboarding, guias, chat IA, etiqueta |
| **Delegador** (dirigente) | Delega tecnologia a um filho de santo | SaaS delegável, onboarding humano |
| **Comunidade ativa** (filho de santo) | Participa, avalia, recomenda | Eventos, grupos, comunidade |
| **Mobile-first** | Apenas smartphone, WhatsApp-first | Mobile-first, Pix |

### Por tradição

| Tradição | Particularidades | Ajuste na plataforma |
|----------|-------------------|----------------------|
| **Umbanda** | Maior abertura à visita; desenvolvimento mediúnico | Filtros "aceita visitantes", "desenvolvimento mediútico" |
| **Candomblé (Ketu, Nagô, Angola, Jeje)** | Eixo de sigilo e respeito | Perfil com tradição, calendário, consentimento |
| **Jurema** | Acesso e variação regional | Respeito ao contexto; modelagem (ontologia, doc 66) |
| **Tambor de Mina, Xangô, Omolocô, encantaria** | Menos visibilidade digital, história forte | Oportunidade de descoberta diferencial |

Toda decisão atende **todas** as tradições — nada de favoritismo doutrinário (doc 01). A segmentação por tradição serve de **filtro e relevância**, nunca de hierarquia.

---

## Notas de método

- Personas são hipóteses testáveis, não: cada uma é ligada a módulos e métricas (docs 43, 44).
- Instrumentos de pesquisa respeitam LGPD (doc 56); recrutamento passa por federações e lideranças (doc 31).
- As personas 1-3 expandem o doc 10; secundárias desdobram Dr. Paulo (→Araci) e Gabriel (→Marlene/lojista); anti-personas são coisas novas no programa.

---

## Referências cruzadas

- Personas originais: doc 10
- Mercado/SWOT: doc 02; posicionamento: doc 26
- Confiança: 28; verificação: 36; avaliação: 37; moderação: 39; anti-fraude: 38
- Módulos SaaS/Marketplace/IA/Comunidade: 17, 18, 20, 35
- LGPD: 56; APIs e dados: 21, 86; governança: 48, 57