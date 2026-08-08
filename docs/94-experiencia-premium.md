# 94 — Experiência Premium

> Etapa 12 da série de experiência do produto. Define o que significa oferecer uma experiência "premium" no AxéMap: princípios, padrões de referência de empresas de alto nível de produto, regras de redução de fricção, padrões por momento e um checklist universal aplicável a qualquer tela.
>
> Relaciona-se com: docs 24, 25, 36, 37, 43, 44, 57, 64. Não duplica conteúdo: aqui o foco é **como a experiência se sente**, não a arquitetura por trás dela.

---

## 1. Princípios da Experiência Premium

Uma experiência premium não é sinônimo de caro, exclusivo ou ornamentado. É a sensação de que **o produto respeita o tempo, o contexto e a cultura do usuário** e entrega valor com o mínimo de atrito possível. Definimos cinco princípios que orientam todas as decisões de interface:

| Princípio | Definição operacional | Referência de mercado | Exemplo concreto no AxéMap |
|-----------|----------------------|------------------------|----------------------------|
| **Zero atrito** | Reduzir ao mínimo o número de passos, campos e decisões entre a intenção do usuário e o resultado | Booking.com, Apple.com | Busca → perfil → WhatsApp em até 3 cliques (ver seção 2) |
| **Clareza** | O usuário entende, sem esforço, o que está vendo e o que pode fazer a seguir | Stripe, Linear | Selo de verificação com tooltip explicando o critério, sem jargão |
| **Confiança** | Cada elemento da interface reforça segurança e legitimidade | Uber, Google Pay | Trust Score visível, selos de verificação explicados, dados de moderação transparentes |
| **Performance percebida** | O usuário sente velocidade mesmo quando a rede é lenta; cargas são antecipadas e progressos são comunicados | Google Search, Stripe | Skeleton de busca e pré-renderização de resultados em menos de 200ms |
| **Microinterações** | Pequenos feedbacks (hover, foco, transições, confirmações) que guiam e confirmam cada ação | Apple, Notion | Feedback visual ao favoritar e confirmação animada ao enviar avaliação |

### 1.1 Por que isso importa para o AxéMap

O AxéMap lida com **confiança, cultura religiosa e, muitas vezes, usuários com baixa fluência digital**. Uma experiência premium aqui não é luxo — é um **fator de inclusão e de respeito**: quanto menor o atrito e mais clara a interface, maior a chance de um dirigente idoso ou de um primeiro visitante concluir a jornada sem se sentir desamparado. A palavra "premium" neste domínio deve soar como **"cuidado"**, e não como "exclusividade de quem tem dinheiro".

### 1.2 Referências de padrão e adaptações ao domínio

| Empresa | Padrão a copiar | Como adaptar ao domínio |
|---------|-----------------|--------------------------|
| **Apple** | Clareza radical, uma ação principal por tela, microinterações de alto acabamento | Cada tela de terreiro com um CTA primário claro ("Entrar em contato", "Visitar", "Doar") |
| **Airbnb** | Onboarding progressivo e foto-first; o perfil conta histórias antes de pedir dados | Perfil do terreiro conduz pela foto/vídeo do dirigente, não por formulário |
| **Stripe** | Clareza de documentação e feedback de estado em tempo real | Barra de completeza do perfil com "o que falta" explicado |
| **Google** | Performance percebida e busca correta; estado de carregamento minimizado | Skeleton + sugestões no campo de busca com terreiros da região |
| **Booking** | Redução de fricção em reservas e conversão; senso de urgência honesto | Confirmação de presença em eventos e agenda de visitas sem login duplicado |
| **Uber** | Estado "ao vivo" (ETA), clareza de trajeto, confiança na origem/destino | Status em tempo real: "terreiro online", "confirmou visita", "avaliou" |
| **Linear** | Velocidade e atalhos de teclado, consistência, feedback instantâneo | Atalhos de busca global (Ctrl/Cmd+K) desde o início |
| **Notion** | Zero fricção de edição, contêineres organizados, feedback contínuo | Edição de perfil inline com salvamento automático e "voltar" sempre visível |

---

## 2. Regras de Redução de Fricção

### 2.1 Caminho mais curto para cada ação crítica

