# 93 — UX Writing: Voz do Produto

## Contexto

Este documento define o sistema de UX Writing do AxéMap: tom de voz, princípios de escrita, diretrizes de microcopy, modelos de mensagens para fluxos críticos, glossário e padrões de feedback. Todo texto de produto (UI, notificações, e-mails, erros, empty states) deve seguir esta voz.

O documento é guiado pelos valores do doc 01 (neutralidade, inclusão, segurança), pela voz da marca do doc 27 (respeitoso, transparente, acolhedor, neutro, profissional) e pelo posicionamento do doc 26 (confiança). Os estados visuais (empty, error, success, notfound) seguem a especificação do componente `StateCard` (apps/web/src/components/ui/state-card.tsx), que define título, descrição, ícone e ação opcional.

---

## 2. Tom de voz

### Definição

O AxéMap fala como um anfitrião atencioso e como um especialista honesto: acolhe quem chega, protege quem é vulnerável e nunca fala mais alto que a tradição que representa. É uma voz que **acolhe, orienta, respeita e não julga**.

### Personalidade da marca

| Traço | Como aparece |
|-------|--------------|
| **Acolhedor** | Recebe a pessoa pela porta de entrada, não pelo atrito |
| **Respeitoso** | Honra as tradições, o sigilo iniciático e a dignidade de cada terreiro |
| **Claro** | Simples, direto, sem jargão e sem rodeios |
| **Neutro** | Nunca favorece uma tradição ou outra; nunca é doutrinário |
| **Transparente** | Explica processos e scores com honestidade |
| **Empoderador** | Coloca a pessoa no controle (do cadastro, da visibilidade, da denúncia) |

### O que dizer / o que NUNCA dizer

| Dizer | Nunca dizer |
|-------|-------------|
| "Encontre sua comunidade com confiança." | "Encontre seu lucro com a macumba" (proselitismo/exotização) |
| "Fale com um dirigente para dúvidas espirituais." | "Nosso oráculo vai fazer o trabalho por você." |
| "A avaliação fala da sua experiência, não da fé." | "Avalie o axé dessa casa." |
| "Ligue o consentimento: fotos só com autorização do terreiro." | "Publique fotos da gira para atrair seguidores." |
| "Sua denúncia é analisada com sigilo." | "Vamos derrubar essa casa." |
| "Religião é dado sensível por LGPD." | "Compartilhamos sua fé com parceiros." |

---

## 3. Princípios de escrita

1. **Clareza > encanto** — frase verdadeira em texto simples vence trocadilho bonito. Se o usuário precisa reler, reescreva.
2. **Brevidade** — no máximo uma frase por estado; deixe o que não é essencial fora da superfície.
3. **Utilidade** — todo texto responde a "e agora, o que eu faço?".
4. **Respeito cultural** — no exótico, no jargão forçado, no sensacional. Explica o termo quando preciso.
5. **Consistência** — o mesmo fluxo usa as mesmas palavras (ver glossário).

Processo de revisão: todo texto passa por uma checagem de "voz" (neutro? respeitoso? claro?) antes de virar componente de UI, alinhado ao _definition of done_ (doc 85).

---

## 4. Diretrizes de microcopy

### Placeholders

| Componente | Exemplo |
|------------|---------|
| Busca | "Busque por cidade, tradição ou terreiro" |
| Cidade | "Ex.: Salvador, BA" |
| Nome do terreiro | "Ex.: Ilê Axé Oyá" |
| Tradição | "Ex.: Umbanda, Candomblé Ketu, Jurema" |
| WhatsApp | "(11) 9 9999-9999" |

### Labels de botões (verbos claros, em primeira ou segunda pessoa, sem caixa alta longa)

| Contexto | Label |
|----------|-------|
| Buscar | "Buscar terreiros" |
| Salvar rascunho | "Salvar rascunho" |
| Confirmar cadastro | "Criar minha conta" |
| Enviar avaliação | "Publicar avaliação" |
| Documentos | "Enviar documentos" |
| Contato | "Chamar no WhatsApp" |
| Recusar | "Agora não" |

### Tooltips

| Área | Texto |
|------|-------|
| Trust Score | "Quanto mais completo e verificado o perfil, maior o score. Veja os detalhes." |
| Selo "Identidade confirmada" | "O dirigente comprovou a identidade com documento." |
| Filtro "aceita visitantes" | "Casas que recebem quem ainda não frequenta." |

### Empty states (variante `empty` do StateCard)

> Regra: título conciso (3-6 palavras), descrição orientada, ação opcional.

| Contexto | Título | Descrição | Ação |
|----------|--------|-----------|------|
| Busca sem retorno | `notfound`: "Nenhum terreiro encontrado" | "Tente outra cidade ou remova algum filtro." | "Limpar filtros" |
| Sem eventos | `empty`: "Nenhum evento próximo" | "Cadastre-se para ver eventos da sua região." | "Ver terreiros próximos" |
| Sem avaliações | `empty`: "Ainda sem avaliações" | "Seja a primeira pessoa a compartilhar sua experiência." | "Avaliar este terreiro" |
| Marketplace vazio | `empty`: "Loja em construção" | "O vendedor ainda não adicionou produtos." | "Ver outras lojas" |

