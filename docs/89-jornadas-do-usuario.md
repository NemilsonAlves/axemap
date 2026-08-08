# 89 — Jornadas do Usuário

## Propósito deste documento

Mapear as jornadas completas dos 15 perfis da plataforma, do primeiro contato ao engajamento contínuo. Complementa os casos de uso (doc 08), os fluxos técnicos (doc 09), as personas (doc 10), o backlog priorizado (doc 22), o Trust Score (doc 28) e a matriz de papéis RBAC (doc 57). O objetivo é orientar a equipe de produto, design e engenharia sobre **onde a plataforma precisa brilhar no MVP** e onde fricções podem destruir a confiança da comunidade.

## Como ler este documento

- Cada perfil tem uma ficha com: Entrada, Objetivo, Fluxo, Decisões, Problemas, Soluções, Saída, Pontos de atrito e Oportunidades de melhoria.
- Os **5 primeiros perfis** (Visitante, Usuário Logado, Filho de Santo, Sacerdote e Administrador do Terreiro) incluem um **diagrama de linha do tempo** (fase → ação → emoção → canal → métrica de sucesso).
- A seção final prioriza as jornadas em relação à North Star do produto: **conexões confiáveis entre pessoas e terreiros** (medida por terreiros ativos, avaliações verificadas e contatos WhatsApp efetivados).

---

## Jornada 1 — Visitante

### 1.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Carla (persona 1), 28 anos, designer em São Paulo, católica não praticante, curiosa sobre Umbanda. Aprendeu sobre o AxéMap por um post no Instagram ou pela indicação de uma amiga. |
| **Contexto** | Não conhece ninguém do segmento, tem medo de preconceito e não sabe como chegar a um terreiro. Acessa pelo celular em um momento de interesse espiritual (à noite, em casa). |
| **Estado inicial** | Não autenticado, primeiro acesso, sem histórico na plataforma. |
| **Canal de entrada** | Direto (link/QR code), orgânico (SEO/Instagram), ou anúncio. |

### 1.2 Objetivo

Encontrar um terreiro que aceite visitantes, seja acolhedor e inclusivo, e entrar em contato de forma segura e sem constrangimento.

### 1.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Abre o site pelo link | Homepage com hero "Encontre terreiros confiáveis" | Landing page pública |
| 2 | Digita "terreiro perto de mim" | Campo de busca com autocomplete | Busca por texto + geolocalização (se autorizada) |
| 3 | Autoriza a localização do navegador | Modal de permissão de geolocalização | Permissão GPS (opcional) |
| 4 | Aplica filtros "aceita visitantes" e "ambiente inclusivo" | Sidebar de filtros (lista + mapa) | Filtros aplicados à query |
| 5 | Analisa os resultados ordenados por distância e Trust Score | Cards com badge de confiança + pins no mapa | Resultados com score visível (doc 28) |
| 6 | Abre o perfil de um terreiro com score alto | Página pública /terreiro/[slug] | Perfil completo + fotos + avaliações + eventos |
| 7 | Lê a seção "Como funciona a visita" e as avaliações | Bloco de informações e avaliações verificadas | Avaliações moderadas visíveis |
| 8 | Clica em "Chamar no WhatsApp" | Botão de contato com mensagem pré-formatada | Redirecionamento para WhatsApp |
| 9 | Envia mensagem e conversa com o dirigente | WhatsApp externo | Fora da plataforma (tracking opcional de clique) |
| 10 | Se desejar, cria conta para salvar o terreiro | CTA de cadastro pós-contato | Fluxo de autenticação (doc 09, Fluxo 7) |

### 1.4 Decisões

| Etapa | Decisão da pessoa | Fatores que influenciam | Desfecho possível |
|-------|-------------------|------------------------|-------------------|
| Busca | Usar texto livre vs. localização | Urgência, conforto com tecnologia | Resultados por geolocalização ou por cidade |
| Filtros | Rigor dos filtros aplicados | Receio de rejeição, perfil espiritual | Lista curta e qualificada vs. lista ampla |
| Seleção | Confiar em score alto + avaliações | Transparência do Trust Score | Abertura do perfil completo |
| Contato | WhatsApp vs. apenas favoritar | Timidez, grau de intenção | Conversa iniciada ou retorno futuro |

### 1.5 Problemas (fricções)

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Medo de preconceito e julgamento ao entrar em contato | Alta |
| 2 | Não sabe o protocolo correto de visita a um terreiro | Alta |
| 3 | Desconfiança sobre a autenticidade das informações | Média |
| 4 | Preocupação de que o terreiro não "aceite" pessoas de outras religiões | Alta |
| 5 | Exige cadastro para ver detalhes (se a plataforma bloquear) | Média |

### 1.6 Soluções (como o produto resolve)

| Fricção | Solução do produto |
|---------|--------------------|
| 1 | Perfis com linguagem acolhedora, selo "aceita visitantes" e diretrizes de visita publicadas |
| 2 | Bloco "Como visitar pela primeira vez" padronizado, com etiqueta de respeito à tradição |
| 3 | Trust Score transparente (doc 28), avaliações moderadas, selos de verificação |
| 4 | Filtro "aceita visitantes" explícito e descrição da casa direcionada a curiosos respeitosos |
| 5 | Todo o fluxo de descoberta disponível para visitante, sem cadastro obrigatório |

### 1.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Contato via WhatsApp iniciado OU perfil salvo em favoritos (se logado) |
| **Próximo passo** | Visita ao terreiro, retorno à plataforma para avaliar a experiência e (idealmente) criar conta |

### 1.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Autorização de geolocalização no primeiro acesso | Médio |
| Carregamento do mapa em conexões lentas | Médio |
| Compreensão do Trust Score | Baixo |
| Decisão de entrar em contato (barreira emocional) | Alto |

### 1.9 Oportunidades de melhoria

- Guia "primeira visita" com checklist interativo e vídeos curtos.
- CTA "continuar sem cadastro" sempre disponível para reduzir fricção de conversão.
- Ordenação por "amigável a visitantes" como opção padrão em clusters urbanos.
- Modo escuro e leitura de tela para reduzir barreiras.

### 1.10 Linha do tempo (fase → ação → emoção → canal → métrica)

| Fase | Ação | Emoção | Canal | Métrica de sucesso |
|------|------|--------|-------|--------------------|
| Descoberta | Vê o anúncio/post sobre o AxéMap | Curiosidade | Instagram / indicação | CTR do link de entrada |
| Engajamento | Faz a primeira busca | Esperança | Web/mobile | Tempo até a primeira busca |
| Exploração | Aplica filtros e navega perfis | Confiança crescente | Web/mobile | Taxa de abertura de perfil |
| Conexão | Clica em WhatsApp | Coragem | Web → WhatsApp | Taxa de clique em contato |
| Ativação | Envia mensagem para o dirigente | Alívio e expectativa | WhatsApp | Contatos efetivados |
| Retenção | Cria conta e salva favoritos | Segurança | Web/mobile | Conversão para cadastro |