Para cada uma das jornadas a seguir, definimos o **número máximo de etapas** e o **caminho canônico**. Se qualquer fluxo exceder essa contagem, ele é elegível para redesign.

| Jornada | Caminho canônico | Cliques/telas máximos | Fricção que DEVE ser eliminada |
|---------|------------------|----------------------|--------------------------------|
| **Buscar um terreiro** | Home → busca → resultado | 2 telas | Filtro que força recarga; resultado parcial imediato |
| **Visitar perfil** | Busca/listagem → perfil | 1 clique a partir do resultado | Tela intermediária de "pré-perfil" |
| **Entrar em contato** | Perfil → WhatsApp | 1 clique (link direto) | Pedir para copiar número ou abrir o app manualmente |
| **Descobrir** | Home → recomendações/região → perfil | 2 telas | Curadoria com "ver mais" em excesso |
| **Avaliar** | Perfil → avaliação → enviar | 2 telas, formulário com menos de 8 campos | Login duplo; nota em campo separado da área de texto |
| **Comprar (marketplace)** | Perfil → catálogo → checkout | 3 telas | Checkout com cadastro redundante; Pix com confirmações em excesso |
| **Matricular** | Perfil → "Quero participar" → agendar/contato | 3 etapas | Repetição de dados já existentes na conta |

### 2.2 Regra dos 3 cliques

Regra heurística: **toda ação crítica do produto deve ser alcançável em até 3 cliques** a partir do estado atual do usuário. Ela não é absoluta (fluxos de cadastro e checkout legítimos podem precisar de mais), mas funciona como um alarme: se uma ação predominante exigir 4 ou mais cliques, o fluxo tem excesso de hierarquia ou de passos e precisa de revisão.

Exceções documentadas e **justificadas**:
- Verificação oficial de um terreiro (identidade/documento) — exige etapas de segurança, pode passar de 3.
- Onboarding completo de dirigente (completeza >80%) — é um *momento de setup*, não uma ação de uso recorrente.

### 2.3 Eliminação de cliques desnecessários

| Clique desnecessário | Impacto negativo | Solução |
|----------------------|------------------|---------|
| Confirmação dupla para ações reversíveis | Atrito e desconfiança | Confirmar apenas ações irreversíveis (excluir, remover) |
| Tela adicional para "ver mais fotos" | Quebra o fluxo | Galeria expandível in-place via modal/lightbox |
| Botões "salvar/OK" em telas sem edição | Fricção | Auto-salvar com feedback |
| Formulário de cadastro com 15 campos no primeiro passo | Abandono massivo | Onboarding progressivo: só o essencial no passo 1 (ver doc 50) |
| Esconder "voltar" no fluxo | Sensação de aprisionamento | Breadcrumb + tecla Esc sempre disponíveis |

---

## 3. Padrões Premium por Momento

### 3.1 Primeiro acesso (onboarding em menos de 2 min)

| Padrão | Racional | Implementação |
|--------|----------|----------------|
| Pedir apenas o essencial | Reduz barreira de cadastro | Cadastro em 1 tela: e-mail/WhatsApp + senha ou OAuth Google |
| Aprender por comportamento, não só por questionário | Menos formulário, mais valor | Perguntar a vertente religiosa apenas quando impacta busca/feed |
| Prova social visível | Gerar confiança imediata | "X terreiros verificados na sua região" já no primeiro acesso |
| Primeiro valor em menos de 60s | Alinhado à North Star (doc 44) | Ao logar, sugerir 3 terreiros próximos verificados na home |
| Onboarding assistido para dirigentes | Inclusão digital | CTA "WhatsApp para ajudar a cadastrar" no primeiro acesso do dirigente (ver doc 24) |

Tempo meta: **do primeiro campo ao primeiro resultado útil ≤ 2 minutos no primeiro acesso**; <60s para visitantes com conta (login social).

### 3.2 Carregamento: skeleton vs spinner

