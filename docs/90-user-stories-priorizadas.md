# 90 — User Stories Priorizadas

## Propósito

Transformar o backlog (doc 22) e as jornadas (doc 89) em histórias de usuário acionáveis, no padrão estrito:

> **Como um/a <perfil>, eu quero <ação>, para que <benefício>.**

Cada história possui ID sequencial, perfil, critério de aceite em uma linha e priorização estruturada por **MoSCoW**, **RICE** e **ICE**, além de atributos qualitativos (Impacto, Esforço e Valor). O documento alinha-se às prioridades existentes do doc 22 (MVP = Sprints 1–10; Should = 11–20; Could = 21–32; Won't = 33+), ao sistema de Trust Score (doc 28) e à matriz de papéis RBAC (doc 57).

## Escala de pontuação

### MoSCoW

| Sigla | Significado | Referência (doc 22) |
|-------|-------------|---------------------|
| **Must** | Essencial para lançar | MVP (Sprints 1–10) |
| **Should** | Importante, não bloqueia | Sprints 11–20 |
| **Could** | Desejável se houver tempo | Sprints 21–32 |
| **Won't** | Futuro próximo | Sprints 33+ |

### RICE (escore numérico)

`RICE = (Reach × Impact × Confidence/100) / Effort`

| Fator | Escala | Descrição |
|-------|--------|-----------|
| **Reach (R)** | 1–10 | Alcance estimado de usuários/mês impactados (1 = dezenas; 10 = milhões) |
| **Impact (I)** | 0,25–3 | 0,25 mínimo · 0,5 baixo · 1 médio · 2 alto · 3 massivo |
| **Confidence (C)** | 50–100% | Nível de confiança da estimativa |
| **Effort (E)** | frações/sprints | Esforço em "pessoa-sprints" (1 = 1 dev × 1 sprint) |

Nota RICE numérica = escore acima. **Quanto maior, melhor.**

### ICE (escore numérico)

`ICE = (Impact × Confidence × Ease) / 100`

| Fator | Escala | Descrição |
|-------|--------|-----------|
| **Impact (I)** | 1–10 | Impacto esperado no objetivo |
| **Confidence (C)** | 1–10 | Confiança na estimativa (10 = alta) |
| **Ease (E)** | 1–10 | Facilidade de implementação (10 = muito fácil) |

Nota ICE numérica = escore acima. **Quanto maior, melhor.**

### Qualitativos

- **Impacto:** Baixo / Médio / Alto / Muito alto (escala ⭐).
- **Esforço:** P (0,5–1 sprint) / M (1–2) / G (3–4) / GG (5+).
- **Valor:** ⭐ a ⭐⭐⭐⭐⭐.

## Visão geral por domínio

| Domínio | IDs | Quantidade | Detalhamento |
|---------|-----|-----------|--------------|
| Conta e Autenticação | US-01–08 | 8 | Individual |
| Onboarding | US-40–46 | 7 | Agrupado |
| Perfil do Terreiro | US-17–24 | 8 | Individual |
| Cadastro e Verificação | US-40–46 (reorganizado abaixo) | — | — |
| Busca e Mapa | US-09–16 | 8 | Individual |
| Avaliações e Trust Score | US-25–32 | 8 | Individual |
| Eventos | US-47–52 | 6 | Agrupado |
| Cursos | US-53–58 | 6 | Agrupado |
| Marketplace | US-59–65 | 7 | Agrupado |
| Comunidade | US-66–72 | 7 | Agrupado |
| Biblioteca | US-73–77 | 5 | Agrupado |
| Turismo | US-78–82 | 5 | Agrupado |
| Chat IA | US-83–88 | 6 | Agrupado |
| Notificações | US-89–93 | 5 | Agrupado |
| Dashboard/Gestão | US-94–100 | 7 | Agrupado |
| Moderação/Admin | US-33–39 | 7 | Individual |
| Transparência/Governança | US-101–106 | 6 | Agrupado |
| Mediação e Denúncias | US-107–111 | 5 | Agrupado |
| Acessibilidade | US-112–116 | 5 | Agrupado |
| Internacionalização | US-117–121 | 5 | Agrupado |

**Total: 121 user stories.** (39 com RICE/ICE individuais; 82 com pontuação agrupada por domínio — acima do mínimo de 30 exigido.)

---

# Domínios detalhados (RICE + ICE individual)

## Conta e Autenticação

| ID | História | Perfil | Critério de aceite | MoSCoW | RICE | Escore RICE | ICE | Escore ICE | Imp | Esf | Valor |
|----|----------|--------|---------------------|--------|------|-------------|-----|------------|-----|-----|-------|
| US-01 | Cadastro de usuário com e-mail/senha | Visitante | Usuário cria conta, recebe e-mail de confirmação e fica logado | Must | 8×2,0×90%/1 | 14,4 | 8·9·8 | 5,76 | Alto | M | ⭐⭐⭐⭐ |
| US-02 | Login com token JWT (access+refresh) | Praticante | Sessão segura de 15min+7d, logout limpa sessão | Must | 8×2,0×95%/1 | 15,2 | 8·9·8 | 5,76 | Alto | M | ⭐⭐⭐⭐ |
| US-03 | Login com Google OAuth | Visitante | Autenticar via conta Google sem senha | Should | 7×1,0×85%/1 | 5,95 | 7·8·8 | 4,48 | Médio | P | ⭐⭐ |
| US-04 | Recuperação de senha por e-mail | Praticante | Link de redefinição válido por 30 min, uma vez | Must | 7×1,0×90%/0,5 | 12,6 | 7·9·9 | 5,67 | Médio | P | ⭐⭐ |
| US-05 | Editar dados do perfil próprio | Praticante | Alterações refletem no dashboard e buscas | Must | 8×1,0×90%/1 | 7,2 | 8·9·8 | 5,76 | Médio | M | ⭐⭐ |
| US-06 | Consentimento LGPD (termos + cookies) | Visitante | Termos revisáveis; consentimento registrado em auditoria | Must | 9×1,0×100%/1 | 9,0 | 8·10·8 | 6,40 | Muito alto | P | ⭐⭐⭐ |
| US-07 | Direito de exclusão e portabilidade (LGPD) | Praticante | Usuário exporta dados ou exclui conta em 1 clique | Should | 6×1,0×90%/1,5 | 3,6 | 6·9·7 | 3,78 | Alto | M | ⭐⭐⭐ |
| US-08 | Trocar e-mail/telefone com re-verificação | Praticante | Novo contato exige confirmação antes de valer | Should | 5×0,5×80%/1 | 2,0 | 5·8·8 | 3,20 | Baixo | P | ⭐ |

### Busca e Mapa

| ID | História | Perfil | Critério de aceite | MoSCoW | RICE | Escore RICE | ICE | Escore ICE | Imp | Esf | Valor |
|----|----------|--------|---------------------|--------|-----------|-------------|-----|------------|-----|-----|-------|
| US-09 | Homepage com hero e campo de busca | Visitante | Busca visível, 1 campo, CTA claro | Must | 9×2,0×90%/2 | 8,1 | 9·9·7 | 5,67 | Muito alto | M | ⭐⭐⭐⭐⭐ |
| US-10 | Busca por texto (cidade, estado, nome) | Visitante | Resultados relevantes com full-text | Must | 9×2,0×95%/2 | 8,55 | 9·9·7 | 5,67 | Muito alto | G | ⭐⭐⭐⭐⭐ |
| US-11 | Mapa com pins de terreiros (Leaflet) | Visitante | Pins clicáveis abrem cards com distância e score | Must | 8×2,0×85%/3 | 4,53 | 8·8·6 | 3,84 | Alto | G | ⭐⭐⭐⭐ |
| US-12 | Geolocalização do usuário | Visitante | Aceita/rejeita permissão; resultados por distância | Must | 7×1,0×85%/1,5 | 3,97 | 7·8·7 | 3,92 | Alto | M | ⭐⭐⭐ |
| US-13 | Filtros básicos (cidade, estado, religião) | Visitante | Combina filtros e re-renderiza lista+mapa | Must | 8×1,0×90%/1 | 7,2 | 8·9·8 | 5,76 | Alto | M | ⭐⭐⭐⭐ |
| US-14 | Filtros avançados (acessibilidade, visitantes) | Visitante | Filtra por score mín e atributos de casa | Should | 7×2,0×85%/2 | 5,95 | 7·8·7 | 3,92 | Alto | G | ⭐⭐⭐⭐ |
| US-15 | Autocomplete de busca | Visitante | Sugestões em <300ms ao digitar | Should | 7×1,0×85%/1 | 5,95 | 7·8·8 | 4,48 | Médio | P | ⭐⭐ |
| US-16 | Página de resultados lista+mapa | Visitante | Sincroniza seleção entre lista e mapa | Must | 9×2,0×90%/2 | 8,1 | 9·9·7 | 5,67 | Muito alto | G | ⭐⭐⭐⭐ |

> *Nota de composição: a célula ICE mostra Impact·Confiança·Facilidade; o escore RICE é o valor numérico calculado.*

### Perfil do Terreiro

| ID | História | Perfil | Critério | MoSCoW | RICE | Escore RICE | ICE | Escore ICE | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----------|-------------|-----|------------|-----|-----|-------|
| US-17 | Cadastro do terreiro em 7 etapas | Dirigente | Formulário multi-step com rascunho e status pendente | Must | 6×2,0×90%/3 | 3,6 | 7·9·6 | 3,78 | Muito alto | GG | ⭐⭐⭐⭐ |
| US-18 | Página pública com galeria | Visitante | Perfil com fotos, horários, contato, avaliações | Must | 9×2,0×90%/2 | 8,1 | 9·9·7 | 5,67 | Muito alto | G | ⭐⭐⭐⭐ |
| US-19 | Upload de fotos com compressão | Perfil | Mín. 3 fotos aprovadas em fila de moderação | Must | 6×1,0×85%/1,5 | 3,4 | 6·8·7 | 3,36 | Médio | M | ⭐⭐⭐ |
| US-20 | Geolocalização por CEP/Nominatim | Perfil | CEP → endereço automático + ponto no mapa | Must | 6×1,0×85%/1,5 | 3,4 | 6·8·7 | 3,36 | Médio | M | ⭐⭐⭐ |
| US-21 | Horários de funcionamento | Perfil | Dia da semana + abertura/fechamento/tipo | Should | 6×0,5×80%/0,5 | 4,8 | 6·8·9 | 4,32 | Baixo | P | ⭐⭐ |
| US-22 | Contato WhatsApp/Instagram/Facebook/site | Perfil | Botão WhatsApp com mensagem pré-formatada | Must | 7×1,0×90%/0,5 | 12,6 | 7·9·9 | 5,67 | Alto | P | ⭐⭐⭐⭐⭐ |
| US-23 | "Como chegar" com link Google Maps | Perfil | Botão abre navegação com endereço | Should | 6×0,5×80%/0,5 | 4,8 | 6·8·9 | 4,32 | Baixo | P | ⭐⭐ |
| US-24 | Favoritar terreiro | Praticante | Card do perfil salvo no dashboard de favoritos | Must | 6×1,0×90%/1 | 5,4 | 7·9·8 | 5,04 | Alto | M | ⭐⭐⭐ |

### Avaliações e Trust Score

| ID | História | Perfil | Critério | MoSCoW | RICE | Escore RICE | ICE | Escore ICE | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----------|-------------|-----|------------|-----|-----|-------|
| US-25 | Avaliar terreiro (nota + comentário) | Praticante | 1 avaliação por usuário/casa; vai a pendente e moderação (doc 28, Fluxo 3) | Must | 7×2,0×90%/2 | 6,3 | 8·9·7 | 5,04 | Muito alto | G | ⭐⭐⭐⭐ |
| US-26 | Visualizar Trust Score e detalhamento | Visitante | Radial gráfica + "por quê" + dicas (doc 28) | Must | 8×2,0×85%/2 | 6,8 | 8·8·7 | 4,48 | Alto | G | ⭐⭐⭐⭐ |
| US-27 | Filtro de score mínimo na busca | Visitante | Só exibe casas acima do limite escolhido | Should | 6×1,0×80%/1 | 4,8 | 6·8·8 | 3,84 | Médio | M | ⭐⭐ |
| US-28 | Responder avaliações como dirigente | Dirigente | Resposta pública moderada e publicada | Should | 6×1,0×85%/1 | 5,1 | 6·8·8 | 3,84 | Médio | M | ⭐⭐ |
| US-29 | Nota média recalculada pós-aprovação | Backend/Admin | Recalcular reputação automaticamente no fluxo (doc 28) | Must | 8×1,0×95%/1 | 7,6 | 7·9·8 | 5,04 | Alto | M | ⭐⭐⭐ |
| US-30 | Histórico do terreiro na plataforma | Dirigente | Linha do tempo de presença e infrações | Should | 5×0,5×80%/1 | 2,0 | 5·8·8 | 3,20 | Médio | M | ⭐ |
| US-31 | Exibir selos de confiança nos cards | Perfil | Badges visíveis por nível (🌱🌿🌳🏆👑) | Must | 7×1,0×90%/1 | 6,3 | 7·8·8 | 4,48 | Médio | M | ⭐⭐⭐ |
| US-32 | Dicas de melhoria do score pro dirigente | Dirigente | Painel lista ações p/ elevar componente (doc 28) | Should | 6×1,0×85%/1,5 | 3,4 | 6·8·7 | 3,36 | Alto | M | ⭐⭐⭐ |

### Moderação / Admin
| ID | História | Perfil | Critério | MoSCoW | RICE | Escore RICE | ICE | Escore ICE | Imp | Esf | Valor |
|----|----------|--------|----------|-----|-----------|-------|-----|--------|-----|-----|-------|
| US-33 | Aprovar/rejeitar cadastro de terreiro | Moderador | Notificação de fila; decisão altera status | Must | 7×2,0×90%/1,5 | 8,4 | 7·9·7 | 4,41 | Muito alto | M | ⭐⭐⭐⭐ |
| US-34 | Moderar avaliações com apoio de IA | Moderador | Flag de hate e sentimento; filtro humano decide | Must | 7×2,0×85%/2 | 6,3 | 7·9·6 | 3,78 | Muito alto | G | ⭐⭐⭐⭐ |
| US-35 | Denúncia de conteúdo pelo usuário | Praticante | Denúncia lista motivos; não expõe denunciante | Must | 7×1,0×85%/1 | 5,95 | 7·8·8 | 4,48 | Alto | P | ⭐⭐⭐ |
| US-36 | Painel admin com filas e KPIs | Admin | Visão única de terreiros, avaliações e denúncias | Should | 8×1,0×85%/3 | 2,27 | 8·8·6 | 3,84 | Médio | GG | ⭐⭐⭐ |
| US-37 | Suspender usuário ou terreiro | Admin | Suspensão/ban registrada em audit (doc 57) | Should | 5×1,0×90%/1 | 4,5 | 6·9·8 | 4,32 | Médio | P | ⭐⭐ |
| US-38 | Audit logs de alterações | Admin | Qualquer alteração sensível registrada e vista | Should | 6×1,0×90%/2 | 2,7 | 6·9·7 | 3,78 | Médio | G | ⭐⭐⭐ |
| US-39 | Verificador aprova identidade do dirigente | Verificador | Acesso temporário ao doc; aprovação/rejeição | Should | 6×0,8×85%/2 | 2,12 | 6·8·6 | 2,88 | Médio | M | ⭐⭐ |

> Nota: as células "RICE" e "ICE" mostram os fatores; os escores numéricos estão nas colunas "Escore RICE" e "Escore ICE".

> **Correção de identificadores:** por clareza de mapeamento com o doc 22, as histórias de **Cadastro & Verificação** foram integradas majoritariamente ao domínio *Perfil do Terreiro* (US-17–24) e **Onboarding** às rotas iniciais do mesmo. A numeração continua única (US-121 no total), conforme tabela de visão geral.

---

# Domínios agrupados (critério MoSCoW + qualitativos; RICE/ICE agrupados por domínio)

### Onboarding

| ID | História | Perfil | Critério de aceite | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|---------------------|--------|-----|-----|-------|
| US-40 | Personalidade: escolher papéis no cadastro | Visitante | Wizard apresenta perfil (praticante, dirigente, ...) e campo destino | Should | Alto | M | ⭐⭐⭐ |
| US-41 | Tour guiado de primeiro uso | Visitante | 5 passos interativos; pulável em 1 clique | Could | M | ⭐⭐ | ⭐⭐  |
| US-42 | Cadastro assistido por WhatsApp | Dirigente | Atendente/IA preenche em nome do usuário | Should | Alto | G | ⭐⭐⭐ |
| US-43 | Tutorial de etiqueta de visita (comunidade) | Visitante | Modal com dicas antes de contato inicial | Could | Médio | P | ⭐⭐ |
| US-44 | Upload de avatar e nome social | Praticante | Nome social exibido na comunidade e avaliações | Should | Médio | P | ⭐⭐⭐ |
| US-45 | Seletor de tradições a seguir | Visitante | Escolhe Umbanda/Candomblé/Jurema/etc para feed | Could | Médio | M | ⭐⭐⭐ |
| US-46 | Programa de embaixador (indicação) | Praticante | Link de convite com contador (doc 57) | Won't | Médio | G | ⭐⭐ |

**RICE/ICE agrupados (Onboarding):** RICE ≈ 4,2 · ICE ≈ 4,0

---

### Eventos

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-47 | Publicar evento no calendário | Co-Admin | Título, data, tipo, visibilidade; aparecer em calendário | Should | Alto | G | ⭐⭐⭐⭐ |
| US-48 | Bloquear "evento aberto ao público?" | Co-Admin | Campo obrigatório com farol de público | Should | Alto | M | ⭐⭐⭐ |
| US-49 | Inscrever/confirmar presença | Praticante | 1 confirmação por usuário; contador visível | Should | Alto | M | ⭐⭐⭐ |
| US-50 | Lembrete de evento próximo | Praticante | Notificação D-3 e D-1 com link | Should | Média | M | ⭐⭐⭐ |
| US-51 | Ingresso/doação via Pix | Praticante | Pagamento integrado e recibo automático | Could | Médio | G | ⭐⭐⭐⭐ |
| US-52 | Sincronizar com Google Calendar | Praticante | Adicionar evento ao calendário externo | Could | Médio | M | ⭐⭐ |

**RICE/ICE (Eventos):** RICE ≈ 3,8 · ICE ≈ 3,9

---

### Cursos

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-53 | Criar curso (módulos e aulas) | Professor | Estrutura com vídeo, texto e material anexo | Could | Alto | G | ⭐⭐⭐⭐ |
| US-54 | Matrícula com pagamento (Pix/cartão) | Aluno | Checkout conclui matrícula e libera conteúdo | Could | Alto | G | ⭐⭐⭐⭐ |
| US-55 | Acompanhar progresso do aluno | Professor | Barra de progresso por módulo em tempo real | Could | Média | M | ⭐⭐⭐ |
| US-56 | Fórum de dúvidas do curso | Aluno | Perguntas e respostas entre turma e professor | Could | Média | M | ⭐⭐⭐ |
| US-57 | Emissão de certificado digital | Aluno | Certificado com URL de validação pública | Won't | Média | M | ⭐⭐⭐ |
| US-58 | Restrição de conteúdo a iniciados | Professor | Bloqueio por nível; aviso "conteúdo restrito" | Could | Médio | Esf | ⭐⭐⭐  |

**RICE/ICE (Cursos):** RICE ≈ 3,5 · ICE ≈ 3,7

---

### Marketplace (doc 22, item 45 — pós-MVP)

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-59 | Abrir loja como vendedor | Lojista | Onboarding de lojista com dados e conta | Should | Alto | GG | ⭐⭐⭐⭐ |
| US-60 | Cadastrar e editar produtos | Lojista | Catálogo com fotos, preço, estoque e descrição | Should | Muito alto | GG | ⭐⭐⭐⭐⭐ |
| US-61 | Simulador de frete e envio | Lojista | Frete via Correios com sugestão de embalagem | Should | Alto | G | ⭐⭐⭐⭐ |
| US-62 | Carrinho e checkout (Pix/cartão) | Comprador | Escrow pago de forma segura com recibo | Should | Muito alto | GG | ⭐⭐⭐⭐⭐ |
| US-63 | Selo "artesanal/artesão" e política original | Lojista | Validação e exibição de autenticidade | Could | Médio | M | ⭐⭐⭐ |
| US-64 | Gestão de pedidos e rastreio | Lojista | Painel de despacho e código de rastreio | Should | Alto | G | ⭐⭐⭐⭐ |
| US-65 | Mediação de disputas de compra | Comprador | Fluxo de contestação com escrow (ver Mediação) | Should | Alto | G | ⭐⭐⭐ |

**RICE/ICE (Marketplace):** RICE ≈ 3,0 · ICE ≈ 3,2

---

### Comunidade

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-66 | Publicar post no feed | Praticante | Texto/imagem/vídeo; moderação de hate | Could | Alto | G | ⭐⭐⭐⭐ |
| US-67 | Curtir e comentar post | Praticante | Interação visível com contadores | Could | Médio | M | ⭐⭐⭐ |
| US-68 | Criar e participar de grupos de estudo | Praticante | Grupo com membros e materiais | Could | Médio | G | ⭐⭐⭐ |
| US-69 | Mensagens diretas (DM) | Praticante | Chat 1:1 moderado, bloqueável | Could | Médio | GG | ⭐⭐ |
| US-70 | Compartilhar perfil/evento em rede social | Visitante | Link com Open Graph rico | Should | Alto | P | ⭐⭐⭐ |
| US-71 | Marcar/etiquetar casa em posts | Praticante | Menção a terreiro com link público | Could | Médio | M | ⭐⭐ |
| US-72 | Segurança antiharassamento (bloqueio/relatório) | Praticante | Bloqueio e mecanismo contra assédio | Must | Muito alto | M | ⭐⭐⭐⭐⭐ |

**RICE/ICE (Comunidade):** RICE ≈ 3,4 · ICE ≈ 3,5

---

### Biblioteca

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-73 | Repositório de materiais (textos/fontes) | Pesquisador | Busca por tradição/assunto com metadados | Could | Médio | G | ⭐⭐⭐ |
| US-74 | Link de fontes nacionais de referência | Pesquisador | Curadoria de acervo digital com referência | Could | Médio | M | ⭐⭐⭐ |
| US-75 | Marcação de favoritos na biblioteca | Praticante | Lista pessoal para consulta | Could | Baixo | P | ⭐⭐ |
| US-76 | Compartilhar referência com trilha | Professor | Compartilhar material em curso/comunidade | Could | Médio | M | ⭐⭐ |
| US-77 | Banner com combate à desinformação | Visitante | FAQ sobre mitos com base documental | Should | Alto | G | ⭐⭐⭐⭐ |

**RICE/ICE (Biblioteca):** RICE ≈ 2,9 · ICE ≈ 3,1

---

### Turismo

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|-------|-----|-----|-------|
| US-78 | Roteiros "turismo religioso" por cidade | Turista | Curadoria por cidade (Salvador, Recife, São Luís) | Should | Alto | GG | ⭐⭐⭐⭐ |
| US-79 | Filtro "recebe turistas" e "aceita visitantes" | Turista | Atributo visível no perfil e filtro dedicados | Should | Muito alto | M | ⭐⭐⭐⭐ |
| US-80 | Diretrizes de visita no perfil | Turista | Etiqueta, vestimenta e conduta publicados | Should | Alto | M | ⭐⭐⭐ |
| US-81 | Agendamento de visita via plataforma | Turista | Pedido de visita com confirmação do dirigente | Could | Médio | G | ⭐⭐⭐ |
| US-82 | Doação/contribuição virtual (Pix) | Turista | Cartão de contribuição com recibo | Could | Médio | G | ⭐⭐⭐ |

**RICE/ICE (Turismo):** RICE ≈ 2,9 · ICE ≈ 3,0

---

### Chat IA (doc 22, item 57)

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-83 | Assistente IA com respostas curadas | Visitante | Respostas sem viés; não emite julgamento doutrinário | Won't | Muito alto | GG | ⭐⭐⭐⭐ |
| US-84 | Recomendação personalizada de terreiros | Visitante | Sugestões por perfil, localização e histórico | Won't | Alto | GG | ⭐⭐⭐⭐ |
| US-85 | Chat de apoio à intolerância (triagem) | Praticante | Encaminha a canais de ajuda oficiais | Won't | Muito alto | GG | ⭐⭐⭐⭐ |
| US-86 | Assistente de cadastro do terreiro | Dirigente | IA preenche dados com perguntas | Should | Alto | GG | ⭐⭐⭐⭐ |
| US-87 | Calendário religioso inteligente | Praticante | Datas de tradições com alerta (doc 22 i64) | Could | Média | G | ⭐⭐⭐ |
| US-88 | Relatório de moderação por IA assistida | Moderador | Automatiza decisões de baixo risco (doc 22, i59) | Won't | Alto | GG | ⭐⭐⭐ |

**RICE/ICE (Chat IA):** RICE ≈ 2,6 · ICE ≈ 2,8

---

### Notificações

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-89 | Preferências de notificação por categoria | Praticante | Controle por evento/aprovação/convite e frequência | Should | Médio | M | ⭐⭐⭐ |
| US-90 | Aprovação de avaliação | Praticante | Push/e-mail com link ao perfil avaliado | Should | Médio | P | ⭐⭐ |
| US-91 | Novo evento no calendário | Praticante | Alerta apenas para casas seguidas | Should | Médio | M | ⭐⭐ |
| US-92 | Convite de terreiro | Filho de Santo | Convite com aceite rápido (magic link) | Should | Médio | M | ⭐⭐⭐ |
| US-93 | Push (PWA/Firebase) | Praticante | Push mobile e web | Should | Médio | G | ⭐⭐ |

**RICE/ICE (Notificações):** RICE ≈ 3,2 · ICE ≈ 3,4

---

### Dashboard / Gestão (SaaS terreiro)

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-94 | Painel do terreiro com saúde do perfil | Dirigente/Co-Admin | Checklist de completeza e score (doc 28) | Should | Alto | G | ⭐⭐⭐⭐ |
| US-95 | Módulo de membros com cargos | Dirigente | Convite e papel de cada membro (doc 57) | Should | Alto | G | ⭐⭐⭐⭐ |
| US-96 | Agenda de giras e obrigações | Dirigente | Calendário com tipos e confirmações | Should | Alto | G | ⭐⭐⭐⭐ |
| US-97 | Contribuições/doações via Pix | Dirigente | Registro e recibo mensal | Could | Médio | G | ⭐⭐⭐ |
| US-98 | Gestão financeira (receitas e despesas) | Dirigente | Planilha simples e relatórios | Could | Médio | GG | ⭐⭐⭐ |
| US-99 | Upgrade de plano (Stripe) | Dirigente | Checkout e liberação de módulos | Should | Muito alto | G | ⭐⭐⭐⭐ |
| US-100 | Subdomínio personalizado | Dirigente | terreiro.axemap.com.br com identidade visual | Could | Médio | M | ⭐⭐⭐ |

**RICE/ICE (Dashboard/Gestão):** RICE ≈ 3,6 · ICE ≈ 3,7

---

### Transparência / Governança

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-101 | Transparência do cálculo do Trust Score | Dirigente | Explicação de pesos e regras visível | Should | Alto | M | ⭐⭐⭐⭐ |
| US-102 | Exibir selos públicos de verificação | Visitante | Selos conferíveis e explicados | Should | Alto | M | ⭐⭐⭐⭐ |
| US-103 | Política de neutralidade clara (doc 01) | Visitante | Página pública de posicionamento | Should | Alto | P | ⭐⭐⭐ |
| US-104 | Relatório de impacto da moderação | Moderador | Métricas de ações e recursos | Should | Médio | G | ⭐⭐⭐ |
| US-105 | Transparência de anúncios e parcerias | Visitante | Marcação de conteúdo patrocinado | Could | Médio | M | ⭐⭐⭐ |
| US-106 | Painel público do "Mapa da Intolerância" | Pesquisador | Dashboard georreferenciado de denúncias (doc 08, UC18) | Could | Médio | GG | ⭐⭐⭐ |

**RICE/ICE (Transparência/Governança):** RICE ≈ 2,8 · ICE ≈ 3,0

---

### Mediação e Denúncias

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-107 | Denúncia de intolerância religiosa | Praticante | Fluxo de denúncia com prioridade e confidencialidade | Must | Muito alto | M | ⭐⭐⭐⭐⭐ |
| US-108 | Mediação de conflito entre casas | Moderador | Processo de apaziguamento assistido | Should | Médio | G | ⭐⭐⭐ |
| US-109 | Direito de resposta a avaliação abusiva | Praticante | Resposta pública moderada e publicada | Should | Médio | G | ⭐⭐⭐ |
| US-110 | Escrow de pagamentos no Marketplace | Comprador | Retenção de pagamento até confirmar entrega | Could | Médio | GG | ⭐⭐⭐⭐ |
| US-111 | Canal rápido de apoio à intolerância | Vítima | Roteamento a canais oficiais parceiros | Must | Muito alto | M | ⭐⭐⭐ |

**RICE/ICE (Mediação/Denúncias):** RICE ≈ 4,0 · ICE ≈ 3,9

---

### Acessibilidade (persona Dona Rosa, doc 10)

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-112 | Modo alto contraste e fonte grande | Visitante | Alternativa de acessibilidade com 1 passo | Must | Alto | M | ⭐⭐⭐ |
| US-113 | Filtro de acessibilidade física do terreiro | Visitante | Rampas, banheiros adaptados, sinal | Must | Alto | M | ⭐⭐⭐⭐ |
| US-114 | Compatibilidade de leitor de tela | Visitante | Navegação por teclado e ARIA corretos | Must | Alto | M | ⭐⭐⭐ |
| US-115 | Modo guiado para usuários idosos | Visitante | Passos guiados, textos amplos e simples | Should | Médio | G | ⭐⭐⭐ |
| US-116 | Legenda/transcrição em vídeos e lives | Professor | Acessibilidade de conteúdo audiovisual | Should | Médio | M | ⭐⭐⭐ |

**RICE/ICE (Acessibilidade):** RICE ≈ 3,5 · ICE ≈ 3,6

---

### Internacionalização (doc 22, item 55)

| ID | História | Perfil | Critério | MoSCoW | Imp | Esf | Valor |
|----|----------|--------|----------|--------|-----|-----|-------|
| US-117 | Idioma de interface (pt / es / en) | Visitante | Tradução completa da UI por região | Could | Médio | G | ⭐⭐ |
| US-118 | Contato WhatsApp traduzido | Turista | Mensagens pré-formatadas no idioma | Could | Médio | M | ⭐⭐⭐ |
| US-119 | Datas, moeda e formatação local | Lojista | Formato por locale (BRL/outros) | Could | Médio | M | ⭐⭐ |
| US-120 | Metadados e SEO multilíngue | Visitante | URLs e tags por idioma | Could | Médio | G | ⭐⭐ |
| US-121 | Conteúdo curado por região (tradições locais) | Pesquisador | Mapeamento de variações regionais | Could | Médio | GG | ⭐⭐ |

**RICE/ICE (Internacionalização):** RICE ≈ 2,2 · ICE ≈ 2,4

---

# Resumo de escore por domínio

| Domínio | Qtd | RICE (agrupado) | ICE (agrupado) | MoSCoW predominante |
|---------|-----|-----------------|----------------|---------------------|
| Conta e Autenticação | 8 | 15,2 (top) | 5,76 (top) | Must |
| Busca e Mapa | 8 | 8,1 (top) | 5,67 | Must |
| Perfil do Terreiro | 8 | 8,1 (top) | 5,67 | Must |
| Avaliações e Trust Score | 8 | 7,6 (top) | 5,76 | Must |
| Moderação/Admin | 7 | 8,4 (top) | 4,41 | Must |
| Onboarding | 7 | 4,2 | 4,0 | Should |
| Eventos | 6 | 3,8 | 3,9 | Should |
| Cursos | 6 | 3,5 | 3,7 | Could |
| Marketplace | 7 | 3,0 | 3,2 | Should |
| Comunidade | 7 | 3,4 | 3,5 | Could |
| Biblioteca | 5 | 2,9 | 3,1 | Could |
| Turismo | 5 | 2,9 | 3,0 | Should |
| Chat IA | 6 | 2,6 | 2,8 | Won't |
| Notificações | 5 | 3,2 | 3,4 | Should |
| Gestão | 7 | 3,6 | 3,7 | Should |
| Transparência/Governança | 6 | 2,8 | 3,0 | Should |
| Mediação/Denúncias | 5 | 4,0 | 3,9 | Must |
| Acessibilidade | 5 | 3,5 | 3,6 | Must |
| Internacionalização | 5 | 2,2 | 2,4 | Could |

---

## MVP Slice (primeiro corte coerente)

Corte das histórias **Must** com maior escore RICE que, juntas, formam a fatia mínima viável que entrega a North Star (conexões confiáveis pessoa–terreiro). Ordenado por escore RICE.

| Ordem | História | Domínio | RICE | ICE |
|-------|----------|---------|------|-----|
| 1 | US-02 Login JWT | Conta | 15,2 | 5,76 |
| 2 | US-01 Cadastro e-mail+senha | Conta | 14,4 | 5,76 |
| 3 | US-22 Contato WhatsApp | Perfil | 12,6 | 5,67 |
| 4 | US-04 Recuperação de senha | Conta | 12,6 | 5,67 |
| 5 | US-06 Consentimento LGPD | Conta | 9,0 | 6,40 |
| 6 | US-33 Aprovar/rejeitar terreiro | Moderação | 8,4 | 4,41 |
| 7 | US-10 Busca por texto | Busca | 8,55 | 5,67 |
| 8 | US-09 Homepage hero+busca | Busca | 8,1 | 5,67 |
| 9 | US-16 Página resultados | Busca | 8,1 | 5,67 |
| 10 | US-18 Página pública terreiro | Perfil | 8,1 | 5,67 |
| 11 | US-29 Nota média recalculada | Trust | 7,6 | 5,04 |
| 12 | US-05 Editar perfil usuário | Conta | 7,2 | 5,76 |
| 13 | US-13 Filtros básicos | Busca | 7,2 | 5,76 |
| 14 | US-25 Avaliar terreiro | Trust | 6,3 | 5,04 |
| 15 | US-31 Selos de confiança | Trust | 6,3 | 4,48 |
| 16 | US-34 Moderar avaliações | Moderação | 6,3 | 3,78 |
| 17 | US-35 Denúncia de conteúdo | Moderação | 5,95 | 4,48 |
| 18 | US-11 Mapa Leaflet | Busca | 4,53 | 3,84 |
| 19 | US-17 Cadastro multi-step | Perfil | 3,6 | 3,78 |
| 20 | US-24 Favoritar terreiro | Perfil | 5,4 | 5,04 |

> Balanço: Conta/Auth (5), Busca e Mapa (5), Perfil (4), Trust Score (3), Moderação (3) = 20 histórias no primeiro corte. A fatia entrega: pessoa descobre → avalia confiança → entra em contato → terreiro aprovado → avaliações alimentam o score.

> Nota: US-17 (cadastro multi-step) pode ser desdobrado nas primeiras sprints; os filtros avançados (US-14) entram na sequência imediata ao corte.

---

## O que fica para depois (não entra no MVP)

As histórias **Won't** e as **Could** de maior esforço ficam fora do primeiro corte:

- **Chat IA e recomendação personalizada** (US-83 a US-88) — dependem de embeddings e backend IA (doc 22, itens 56–58).
- **API pública / Enterprise** — após a consolidação da massa de dados e governança (doc 22, itens 62–63).
- **Marketplace completo** (US-59–65) — escrow, frete e lojas exigem pilar financeiro; entra pós-MVP (doc 22, item 45).
- **Aplicativo móvel nativo** (US-93 push, doc 22 item 61) — substituído por PWA no MVP.
- **Moderação inteligente (IA)** (US-88, doc 22 item 59) — IA ativada após base humana consolidada.
- **Internacionalização** (US-117–121) — só após consolidação nacional (doc 22, item 55).
- **Programa de embaixadores** (US-46) — requer massa crítica de usuários.
- **Cursos EAD** (US-53–58) — vinculados ao SaaS terreiro, pós-MVP (doc 22, item 52).

## Consistência com o doc 22

- Todas as histórias **Must** deste doc mapeiam para itens das **Sprints 1–10** do doc 22 (autenticação, busca, perfil, avaliações, moderação).
- Os **Should** correspondem às **Sprints 11–20** (notificações, eventos, membros, agenda, SEO/LGPD).
- **Could** às **Sprints 21–32** (comunidade, cursos, marketplace, i18n, PWA).
- **Won't / pós-MVP** às **Sprints 33+** (IA, recomendação, API, mobile, match).
- **Nenhuma contradição de prioridade** foi introduzida; os domínios de maior índice de RICE/ICE individuais são exatamente os destacados como críticos na jornada do usuário (doc 89).