---

## Jornada 2 — Usuário Logado (Praticante)

### 2.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Mariana (persona 3), 32 anos, professora universitária em Porto Alegre, umbandista há 5 anos. Já tem conta e busca expandir sua rede de contatos e eventos. |
| **Contexto** | Entrou recentemente em um novo bairro/cidade ou quer conhecer terreiros de outras casas para troca de experiências. |
| **Estado inicial** | Autenticado, perfil completo, email confirmado, RBAC praticante (doc 57). |

### 2.2 Objetivo

Encontrar eventos abertos de outras casas, avaliar terreiros visitados, construir sua rede de praticantes e contribuir com a comunidade.

### 2.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Faz login | Tela de login (JWT + refresh token) | Sessão ativa (doc 09, Fluxo 7) |
| 2 | Acessa o dashboard "Minha conta" | Dashboard com favoritos, avaliações, convites | Painel do usuário |
| 3 | Busca eventos abertos de Umbanda no fim de semana | Calendário de eventos com filtros | Lista de eventos publicados |
| 4 | Favorita um evento e compartilha no grupo da comunidade | Botão favoritar + compartilhar | Evento salvo; link com Open Graph |
| 5 | Visita o terreiro novo | — (fora da plataforma) | — |
| 6 | Retorna e avalia o terreiro visitado | Formulário de avaliação (nota + texto) | Avaliação entra em "pendente" para moderação (doc 09, Fluxo 3) |
| 7 | Recebe notificação de aprovação | Notificação (push/email) | Avaliação aprovada e score recalculado |
| 8 | Participa do fórum/feed da comunidade | Feed com posts, curtidas e comentários | Conteúdo moderado |

### 2.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Alvo da busca | Evento aberto vs. visita agendada | Disponibilidade, proximidade | Comparecimento |
| Avaliação | Avaliar publicamente vs. manter para si | Receio de retaliação, costume | Nota + comentário publicado |
| Compartilhamento | Divulgar no grupo vs. guardar | Orgulho de pertencimento | Maior alcance do terreiro |

### 2.5 Problemas (fricções)

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Avaliação demora a ser aprovada e a pessoa perde o ímpeto | Média |
| 2 | Receio de avaliações negativas gerarem conflito entre casas | Alta |
| 3 | Dificuldade de saber quais eventos são "abertos a visitantes" | Média |
| 4 | Notificações excessivas ou irrelevantes | Média |

### 2.6 Soluções

| Fricção | Solução do produto |
|---------|--------------------|
| 1 | Moderação por IA em paralelo com aprovação humana; feedback de status em tempo real |
| 2 | Política de anonimato parcial em avaliações sensíveis e mediação de conflitos |
| 3 | Atributo obrigatório "evento aberto ao público?" na publicação |
| 4 | Preferências de notificação granulares por categoria e frequência |

### 2.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Terreiro avaliado, eventos favoritados, participação ativa na comunidade |
| **Próximo passo** | Recomendação a amigos curiosos (efeito viral) e retorno para novos eventos |

### 2.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Tempo de aprovação da avaliação | Médio |
| Decisão de avaliar publicamente | Alto |
| Navegação entre dashboard e comunidade | Baixo |
| Gestão de notificações | Médio |

### 2.9 Oportunidades de melhoria

- Notificação push de "avaliação aprovada" com link direto para o perfil avaliado.
- Rascunho de avaliação (salvar automaticamente caso a pessoa desista no meio).
- Recomendação de eventos "do seu perfil" baseada no histórico.

### 2.10 Linha do tempo

| Fase | Ação | Emoção | Canal | Métrica de sucesso |
|------|------|--------|-------|--------------------|
| Reentrada | Login e dashboard | Familiaridade | Web/mobile | Retenção D+7 |
| Descoberta | Busca de eventos abertos | Antecipação | Web/mobile | Cliques em eventos |
| Salvamento | Favorita e compartilha | Pertencimento | Web/mobile | Compartilhamentos por usuário |
| Experiência | Visita o terreiro | Curiosidade | Offline | (qualitativo) |
| Contribuição | Avalia o terreiro | Gratidão/cautela | Web/mobile | Avaliações por usuário ativo |
| Confirmação | Recebe aprovação da avaliação | Reconhecimento | Push/email | Tempo de moderação |
| Comunidade | Participa do feed | Conexão | Web/mobile | Posts + comentários |

---

## Jornada 3 — Filho de Santo

### 3.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Filho de Santo iniciado (RBAC: papel "Filho de Santo" dentro do terreiro, doc 57), convidado pelo dirigente por WhatsApp/email. |
| **Contexto** | O terreiro migrou para o SaaS do AxéMap e o dirigente está montando a lista de membros. |
| **Estado inicial** | Usuário logado, sem vínculo com terreiro ainda; recebe convite. |

### 3.2 Objetivo

Aceitar o vínculo com o terreiro, acessar a agenda de giras e as comunicações internas, e participar das atividades da casa.

### 3.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Recebe convite do dirigente | Notificação (WhatsApp/email) com link de aceite | Convite com token |
| 2 | Abre o link e faz login (ou cria conta) | Tela de login/cadastro | Autenticação |
| 3 | Aceita o vínculo com o terreiro | Tela de confirmação do convite | Membro vinculado, papel atribuído |
| 4 | Visualiza a agenda de giras e compromissos | Painel do membro / agenda compartilhada | Agenda do terreiro |
| 5 | Confirma presença em uma gira | Ação de "confirmar presença" | Presença registrada |
| 6 | Recebe comunicados internos | Central de avisos / push | Mensagens da casa |
| 7 | Contribui com doação/contribuição mensal (se habilitado) | Módulo de contribuições | Registro de contribuição |

### 3.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Aceite do convite | Aceitar e vincular perfil | Confiança no terreiro, privacidade | Vínculo ativo |
| Participação | Confirmar presença nas giras | Agenda pessoal | Presenças registradas |
| Privacidade | Expor nome/foto no diretório de membros | Discrição (medo de discriminação no trabalho) | Visibilidade restrita ou pública |

### 3.5 Problemas (fricções)

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Medo de que a associação religiosa vaze para o ambiente de trabalho | Alta |
| 2 | Letramento digital baixo em membros mais velhos | Alta |
| 3 | Confusão sobre os múltiplos papéis (ogã, ekedi, filho de santo) | Média |
| 4 | Dependência do dirigente para ajustes de conta | Média |

### 3.6 Soluções

| Fricção | Solução do produto |
|---------|--------------------|
| 1 | Controle granular de privacidade (perfil invisível no diretório, avatar, nome social) |
| 2 | Interface simplificada no app do membro, ícones grandes, modo guiado |
| 3 | Wizard de papel explicando funções e permissões em linguagem simples |
| 4 | Fluxo de "fale com o dirigente" in-app e autoatendimento básico |

