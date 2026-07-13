# 58 — Estratégia de Qualidade dos Dados

## Dimensões da Qualidade

| Dimensão | Definição | Métrica |
|----------|-----------|---------|
| **Completeza** | % de campos preenchidos | Campos preenchidos / Total campos |
| **Precisão** | Dados correspondem à realidade | Taxa de correção por denúncia |
| **Consistência** | Dados não contraditórios | CEP x Cidade, Tradição x Nome |
| **Atualidade** | Dados refletem o momento atual | Dias desde última atualização |
| **Unicidade** | Sem duplicatas | % de perfis únicos |
| **Validade** | Dados dentro de formatos esperados | Taxa de rejeição na validação |

## Gatilhos de Qualidade Automáticos

| Gatilho | Detecção | Ação |
|---------|----------|------|
| **CEP não corresponde à cidade** | Validação via API dos Correios | Sinalizar para revisão, bloquear publicação |
| **Telefone inválido** | Regex + validação operadora | Bloquear salvamento |
| **Nome muito genérico** ("Terreiro") | Lista de palavras proibidas + similaridade | Solicitar nome mais específico |
| **Descrição copiada de outro perfil** | Simhash + similaridade de cosseno | Marcar como potencial plágio |
| **Foto com metadados de localização diferente** | EXIF geotag vs endereço declarado | Sinalizar para moderação |
| **Múltiplos terreiros no mesmo endereço** | Agrupamento por CEP + número | Sinalizar duplicidade potencial |
| **Tradição religiosa inconsistente** | Lista de valores válidos + similaridade | Sugerir correção |
| **Evento com data no passado** | Validação temporal | Aviso ao criar |

## Score de Qualidade do Dado

Internamente, cada terreiro tem um **Data Quality Score** (DQS), diferente do Trust Score:

```
DQS = Completeza × 0.4 + Precisão × 0.3 + Consistência × 0.2 + Atualidade × 0.1
```

O DQS é usado para:
- Decidir prioridade na fila de moderação
- Sinalizar perfis que precisam de atenção
- Calcular o componente "Completeza" do Trust Score

## Processo de Correção

### Correção Automática

| Situação | Correção |
|----------|----------|
| Cidade com acentuação incorreta | Normalização automática |
| Telefone sem DDD | Solicitar DDD |
| CEP com formato errado | Auto-correct via API |
| Tradição com nome similar (ex: "Candomble" → "Candomblé") | Sugestão automática |

### Correção Manual (Admin)

```
Perfil sinalizado por baixa qualidade
  → Admin revisa
    ├── Dado incorreto → corrige (auditado)
    ├── Dado desatualizado → notifica dirigente
    └── Dado OK → remove sinalização (falso positivo)
```

### Correção pela Comunidade

Usuários podem sugerir correções em dados públicos:

```
Usuário → "Sugerir correção" em campo específico
  → Admin avalia
    ├── Aceita → correção aplicada + crédito ao usuário
    └── Rejeita → notifica usuário
```

## Prevenção de Entrada de Baixa Qualidade

### No Frontend

| Técnica | Exemplo |
|---------|---------|
| **Autocomplete** | Cidade auto-completa a partir do CEP |
| **Máscaras** | Telefone: (81) 99999-9999 |
| **Validação inline** | Erro no campo antes de submeter |
| **Sugestões** | "Você quis dizer Umbanda?" |
| **Placeholder explicativo** | "Ex: Tenda de Umbanda Pai João de Oxalá" |

### No Backend

| Técnica | Exemplo |
|---------|---------|
| **Zod schemas** | Validação rigorosa de tipos e formatos |
| **Sanitização** | Remoção de HTML, scripts, espaços extras |
| **Normalização** | Lowercase, remoção de acentos para busca |
| **Deduplicação** | Checagem de similaridade antes de salvar |
| **Geocoding reverso** | Validar endereço via Nominatim |

## Métricas de Qualidade

| Métrica | Meta (semanal) |
|---------|---------------|
| Completeza média dos perfis | > 65% |
| Precisão (confirmada por auditoria) | > 95% |
| Taxa de duplicatas | < 2% |
| Taxa de correção por denúncia | < 5% |
| Tempo médio entre detecção e correção | < 24h |
| Dados atualizados em < 30 dias | > 60% |
