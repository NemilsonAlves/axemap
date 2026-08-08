# 92 — Fluxos Transacionais e Experienciais

## Escopo e Relação com Outros Documentos

Este documento detalha a **Etapa 08** do projeto: fluxos transacionais e experienciais de ponta a ponta, sob a ótica da experiência do usuário (gatilhos, atores, decisões, estados, mensagens, métricas e red flags).

O doc 09 já detalha os fluxos de **sistema** de busca, cadastro de terreiro, avaliação, marketplace, SaaS e autenticação. Este documento **não repete** o nível de implementação; ele **preenche as lacunas experienciais e transacionais** que o doc 09 não define: onboarding, verificação, mediação, denúncia, suporte, chat IA, busca semântica, matrícula, venda no marketplace, compartilhamento e favoritos, além dos estados e strings de interface.

Referências: doc 08 (atores), doc 09 (fluxos de sistema), doc 13 (APIs), doc 37 (política de avaliações), doc 39 (estratégia de moderação), doc 50 (cadastro híbrido), doc 57 (permissões e papéis — RBAC), doc 60 (verificação documental), doc 65 (knowledge graph), doc 66 (ontologia do domínio), doc 68 (busca semântica), doc 69 (arquitetura de IA).

**Convenções de diagrama usadas ao longo do texto:**

```
[1] → [2] → {decisão} → [3a] / [3b]     sequência, decisão e ramificação
(estado)                                  estado de tela (loading / success / error / empty)
'string'                                  mensagem-chave exibida ao usuário
```

---

## Fluxo 1 — Cadastro por Email

```
[Visitante clica em "Criar conta"] → [F1/cadastro]
  → [1] Formulário (nome, email, senha, confirmar senha, termos de uso)
  → {senha != confirmação}       → erro inline no passo 1
  → {email inválido}             → erro inline
  → [2] Envia POST /auth/register (estado: loading no botão)
  → {email já cadastrado}        → [2a] bloco de erro com botão "Entrar" direto
  → {sucesso}                    → [3] Tela "Confirmar seu e-mail"
       → envia email com link de confirmação (válido por 24h)
  → [4] usuário clica no link → estado "email confirmado" → redireciona para login ou onboarding
```

- **Gatilho:** clique em "Criar conta" no cabeçalho, na Home ou em qualquer CTA de ação logada.
- **Atores:** Visitante.
- **Pré-condições:** nenhuma; email válido e senha mínima de 8 caracteres.
- **Decisões e ramificações:** senha fraca; email duplicado; token de confirmação expirado (reenvio disponível).
- **Estados:**
  - `loading`: "Criando sua conta, um instante..."
  - `error`: "Não foi possível criar sua conta. Tente novamente."
  - `success`: "E-mail confirmado. Axé para você!"
  - `empty`: não aplicável.
- **Mensagens-chave:**
  - Email de confirmação: "Recebemos seu cadastro. Confirme seu e-mail para começar."
  - Email duplicado: "Este e-mail já está cadastrado. Deseja entrar?"
  - Token expirado: "Este link expirou. Solicite um novo."
- **Pós-fluxo:** Onboarding de primeiro acesso (Fluxo 5).
- **Métricas de funil:** visita do formulário → envio válido (conversão de preenchimento) → e-mail confirmado (ativação) → perfil completo. Alvo de confirmação de e-mail ≥ 75%.
- **Red flags de segurança:** prevenção de cadastro em massa (rate limit + Turnstile, doc 05); bloqueio de e-mail descartável para contas que pretendem reivindicar perfil (doc 50); auditoria de criação (doc 61).

---

## Fluxo 2 — Cadastro por Rede Social

```
[Visitante clica em "Continuar com Google"]
→ [1] Redirecionamento OAuth2 (doc 13) → consentimento Google
→ [2] callback /auth/callback
  → [3a] {e-mail já existe} → vincula conta social ao usuário existente → [4] login direto
  → [3b] {e-mail novo} → cria usuário (e-mail confirmado implicitamente) → [5] onboarding
  → {e-mail social já vinculado a outra conta} → erro orientado à recuperação da conta
```