### 3.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Membro ativo da casa, agenda sincronizada, comunicação fluindo |
| **Próximo passo** | Participação contínua nas atividades e uso do calendário religioso |

### 3.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Aceite do convite (fluxo de login prévio) | Médio |
| Configuração de privacidade | Médio |
| Letramento digital | Alto |
| Confirmação de presença | Baixo |

### 3.9 Oportunidades de melhoria

- Aceite de convite sem senha (magic link com expiração curta).
- Perfis de membro com "modo discrição" pré-ativado para usuários recém-vinculados.
- Vídeos tutoriais curtos em português simples para cada ação principal.

### 3.10 Linha do tempo

| Fase | Ação | Emoção | Canal | Métrica de sucesso |
|------|------|--------|-------|--------------------|
| Convite | Recebe convite do dirigente | Honra/curiosidade | WhatsApp/email | Taxa de aceite de convites |
| Ativação | Aceita vínculo e explora o painel | Insegurança inicial | Web/mobile | Tempo até a primeira ação |
| Rotina | Confirma presença e lê avisos | Pertencimento | Web/mobile | Membros ativos semanais |
| Contribuição | Faz contribuição mensal | Compromisso | Mobile/WhatsApp | Taxa de contribuição |
| Retenção | Mantém-se conectado à agenda | Estabilidade | Mobile | Retenção D+30 de membros |

---

## Jornada 4 — Sacerdote (Dirigente)

### 4.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Seu Jorge (persona 2), 55 anos, pai de santo há 30 anos em Salvador, dirige o Ilê Axé Oyá (Candomblé Ketu). Não tem site e só funciona no boca-a-boca. |
| **Contexto** | Um filho de santo mais jovem ofereceu ajuda para cadastrar o terreiro. O dirigente tem baixo letramento digital e muito receio de tecnologia. |
| **Estado inicial** | Não cadastrado; conta criada com auxílio de um terceiro. |

### 4.2 Objetivo

Ganhar visibilidade para o terreiro, atrair novos filhos, divulgar eventos e manter a casa atualizada sem complexidade.

### 4.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Cria conta (com ajuda de um membro jovem) | Tela de cadastro multi-step | Autenticação |
| 2 | Cadastra o terreiro | Formulário multi-step (7 passos, doc 09 Fluxo 2) | Status "pendente" |
| 3 | Recebe aprovação da moderação | Notificação por email/WhatsApp | Status "aprovado", visível na busca |
| 4 | Preenche gradualmente fotos, horários e descrição | Painel de edição do terreiro | Completeza do perfil (C) sobe |
| 5 | Publica o primeiro evento (gira aberta) | Calendário de eventos | Atualização (A) do Trust Score |
| 6 | Responde a avaliações recebidas | Central de avaliações | Engajamento social (S) |
| 7 | Gerencia via WhatsApp as mensagens recebidas | Botão de contato | Tracking de cliques |

### 4.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Cadastro | Cadastrar agora vs. adiar | Confiança na plataforma | Terreiro ativo ou abandonado |
| Completeza | Preencher tudo vs. mínimo | Tempo, letramento digital | Score maior ou menor |
| Eventos | Publicar giras abertas vs. só internas | Segurança, tradição | Alcance maior ou menor |
| Delegação | Delegar gestão a um co-admin | Confiança nos filhos de santo | Menos sobrecarga |

### 4.5 Problemas (fricções)

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Baixo letramento digital; formulários longos assustam | Alta |
| 2 | Medo de exposição e ataques de intolerância religiosa | Alta |
| 3 | Não tem tempo para manter o perfil atualizado | Alta |
| 4 | Confunde painel do terreiro com painel do usuário | Média |
| 5 | Receio de que a plataforma "julgue" a espiritualidade da casa | Alta |

### 4.6 Soluções

| Fricção | Solução do produto |
|---------|--------------------|
| 1 | Cadastro assistido (wizard), modo texto simples, suporte humano por WhatsApp |
| 2 | Controles de privacidade (ocultar endereço exato, mostrar apenas bairro/cidade) |
| 3 | Modo "manutenção por terceiros" com co-admin + lembretes gentis de atualização |
| 4 | Navegação única com "Meu Terreiro" como entidade central |
| 5 | Neutralidade doutrinária explícita (doc 01) e ausência de ranking espiritual |

### 4.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Terreiro ativo com score em crescimento, eventos publicados e membros vinculados |
| **Próximo passo** | Upgrade para plano SaaS (Básico/Profissional) para desbloquear agenda e financeiro |

### 4.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Cadastro multi-step sem assistência | Alto |
| Configuração de privacidade | Médio |
| Manutenção contínua do perfil | Alto |
| Entendimento do Trust Score | Médio |

### 4.9 Oportunidades de melhoria

- "Cadastro assistido" por WhatsApp (assistente humano/IA que preenche em nome do dirigente).
- Kit de onboarding físico (QR code impresso para visitantes do terreiro).
- Dicas proativas no painel: "Complete seu perfil para alcançar +8 pontos de score".

### 4.10 Linha do tempo

| Fase | Ação | Emoção | Canal | Métrica de sucesso |
|------|------|--------|-------|--------------------|
| Decisão | Decide cadastrar com ajuda de membro | Esperança/cautela | WhatsApp + web | Cadastros concluídos |
| Ativação | Conclui o cadastro multi-step | Apreensão | Web/mobile | Taxa de conclusão do wizard |
| Publicação | Terreiro aprovado e visível | Orgulho | Web/mobile | Tempo de aprovação |
| Operação | Publica eventos e responde avaliações | Confiança | Web/mobile | Terreiros ativos (publicam 1x/mês) |
| Crescimento | Recebe contatos e novos visitantes | Realização | WhatsApp | Contatos recebidos |

---

## Jornada 5 — Administrador do Terreiro (Co-Admin)

### 5.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Filho de santo jovem e digital (perfil "Co-Admin", doc 57) nomeado pelo dirigente para operar a plataforma. Ex.: Pai Ricardo (persona 4) delega a um membro da casa. |
| **Contexto** | O dirigente confia no co-admin para editar perfil, gerenciar membros e publicar eventos, mantendo as decisões estratégicas consigo. |
| **Estado inicial** | Usuário logado, papel Co-Admin no terreiro. |

### 5.2 Objetivo

Manter o perfil do terreiro atualizado, gerenciar membros, publicar eventos e garantir que a casa tenha boa presença digital sem depender do dirigente.

### 5.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Recebe papel de Co-Admin | Notificação de papel atribuído | RBAC atualizado |
| 2 | Acessa o painel "Meu Terreiro" | Painel administrativo do terreiro | Permissões de edição liberadas |
| 3 | Edita informações e fotos do perfil | Editor do perfil | Completeza (C) recalculada |
| 4 | Convida novos membros | Módulo de membros (doc 08 UC08) | Convites enviados |
| 5 | Publica eventos no calendário | Calendário de eventos | Eventos visíveis |
| 6 | Responde avaliações e mensagens | Central de avaliações/mensagens | Engajamento (S) |
| 7 | Monitora o Trust Score e relata ao dirigente | Dashboard com radar do score (doc 28) | Score acompanhado |