### Loading states

- "Buscando terreiros perto de você…" (sem spinner vazio; com contexto)
- "Enviando seus documentos com segurança…"
- "Preparando seu perfil…"

### Erros (padrão no doc 7 de feedback)

O tom do erro é **calmo e orientado**: nunca culpa, nunca alarme.

- Campo inválido: "Informe um telefone válido."
- Rede: "Não conseguimos concluir agora. Tente novamente em instantes." (ação: "Tentar de novo")
- Permissão: "Você precisa de permissão para fazer isso." + link de suporte.

### Confirmações

- "Conta criada com sucesso. Vamos montar o perfil do seu terreiro?" → CTA ["Montar agora"]
- "Denúncia recebida. Nossa equipe analisará em até 24h." (sem expor o denunciado)

### Onboarding

Fluxo de primeiro acesso com empatia, em 3 passos e poucas palavras:
1. "Bem-vindo(a). Vamos encontrar sua comunidade." (perguntar localização)
2. "Qual tradição você mais se identifica?" (neutro, lista não ordenada)
3. "Prefere terreiro que aceita visitantes?" (dimer para filtro)

---

## 5. Modelo de mensagens por fluxo crítico

### Cadastro
- Title/Heading: "Crie sua conta"
- Microcopy: "Leva menos de 1 minuto. Seus dados de religião são protegidos por LGPD."
- Confirm: "Criar minha conta"
- Sucesso: "Conta criada. Que bom ter você por aqui."

### Verificação de terreiro (níveis de verificação, doc 36)
- Passo 1: "Confirme seu contato" (WhatsApp/email com código)
- Passo 2: "Conte sobre seu terreiro" (tradição, descrição, horários)
- Passo 3: "Envie a foto do dirigente para confirmarmos" — com reafirmativa de sigilo: "Seus documentos são criptografados e nunca ficam públicos."
- Confirmar: "Enviar para revisão" / microcopy "Nossa equipe analisa em até 48h."
- Sucesso: "Verificação concluída. Selo 'Identidade confirmada' adicionado."
- Erro: "Não conseguimos validar suas fotos. Verifique se são reais e tente novamente."

### Avaliação (docs 37)
- Heading: "Sua experiência importa"
- Reafirma a regra: "Avalie o acolhimento, organização e transparência — não a fé."
- Label: "Como você avalia sua experiência?" (nota 1-5)
- Botão: "Publicar avaliação"
- Erro de moderação: "Sua avaliação foi revisada e não publicada, de acordo com nossas regras. Veja o motivo." + link de recurso ("Recorrer em 7 dias").

### Denise (docs 39)
- Título: "Reportar problema"
- Microcopy de sigilo: "Sua denúncia é anônima e analisada por pessoas."
- Botão: "Enviar denúncia"
- Sucesso: "Denúncia recebida. Vamos analisar com responsabilidade e sigilo."

### Mediação
- Aviso: "Detectamos uma disputa de avaliação. Nossa mediação busca diálogo antes de qualquer punição."
- CTA à mediação: "Conversar com mediação"

### Pagamento
- Confirmação: "Concluir pagamento" → link de checkout
- Sucesso: "Pagamento aprovado. Seu plano está ativo."
- Erro: "Não foi possível processar o pagamento. Verifique seus dados e tente de novo."

### Matrícula (curso/oficina, persona Tata Tião)
- Título: "Garanta sua vaga"
- CTA: "Efetuar matrícula"
- Sucesso: "Matrícula confirmada. Você recebeu os detalhes no e-mail."

### Chat IA (doc 20)
- Acolhimento: "Oi! Sou o assistente do AxéMap. Posso ajudar a entender uma tradição ou encontrar um terreiro. Para questões espirituais profundas, sugiro falar com um dirigente."
- Fim de contexto: "Não tenho certeza sobre isso. Recomendo confirmar com o dirigente do terreiro."

### Primeiro acesso
- "Bem-vindo(a) ao AxéMap. Vamos montar seu perfil em 3 passos."

### Feature flags / experimentos
- Communication só em experimentos internos; nunca informar o usuário de variante.
- Se flag introduz mudança visível: "Novidade: agora você filtra por acessibilidade." com link "Ver novidades".

---

## 6. Glossário e termos

### Capitalização e grafia padrão

| Termo | Regra | Uso correto |
|----|-------|--------------|
| **Pai de Santo** | Maiúsculas, por ser título. | Pai de Santo · mãe de santo (como substantivo em comum mantém?) → decisão: texto corrido usa minúscula quando genérico, maiúscula quando título direto |
| **babalorixá / iyalorixá** | Minúsculas (substantivos comuns do português), sentido do cargo mantém-se por extenso quando necessário | babalorixá, iyalorixá |
| **filho de santo** | minúscula | filhos de santo |
| **terreiro** | minúscula | terreiro, casa |
| **orixá** | minúscula (substantivo comum), nome próprio do orixá em maiúscula | orixá Xangô |
| **oxum / axé** | minúscula | axé |
| **Umbanda, Candomblé, Jurema, Tambor de Mina, Xangô, Omolocô** | Como tradições: maiúscula | Candomblé de matriz angolana |
| **Nomes de tradição/nação** | maiúscula | Ketu, Nagô, Jejé |