- **Ponto de diferença vs. Fluxo 1:** nenhuma senha; a confirmação de e-mail é considerada válida (o provedor é guardião da identidade).
- **Estado `empty`:** se o provedor não devolver o e-mail, pedir o e-mail manualmente antes de criar a conta.
- **Decisões:** e-mail existente (vincula) vs. novo (cria); já vinculado (conflito).
- **Mensagens-chave:**
  - Vínculo: "Conectamos sua conta social. Bem-vindo de volta."
  - Conflito: "Este e-mail já está vinculado a outra conta. Entre para gerenciar."
- **Métricas:** taxa de conclusão do OAuth; conversão social vs. e-mail por origem de campanha.
- **Red flags:** rejeitar e-mail descartável do provedor social; medidas anti-automação para evitar criação em massa (doc 38).

---

## Fluxo 3 — Login

Complementa o Fluxo 7 do doc 09 com estados e mensagens de UX.

```
[1] Usuário insere e-mail + senha
→ [2] Valida credenciais
   → {success} → login → redireciona para `next` (página original) ou dashboard
   → {erro} → mensagem genérica 'E-mail ou senha inválidos' (não revela qual está errado)
   → {bloqueado, 5 tentativas} → estado locked (15 min) + botão "Esqueci minha senha"
→ alternativa: "Continuar com Google"
```

- **Gatilho:** clique em "Entrar" ou redirecionamento forçado de fluxo logado.
- **Atores:** Visitante (com credenciais) e Praticante.
- **Pré-condições:** conta criada e e-mail confirmado.
- **Decisões:** e-mail+senha vs. social; bloqueio por tentativas ("login_attempts ≥ 5", doc 05).
- **Estados:**
  - `loading`: "Entrando..."
  - `error`: "E-mail ou senha inválidos. Você tem X tentativas restantes."
  - `error bloqueio`: "Muitas tentativas. Tente novamente em 15 minutos."
- **Pós-fluxo:** mantém a rota original (`next`); do contrário, leva ao dashboard ou à Home.
- **Métricas:** taxa de conversão tentativa → sucesso; taxa de bloqueio (> 5% indica problema de recuperação).
- **Red flags:** mensagem genérica para evitar enumeração de e-mails; bloqueio temporário anti-força-bruta; limites de velocidade.

---

## Fluxo 4 — Recuperação de Senha

```
[1] "Esqueci minha senha" no login → formulário de e-mail
   → [2a] {e-mail existe} → envia link/código (uso único, validade 1h) → estado "enviamos um link"
   → [2b] {e-mail não existe} → mesma tela de sucesso (anti-vazamento de existência de conta)
→ [3] abre o link → define nova senha (duas vezes, iguais)
   → {ok} → "senha atualizada" → login
   → {token expirado} → solicitar novo link
```

- **Gatilho:** link "Esqueci minha senha" na tela de login.
- **Atores:** Visitante com conta existente.
- **Decisões:** e-mail existe? — a mensagem de sucesso é idêntica nos dois casos (segurança).
- **Estados:**
  - `empty`: usuário informa e-mail não cadastrado; não há erro, apenas a mesma resposta padrão.
  - `success`: "Enviamos um link de redefinição para seu e-mail, se a conta existir."
- **Pós-fluxo:** novo login com a senha redefinida; todas as sessões antigas são revogadas.
- **Métricas:** conversão de recuperação → novo login (retenção e grupos de contas).
- **Segurança/red flags:** token de uso único e curto; invalidar tokens anteriores no reset; não listar e-mails cadastrados.

---

## Fluxo 5 — Onboarding e Primeiro Acesso

Transforma o cadastro em praticante ativo e fidedigno, com foco em perfil e preferências.

```
[praticante recém-confirmado]
→ [1] Boas-vindas + opção opcional de escolher a tradição de interesse (Umbanda, Candomblé...)
→ [2] Preferências: estado/cidade, aceita recomendações personalizadas   {pular → permite seguir}
→ [3] "O que te traz aqui?" (multiescolha): [começar / frequentar uma gira / conhecer minha raiz / apoio de uma casa]
→ [4] CTA final "Vamos buscar seu lugar" → Home personalizada
```

#### Estado vazio crítico (primeira semana)

Após o onboarding, o usuário vê o **estado vazio** em toda área pessoal até a primeira ação:

| Área | Estado vazio (string) | Próximo passo sugerido |
|------|----------------------|------------------------|
| Favoritos | "Você ainda não salvou nada. Toque no coração de uma casa." | Buscar terreiros |
| Histórico | "Seu histórico aparece aqui depois de algumas buscas." | Fazer uma busca |
| Minhas avaliações | "Nada avaliado ainda. Que tal contar como foi?" | Perfis de terreiros |
| Minhas compras | "Seu pedido aparecerá aqui quando você comprar." | Marketplace |
| Minhas matrículas | "Nenhum curso até agora." | Catálogo de cursos |
| Notificações | "Sem novidades agora. Relaxe, a gente avisa." | — |

- **Gatilho:** primeiro login logado pós confirmação.
- **Ator:** Praticante recém-criado.
- **Pré-condições:** e-mail confirmado.
- **Decisões:** "Pular" é sempre permitido; dados financeiros nunca são solicitados aqui.
- **Métricas:** % de conclusão das 4 etapas; % de pulo de etapas; ativação (≥ 1 ação social em 7 dias) como north star metric (doc 44).
- **Privacidade (LGPD):** consentimento explícito para recomendações e comunicação; ajuste em /configuracoes.

---

## Fluxo 6 — Cadastro de Terreiro (Multistep)

Complementa o Fluxo 2 do doc 09 com foco em experiência e salvamento parcial.

```
[dirigente logado → CTA "Cadastrar meu terreiro" no menu ou dashboard]
→ [1] Identificação: nome, tradição, linha, data de fundação (estado de disponibilidade de nome)
→ [2] Endereço: CEP → busca automática → pin no mapa (validação geográfica)
→ [3] Contato: WhatsApp, Instagram, Facebook, site (nível de privacidade de exibição)
→ [4] Características: aceita visitantes?, acessibilidade, banheiros, infantil, desenvolvimento
→ [5] Fotos (upload com compressão e preview)
→ [6] Horários por dia/turno + status "a casa recebe visitantes?"
→ [7] Revisão e publicação
→ {sucesso} → status "pendente" → notifica o dirigente + fila de moderação → tela "Em análise"
```

- **Salvamento parcial:** a cada passo o rascunho é salvo (doc 50); permite "Salvar e terminar depois".
- **Estados:**
  - `loading` (envio): "Enviando seu terreiro para análise..."
  - `success`: "Seu terreiro foi enviado para análise."
  - `error` (geocodificação): "Não conseguimos localizar este endereço. Confira o CEP."
  - `empty` (galeria): "Adicione fotos para que as pessoas conheçam sua casa."
- **Decisões:** salvar rascunho vs. enviar; publicar direto vs. aguardar reivindicação (validade do vínculo).
- **Mensagens-chave:** notificação ao dirigente quando aprovado/rejeitado, com motivo (doc 51 — máquina de estados dos perfis).
- **Pós-fluxo:** quando aprovado, CTA para verificar (Fluxo 7) e para preencher o mapa do Trust Score (doc 53).
- **Métricas:** conclusão por etapa (abandono); queda em [2] e [5]; tempo médio; taxa de aprovação na primeira revisão.
- **Red flags:** autenticidade do vínculo (risco de cadastro de casa de terceiros — doc 47); exigência posterior de verificação.

---

## Fluxo 7 — Solicitação de Verificação

Referência: doc 60 (processo documental) e doc 53 (Trust Score selo).

```
[dashboard → aba "Verificação"]
→ [1] escolher o tipo (identidade do dirigente / verificação do terreiro)
→ [2] formulário + upload de documento (identidade do dirigente + opcional comprovante de vínculo)
→ [3] revisão dos dados
→ [4] envio → estado "pendente" → fila; aguarda análise do verificador
→ {verificador atende}
   → [5a] aprovado → selo "Verificado" + incremento no Trust Score → notifica o dirigente
   → [5b] rejeitado → motivo e dica → reenvio/novo documento
   → {em espera > 72h} → lembrete de acompanhamento
```

- **Gatilho:** CTA "Solicitar verificação" no dashboard (apenas Dirigente/Co-Admin, doc 57).
- **Pré-condições:** terreiro aprovado na moderação; conta com e-mail confirmado.
- **Estado `empty`:** nenhum documento enviado ainda → tela explicativa do que será verificado e como o selo afeta o Trust Score.
- **Decisões:** documento vencido/ilegível → erro de revisão com motivo; tipos de documento (identidade, CNH, passaporte).
- **Mensagens-chave:**
  - Aprovado: "Seu terreiro foi verificado! O selo atualiza o Trust Score."
  - Rejeitado: "A verificação não pôde ser concluída. Verifique o documento e tente novamente."