### 5.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Edição de conteúdo | Alterar conteúdo sem consultar o dirigente | Autonomia vs. hierarquia da casa | Conteúdo atualizado |
| Publicação de eventos | Publicar direto vs. aguardar aprovação do dirigente | Gravidade do evento | Evento no ar |
| Prioridades | Focar em score vs. foco em eventos | Diretrizes da casa | Crescimento do perfil |

### 5.5 Problemas (fricções)

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Conflito de autoridade: editar sem consultar o dirigente | Média |
| 2 | Falta de histórico/auditoria de quem alterou o quê | Média |
| 3 | Não há "modo revisão" para mudanças sensíveis | Média |
| 4 | Dependência do dirigente para assinar plano/verificar identidade | Média |

### 5.6 Soluções

| Fricção | Solução do produto |
|---------|--------------------|
| 1 | Configuração de permissões finas (doc 57) definidas pelo dirigente |
| 2 | Audit logs de alterações no perfil visíveis no painel |
| 3 | "Rascunho para revisão" para mudanças críticas (finanças, verificação) |
| 4 | Fluxo de solicitação de aprovação in-app ao dirigente |

### 5.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Terreiro atualizado, membros gerenciados, eventos no ar, score crescente |
| **Próximo passo** | Sugerir ao dirigente upgrade de plano e novas funcionalidades |

### 5.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Separação de responsabilidades com o dirigente | Médio |
| Fluxo de revisão de mudanças | Médio |
| Gestão de convites de membros | Baixo |
| Monitoramento do score | Baixo |

### 5.9 Oportunidades de melhoria

- Centro de "saúde do perfil" com checklist de ações recomendadas.
- Modo de auditoria simples ("últimas 10 alterações por quem").
- Permissão de delegar eventos a ogãs e ekedis com curadoria do co-admin.

### 5.10 Linha do tempo

| Fase | Ação | Emoção | Canal | Métrica de sucesso |
|------|------|--------|-------|--------------------|
| Delegação | Recebe papel de co-admin | Responsabilidade | Notificação | Papéis ativados |
| Operação | Atualiza perfil e fotos | Produtividade | Web | Atualizações por semana |
| Gestão | Convida e gerencia membros | Organização | Web/mobile | Membros vinculados |
| Publicação | Publica eventos | Satisfação | Web/mobile | Eventos publicados/mês |
| Melhoria | Eleva o score da casa | Orgulho | Web/mobile | Evolução do Trust Score |

---

## Jornada 6 — Babalorixá

### 6.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Babalorixá (pai de santo de tradição de Candomblé) dirigindo terreiro de grande porte, com muitos filhos de santo iniciados e agenda intensa de obrigações e festas. |
| **Contexto** | Busca profissionalização da gestão do terreiro mantendo a sacralidade das práticas; lida com fluxo de turismo religioso e pesquisadores. |

### 6.2 Objetivo

Gerir agenda de obrigações, organizar filhos de santo por cargo, coordenar festas e receber visitantes/pesquisadores com segurança, preservando a tradição.

### 6.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Acessa o painel do terreiro | Dashboard completo do SaaS | Plano ativo |
| 2 | Agenda obrigações e festas | Calendário com tipos de evento | Eventos organizados |
| 3 | Organiza filhos de santo por cargo (ogã, ekedi) | Módulo de membros (doc 57) | Papéis definidos |
| 4 | Publica fotos e histórico da casa | Galeria histórica (memória da casa) | Completeza (C) |
| 5 | Configura regras de visita para pesquisadores/turistas | Bloco de diretrizes de visita | Transparência |
| 6 | Coordena contribuições e doações | Módulo de contribuições | Registro financeiro |
| 7 | Monitora denúncias/respostas de intolerância | Centro de proteção e apoio | Comunicação com suporte |

### 6.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Publicação | Expor rituais públicos vs. manter reservado | Sacralidade vs. visibilidade | Calendário seletivo |
| Verificação | Buscar selo de identidade | Segurança vs. burocracia | Score mais alto |
| Turismo | Acolher turistas religiosos | Receita vs. preservação | Fluxo de visitas |
| Finanças | Digitalizar contribuições | Costume vs. praticidade | Receita organizada |

### 6.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Medo de profanação de informações sagradas | Alta |
| 2 | Sobreposição de agendas e conflitos de horário | Média |
| 3 | Burocracia de verificação de identidade | Média |
| 4 | Vulnerabilidade a ataques de intolerância | Alta |

### 6.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Controles de visibilidade por tipo de evento; avisos de "conteúdo sensível culturalmente" |
| 2 | Conflitos de agenda com sugestões automáticas de horários |
| 3 | Verificação assistida por humano (suporte da plataforma) |
| 4 | Canal rápido de denúncia com prioridade e apoio jurídico parceiro |

### 6.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Terreiro plenamente gerenciado, tradição preservada, público ampliado |
| **Próximo passo** | Publicação de cursos/ensino e expansão para Marketplace próprio |

### 6.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Visibilidade de rituais | Alto |
| Verificação de identidade | Médio |
| Coordenação de agenda | Médio |
| Gestão de doações | Baixo |

### 6.9 Oportunidades de melhoria

- Calendário religioso inteligente com datas tradicionais (pós-MVP, doc 22 item 64).
- "Guia do pesquisador" com perguntas frequentes para reduzir pedidos repetitivos.
- Área de memória digital com linha do tempo histórica da casa.

---

## Jornada 7 — Iyalorixá

### 7.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Mãe Beata de Iemanjá (persona 5), 68 anos, iyalorixá em Recife, dirige Ilê Axé Omolu há mais de 40 anos. Enfrenta intolerância crescente e valoriza o registro da memória. |
| **Contexto** | Cadastrou o terreiro com ajuda de uma neta; vê a plataforma como "ato de resistência" e espaço de documentação histórica. |

### 7.2 Objetivo

Documentar a história do terreiro, garantir segurança diante de ataques, manter a transparência e deixar legado para as próximas gerações.

### 7.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Acessa o painel com ajuda da neta | Painel em modo assistido | Conta ativa |
| 2 | Adiciona galeria histórica e narrativa da casa | Galeria + linha do tempo | Memória registrada |
| 3 | Ativa verificação do perfil | Fluxo de verificação (doc 28) | Selos conquistados |
| 4 | Monitora avaliações e denúncias | Central de avaliações | Reputação controlada |
| 5 | Publica eventos comunitários (ações sociais) | Calendário + engajamento social | Score social (S) |
| 6 | Recebe suporte em caso de ataque de intolerância | Canal de apoio prioritário | Segurança garantida |