**Regra geral do glossário:** nomes próprios de tradições e de títulos em cargo em contexto cerimonial vão em maiúscula apenas quando é nome próprio; advertência dos substantivos comuns segue gramática. Manter isso **consistente** é requisito da voz.

### Termos proibidos (nunca usar, nem internamente)

| Proibido | Use |
|----------|-----|
| "seita", "culto de seita" | comunidade, casa, terreiro |
| "macumba" (pejorativo) | denominação ou apenas "tradição de matriz africana" |
| "Exótico", "folclore | ritos e tradição, religião |
| "chefe do culto" | dirigente, pai de santo, mãe de santo |
| "Bairro/estilo violento" | nada; respeite o tom |
| "verdadeiro pai de santo", "real axé" | julgamento de tradição (quebra neutralidade) |

---

## 7. Padrões de feedback (sucesso/erro com strings prontas)

### Sucesso

| Estado | Título | Descrição |
|--------|--------|-----------|
| Cadastro | "Conta criada" | "Vamos montar seu perfil." |
| Verificação | "Verificação enviada" | "Nossa equipe analisa em até 48h." |
| Avaliação | "Avaliação publicada" | "Obrigado por compartilhar sua experiência." |
| Denúncia | "Denúncia recebida" | "Analisaremos com sigilo." |
| Pagamento | "Pagamento aprovado" | "Seu plano está ativo." |
| Matrícula | "Matrícula confirmada" | "Você recebeu os detalhes no e-mail." |

### Erro (com ação de saída)

| Situação | Título | Descrição | Ação |
|----------|--------|-----------|------|
| Rede | "Algo não conectou" | "Tente de novo em instantes." | "Tentar novamente" |
| Campo | "Dado inválido" | "Confirma um {campo} válido." | "Corrigir" |
| Denúncia | "Não foi possível enviar" | "Sua denúncia não chegou. Tente outra vez." | "Reenviar" |

---

## 8. Voz para notificações e e-mails

### Estrutura: título (ação) + corpo (contexto) + CTA

| Tipo | Título | Corpo | CTA |
|------|--------|-------|-----|
| Nova avaliação | "Você recebeu uma avaliação" | "{[nome]} avaliou seu terreiro com {nota}★." | "Ver avaliação" |
| Selo conquistado | "Selo de confiança adicionado" | "Seu terreiro agora é 'Identidade confirmada'." | "Ver selos" |
| Denúncia sobre o terreiro | "Recebemos um sinal de revisão" | "Temos uma sinalização para analisar. Nas regras são respeitadas, fique tranquilo." | "Entenda" |
| Evento novo | "Novo evento perto de você" | "[terreiro] vai celebrar no dia {data}." | "Ver evento" |
| Boas-vindas (email) | "Bem-vindo ao AxéMap" | "Encontre sua comunidade com confiança. Começe pesquisando sua cidade." | "Começar" |

Regras:
- **Nunca** notificar denúncias de forma a expor terceiros; se for notificar, fazer com neutralidade e cuidado (docs 39, 47).
- Título ≤ 60 chars, corpo ≤ 140 chars, um único CTA.
- Tom acolhedor e neutro em todos.

---

## 9. Acessibilidade de texto
- **Linguagem simples:** vocabulário comum; nenhum tecnicismo; explique termos religiosos na primeira vez.
- **Frases curtas:** use frases curtas; importante para Dona Rosa (doc 10).
- **Evitar trocadilhos, ambiguidade e humor de duplo sentido.**
- **Descrições alternativas:** as imagens (rituais, produtos) têm `alt` descritivo e neutro, nunca sensacionalista: "Atabaque de madeira" em vez de "bateria espiritual estrondosa".
- **Contraste e legibilidade:** textos legíveis com o Design System (cores pertexto-foreground sobre fundos neutros; ver paleta em doc 27).
- **Não depende apenas de cor:** placeholders e tooltips usam também texto/ícone (como o StateCard, que combina ícone e título).
- Use a naturalidade da voz: "você" (singular), flexão de gênero "bem-vindo(a)" quando não há identidade conhecida.

---

## Referências cruzadas

- Componente de estado visual (empty/error/success/notfound): `apps/web/src/components/ui/state-card.tsx`
- Valores e neutralidade: doc 01
- Posicionamento e promessa: doc 26; tom de voz da marca: doc 27
- Fluxo de verificação: doc 36; avaliação: doc 37; moderação e denúncia: doc 39
- Privacidade: LGPD e governança: docs 56, 48; IA e chat: doc 20
- User Needs já levantadas: doc 88 (personas) e doc 10