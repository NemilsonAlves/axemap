# 42 — Eventos de Domínio

## Visão Geral

Os eventos de domínio são a espinha dorsal do sistema de confiança. Cada ação relevante dispara um evento que atualiza o Trust Score, notificações e outros subsistemas de forma assíncrona.

## Catálogo de Eventos de Domínio

### Eventos de Terreiro

| Evento | Disparado por | Consumidores |
|--------|--------------|--------------|
| **TerreiroCadastrado** | Cadastro inicial de terreiro | TrustScore, Notificações, SEO |
| **PerfilAtualizado** | Alteração de dados do terreiro | TrustScore (completeza), AuditLog |
| **FotoAdicionada** | Upload de foto | TrustScore (verificação), Moderação |
| **FotoAprovada** | Moderação aprovou foto | TrustScore (verificação) |
| **HorarioAtualizado** | Alteração de horários | TrustScore (completeza) |
| **TrustScoreRecalculado** | Recalculo periódico ou por evento | Busca (reindexar), Notificações |
| **NivelConfiancaAlterado** | Mudança de nível (🌱→🌿, etc.) | Notificações (dirigente), Badges |
| **VerificacaoConcluida** | Selo de verificação concedido | TrustScore, Notificações |
| **VerificacaoRevogada** | Selo removido | TrustScore, Notificações |
| **DenunciaConfirmada** | Denúncia contra terreiro validada | TrustScore (penalidade), Sinalizações |
| **PenalidadeAplicada** | Penalidade por infração | TrustScore, Notificações |

### Eventos de Avaliação

| Evento | Disparado por | Consumidores |
|--------|--------------|--------------|
| **AvaliacaoCriada** | Nova avaliação submetida | Moderação (fila), Reputação |
| **AvaliacaoModerada** | Moderação concluída (aprovada/rejeitada) | TrustScore (reputação), Notificações |
| **AvaliacaoReportada** | Avaliação sinalizada por usuário | Moderação (revisão), Anti-fraude |
| **AvaliacaoMarcadaUtil** | Usuário marcou avaliação como útil | ReputaçãoAvaliador |
| **AvaliacaoRespondida** | Terreiro respondeu à avaliação | TrustScore (taxa resposta) |

### Eventos de Usuário

| Evento | Disparado por | Consumidores |
|--------|--------------|--------------|
| **UsuarioCadastrado** | Novo cadastro | Gamificação, EmailBoasVindas |
| **EmailConfirmado** | Verificação de email | ReputaçãoAvaliador (upgrade) |
| **WhatsAppConfirmado** | Verificação de WhatsApp | TrustScore (verificação) |
| **LoginRealizado** | Login do usuário | Gamificação (daily), Métricas |
| **PerfilUsuarioCompleto** | Usuário atingiu >80% completeza | Gamificação (badge) |

### Eventos de Gamificação

| Evento | Disparado por | Consumidores |
|--------|--------------|--------------|
| **PontosGanhos** | Usuário ganhou pontos | Gamificação (nível), Notificações |
| **NivelAlterado** | Usuário subiu de nível | Notificações, Badges |
| **BadgeConquistada** | Badge desbloqueada | Notificações, Perfil |
| **LeaderboardAtualizado** | Ranking semanal recalculado | Notificações (top 10) |

### Eventos de Moderação e Anti-Fraude

| Evento | Disparado por | Consumidores |
|--------|--------------|--------------|
| **ConteudoSinalizado** | IA detectou conteúdo suspeito | Moderação (fila), Anti-fraude |
| **ComportamentoSuspeito** | Padrão anômalo detectado | Anti-fraude (análise), Admin |
| **UsuarioBanido** | Banimento aplicado | Notificações, Sessões (revogar) |

### Eventos de Comunidade

| Evento | Disparado por | Consumidores |
|--------|--------------|--------------|
| **PostCriado** | Novo post no feed | Feed (distribuição) |
| **GrupoCriado** | Novo grupo | Comunidade, Notificações |
| **EventoCriado** | Novo evento público | Calendário, Notificações (seguidores) |

## Schema do Evento