- **Métricas do funil:** solicitou → documentos válidos → aprovado vs. rejeitado; tempo de revisão; taxa de reenvio. Meta de aprovação em ≤ 72h.
- **Red flags/segurança:** documentos acessíveis só ao verificador e só no tempo necessário (doc 57 — permissão temporária); criptografia em repouso; trilhas no audit log (doc 61); retenção conforme LGPD.

---

## Fluxo 8 — Solicitação / Publicação de Evento

```
[1] Título, tipo (gira, toque, festa, palestra, desenvolvimento), data, hora, local (presencial/remoto)
[2] Descrição (valor de ingresso aberto), capacidade, link de transmissão
[3] Revisão
   → {publicar agora}
      → terreiro aprovado + plano permite publicar (doc 17)
      → status "pendente" → moderação → [aprovado] eventos visíveis no calendário / [rejeitado] com motivo
   ou {agendar} → publicado na data futura automaticamente + lembrete
```

- **Atores:** Dirigente, Co-Admin, ogã, ekedi (permissão de publicar eventos, doc 57), conforme o papel.
- **Pré-condições:** terreiro que publica está aprovado; usuário tem permissão de eventos.
- **Estados:** `loading` envio; `success` "Evento publicado (ou agendado)"; `error` data no passado → "Escolha uma data futura"; `empty` no calendário do terreiro ("Nenhum evento ainda — publique a primeira gira").
- **Decisões de moderação:** eventos que violam a política (doc 39) → rejeição; conteúdo com termos religiosos → análise contextual; reenvio após ajuste.
- **Pós-fluxo:** notificação a seguidores; entrada no calendário; link de compartilhamento/ingresso (doc 08 UC07).
- **Métricas:** criados vs. publicados vs. rejeitados; taxa "vou participar" (engajamento); conversão de ingressos (futuro).
- **Red flags:** evento ilegal/ódio → bloqueio imediato + auditoria; conteúdo sexual ou impróprio envolvendo menores.

---

## Fluxo 9 — Compra e Pagamento (Checkout de Artigos)

Complementa o Fluxo 4 do doc 09 com estados e decisões experienciais.

```
[1] "Adicionar ao carrinho" (o carrinho tem ícone/contador; login exigido em checkout)]
→ [2] Ver carrinho (quantidade, valor, frete previsto)
→ [3] Checkout
   → [3a] endereço de entrega (ou retirada na casa)
   → [3b] forma de pagamento: Pix (QR Code) / Cartão (Stripe)
   → [3c] resumo + confirmação
→ [4] processa pagamento (loading "Processando pagamento...")
   → {sucesso} → [5] tela de confirmação com número do pedido → e-mail do pedido
   → {falha} → erro "O pagamento não foi aprovado. Tente outro método." → volta ao 3b
   → {carrinho expirado} → aviso e volta ao produto
→ [6] vendedor prepara e envia → código de rastreio
→ [7] comprador acompanha o status e avalia o produto
```

- **Gatilho:** clique em "Comprar" / "Finalizar compra".
- **Atores:** Comprador (Praticante) e Vendedor.
- **Pré-condições:** produto disponível; estoque; vendedor ativo; método de pagamento configurado.
- **Decisões:** pagamento Pix vs. cartão; entrega vs. retirada; cupom (futuro); **login obrigatório** para checkout (reduz abandono e fraude).
- **Mensagens-chave:**
  - Confirmação: "Pedido confirmado. O vendedor foi avisado."
  - Rastreio atualizado: "Seu pedido foi enviado / entregue."
- **Pós-fluxo:** tela do pedido + estímulo a avaliar produto e loja após entrega.
- **Métricas de funil:** taxa em cada etapa (carrinho → iniciar checkout → pagamento aprovado → compra concluída); abandono de carrinho; taxa de reprovação; tempo de checkout.
- **Red flags:** fraude de cartão, chargeback (fila de análise, doc 38); produtos de natureza proibida; vendedores com Trust Score baixo em análise de pagamento; limites de valor.