### 7.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Memória | Publicar história da casa | Orgulho vs. exposição | Legado digital |
| Verificação | Enviar documento de identidade | Confiança vs. burocracia | Selo de identidade |
| Visibilidade | Ocultar endereço exato | Segurança | Perfil mais seguro |
| Ações sociais | Publicar ações comunitárias | Valores da casa | Engajamento social |

### 7.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Dependência total de terceiros para operar a plataforma | Alta |
| 2 | Medo de ataques/doação de ódio nas avaliações | Alta |
| 3 | Receio de que a memória seja usada de forma desrespeitosa | Alta |
| 4 | Dificuldade de acesso (visão, letramento) | Alta |

### 7.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Programa "ajudante de casa" (co-admin) + suporte humano em português |
| 2 | Moderação pré-publicação, bloqueio de ofensas e denúncia com prioridade |
| 3 | Direitos de uso de conteúdo e marca d'água opcional nas fotos |
| 4 | Acessibilidade total (fonte grande, leitor de tela, modo guiado) |

### 7.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Terreiro verificado, memória documentada, comunidade protegida |
| **Próximo passo** | Programa de embaixadores e parceria com organizações de defesa religiosa |

### 7.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Dependência de terceiros | Alto |
| Exposição e intolerância | Alto |
| Verificação burocrática | Médio |
| Acessibilidade | Alto |

### 7.9 Oportunidades de melhoria

- Modo de voz para comandos simples (pós-MVP).
- "Cartilha de proteção" comunitária gerada pela plataforma.
- Certificado digital de memória com data e autoria da casa.

---

## Jornada 8 — Professor

### 8.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Professor(a) de cursos do terreiro (EAD ou presencial), indicado pelo dirigente; pode ser um filho de santo sênior ou um parceiro externo. |
| **Contexto** | O terreiro habilitou o módulo de cursos (doc 22 item 52) e o professor precisa criar conteúdo, matricular alunos e acompanhar progresso. |

### 8.2 Objetivo

Criar e ministrar cursos, publicar materiais, acompanhar matrículas e emitir certificados sem infraestrutura própria.

### 8.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Recebe papel de Professor | Notificação de papel (RBAC) | Permissão de criação |
| 2 | Cria um curso | Editor de curso (módulos, aulas) | Curso em rascunho |
| 3 | Publica vídeos e materiais | Biblioteca de conteúdo | Conteúdo ativo |
| 4 | Abre matrículas | Gerenciador de matrículas | Alunos inscritos |
| 5 | Acompanha progresso dos alunos | Dashboard de progresso | Métricas de aprendizagem |
| 6 | Aplica avaliações e emite certificados | Módulo de avaliação/certificado | Certificados emitidos |

### 8.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Formato | Curso pago vs. gratuito | Missão da casa vs. receita | Alcance e receita |
| Conteúdo | Aberto vs. restrito a iniciados | Sigilo ritual | Acesso controlado |
| Certificação | Certificado próprio vs. co-branded | Credibilidade | Valor do certificado |

### 8.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Falta de infraestrutura de vídeo e hospedagem | Alta |
| 2 | Dúvida sobre o que pode ser ensinado abertamente | Alta |
| 3 | Gestão manual de matrículas e pagamentos | Média |
| 4 | Dificuldade de engajar alunos a distância | Média |

### 8.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Hospedagem de vídeo integrada e player responsivo |
| 2 | Diretrizes de conteúdo culturalmente sensível e avisos de "conteúdo restrito a iniciados" |
| 3 | Matrículas, cobrança e listas automatizadas |
| 4 | Lembretes automáticos, fórum de dúvidas e certificados |

### 8.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Curso ativo com alunos engajados e certificados emitidos |
| **Próximo passo** | Nova turma, cursos avançados e programação de parcerias |

### 8.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Upload e edição de vídeo | Médio |
| Definição de conteúdo público vs. restrito | Alto |
| Gestão de matrículas | Médio |
| Emissão de certificados | Baixo |

### 8.9 Oportunidades de melhoria

- Bibliotecas de materiais reutilizáveis entre turmas.
- Certificados digitais com assinatura e validação por link (doc 22 item 67).
- Coautoria de cursos entre professores.

---

## Jornada 9 — Aluno

### 9.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Praticante ou curioso que se matricula em um curso oferecido por um terreiro na plataforma. |
| **Contexto** | Encontrou o curso pela busca ou pela comunidade e quer aprender de forma respeitosa e estruturada. |

### 9.2 Objetivo

Matricular-se, acessar o conteúdo no seu ritmo, interagir com o professor e receber certificado ao concluir.

### 9.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Encontra o curso | Página do curso na busca/destaques | Curso público |
| 2 | Analisa programa e avaliações | Página de detalhes do curso | Informação completa |
| 3 | Efetua a matrícula (e pagamento, se pago) | Checkout de matrícula | Vaga reservada |
| 4 | Acessa o conteúdo | Player de aulas + material | Progresso registrado |
| 5 | Tira dúvidas no fórum | Fórum de dúvidas | Comunicação aluno-professor |
| 6 | Conclui as avaliações | Testes/atividades | Nota registrada |
| 7 | Recebe o certificado | Emissão automática | Certificado validável |

### 9.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Curso | Escolher curso público vs. restrito | Iniciação vs. curiosidade | Acesso ao conteúdo |
| Investimento | Pagar por curso pago | Orçamento, valor percebido | Matrícula concluída |
| Ritmo | Ritmo livre vs. turma com prazo | Disponibilidade | Conclusão |

### 9.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Dificuldade de pagamento (cartão/Pix no mobile) | Média |
| 2 | Medo de conteúdo desrespeitoso ou superficial | Média |
| 3 | Abandono por falta de acompanhamento | Alta |
| 4 | Dúvida sobre a validade do certificado | Média |

### 9.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Checkout com Pix e cartão, recibo automático |
| 2 | Avaliações de cursos, curadoria e diretrizes de conteúdo |
| 3 | Lembretes progressivos e trilha visual de progresso |
| 4 | Certificado digital com URL de validação pública |

### 9.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Curso concluído, certificado emitido, conexão com o terreiro criada |
| **Próximo passo** | Visitar o terreiro, matricular-se em novo curso ou aderir à comunidade |

### 9.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Checkout e pagamento | Médio |
| Engajamento ao longo do curso | Alto |
| Validação do certificado | Médio |
| Navegação no player | Baixo |

### 9.9 Oportunidades de melhoria

- Trilha de cursos recomendada por perfil.
- Download de materiais para estudo offline (PWA).
- Feedback do professor em atividades escritas.

---

## Jornada 10 — Turista

### 10.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Turista religioso ou cultural visitando uma cidade (ex.: Salvador, Recife, São Luís) em busca de experiência cultural autêntica e respeitosa. |
| **Contexto** | Quer conhecer um terreiro com segurança, sem desrespeitar a tradição; não conhece a comunidade local. |

