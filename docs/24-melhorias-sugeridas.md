# 24 — Melhorias Sugeridas

## Funcionalidades Não Listadas Originalmente

### 1. Mapa da Intolerância Religiosa (MVP++)
**Descrição:** Dashboard georreferenciado com dados anônimos de denúncias de intolerância religiosa, alimentado por reports da plataforma + dados públicos (Disque 100).
**Valor:** Posiciona o AxéMap como ferramenta de utilidade pública, atrai mídia, fortalece parcerias governamentais.

### 2. Modo Visitante Seguro
**Descrição:** Perfil do terreiro pode marcar "horários seguros para visitação" — dias/horários em que a casa está aberta para visitantes pela primeira vez, com acompanhamento.
**Valor:** Reduz barreira de entrada para pessoas curiosas que têm medo de ir pela primeira vez.

### 3. Glossário Interativo de Termos
**Descrição:** Tooltip em termos religiosos ao longo do site (axé, ogã, ekedi, etc.). Ao passar o mouse, explicação breve aparece.
**Valor:** Educativo, reduz desinformação, melhora SEO (conteúdo rico), ajuda visitantes.

### 4. "Carta de Apresentação" do Terreiro
**Descrição:** Vídeo curto (1-2 min) do dirigente se apresentando e explicando a linha da casa, disponível no topo do perfil.
**Valor:** Conexão emocional, transparência, diferenciação.

### 5. Programa de Embaixadores
**Descrição:** Líderes de terreiros verificados viram "embaixadores" — ganham destaque, benefícios e ajudam a onboardar outros terreiros.
**Valor:** Growth orgânico, credibilidade, capilaridade.

### 6. Verificação por Pares (Peer Review)
**Descrição:** Terreiro novo pode ser verificado por 3 terreiros já verificados da mesma região. Sistema de reputação entre pares.
**Valor:** Escalabilidade da verificação, engajamento comunitário, confiança.

### 7. Mural de Recados do Terreiro
**Descrição:** Quadro de avisos digital onde o terreiro publica comunicados urgentes ("Gira cancelada hoje", "Precisamos de doações").
**Valor:** Comunicação instantânea, útil, engajamento.

### 8. Doação Direta via Plataforma
**Descrição:** Botão "Doar" no perfil do terreiro com Pix integrado (mesmo sem plano pago). Taxa zero para terreiros, apenas custo de processamento.
**Valor:** Gera receita para terreiros, goodwill para plataforma, porta de entrada para SaaS financeiro.

### 9. Agendamento de Visita
**Descrição:** Visitante agenda dia/horário para conhecer o terreiro. Terreiro recebe notificação e confirma. Reduz constrangimento de "chegar sem avisar".
**Valor:** Reduz atrito para visitantes, organiza a casa.

### 10. Mapa de Turismo Religioso Afro
**Descrição:** Rotas turísticas integrando terreiros históricos + pontos turísticos + restaurantes de comida afro. Parceria com secretarias de turismo.
**Valor:** Atrai turistas, gera receita enterprise, fortalece marca.

### 11. Comunidade de Suporte Jurídico
**Descrição:** Seção com advogados parceiros especializados em liberdade religiosa. Terreiro pode solicitar orientação.
**Valor:** Impacto social real, diferenciação, parcerias com ONGs e escritórios.

### 12. Árvore Genealógica do Terreiro
**Descrição:** Visualização da linhagem espiritual — "quem foi pai de quem". Preservação da memória oral em formato digital.
**Valor:** Preservação cultural, valor histórico, engajamento.

### 13. Calendário Nacional Unificado
**Descrição:** Calendário com todas as datas importantes de todas as tradições (Festa de Iemanjá, Dia da Umbanda, etc.), com eventos locais integrados.
**Valor:** Utilidade pública, SEO, atrai tráfego.

### 14. "Adote um Terreiro" — Patrocínio Corporativo
**Descrição:** Empresas podem patrocinar a assinatura SaaS de um terreiro carente. Selo "Apoiador" no perfil da empresa.
**Valor:** Receita corporativa, impacto social, marketing para empresas com agenda ESG.

### 15. Integração com Mapeamento Governamental
**Descrição:** Conectar com sistemas de mapeamento de terreiros já existentes (Mapeando Axé, Terreiros do Brasil) via API para importação de dados.
**Valor:** Acelera base inicial, evita recadastro, posiciona como centralizador.

## Melhorias Técnicas Sugeridas

### 1. PostGIS vs. GeoDjango
**Sugestão:** Usar PostGIS desde o início para a geolocalização, mesmo no MVP. A diferença de performance em queries de proximidade é enorme.

### 2. GraphQL para Buscas Complexas
**Motivo:** Frontend de busca precisa de dados de múltiplas tabelas (terreiro + fotos + avaliações + eventos). GraphQL evita over-fetching e under-fetching.

### 3. Service Worker para Mapa Offline
**Motivo:** Mapa do Leaflet pode ser cacheado via service worker. Usuário pode navegar no mapa mesmo sem internet (útil em áreas com conectividade limitada).

### 4. Compressão de Imagens Automática
**Ferramenta:** Sharp (server-side) ou Cloudflare Images. Fotos de terreiro podem ser grandes. Redimensionar para 3 tamanhos (thumb, medium, full) no upload.

### 5. Lazy Loading + Virtual Scroll na Lista
**Motivo:** Milhares de terreiros na busca — renderizar todos de uma vez trava o navegador. Virtual scroll é obrigatório.

### 6. Analytics desde o Dia 1
**Sugestão:** Implementar eventos de analytics (PostHog ou Plausible) desde o MVP. Decisões baseadas em dados desde o início.

## Armadilhas a Evitar

| Armadilha | Por que evitar | Alternativa |
|-----------|---------------|-------------|
| **Over-engineering no MVP** | Clean Architecture em excesso atrasa lançamento | Clean Architecture SIM, mas sem separação desnecessária |
| **Muitas features no lançamento** | Dilui foco, entrega nada bem feito | Lançar com busca + perfil + avaliações só |
| **Ignorar mobile-first** | 70%+ dos acessos serão mobile | Design mobile-first desde o wireframe |
| **Precificar muito baixo** | Desvaloriza o serviço | R$ 49/mês é justo para o valor entregue |
| **Moderação 100% manual** | Não escala com crescimento | IA + comunidade + reports |
| **Esquecer dirigentes não digitais** | Exclui a base mais tradicional | Onboarding assistido + suporte WhatsApp |

## Expansão Geográfica Futura

Após consolidar no Brasil, o AxéMap pode expandir para:
- **Portugal:** Comunidade afro-brasileira e candomblecistas
- **EUA:** Santeria, Vodou, Candomblé communities (NY, Miami, Atlanta)
- **Caribe:** Santeria cubana, Vodou haitiano
- **África:** Nigéria (Ifá), Benin (Vodun), Angola (Candomblé de Angola)
- **Europa:** Comunidades diaspóricas (Londres, Paris, Lisboa)

**Modelo:** Franchising digital ou licenciamento da plataforma para parceiros locais.