---

## Fluxo 10 — Matrícula em Curso

```
[1] Página do curso → "Matricular-se" (entrar no fluxo)
   → {curso gratuito} → [2] matrícula imediata (login) → [3] acesso ao conteúdo + certificado
   → {curso pago} → mesmo fluxo de compra (gera pedido) → [4] matrícula ativa
   → {conta não confirmada} → acesso negado → CTA completar a conta
```

- **Gatilho:** botão "Matricular-se" na página do curso.
- **Atores:** praticante (aluno) e dirigente (instrutor).
- **Pré-condições:** curso publicado; login; pagamento (se pago) concluído.
- **Decisões:** gratuito vs. pago; matrícula única por usuário (1 por conta); cancelamento/reembolso conforme política do curso.
- **Estados:** `loading` (processar matrícula/pagamento); `success` ("Matrícula confirmada! Bem-vindo à turma."); `error` ("Turma fechada" quando lotado / falha de pagamento); `empty` (nenhuma matrícula ainda no painel).
- **Pós-fluxo:** adicionado ao painel; notificação de início de curso; certificado ao concluir.
- **Métricas:** visão → matrícula (conversão); conclusão; certificados emitidos; evasão por etapa.
- **Red flags:** matrícula duplicada; curso sem pré-requisito atendido explicitamente; pagamento de terceiros.

---

## Fluxo 11 — Marketplace (Venda)

```
[1] "Abrir loja" → assinar termos da loja + configurar dados bancários e política de envio
→ [2] Cadastrar produto (foto, descrição, preço, estoque, categoria)
      cada estado de produto: [Rascunho / Pendente / Aprovado / Pausado / Bloqueado]
→ [3] produto entra na fila de moderação
   → [aprovado] → visível no catálogo
   → [rejeitado] → mensagem com motivo + possibilidade de reenvio
→ [4] Venda → vendedor recebe o pedido → prepara → insere rastreio → entrega
→ [5] Avaliação pós-venda (comprador avalia produto e vendedor)
→ [6] Payout (transferência de valores via API)
```

- **Atores:** vendedor (terreiro ou fornecedor aprovado), comprador, staff (moderação de produtos).
- **Pré-condições:** conta verificada para recebimento; loja habilitada.
- **Métricas de funil:** produtos cadastrados → aprovados → com venda; GMV; comissão (doc 18); taxa de paus/reprovação.
- **Red flags (alto risco):** análise de vendedor novo (KYC), anti fraude de loja fantasma; produtos religiosos sensíveis tratados com respeito (sem profanação); bloqueio de itens proibidos pela política.

---

## Fluxo 12 — Avaliação e Resposta do Terreiro (moderação + direito de resposta)

Complementa o Fluxo 3 do doc 09 com o **direito de resposta** (exigência do doc 37/47).

```
[praticante → perfil do terreiro → "Avaliar"]
→ [1] nota (1–5) + título + comentário
→ validação única (1 avaliação por usuário por terreiro)
→ status 'pendente' → moderação (humana + IA)
→ [aprovado] → avaliação visível no perfil → recalcula o Trust Score
→ [rejeitado] → notificação do motivo (sem opressão)

→ sob a vista do DONO do terreiro:
   → [direito de resposta] → publica 1 resposta por avaliação (analisada)
   → ou [reportar a avaliação] → entra no fluxo de denúncia (Fluxo 14)
```

- **Atores:** praticante, dono do terreiro, moderador.
- **Pré-condições:** usuário logado e com e-mail confirmado; perfil minimizado (contra avaliações falsas, doc 38).
- **Decisões:** moderação aprovada/rejeitada (IA + humano); denúncia de avaliação; direito de resposta em proporção 1:1 por avaliação.
- **Estados:** pendente, aprovada, rejeitada, resposta publicada/contestada.
- **Mensagens-chave:**
  - Aprovada: "Sua avaliação foi publicada. Obrigado por contribuir."
  - Rejeitada (ódio/ameaça/desinformação): "Esta avaliação não pôde ser publicada."
  - Resposta publicada: "A casa respondeu sua avaliação."