```typescript
interface DomainEvent {
  eventId: string;          // UUID v7
  eventType: string;        // "TerreiroCadastrado"
  eventVersion: number;     // 1
  aggregateId: string;      // UUID da entidade principal
  aggregateType: string;    // "Terreiro", "Usuario", "Avaliacao"
  data: Record<string, any>; // Payload do evento
  metadata: {
    correlationId: string;  // Para tracing
    causationId: string;   // Evento causador (se aplicável)
    timestamp: string;      // ISO 8601
    userId?: string;        // Usuário que disparou
    userAgent?: string;
    ipAddress?: string;
  };
}
```

## Exemplos de Eventos

### TerreiroCadastrado

```json
{
  "eventId": "01J3XYZ...",
  "eventType": "TerreiroCadastrado",
  "eventVersion": 1,
  "aggregateId": "uuid-do-terreiro",
  "aggregateType": "Terreiro",
  "data": {
    "terreiroId": "uuid",
    "nome": "Terreiro Pai João",
    "tradicao": "umbanda",
    "cidade": "Recife",
    "estado": "PE",
    "ownerId": "uuid-do-dirigente",
    "camposPreenchidos": 5,
    "totalCampos": 17
  },
  "metadata": {
    "correlationId": "corr-123",
    "causationId": null,
    "timestamp": "2026-07-13T15:00:00Z",
    "userId": "uuid-do-dirigente",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "189.xxx.xxx.xxx"
  }
}
```

### AvaliacaoModerada

```json
{
  "eventId": "01J3XYY...",
  "eventType": "AvaliacaoModerada",
  "eventVersion": 1,
  "aggregateId": "uuid-da-avaliacao",
  "aggregateType": "Avaliacao",
  "data": {
    "avaliacaoId": "uuid",
    "terreiroId": "uuid",
    "usuarioId": "uuid",
    "nota": 5,
    "status": "aprovado",
    "moderadoPor": "uuid-do-moderador",
    "pesoAvaliador": 1.5
  },
  "metadata": {
    "correlationId": "corr-456",
    "causationId": "evento-avaliacao-criada",
    "timestamp": "2026-07-13T15:30:00Z",
    "userId": "uuid-do-moderador"
  }
}
```

## Consumidores de Eventos (Handlers)

| Evento | Handler | Ação |
|--------|---------|------|
| **TerreiroCadastrado** | RecalcularTrustScoreHandler | Calcula score inicial (10 pts) |
| **PerfilAtualizado** | RecalcularCompletezaHandler | Recalcula completeza do perfil |
| **AvaliacaoModerada** (aprovada) | AtualizarReputacaoHandler | Recalcula reputação do terreiro + avaliador |
| **AvaliacaoModerada** (rejeitada) | PenalizarAvaliadorHandler | Reduz reputação do avaliador |
| **VerificacaoConcluida** | AtualizarVerificacaoHandler | Soma pontos de verificação |
| **DenunciaConfirmada** | AplicarPenalidadeHandler | Reduz score, registra sinalização |
| **TrustScoreRecalculado** | VerificarMudancaNivelHandler | Se score mudou de nível, dispara NivelConfiancaAlterado |
| **LoginRealizado** | AtualizarUltimoLoginHandler | Atualiza métrica de último login |
| **EventoCriado** | AtualizarMetricaEventosHandler | Recalcula eventos nos últimos 30/90 dias |

## Filas (BullMQ) para Eventos

| Fila | Eventos | Prioridade | Consumidor |
|------|---------|-----------|------------|
| **trust-score-queue** | PerfilAtualizado, AvaliacaoModerada, VerificacaoConcluida, DenunciaConfirmada | Alta | Recalcular Trust Score |
| **notification-queue** | NivelConfiancaAlterado, BadgeConquistada, VerificacaoConcluida | Alta | Notificações push/email/whatsapp |
| **search-index-queue** | TerreiroCadastrado, TrustScoreRecalculado | Média | Reindexar Elastic/Meili |
| **audit-log-queue** | Todos eventos | Baixa | Registrar em audit_logs |
| **analytics-queue** | LoginRealizado, AvaliacaoCriada, TerreiroCadastrado | Baixa | Métricas e dashboards |
