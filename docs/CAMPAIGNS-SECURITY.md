# AxéMap — Segurança de Campanhas

## Princípio

Campanhas no AxéMap jamais são publicadas automaticamente.
Todo o fluxo é auditado, moderado e sujeito a prestação de contas.

---

## Fluxo de Status

```
RASCUNHO
↓ Criação pelo responsável
↓
PENDENTE_ANALISE
↓ Enviada para análise
↓
EM_ANALISE_IA
↓ Score de risco gerado (ADVISÓRIO — não substitui humano)
↓
AGUARDANDO_DOCUMENTOS (quando necessário)
↓
EM_REVISAO_HUMANA
↓ Análise humana obrigatória
↓
APROVADA
↓ Aprovação pelo moderador
↓
PUBLICADA
↓ Ativa para arrecadação
↓
EM_ARRECADAÇÃO
↓ Arrecadando contribuições
↓
ENCERRADA
↓ Prazo atingido ou meta alcançada
↓
PRESTACAO_CONTAS
↓ Responsável publica prestação de contas

Status alternativos:
RECUSADA — documentação insuficiente ou risco alto
BLOQUEADA — violação detectada pós-publicação
ARQUIVADA — histórico
```

---

## Análise de IA (Assistida)

A análise de IA é **ADVISÓRIA**:
- Gera score de risco (0-100)
- Identifica sinais linguísticos de risco
- **NÃO** aprova nem recusa automaticamente
- **NÃO** substitui revisão humana
- Decisão final é sempre do moderador humano

---

## Mecanismos de Segurança

### Antifraude
- Score de risco calculado por IA
- Revisão humana obrigatória para campanhas de alto risco
- Documentação obrigatória para campanhas acima de determinado valor
- Análise de comportamento do criador

### Documentação
- `DocumentosCampanha`: evidências obrigatórias por categoria
- Documentos são validados por moderadores
- Documentos nunca são expostos publicamente

### Denúncias de Campanha
- Qualquer usuário pode denunciar via `/protecao`
- Denúncia cria protocolo com auditoria
- Denúncia **não** suspende automaticamente a campanha
- Mediação quando aplicável

### Prestação de Contas
- `CampanhaPrestacaoConta`: entidade dedicada
- Atualizações regulares obrigatórias
- Histórico imutável de alterações

---

## Categorias Suportadas

| Categoria | Uso |
|---|---|
| SOCIAL | Projetos sociais e comunitários |
| CULTURAL | Preservação e promoção cultural |
| EDUCACIONAL | Educação e formação |
| AMBIENTAL | Iniciativas ambientais |
| EMERGENCIAL | Emergências e crises |
| INFRAESTRUTURA | Melhoria de espaços físicos |
| PATRIMONIO_HISTORICO | Patrimônio material e imaterial |
| PESQUISA | Pesquisa acadêmica e documental |
| JUVENTUDE | Projetos para jovens |
| INCLUSAO | Inclusão e acessibilidade |
| EVENTOS | Eventos culturais e comunitários |

---

## APIs Relevantes

| Endpoint | Descrição |
|---|---|
| `POST /campanhas` | Criar campanha (usuário autenticado) |
| `GET /campanhas` | Listar campanhas públicas |
| `GET /campanhas/:slug` | Detalhes públicos |
| `POST /campanhas/:slug/apoiar` | Apoiar campanha |
| `GET /admin/campanhas` | Admin: listar todas |
| `POST /admin/campanhas/:id/analise-ia` | Admin: executar análise IA |
| `POST /admin/campanhas/:id/aprovar` | Admin: aprovar |
| `POST /admin/campanhas/:id/recusar` | Admin: recusar |
| `POST /admin/campanhas/:id/bloquear` | Admin: bloquear |
| `POST /admin/campanhas/:id/publicar` | Admin: publicar |

---

## Status de Implementação

| Componente | Status |
|---|---|
| Modelo Prisma Campanhas (completo) | ✅ |
| CampanhasService | ✅ |
| CampanhasAdminService (análise IA, aprovação, fluxo) | ✅ |
| Fluxo de status completo | ✅ |
| Documentos de campanha | ✅ (DocumentosCampanha) |
| Prestação de contas | ✅ (CampanhaPrestacaoConta) |
| Denúncias de campanha | ✅ (via módulo /protecao) |
| Análise antifraude via IA | ✅ (ADVISÓRIO) |
| Moderação humana obrigatória | ✅ |