- **Pós-fluxo:** impacto no Trust Score (reputação, doc 53); notifica o dono para responder.
- **Métricas:** tempo de moderação; média de avaliações validadas; % de respostas do terreiro.
- **Red flags:** avaliações falsas/avaliadas de propósito (verificação de origem, doc 38); resposta com teor de ameaça; moderação sem viés para não silenciar críticas legítimas.

---

## Fluxo 13 — Mediação de Conflito

Referência: doc 48 (governança) e doc 39 (mediação).

```
[fluxo identificado pelo staff (via denúncia ou análise de conteúdo)]
→ [1] categorização do caso (conflito entre usuários, usuário-terreiro, etc.)
→ [2] abre "caso de mediação" (status: aberto)
→ [3] ambas as partes informadas; enviam sua versão, documentos e contexto
→ [4] processo conduzido de forma neutra, com prazos e possibilidade de réplica
→ [5] decisão baseada em evidências:
   → [acordo] → ambas as partes concordam → caso encerrado por conciliação
   → [sanção simples] → advertência/adequação de conteúdo
   → [sem solução] → escalado para o admin → suspensão/bloqueio possível
   → registro completo em auditoria (doc 61)
```

- **Gatilho:** flag do staff (não é autoaberto pelo usuário).
- **Atores:** mediador (staff), admin, partes envolvidas.
- **Pré-condições:** conflito definido e partes identificadas.
- **Estado de vida do caso:** aberto → em mediação → acordo / adjudicado → encerrado / arquivado.
- **Mensagens:** notificação às partes em cada etapa ("Envie sua versão do caso até [data]").
- **Decisão:** mediação (técnica) vs. punição direta; escala quando há risco de conteúdo, punição quando a política é violada.
- **Métricas:** nº de casos, taxa de acordo, tempo médio de mediação, recorrência.
- **Red flags:** retaliação, ameaça, falsificação de evidência, perfilado por grupos rivais.

---

## Fluxo 14 — Denúncia (report)

```
[usuário logado → "Reportar" em avaliação, terreiro, evento, post, produto, usuário ou mensagem]
→ [1] motivo (lista de categorias) + texto de contexto opcional
→ [2] confirmação do envio (para evitar erro de clique)
→ [3] envia → status "recebida" (acompanhar em /minhas-denuncias)
→ [4] fila do staff:
   → [verificação]
     → [confirmado] → ação (remover/suspender/mediar) + notifica reportante e alvo
     → [sem evidência] → arquivado "avaliado, sem ação"
   → [denúncias abusivas/spam] → penalidade do reportante
```

- **Gatilho:** botão "Reportar" no menu contextual.
- **Atores:** praticante (reporta), moderador/admin (decide), alvo.
- **Pré:** usuário logado (evita anônimos); religião não é, em si, motivo válido (doc 39).
- **Estados:** pendente, em análise, resolvido (aplicado/arquivado), abusivo (avaliado).
- **Mensagens:** "Obrigado por avisar. Tratamos com responsabilidade." ; se violação: "A denúncia foi avaliada sem ação.".
- **Métricas:** volume por categoria; taxa de denúncia confirmada; repeat reporters (abusivo); tempo de resposta da fila.
- **Red flags:** denúncia utilizada como arma entre grupos (bots, abuso); silenciamento de terreiro concorrente; pré-análise por IA com curadoria humana.

---

## Fluxo 15 — Suporte (Abertura de Ticket)

```
[1] Centro de ajuda → busca de artigo na Biblioteca
→ [2] se não resolveu → "Contato com suporte"
→ [3] seleção da área (conta/terreiro/marketplace/pagamento/moderação)
→ [4] descrição do problema + captação (Turnstile) → validação de e-mail (primeiro ticket)
→ [5] cria ticket (gerado nº, status 'novo')
→ [6] suporte responde (e-mail + notificação in-app)
→ [7] feedback de satisfação ao encerrar
→ [8] possibilidade de reabrir se não resolveu
```

- **Auto-serviço:** combinar o módulo Ajuda + Biblioteca para resolver a maioria sem ticket.
- **Estados do ticket:** novo → em atendimento → aguardando usuário → resolvido / fechado / reaberto.
- **Modelos de resposta:** com base na política, com transparência.
- **Métricas:** volume, tempo de primeira resposta, resolução média e satisfação do usuário.
- **Red flags (anti-fraude):** aviso contra tickets automáticos; confirmação de e-mail no primeiro ticket; rate limit.