### 10.2 Objetivo

Encontrar terreiros que recebam visitantes, agendar visita e vivenciar a cultura afro-brasileira com respeito e segurança.

### 10.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Busca terreiros na cidade turística | Busca por localização | Resultados geolocalizados |
| 2 | Filtra por "aceita visitantes" e "recebe turistas" | Filtros avançados | Lista qualificada |
| 3 | Lê diretrizes de visita e história | Perfil + galeria histórica | Contexto cultural |
| 4 | Entra em contato por WhatsApp | Botão de contato | Mensagem pré-formatada |
| 5 | Agenda a visita | Acordo via WhatsApp/agenda | Visita confirmada |
| 6 | Após a visita, avalia a experiência | Formulário de avaliação | Feedback registrado |

### 10.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Destino | Escolher terreiro | Score, avaliações, diretrizes | Visita agendada |
| Contribuição | Fazer doação/contribuição | Costume local, generosidade | Apoio à casa |
| Divulgação | Avaliar e compartilhar | Respeito à tradição | Visibilidade |

### 10.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Medo de cair em "falsa terreiro" comercial | Alta |
| 2 | Dúvida de etiqueta e vestimenta | Média |
| 3 | Barreira de idioma (turistas estrangeiros) | Média |
| 4 | Insegurança em bairros desconhecidos | Média |

### 10.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Trust Score, verificação e selos; avisos sobre casas verificadas |
| 2 | Guia de etiqueta no perfil e antes da visita |
| 3 | i18n (doc 22 item 55) e contato traduzido |
| 4 | Indicação de como chegar seguro + avaliações de outros visitantes |

### 10.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Visita realizada, experiência avaliada, terra conectado ao turismo cultural |
| **Próximo passo** | Compartilhamento, retorno em nova viagem, ingresso no turismo religioso da cidade |

### 10.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Confiança na autenticidade | Alto |
| Agendamento da visita | Médio |
| Idioma | Médio |
| Etiqueta | Baixo |

### 10.9 Oportunidades de melhoria

- Roteiros "turismo religioso" curados por cidade (Salvador, Recife, São Luís).
- Cartão virtual de contribuição via Pix na plataforma.
- Parceria com agências de turismo ético do segmento.

---

## Jornada 11 — Pesquisador

### 11.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Dr. Paulo (persona 7), antropólogo em Brasília, estuda a distribuição de terreiros no Brasil e busca dados agregados e anonimizados. |
| **Contexto** | Necessita de dados confiáveis para artigos científicos e políticas públicas; valoriza a transparência e o consentimento. |

### 11.2 Objetivo

Acessar dados agregados e anonimizados (API pública, doc 22 item 62), contatar terreiros para pesquisa de campo e contribuir com conhecimento.

### 11.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Conhece a plataforma por artigos/academia | Página pública / API docs | Documentação aberta |
| 2 | Solicita credencial de acesso à API | Portal de desenvolvedores | Chave de API |
| 3 | Baixa datasets agregados | Download de datasets | Dados anonimizados |
| 4 | Filtra por região/tradição | Consulta à API | Resultados segmentados |
| 5 | Contata terreiros para pesquisa de campo | Canal respeitoso de contato | Aprovação dos terreiros |
| 6 | Publica resultados | Fora da plataforma | (reconhecimento) |
| 7 | Retribui à comunidade com dados úteis | Publicação de relatório | Ciclo de valor |

### 11.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Fonte de dados | Usar AxéMap vs. outras fontes | Cobertura, confiança | Adoção da API |
| Abordagem de campo | Contato formal vs. informal | Ética da pesquisa | Relação com terreiros |
| Publicação | Compartilhar resultados com a comunidade | Reciprocidade | Confiança mútua |

### 11.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Falta de dados abertos e confiáveis no setor | Alta |
| 2 | Receio dos terreiros em participar de pesquisas | Alta |
| 3 | Ausência de acordos de uso de dados | Média |
| 4 | Dificuldade de obter consentimento ético | Média |

### 11.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | API pública com datasets agregados e LGPD nativa |
| 2 | Canal de contato formal com formulário de consentimento |
| 3 | Termos de uso de dados claros e abertos |
| 4 | Ferramenta de consentimento digital por terreiro |

### 11.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Dados obtidos, pesquisa conduzida, relação de confiança com a comunidade |
| **Próximo passo** | Parceria institucional, publicação e feed-back de dados à plataforma |

### 11.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Onboarding da API | Médio |
| Contato com terreiros | Alto |
| Consentimento | Médio |
| Qualidade dos dados | Médio |

### 11.9 Oportunidades de melhoria

- Dashboards públicos do "Mapa da Intolerância" (doc 08 UC18).
- Programa de "pesquisa responsável" com selo para pesquisadores.
- Relatórios automáticos de distribuição por região.

---

## Jornada 12 — Lojista

### 12.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Gabriel (persona 6), 29 anos, artesão de atabaques e agogôs em São Luís, hoje vende por encomenda e em feiras. |
| **Contexto** | Quer alcance nacional sem depender de marketplaces genéricos; busca compradores qualificados do segmento. |

### 12.2 Objetivo

Abrir loja no Marketplace, cadastrar produtos, gerenciar estoque e pedidos, e vender para todo o Brasil com segurança.

### 12.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Cadastra-se como vendedor | Onboarding de lojista | Conta de loja |
| 2 | Abre a loja e preenche perfil | Loja pública | Loja aprovada |
| 3 | Cadastra produtos (fotos, preços, estoque) | Catálogo de produtos | Produtos no ar |
| 4 | Define frete e prazos | Configuração de envio | Regras de envio |
| 5 | Recebe pedidos | Painel de pedidos | Pedidos em aberto |
| 6 | Prepara e envia com código de rastreio | Fluxo de despacho | Pedido em trânsito |
| 7 | Recebe pagamento (Pix/cartão) e repasse | Liquidação financeira | Receita recebida |

### 12.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Assortimento | Quais produtos publicar | Capacidade de produção | Catálogo definido |
| Preço | Estratégia de preço | Concorrência, frete | Margem definida |
| Envio | Frete grátis vs. pago | Conversão | Taxa de venda |

### 12.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Custo de frete alto no Brasil | Alta |
| 2 | Gestão de estoque em pequena escala | Média |
| 3 | Concorrência desleal (produtos industrializados como artesanais) | Alta |
| 4 | Inadimplência e contestações | Média |

### 12.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Simulador de frete, tabelas de Correios e sugestão de embalagem |
| 2 | Controle de estoque simplificado com alerta de baixa |
| 3 | Selo "artesanal/artesão" e política de originalidade |
| 4 | Escrow e mediação de disputas (doc 90, Mediação) |

### 12.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Loja ativa com vendas nacionais e reputação construída |
| **Próximo passo** | Plano de lojista premium, anúncios e expansão de catálogo |

