# 61 — Modelo de Auditoria

## Filosofia

> "No AxéMap, toda ação relevante deixa rastro. Se não foi auditado, não aconteceu."

## O Que é Auditado

### Eventos de Dados

| Categoria | Eventos Auditados |
|-----------|------------------|
| **Perfil de Terreiro** | Criação, edição de campos críticos, exclusão, mesclagem, suspensão, reativação |
| **Usuário** | Cadastro, login, alteração de papel, exclusão, banimento |
| **Avaliação** | Criação, moderação (aprovação/rejeição), reporte, resposta |
| **Verificação** | Solicitação, upload de documentos, aprovação/rejeição, revogação |
| **Trust Score** | Cada recalculo (score anterior, novo, motivo) |
| **Financeiro** | Transações, alteração de plano, cancelamento, reembolso |
| **Moderação** | Decisões (IA e humana), recursos, alteração de status |
| **Admin** | Qualquer ação administrativa (criar, editar, excluir, suspender) |
| **LGPD** | Solicitações de exclusão, portabilidade, consentimento |

### O que NÃO é Auditado (para reduzir volume)

- Visualizações de página (são métricas, não auditoria)
- Buscas realizadas (são métricas)
- Login sem alteração de dados

## Estrutura do Log de Auditoria

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação do evento
  tabela VARCHAR(100) NOT NULL,        -- 'terreiros', 'avaliacoes', 'usuarios'
  registro_id UUID NOT NULL,            -- ID do registro afetado
  acao VARCHAR(50) NOT NULL,            -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'
  
  -- Dados
  dados_anteriores JSONB,               -- snapshot anterior (para UPDATE/DELETE)
  dados_novos JSONB,                     -- novo snapshot (para CREATE/UPDATE)
  campos_alterados TEXT[],               -- ['nome', 'descricao'] (apenas UPDATE)
  
  -- Ator
  usuario_id UUID REFERENCES usuarios(id),
  papel_do_usuario VARCHAR(50),          -- 'dirigente', 'admin', 'moderador'
  ip_address VARCHAR(45),
  user_agent TEXT,
  sessao_id UUID,
  
  -- Contexto
  terreiro_id UUID REFERENCES terreiros(id),  -- se aplicável
  correlation_id UUID,                          -- para tracing de eventos encadeados
  
  -- Metadados
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_audit_tabela_registro ON audit_logs(tabela, registro_id, created_at DESC);
CREATE INDEX idx_audit_usuario ON audit_logs(usuario_id, created_at DESC);
CREATE INDEX idx_audit_terreiro ON audit_logs(terreiro_id, created_at DESC);
CREATE INDEX idx_audit_data ON audit_logs(created_at);
CREATE INDEX idx_audit_correlation ON audit_logs(correlation_id);
```

## Política de Retenção

| Tipo de Log | Retenção | Destino Final |
|-------------|----------|---------------|
| Auditoria de dados | 5 anos | Anonimizar após 5 anos |
| Auditoria de login | 1 ano | Excluir após 1 ano |
| Auditoria de Trust Score | 2 anos | Manter agregado (média) |
| Auditoria de moderação IA | 6 meses | Manter apenas decisões com recurso |
| Auditoria financeira | 6 anos (fiscal) | Manter conforme lei |
| Auditoria LGPD | 5 anos após exclusão | Excluir |

## Como a Auditoria é Gerada

### Middleware (NestJS Interceptor)

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { method, path, user, ip } = request;
    
    // Ignora GET requests (apenas leitura)
    if (method === 'GET') return next.handle();

    return next.handle().pipe(
      tap(async (response) => {
        // Identifica a ação baseada no método + path
        const acao = this.mapAction(method, path);
        const tabela = this.mapTable(path);
        const registroId = this.extractId(path, response);
        
        // Só audita se for relevante
        if (!acao || !tabela || !registroId) return;

        await this.prisma.audit_logs.create({
          data: {
            tabela,
            registro_id: registroId,
            acao,
            dados_anteriores: request.auditPreviousData || null,
            dados_novos: response?.data || null,
            campos_alterados: request.auditChangedFields || null,
            usuario_id: user?.id,
            papel_do_usuario: user?.papel,
            ip_address: ip,
            user_agent: request.headers['user-agent'],
            sessao_id: request.session?.id,
            terreiro_id: request.params?.slug ? await this.resolveTerreiroId(request.params.slug) : null,
            correlation_id: request.correlationId,
          }
        });
      })
    );
  }
}
```

### Domain Events (para operações assíncronas)

```typescript
@Injectable()
export class AuditDomainEventHandler {
  constructor(private prisma: PrismaService) {}

  @OnEvent('TerreiroCadastrado')
  async handleTerreiroCadastrado(event: TerreiroCadastradoEvent) {
    await this.prisma.audit_logs.create({
      data: {
        tabela: 'terreiros',
        registro_id: event.aggregateId,
        acao: 'CREATE',
        dados_novos: event.data,
        usuario_id: event.metadata.userId,
        papel_do_usuario: event.metadata.userRole,
        correlation_id: event.metadata.correlationId,
        created_at: new Date(event.metadata.timestamp),
      }
    });
  }
}
```

## Visualização de Auditoria

### Para Administradores

```
Painel → Auditoria

  ┌────────────────────────────────────────────┐
  │  [Filtrar por tabela ▼] [Data ▼] [Usuário] │
  ├────────────────────────────────────────────┤
  │  13/07 15:30 | terreiros | UPDATE          │
  │  Terreiro Pai João — Campos: descricao     │
  │  Por: José Santos (dirigente)              │
  │  IP: 189.xxx.xxx.xxx                       │
  │  [Ver diff]                                │
  ├────────────────────────────────────────────┤
  │  13/07 15:00 | terreiros | CREATE          │
  │  Terreiro Mãe Maria                        │
  │  Por: Admin (moderador)                    │
  │  [Ver dados]                               │
  ├────────────────────────────────────────────┤
  │  13/07 14:00 | avaliacoes | APPROVE        │
  │  Avaliação #12345                          │
  │  Por: IA (99.5% confiança)                 │
  │  [Ver decisão]                             │
  └────────────────────────────────────────────┘
```

### Para o Usuário (LGPD)

O usuário pode solicitar exportação de TODOS os seus dados:

```
Solicitação de portabilidade (Art. 18 LGPD)
  → Gera JSON com todos os dados pessoais
  → Inclui logs de auditoria onde o usuário é o ator
  → Disponível por 30 dias
  → Formato: JSON estruturado + CSV
```

## Métricas de Auditoria

| Métrica | Meta |
|---------|------|
| % de ações críticas auditadas | 100% |
| Tempo entre ação e registro no log | < 1s (síncrono) ou < 5min (assíncrono) |
| Volume estimado de logs/dia | 10k-50k (MVP), 500k-1M (escala) |
| Tempo de consulta no painel | < 3s |
| Retenção conforme política | 100% compliance |