---

## Fluxo 16 — Chat IA (Primeiro Contato)

```
[entrada no chat (Home / "Pergunte ao AxéMap")]
→ [1] tela de boas-vindas + disclaimer: "A IA não substitui seu pai/mãe de santo; orienta sobre informação."
→ [2] usuário digita:
   → [intenção identificada] → busca semântica (doc 68) + Biblioteca + Knowledge graph
   → [não identificada] → mostra fontes e sugere terreiros; oferece conversa humana
   → [pergunta sobre religião/viés] → resposta com neutralidade e fontes
→ [3] sugestões de ação: abrir perfil, publicar avaliação, "falar com humano"
→ [opcional] e-mail do histórico de processo (LGPD)
```

- **Gatilho:** ícone/fluxo "Pergunte ao AxéMap".
- **Atores:** visitante e praticante.
- **Pré-condições:** LLM com curadoria (doc 69) + guardrails éticos (neutralidade). Nunca conselho de saúde nem leitura espiritual; encaminhar a um especialista ("isso requer acompanhamento com seu dirigente ou profissional").
- **Decisões:** intenção reconhecida → oferecer informação; não-sabido → redirecionar; conteúdo ofensivo → filtro automático.
- **Estados:** `loading` ("Um instante..."); `empty` (banner de disclaimer); `error` (falha → "Sem resposta agora, tente de novo"); `success` (card com fonte).
- **Mensagem ética:** "Respostas da IA não substituem seu pai/mãe de santo."
- **Métricas:** tarefa concluída no chat; taxa de continuidade para humano; taxa de "repetição da mesma pergunta" (falha de intenção).
- **Red flags:** viés/alucinação em conteúdo religioso — curadoria de fontes, moderação de respostas, rastreabilidade; não viralizar resposta sem validação.

---

## Fluxo 17 — Busca Semântica

Fluxo do **usuário** da busca (doc 68), da intenção ao resultado.

```
[1] expressão em linguagem natural (ex.: "terreiro acolhedor LGBTQIA+ perto de casa")
   Fase 1 → full-text + filtros ; Fase 2/3 → embedding + entidades (tradição, localização, perfil, acessibilidade)
→ [2] resultados ordenados (Trust Score + relevância + distância)
→ [3] refina com filtros e faixa de raio → [nova busca]
→ [4] sem resultado → sugere termos ou expande o raio ("você quis dizer: perto de...")
→ [5] opcional: salvar a busca/alerta de novos cadastros
```

- **Gatilho:** o campo de busca global, o ⌘K ou o hero da Home.
- **Atores:** visitante e praticante.
- **Decisões:** zero resultados → expandir raio/sugerir termos; baixa cardinalidade → mostrar alternativas próximas; contexto logado → personalização (preferência de tradição do onboarding).
- **Estados:** `loading` (buscando...); `empty` (tela de ajuda para revisar filtros); `error` (falha → tentar de novo); `success` (lista + mapa).
- **Mensagem zero:** "Não encontramos nada com esses termos. Tente ampliar o raio ou remover filtros."
- **Métricas (doc 68):** precisão top-5, recall, clique no primeiro resultado, zero-result rate, satisfação de busca.
- **Red flags:** viés por região (não exibir somente terreiros verificados); explicabilidade ("por que este resultado?" via Trust Score) quando perguntado.

---

## Fluxo 18 — Compartilhamento (Link / QR)

```
[usuário toca em "Compartilhar" em card/perfil/evento/produto]
→ [1] sheet de opções: WhatsApp, Instagram, Facebook, X, copiar link, gerar QR
→ [2] link canônico (doc 91) + preview Open Graph rico
→ [opcional] QR Code do perfil para eventos impressos
→ [resultado] conversão não autenticada (visitante acessa e pode favoritar/cadastrar)
```

- **Atores:** visitante e praticante.
- **Pré-condições:** não é necessário login; recursos públicos podem ser compartilhados.
- **Estados:** `success` (toast "Link copiado")); `error` (falha na geração do QR).
- **Métricas:** compartilhamentos por tipo; CTR de links sociais; conversão visitante → cadastro; varredura de QR em eventos.
- **Red flags:** link com token/segredos (não compartilhar dados privados; respeitar a privacidade das comunidades restritas).

