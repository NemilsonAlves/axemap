# 28 — Sistema de Confiança (Trust Score)

## Filosofia

O Trust Score é o **principal diferencial competitivo** do AxéMap. Ele não é um ranking de "qualidade espiritual" — isso seria impositivo e anti-neutralidade. Em vez disso, é uma medida de:

1. **Completeza das informações** — O terreiro forneceu dados suficientes?
2. **Verificação de identidade** — Quem está por trás é real e verificável?
3. **Engajamento** — O terreiro mantém seu perfil atualizado?
4. **Reputação comunitária** — O que a comunidade diz (avaliações, recomendações)?
5. **Histórico** — Há quanto tempo está na plataforma, consistência de presença?

## Componentes do Trust Score

| Componente | Peso | Descrição |
|-----------|------|-----------|
| **Completeza do Perfil** | 25% | % de campos preenchidos (fotos, descrição, horários, contato) |
| **Verificação** | 25% | Selos conquistados (identidade, fotos, informações) |
| **Atualização** | 15% | Última atualização do perfil, eventos recentes, calendário ativo |
| **Avaliações** | 20% | Média de avaliações + número de avaliações (com peso maior para volume) |
| **Histórico** | 10% | Tempo na plataforma sem infrações, consistência de presença |
| **Engajamento Social** | 5% | Taxa de resposta, eventos realizados, ações sociais |

## Cálculo do Trust Score

```
Trust Score = (C × 0.25) + (V × 0.25) + (A × 0.15) + (R × 0.20) + (H × 0.10) + (S × 0.05)

Onde:
  C = Completeza (0.0 - 1.0)
  V = Verificação (0.0 - 1.0, ver selos)
  A = Atualização (0.0 - 1.0)
  R = Reputação (0.0 - 1.0)
  H = Histórico (0.0 - 1.0)
  S = Engajamento Social (0.0 - 1.0)

Resultado: 0.0 (min) a 1.0 (max), exibido como 0-100
```

### Regras de Negócio do Cálculo

1. **Score mínimo de partida:** 10 pontos (terreiro recém-cadastrado)
2. **Score máximo:** 100 pontos (teórico, nenhum terreiro terá 100)
3. **Decaimento:** Se o terreiro não fizer login por 90 dias, perde 5 pontos/mês
4. **Reset:** Penalidades graves (verificação revogada, moderação) podem zerar componentes
5. **Redistribuição:** Se um componente não se aplica (ex: sem avaliações), seu peso é redistribuído entre os disponíveis

## Selos de Confiança

### Selos de Verificação

| Selo | Como conquistar | Impacto no Score |
|------|----------------|-----------------|
| **📱 Contato Verificado** | Confirmar WhatsApp/telefone via código SMS | +3 pts (V) |
| **📧 Email Verificado** | Clicar no link de confirmação | +2 pts (V) |
| **📍 Endereço Verificado** | Fornecer endereço completo com CEP válido | +3 pts (C) |
| **👤 Identidade Confirmada** | Enviar documento do dirigente (validação manual) | +10 pts (V) |
| **📸 Fotos Verificadas** | Mínimo 3 fotos reais aprovadas pela moderação | +5 pts (V) |
| **📅 Perfil Completo** | Todos os campos obrigatórios preenchidos + horários | +8 pts (C) |
| **🗓️ Calendário Ativo** | Eventos nos últimos 30 dias | +5 pts (A) |
| **⭐ Comunidade Aprova** | 10+ avaliações com média >= 4.0 | +7 pts (R) |

### Níveis de Confiança

| Nível | Score | Ícone | Cor |
|-------|-------|-------|-----|
| **Novo** | 0-25 | 🌱 | Cinza |
| **Estabelecido** | 26-50 | 🌿 | Verde claro |
| **Confiável** | 51-75 | 🌳 | Verde médio |
| **Referência** | 76-90 | 🏆 | Verde escuro |
| **Excelência** | 91-100 | 👑 | Dourado |

## Transparência do Score

O Trust Score é **completamente transparente**:

1. **Score visível** no perfil do terreiro e nos cards de busca
2. **Detalhamento** ao clicar: "Por que esse terreiro tem score X?"
3. **Componentes individuais** exibidos em gráfico radar
4. **Dicas de melhoria** para dirigentes: "Complete seu perfil para aumentar o score"
5. **Nunca é algoritmo obscuro** — todo peso e regra documentados

### Exemplo de Detalhamento (UI)

```
Trust Score: 72 — Confiável 🏆

  Completeza    ██████████░░░  85%  ✓ Perfil quase completo
  Verificação   ████████░░░░░  70%  ✓ Email + WhatsApp + Identidade
  Atualização   ███████░░░░░░  60%  ⚠ Último evento: 45 dias atrás
  Avaliações    ██████████░░░  80%  ✓ 12 avaliações (média 4.5)
  Histórico     ████████░░░░░  65%  ✓ 8 meses na plataforma
  Engajamento   ██████░░░░░░░  50%  ⚠ Sem ações sociais registradas

  DICA: Adicione eventos no calendário para aumentar seu Trust Score!
```

## Regras de Exibição na Busca

- **Ordenação padrão:** Trust Score (decrescente) + distância
- **Filtro mínimo:** Usuário pode definir score mínimo (ex: "só mostre terreiros com score > 50")
- **Badge visível:** Cada card na busca mostra o nível (🌱 🌿 🌳 🏆 👑)
- **Sem score escondido:** TODO terreiro tem score visível, sem exceção

## Impacto na Monetização

| Plano | Score Máximo | Benefícios |
|-------|-------------|-----------|
| Grátis | 60 | Limitado por completeza (sem vídeos, galeria limitada) |
| Básico | 75 | + Selo de calendário ativo, + vídeos |
| Profissional | 90 | + Selo de identidade, prioridade na busca |
| Enterprise | 100 | + Selo "Verificado Premium", suporte prioritário |

> **Nota:** O plano não COMPRA score. Ele DESBLOQUEIA componentes que permitem alcançar score maior. A diferença está na capacidade de preencher mais informações, não na compra de reputação.

## Atualização do Score

| Evento | Ação |
|--------|------|
| Terreiro atualiza perfil | Recalcular completeza (C) |
| Nova avaliação aprovada | Recalcular reputação (R) |
| Novo evento publicado | Atualizar atualização (A) |
| Selo conquistado/perdido | Atualizar verificação (V) |
| Login do dirigente | Atualizar última atividade |
| 90 dias sem login | Aplicar decaimento |
| Denúncia confirmada | Aplicar penalidade |