### 12.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Cadastro de produtos (volume) | Médio |
| Logística e frete | Alto |
| Validação de autenticidade | Alto |
| Repasse financeiro | Baixo |

### 12.9 Oportunidades de melhoria

- Integração com transportadoras populares e etiquetas de envio.
- Vitrine sazonal (festas de Orixá, oferendas sazonais).
- Comunidade de lojistas e grupos de suporte.

---

## Jornada 13 — Parceiro Comercial

### 13.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Empresa parceira (agência de turismo ético, fornecedor de vestes litúrgicas, editora de livros afro-brasileiros, ONG de defesa religiosa) que quer distribuir produtos/serviços pela plataforma. |
| **Contexto** | Busca canal qualificado e eticamente alinhado para atingir a comunidade. |

### 13.2 Objetivo

Estabelecer parceria formal, publicar ofertas/serviços, acompanhar desempenho e crescer em conjunto com a plataforma.

### 13.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Manifesta interesse | Formulário de parcerias / contato comercial | Lead de parceria |
| 2 | Passa por triagem e acordo comercial | Contrato/termo (fora da plataforma) | Parceria aprovada |
| 3 | Recebe conta de parceiro | Onboarding de parceiro | Perfil de parceiro |
| 4 | Publica ofertas ou integra produtos | Portal do parceiro | Catálogo integrado |
| 5 | Acompanha métricas de desempenho | Dashboard do parceiro | KPIs visíveis |
| 6 | Recebe relatórios e faturamento | Relatórios financeiros | Resultados consolidados |

### 13.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Formato | Integração API vs. manual | Escala, capacidade técnica | Modelo de integração |
| Portfólio | Quais ofertas publicar | Mercado-alvo | Catálogo definido |
| Investimento | Plano/anúncios | ROI esperado | Orçamento alocado |

### 13.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Complexidade de integração técnica | Média |
| 2 | Alinhamento de valores com a comunidade | Alta |
| 3 | Mensuração de ROI | Média |
| 4 | Fragilidade de acordos comerciais | Média |

### 13.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | APIs documentadas, webhooks e sandbox |
| 2 | Política de parceria alinhada à neutralidade e respeito cultural |
| 3 | Dashboards de conversão e atribuição |
| 4 | Contratos claros, comissões transparentes e SLA |

### 13.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Parceria ativa, ofertas publicadas, métricas acompanhadas |
| **Próximo passo** | Expansão de catálogo, anúncios e novas integrações |

### 13.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Integração técnica | Médio |
| Alinhamento de valores | Alto |
| Relatórios de desempenho | Médio |
| Acordos comerciais | Médio |

### 13.9 Oportunidades de melhoria

- Marketplace de parcerias com casos de sucesso.
- Programa de co-marketing com a plataforma.
- Relatórios setoriais para parceiros institucionais.

---

## Jornada 14 — Moderador

### 14.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Moderador da equipe AxéMap (RBAC: moderador/curador voluntário, doc 57) responsável por aprovar terreiros, avaliar avaliações e conter discurso de ódio. |
| **Contexto** | Trabalha em filas de moderação; precisa ser rápido, justo e documentado. |

### 14.2 Objetivo

Manter a plataforma segura e confiável, aprovar conteúdo legítimo com agilidade e aplicar sanções com critério e rastreabilidade.

### 14.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Recebe notificação de novo item na fila | Central de moderação | Fila atualizada |
| 2 | Revisa cadastro de terreiro | Tela de revisão (dados, fotos) | Decisão pendente |
| 3 | Aprova, rejeita ou solicita correção | Ações de moderação | Status atualizado |
| 4 | Revisa avaliações com flag de IA | Fila de avaliações | Decisão registrada |
| 5 | Avalia denúncias de intolerância | Centro de denúncias | Ação tomada |
| 6 | Aplica sanções (suspensão, aviso) | Ferramentas de sanção | Registro em audit log |
| 7 | Documenta decisões e feedback | Notas de moderação | Rastreabilidade |

### 14.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Aprovação | Aprovar vs. solicitar correção | Qualidade da informação | Terreiro no ar |
| Conteúdo | Remover vs. manter | Liberdade vs. segurança | Ambiente seguro |
| Sanção | Advertir vs. suspender | Gravidade e histórico | Penalidade aplicada |

### 14.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Volume alto de conteúdo para poucos moderadores | Alta |
| 2 | Erros de julgamento geram crise de confiança | Alta |
| 3 | Falta de contexto cultural para avaliar conteúdo ritual | Alta |
| 4 | Fadiga e burnout da moderação | Média |

### 14.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Fila priorizada por severidade e moderação IA assistida (doc 22 item 59) |
| 2 | Guidelines claros, histórico do usuário e revisão por pares |
| 3 | Curadores voluntários da própria comunidade (doc 57) |
| 4 | Rodízio de filas, limites de sessão e treinamento |

### 14.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Filas limpas, decisões documentadas, plataforma segura |
| **Próximo passo** | Melhoria contínua de regras e treinamento da equipe |

### 14.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Volume de filas | Alto |
| Contexto cultural | Alto |
| Consistência de decisões | Médio |
| Ferramentas de sanção | Baixo |

### 14.9 Oportunidades de melhoria

- Painel de moderação com shortcuts e visão em lote.
- Base de conhecimento cultural curada para decisões justas.
- Relatórios de impacto da moderação (transparência).

---

## Jornada 15 — Administrador da Plataforma

### 15.1 Entrada

| Campo | Detalhe |
|-------|---------|
| **Cenário** | Admin AxéMap / Super Admin (doc 57) cuidando da operação completa: usuários, terreiros, pagamentos, métricas e governança. |
| **Contexto** | Monitora a saúde do produto, resolve incidentes e toma decisões baseadas em dados. |

### 15.2 Objetivo

Garantir a operação saudável da plataforma, acompanhar KPIs (doc 01), resolver incidentes e conduzir a governança com transparência.

### 15.3 Fluxo

| Passo | Ação | Ponto de contato / Tela | Estado da plataforma |
|-------|------|--------------------------|----------------------|
| 1 | Acessa o painel administrativo | Dashboard de admin | Visão geral do sistema |
| 2 | Monitora KPIs (usuários, terreiros, buscas, receita) | Dashboards de métricas | Dados em tempo real |
| 3 | Gerencia filas de moderação e verificações | Painel de operações | Backlog de trabalho |
| 4 | Resolve incidentes e pedidos de suporte | Centro de suporte | Tickets priorizados |
| 5 | Gerencia planos e cobranças | Módulo de faturamento | Receita recorrente |
| 6 | Aplica ações de governança (suspensões, exclusões) | Ferramentas de administração | Ações auditadas |
| 7 | Analisa logs de auditoria | Auditoria do sistema | Rastreabilidade total |

### 15.4 Decisões

