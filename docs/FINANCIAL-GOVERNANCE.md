# AxéMap — Governança Financeira

## Princípio

As receitas do AxéMap são classificadas em fluxos separados para garantir
rastreabilidade, transparência e integridade do sistema de confiança.

**NENHUM fluxo financeiro altera Trust Score, verificação ou reputação.**

---

## Fluxos Financeiros

### RECEITA COMERCIAL
- AxéMap ADS (publicidade)
- Planos SaaS (recursos premium para comunidades)
- Serviços sob contrato
- Assinaturas de planos

### APOIO
- Contribuições do Círculo de Apoiadores
- Valores destinados à infraestrutura da plataforma

### CAMPANHAS
- Valores arrecadados em campanhas sociais/culturais
- Destinados exclusivamente às causas das campanhas
- **Nunca misturados com a receita operacional**

### PATROCÍNIO
- Contratos de publicidade institucional
- Parcerias de comunicação
- Mídia regional/nacional/internacional

### INSTITUCIONAL
- Convênios com órgãos públicos
- Projetos via editais
- Acordos com museus, universidades, centros culturais

---

## Regras de Isolamento

1. Saldo de campanhas pertence às campanhas — não à plataforma
2. Apoios são usados somente para infraestrutura
3. Receita comercial financia operação e desenvolvimento
4. Patrocínio é registrado separadamente de Trust
5. Nenhum pagamento melhora avaliações, verificação ou posição orgânica

---

## Entidades de Dados

| Entidade | Tipo | Fluxo |
|---|---|---|
| `ApoioPlataforma` | Contribuição | APOIO |
| `PlanoAssinatura` / `PlanoPagamento` | Assinatura | RECEITA COMERCIAL |
| `CampanhaApoio` | Apoio de campanha | CAMPANHA |
| `AdCampanha` / `AdPagamento` | Publicidade | PATROCÍNIO |
| `TransacaoFinanceira` | Registro geral | MÚLTIPLOS |
| `PaymentWebhookLog` | Auditoria de gateway | TODOS |

---

## Auditoria e Rastreabilidade

Todo fluxo financeiro deve gerar:
- `AuditLog` com ação, entidade, antes e depois
- `PaymentWebhookLog` para eventos de gateway
- Registro de quem confirmou/rejeitou (quando manual)

---

## Futuro Instituto AxéMap

A arquitetura atual já suporta separação futura entre:

**AXÉMAP TECNOLOGIA** — produto/empresa
- Receita: ADS, SaaS, serviços, assinaturas

**INSTITUTO AXÉMAP** — entidade sem fins lucrativos
- Receita: Apoios, editais, convênios, projetos culturais

A separação jurídica pode ser feita sem refatoração estrutural grande
graças à classificação de `origin` nos modelos de pagamento.

---

## Transparência Pública

Dados publicados em `/transparencia` (público):
- Total arrecadado com apoios
- Número de apoiadores
- Distribuição por nível
- Mural de apoiadores não-anônimos

Dados publicados em `/admin/transparencia` (administrador):
- Todas as fontes de receita
- Gastos por categoria
- Metas e evolução

---

## Status de Implementação

| Componente | Status |
|---|---|
| Classificação de fluxos por `origin` | ✅ |
| AuditLogs financeiros | ✅ |
| PaymentWebhookLog (migration) | ✅ |
| Contabilidade completa | ⏳ Fase futura |
| Relatórios mensais automáticos | ⏳ Fase futura |
| Separação jurídica Instituto | ⏳ Decisão jurídica pendente |
