# AxéMap — Modelo de Sustentabilidade

## Princípio Fundamental

**O AxéMap é gratuito para a comunidade.**

O acesso público ao ecossistema — mapa, comunidades, tradições, informações públicas, eventos, organizações, federações, TV AxéMap — permanece gratuito sempre que possível.

O modelo financeiro sustenta a infraestrutura através de múltiplas fontes sem jamais comprometer o acesso público ou a independência do sistema de confiança.

---

## Fontes de Receita

### 1. Círculo de Apoiadores (`/apoie`)
Contribuições recorrentes e avulsas de pessoas que desejam apoiar a manutenção da plataforma.

| Nível | Valor | Natureza |
|---|---|---|
| SEMENTE | R$ 5 | Reconhecimento |
| GUARDIÃO | R$ 10 | Reconhecimento |
| AXÉ | R$ 15 | Reconhecimento |
| MEMÓRIA | R$ 20 | Reconhecimento |
| ANCESTRALIDADE | R$ 50 | Reconhecimento |
| MANTENEDOR | R$ 100 | Reconhecimento |

Valores personalizados também são suportados.

### 2. AxéMap ADS
Publicidade claramente identificada como "PATROCINADO" ou "PUBLICIDADE". Nunca misturada com o sistema de confiança orgânico.

### 3. Planos SaaS — Recursos Premium
Ferramentas avançadas para comunidades, organizações e profissionais. Os planos **não alteram Trust Score, verificação ou reputação**.

### 4. Campanhas Sociais
Plataforma de arrecadação para causas culturais, sociais e humanitárias. Os valores são destinados às campanhas, não à operação da plataforma.

### 5. Patrocínios Institucionais
Parcerias formais com organizações, institutos, universidades. Transparência total nos termos.

### 6. Editais e Projetos Culturais
Participação em editais públicos e privados para projetos de preservação cultural.

### 7. Convênios Institucionais
Acordos com órgãos públicos, museus, centros culturais para uso da plataforma.

---

## O Que o Dinheiro NÃO Compra

```
❌ Trust Score maior
❌ Verificação automática
❌ Certificação religiosa
❌ Autoridade espiritual
❌ Posição orgânica no mapa
❌ Remoção de denúncias legítimas
❌ Avaliações positivas
❌ Destaque orgânico disfarçado
❌ Poder sobre comunidades
```

---

## O Que o Dinheiro Compra

```
✅ Serviços de infraestrutura (SaaS)
✅ Publicidade claramente identificada
✅ Recursos premium de gestão
✅ Exposição publicitária rotulada
```

---

## Linguagem Institucional

Usar:
- "Apoie para manter o AxéMap vivo."
- "Seu apoio mantém servidores, segurança, desenvolvimento e pesquisa."
- "Contribua com o crescimento da rede."

Evitar:
- "ÚLTIMA CHANCE!"
- "Doe agora ou..."
- "Pague para aparecer."
- "Pague para ser verificado."

---

## Separação de Fluxos Financeiros

| Tipo | Conta | Uso |
|---|---|---|
| Receita Comercial | ADS + SaaS | Operação |
| Apoio | Círculo de Apoiadores | Infraestrutura |
| Campanhas | Destinadas | Projetos específicos |
| Patrocínio | Contratos | Publicidade/parceria |
| Institucional | Convênios/editais | Projetos culturais |

Os saldos **nunca** são misturados.

---

## Status de Implementação

| Componente | Status |
|---|---|
| Modelos Prisma (ApoioPlataforma) | ✅ |
| ApoieService (6 níveis, PENDENTE→CONFIRMADO) | ✅ |
| ApoieController (/apoie/niveis, /apoie/transparencia) | ✅ |
| ApoieAdminController (/admin/apoie) | ✅ |
| Página /apoie | ✅ |
| ADS Backend (AdCampanha, AdPagamento) | ✅ |
| Payment Abstraction Layer | ✅ |
| WebhookService (idempotência, dead-letter) | ✅ |
| Testes de separação Trust/Dinheiro | ✅ |
| Gateway de pagamento real (Mercado Pago/Stripe) | ⏳ Aguarda VPS |
| Recibos automáticos | ⏳ Aguarda gateway |
| Assinaturas recorrentes via gateway | ⏳ Aguarda gateway |