---

## Fluxo 19 — Favoritos / Salvos

```
[usuário em card/perfil/evento/produto → ícone de favorito (toggle preenchido)]
→ persistência no /meu-favoritos: pastas por tipo (terreiro, evento, curso, produto)
→ criar pastas nomeadas ("Candidatos para frequentar", "Comprar depois")
→ sincronização em todos os canais (web, PWA, app)
→ retirar de favoritos → removido do histórico; alerta de evento via notificação
```

- **Estados:** `success` (ícone preenchido + toast "Salvo nos favoritos"), `error` (falha na persistência — tentar de novo), `empty` (conforme estado vazio do onboarding).
- **Métricas:** taxa de favoritar por tipo de conteúdo; conversão de favorito para ação (contatar/resgatar), re-engajamento.
- **Nota:** favoritar não gera convite; separa preferência de notificação.

---

## Priorização dos Fluxos para o MVP

Critérios: (C) confiança/segurança/compliance, (U) utilidade da jornada nuclear, (I) impacto monetário, (E) esforço de implementação, (V) valor para o efeito rede. Escala: Alta (A), Média (M), Baixa (B).

| Fluxo | Crítico? | Confiança (C) | Uso (U) | Impacto $ (I) | Esforço (E) | Prioridade |
|-------|----------|--------------|---------|---------------|-------------|------------|
| 1. Cadastro email | Sim | A | A | M | M | 1 — MVP |
| 2. Cadastro social | Sim | A | A | M | M | 1 — MVP |
| 3. Login | Sim | A | A | M | L | 1 — MVP |
| 4. Recuperação de senha | Sim | A | M | M | L | 1 — MVP |
| 5. Onboarding / 1º acesso | Sim | M | A | A | M | 1 — MVP |
| 6. Cadastro terreiro (multistep) | Sim | A | A | A | A | 1 — MVP |
| 7. Solicitação de verificação | Sim | A | M | A | M | 2 — MVP (selo v1) |
| 8. Publicação de evento | Sim | M | A | A | M | 1 — MVP |
| 9. Compra / checkout | Sim | A | A | A | A | 2 — MVP lite |
| 10. Matrícula em curso | Sim | M | M | A | M | 2 — Fase 2 |
| 11. Marketplace venda (loja) | Sim | A | M | A | A | 2 — Fase 2 |
| 12. Avaliação + resposta | Sim | A | A | M | M | 1 — MVP |
| 13. Mediação de conflito | Sim | A | L | L | M | 2 — Fase 2 (limitada) |
| 14. Denúncia / report | Sim | A | M | M | M | 1 — MVP |
| 15. Suporte / ticket | Sim | A | A | M | M | 1 — MVP (básico) |
| 16. Chat IA 1º contato | Não | M | M | M | A | 2 — Fase 2 |
| 17. Busca semântica | Sim (F1) | A | A | A | M | 1 — MVP (texto + filtros); F2/F3 depois |
| 18. Compartilhamento | Não | M | M | M | L | 1 — MVP (v1) |
| 19. Favoritos / salvos | Não | M | A | M | L | 1 — MVP |

### Leitura da priorização

- **MVP (4 meses, equipe enxuta, doc 01):** manter o núcleo autenticado + descoberta + avaliação + compartilhamento + denúncia/suporte básico. Fluxos 1–9, 12, 14, 15, 18 e 19 entram.
- **Checkout e pagamento:** versão **lite** no MVP (direta entre comprador e vendedor), sem a complexidade completa de lojas — que fica para a Fase 2. O doc 09 já tratava marketplace como futuro; aqui priorizamos a compra para a prova de mercado.
- **Verificação:** ir com o **selo v1** no MVP (WhatsApp/e-mail/endereço validado) e aprofundar o documental na Fase 2 (doc 60). O Trust Score já precisa dos selos mínimos (doc 53).
- **Chat IA e mediação completa** são **Fase 2**: a base de confiança (vetores, moderação) precisa estar estável e a Biblioteca + ontologia (doc 66) minimamente populada, o que reduz viés e garante qualidade.
- **Regra global no Trust Score:** qualquer fluxo que o altere (7, 12, 13, 14) só é ativado junto ao recálculo do doc 53 (fila processada assíncrona), para que a reputação nunca fique dessincronizada.