| Contexto | Padrão | Motivo |
|----------|--------|--------|
| Primeiro carregamento de página estrutural | Skeleton (esqueleto do layout) | Dá a sensação de layout estável e reduz ansiedade de "tela branca" |
| Ação em background (salvar, favoritar) | Feedback local + estado final animado | Não interrompe o fluxo |
| Busca com muitos resultados | Resultado parcial + skeleton para o restante | Prioriza a resposta rápida (padrão Google) |
| Submissão de formulário longo | Spinner com mensagem honesta ("Enviando... isso pode levar alguns segundos") | Evita abandono em etapas de verificação/upload |
| Operação que pode falhar | Estado otimista + rollback | Confiança sem mentir: mostra sucesso prévio e corrige se falhar |

**Regra prática:** nunca deixe um clique sem feedback. Todo botão de ação responde em menos de 120ms com estado visual.

### 3.3 Empty states acolhedores

Um empty state (tela sem dados) é um momento de risco de abandono. Padrão premium: **ele deve guiar a próxima ação, não apenas dizer "não há nada"**.

Exemplos no AxéMap:
- **Busca sem resultados** → "Não encontramos terreiros assim perto de você. Amplie o raio de busca" + alternativa: "Ajude a mapear: indique um terreiro que você conhece".
- **Lista de favoritos vazia** → saudação + CTA para a home "Explore terreiros verificados perto de você".
- **Painel do usuário sem avaliações** → "Você ainda não avaliou. Sua opinião ajuda a comunidade a encontrar casas confiáveis."
- **Painel do dirigente sem convidados** → "Convide seus frequentadores via WhatsApp e mantenha todos informados."

Regra de tom: o empty state deve ser **acolhedor, sem culpar o usuário**, e sempre propor 1 (máximo 2) próximas ações claras.

### 3.4 Feedback em tempo real

- **Validação de campos inline** (após o usuário sair do campo, não a cada tecla, para não constranger).
- **Contador de caracteres** para textos longos (avaliação, descrição, mensagem).
- **Indicador de "salvando / salvo"** na edição do perfil.
- **Conflito de edição em tela** (ex.: dois dirigentes editando o mesmo perfil simultaneamente).
- Ações assíncronas (verificação documental) com **progresso visível e expectativa de tempo** ("Análise em até 48h pela nossa equipe").
- **Desfazer (undo)** em ações destrutivas e reversíveis (remover foto, excluir rascunho).

### 3.5 Estados de sucesso com próximo passo

Todo estado de sucesso deve responder **"e agora o quê?"**. O AxéMap já tem o componente `state-card` no Design System — use-o em todos os sucessos.

| Ação bem-sucedida | Estado de sucesso | Próximo passo sugerido |
|-------------------|-------------------|------------------------|
| Cadastro de terreiro (rascunho) | "Cadastro salvo como rascunho" | "Complete seu perfil para aumentar a visibilidade" |
| Envio de avaliação | "Obrigado! Sua opinião foi registrada." | "Ver outras avaliações" / "Compartilhar este terreiro" |
| Verificação atualizada | "Seu terreiro agora aparece com o selo X" | "Ver como ficou seu perfil" + "Compartilhar a novidade" |
| Favorito adicionado | Ícone animado + "Salvo nos favoritos" | "Ver seus favoritos" |
| Compra no marketplace | "Pedido confirmado" | "Acompanhar entrega" + "Deixar avaliação da compra" |

### 3.6 Consistência visual

- Fundação no **Design System definido em `apps/web/src/app/globals.css`**: tokens de cor (barro, cobre, bronze, terra), tipografia (Inter + Plus Jakarta Sans), raios, sombras, opacidade e motion.
- Componentes reutilizáveis em **`apps/web/src/components/ui/`**: `badge`, `tooltip`, `dialog`, `sheet`, `dropdown-menu`, `tabs`, `combobox`, `timeline`, `skeleton`, `state-card`, `toast`, `trust-score-card`, `profile-card`, `mega-menu`, `search`.
- Regra: **não criar componentes visuais ad hoc**; sempre compor a partir desses. Variações passam pelo design token, não por estilização isolada.
- **Densidade consistente por família de tela**: listas de terreiros sempre com o mesmo layout de card (`profile-card`), o mesmo `badge` para selos, etc.
- Tema **dark** completo (o DS já define os tokens `--dark`) deve ter paridade de acessibilidade com o tema light (ver doc 95).

### 3.7 Motivos para "confiança" exibidos sem exotizar a cultura

A confiança deve ser **apresentada como cuidado profissional, nunca como espetacularização da cultura**:

| Elemento de confiança | Como exibir | O que NÃO fazer |
|------------------------|-------------|-----------------|
| **Verificação / selos** | Badge discreto + tooltip "Terreiro com perfil verificado pela AxéMap" | Não tratá-lo como "troféu exótico", não associar a superstição |
| **Trust Score** | Barra de confiança com detalhamento claro (completeza, verificação, avaliação) e "como melhorar" | Não transformar em ranque público que constranja a casa |
| **Avaliações de usuários** | Contagem, média e amostras organizadas por utilidade | Não editar ou recortar trechos para favorecer a aparência |
| **Atividade** | "Responde às avaliações", "última publicação há 5 dias" | Sem revelar dados pessoais |
| **Resultados da moderação** | "Conteúdo revisado pela comunidade" com link para a política | Não expor a pontuação interna de trust na superfície do usuário |

Regra de ouro: mostrar confiança é **mostrar o processo de cuidado** por trás do dado, sempre em linguagem respeitosa e neutra quanto à religião, preservando a dignidade do terreiro e a privacidade dos envolvidos.

---

## 4. Checklist da Experiência Premium (aplicável a qualquer tela)

Antes de considerar qualquer tela pronta, ela deve passar neste checklist. Se um item falhar, a tela volta para revisão.

### Fricção e caminho
- [ ] A ação crítica da tela está acessível em até 3 cliques (com exceção justificada documentada).
- [ ] Existe 1 (único) CTA primário claro por tela.
- [ ] Nenhuma confirmação dupla para ações reversíveis.
- [ ] Não há campos ou etapas que repetem dados já obtidos.
- [ ] O formulário pede o mínimo necessário no primeiro passo (progressivo).

### Clareza
- [ ] O título/H1 descreve o que o usuário vê, sem jargão.
- [ ] Termos religiosos (ogã, ekedi, axé) possuem tooltip/glossário (ver doc 24).
- [ ] Cada estado visível (carregando, vazio, erro, sucesso) tem texto autoexplicativo e "próximo passo".
- [ ] Não há dois elementos visuais comunicando informações conflitantes no mesmo momento.

### Confiança
- [ ] Selos e verificação visíveis têm tooltip explicativo honesto.
- [ ] Avaliação e moderação não distorcem o dado para uma aparência favorável.
- [ ] Transparência do processo mantida sem expor dados sensíveis.

### Performance percebida
- [ ] Todo carregamento tem skeleton ou feedback em até 300ms.
- [ ] Nenhuma interação fica sem resposta visual (estados hover/pressed).
- [ ] LCP ≤ 2,5s em rede média (Core Web Vitals); imagens têm versões em vários tamanhos.

### Microinterações
- [ ] Cada ação primária tem microinteração (transição, animação).
- [ ] Animações duram entre 120-320ms (tokens de motion do DS) e usam `--ease-out`.
- [ ] `prefers-reduced-motion` é respeitado (bloco já presente no globals.css).

### Consistência
- [ ] Usa tokens do Design System (globals.css) — sem cores/raios isolados.
- [ ] Reutiliza componentes de `components/ui/`; não duplica visualmente.
- [ ] Temas dark e light com paridade e contraste AA (ver doc 95).

---

## 5. Relação com as demais docs

| Doc | Relação |
|-----|---------|
| 24 | Onboarding assistido para não-digitais, Modo Visitante Seguro e agendamento de visitas citados |
| 25 | Alinhamento com "neutralidade religiosa" e cortes do MVP que preocupam |
| 36/37 | Selo de verificação e avaliações — base dos motivos de confiança desta etapa |
| 43 | KPIs de performance e NPS/CSAT que a boa experiência alimenta |
| 44 | North Star "Conexões Confiáveis" — cada caminho cortado eleva a taxa de conexão |
| 57 | RBAC — a semântica de visibilidade (quem vê o trust score) reflete nos limites de exibição |
| 64 | Arquitetura de componentes definida — esta doc define como eles devem "ser sentidos" |
| 96 | Métricas de experiência (tempo de tarefa, CES, erros) quantificam estes padrões |

**Próximo passo:** a doc 95 (Acessibilidade e Inclusão) traduz estes princípios em normas WCAG 2.2 para o AxéMap.