| Etapa | Decisão | Fatores | Desfecho |
|-------|---------|---------|----------|
| Escalonamento | Escalar incidente vs. resolver | Severidade, recursos | Resolução |
| Prioridade | Focar em crescimento vs. segurança | Estágio do produto | Alocação de esforço |
| Governança | Aplicar regras de forma consistente | Políticas, contexto | Confiança do usuário |

### 15.5 Problemas

| # | Fricção | Gravidade |
|---|---------|-----------|
| 1 | Dados dispersos entre módulos (dificulta decisão) | Alta |
| 2 | Incidentes de segurança/privacidade (LGPD) | Alta |
| 3 | Crescimento descontrolado de contas falsas | Alta |
| 4 | Dependência de dados não estruturados para decisões | Média |

### 15.6 Soluções

| Fricção | Solução |
|---------|---------|
| 1 | Data warehouse interno e dashboards unificados |
| 2 | Processos de resposta a incidentes e trilhas de auditoria |
| 3 | Verificação antifraude em cadastro e login |
| 4 | Relatórios padronizados e exportações |

### 15.7 Saída

| Campo | Detalhe |
|-------|---------|
| **Estado final** | Operação saudável, KPIs no rumo, incidentes resolvidos |
| **Próximo passo** | Rodada de planejamento de produto e melhorias de governança |

### 15.8 Pontos de atrito

| Ponto | Classificação |
|-------|---------------|
| Visão unificada de dados | Alto |
| Resposta a incidentes | Médio |
| Gestão de fraudes | Alto |
| Governança e auditoria | Médio |

### 15.9 Oportunidades de melhoria

- Centro de comando com alertas proativos de anomalias.
- Painéis de LGPD (consentimento, exclusão, portabilidade).
- Relatórios executivos automáticos semanais.

---

## Priorização das Jornadas

### Critérios

- **Jornada crítica (MVP):** bloqueia a North Star (conexões confiáveis pessoa-terreiro) ou o lançamento.
- **Jornada de apoio:** viabiliza receita, governança ou pós-MVP, mas não bloqueia o primeiro corte.

### Jornadas que devem ser perfeitas no MVP

| # | Jornada | Por que | Foco no MVP |
|---|---------|---------|-------------|
| 1 | Visitante | É a porta de entrada; se falhar, nada mais importa | Busca, filtros, perfil, WhatsApp |
| 2 | Usuário Logado (Praticante) | Avaliações e favoritos geram o Trust Score | Avaliação, favoritos, notificações |
| 4 | Sacerdote (Dirigente) | Sem terreiros cadastrados não há conteúdo | Cadastro assistido, painel simples |
| 5 | Co-Admin | Mantém o perfil vivo quando o dirigente não tem tempo | Gestão de perfil e eventos |
| 14 | Moderador | Sem moderação confiável, confiança e segurança colapsam | Filas de aprovação e denúncias |

### Jornadas críticas vs. de apoio (resumo)

| Jornada | Papel | Crítica/De apoio | Prioridade MVP | Justificativa |
|---------|-------|------------------|----------------|---------------|
| 1 — Visitante | Não autenticado | **Crítica** | P0 | Primeira impressão e descoberta |
| 2 — Usuário Logado | Praticante | **Crítica** | P0 | Gera avaliações e o Trust Score |
| 3 — Filho de Santo | Membro do terreiro | De apoio | P2 | Depende do SaaS (pós-MVP) |
| 4 — Sacerdote | Dirigente | **Crítica** | P0 | Sem terreiros, não há rede |
| 5 — Co-Admin | Apoio do dirigente | **Crítica** | P0 | Sustenta a atualização do perfil |
| 6 — Babalorixá | Dirigente Candomblé | De apoio | P1 | Variação de perfil 4; módulos avançados |
| 7 — Iyalorixá | Dirigente tradicional | De apoio | P1 | Acessibilidade e memória pós-MVP |
| 8 — Professor | Criador de curso | De apoio | P2 | Depende do módulo Cursos |
| 9 — Aluno | Consumidor de curso | De apoio | P2 | Depende do módulo Cursos |
| 10 — Turista | Visitante especializado | De apoio | P1 | Filtro "aceita visitantes" já atende |
| 11 — Pesquisador | Consumidor de dados | De apoio | P3 | API pública é pós-MVP (doc 22) |
| 12 — Lojista | Vendedor | De apoio | P3 | Marketplace é pós-MVP (doc 22) |
| 13 — Parceiro Comercial | Empresa | De apoio | P3 | Depende de Marketplace/comercial |
| 14 — Moderador | Staff | **Crítica** | P0 | Segurança e confiança |
| 15 — Admin Plataforma | Staff | De apoio | P1 | Ops mínima (filas) no MVP; dashboards depois |

### Recomendação de sequência de design/engenharia

1. **Sprint 1-2:** Jornada 1 (Visitante) — busca, mapa, perfil, contato.
2. **Sprint 3-4:** Jornadas 4 e 5 (Cadastro e gestão do terreiro).
3. **Sprint 5-6:** Jornada 2 (avaliação, favoritos, notificações) + Trust Score.
4. **Sprint 7-8:** Jornada 14 (moderação e denúncias).
5. **Sprint 9-10:** Ajustes de completude (privacidade, acessibilidade básica) e hardenização.
6. **Pós-MVP:** Jornadas 3, 6, 7, 8, 9, 10, 15 (SaaS, cursos, turismo) e depois 11, 12, 13 (API, marketplace, parcerias).

---

## Anexo — Mapa de jornadas vs. módulos do backlog (doc 22)

| Jornada | Módulos acionados | Itens do backlog (doc 22) |
|---------|-------------------|---------------------------|
| 1 — Visitante | Autenticação (não), Busca, Perfil | 8-15, 17, 22 |
| 2 — Usuário Logado | Autenticação, Engajamento, Comunidade | 1-7, 24-27, 39, 48-50 |
| 3 — Filho de Santo | SaaS Membros, Agenda, Notificações | 34-36, 39, 54 |
| 4 — Sacerdote | Perfil Terreiro, SaaS, Verificação | 16-23, 33-37, 42 |
| 5 — Co-Admin | SaaS, Moderação, Audit | 34-35, 44 |
| 6 — Babalorixá | SaaS avançado, Turismo, Proteção | 46, 47, 64, 65 |
| 7 — Iyalorixá | Acessibilidade, Memória, Proteção | 40-42, 53 |
| 8 — Professor | Cursos | 52, 67 |
| 9 — Aluno | Cursos, Pagamentos | 52, 67 |
| 10 — Turista | Busca, Perfil, i18n | 13, 55 |
| 11 — Pesquisador | API pública | 62, 63 |
| 12 — Lojista | Marketplace | 45 |
| 13 — Parceiro | Marketplace, Enterprise | 45, 63, 68 |
| 14 — Moderador | Moderação | 28-31, 59 |
| 15 — Admin | Admin, Governança | 28-31, 43-44, 58 |
