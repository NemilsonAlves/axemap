# 08 — Casos de Uso

## Atores

| Ator | Descrição |
|------|-----------|
| **Visitante** | Usuário não autenticado que navega e busca terreiros |
| **Praticante** | Usuário autenticado que avalia, comenta, favorita |
| **Cambono** | Auxiliar do terreiro, pode gerenciar agenda |
| **Ogã** | Responsável pelos atabaques e musicalidade |
| **Ekedi** | Responsável pelo trato com os Orixás |
| **Filho de Santo** | Membro do terreiro, pode ter acesso ao SaaS |
| **Pai/Mãe de Santo** | Dirigente do terreiro, admin do perfil |
| **Visitante Admin** | Staff do AxéMap (moderação, suporte) |
| **Super Admin** | Administrador do sistema |

## Casos de Uso do MVP

### UC01: Buscar Terreiros
**Ator:** Visitante, Praticante
**Fluxo:**
1. Usuário acessa a página inicial ou mapa
2. Usa campo de busca (texto livre ou localização automática)
3. Aplica filtros (cidade, estado, religião, acessibilidade, etc.)
4. Visualiza resultados no mapa + lista
5. Clica em um terreiro para ver detalhes

### UC02: Visualizar Perfil do Terreiro
**Ator:** Visitante, Praticante
**Fluxo:**
1. Usuário acessa página pública do terreiro
2. Visualiza: fotos, descrição, horários, contato, mapa, avaliações
3. Pode compartilhar, favoritar (se logado), ou clicar no WhatsApp

### UC03: Cadastrar Terreiro
**Ator:** Pai/Mãe de Santo
**Fluxo:**
1. Usuário logado acessa "Cadastrar Terreiro"
2. Preenche formulário multi-step com informações básicas
3. Adiciona fotos, horários, características
4. Submete para aprovação
5. Recebe notificação quando aprovado

### UC04: Avaliar Terreiro
**Ator:** Praticante (logado)
**Fluxo:**
1. Usuário acessa perfil do terreiro
2. Clica em "Avaliar"
3. Dá nota de 1 a 5
4. Escreve título e comentário
5. Submete — avaliação entra como "pendente" para moderação
6. Quando aprovada, aparece no perfil

### UC05: Adicionar aos Favoritos
**Ator:** Praticante (logado)
**Fluxo:**
1. Usuário acessa perfil do terreiro
2. Clica no ícone de coração/favoritar
3. Terreiro adicionado à lista de favoritos
4. Usuário pode gerenciar favoritos no dashboard

### UC06: Compartilhar Terreiro
**Ator:** Visitante, Praticante
**Fluxo:**
1. Usuário acessa perfil do terreiro
2. Clica em "Compartilhar"
3. Escolhe: WhatsApp, Instagram, Facebook, copiar link
4. Link com Open Graph gera preview rico

### UC07: Cadastrar Evento
**Ator:** Pai/Mãe de Santo
**Fluxo:**
1. Acessa painel do terreiro
2. Clica em "Novo Evento"
3. Preenche: título, data, horário, descrição, tipo
4. Opcional: capacidade, valor ingresso, link transmissão
5. Publica — evento aparece no calendário

### UC08: Gerenciar Membros (SaaS)
**Ator:** Pai/Mãe de Santo
**Fluxo:**
1. Acessa painel > Membros
2. Convida por email/WhatsApp ou adiciona manualmente
3. Define cargo (ogã, ekedi, filho de santo, etc.)
4. Membro recebe notificação e aceita
5. Painel do membro é liberado

### UC09: Busca com Filtros Avançados
**Ator:** Visitante, Praticante
**Fluxo:**
1. Acessa página de busca
2. Expande "Filtros Avançados"
3. Seleciona combinações: religião + cidade + aceita visitantes + acessibilidade + etc.
4. Resultados filtrados no mapa + lista
5. Pode salvar a busca como alerta (futuro)

### UC10: Contato via WhatsApp
**Ator:** Visitante, Praticante
**Fluxo:**
1. No perfil do terreiro, clica em "WhatsApp"
2. Redirecionado para WhatsApp com mensagem pré-formatada
3. "Olá! Encontrei seu terreiro no AxéMap e gostaria de mais informações."

## Casos de Uso Futuros

### UC11: SaaS — Gestão Financeira
**Ator:** Pai/Mãe de Santo
Recebimento de doações via Pix, controle de despesas, emissão de recibos.

### UC12: SaaS — Subdomínio Personalizado
**Ator:** Pai/Mãe de Santo
Acesso via terreiro.axemap.com.br com identidade visual personalizada.

### UC13: Marketplace — Comprar Produto
**Ator:** Praticante
Navega, adiciona ao carrinho, compra com Pix/Cartão.

### UC14: Comunidade — Postar no Feed
**Ator:** Praticante
Cria post com texto, imagem, vídeo. Comenta e curte posts de outros.

### UC15: IA — Recomendação Personalizada
**Ator:** Visitante
Recebe sugestões de terreiros baseadas em perfil, localização e histórico.

### UC16: Mobile — Notificação Push
**Ator:** Praticante
Recebe alertas de eventos próximos, novas avaliações, convites.

### UC17: Enterprise — API de Dados
**Ator:** Pesquisador, Governo
Acessa dados agregados e anonimizados via API pública para pesquisa acadêmica e políticas públicas.

### UC18: Enterprise — Mapa da Intolerância
**Ator:** Pesquisador, Governo, ONGs
Dashboard com dados georreferenciados de denúncias de intolerância religiosa.
