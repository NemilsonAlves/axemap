# 85 — Definition of Done (DoD)

## Checklist Universal

### Requisitos Obrigatórios

```
[ ] Código implementado conforme especificação
[ ] Código segue coding standards (doc 79)
[ ] ESLint aprovado (sem warnings)
[ ] TypeScript type check aprovado
[ ] Build aprovado
[ ] Testes unitários passando (≥80% coverage)
[ ] Testes de integração passando (se aplicável)
[ ] Testes E2E passando (se fluxo crítico)
[ ] Nenhuma vulnerabilidade de segurança conhecida
[ ] Nenhum secret hardcoded
[ ] Documentação atualizada (se aplicável)
[ ] CHANGELOG.md atualizado (se pública)
[ ] PR aprovado por pelo menos 1 reviewer
```

### Requisitos por Tipo de Mudança

#### 🐛 Bug Fix
```
[ ] Teste que reproduz o bug adicionado
[ ] Bug confirmado como resolvido no ambiente de staging
[ ] Root cause documentada no PR
```

#### ✨ Feature
```
[ ] Feature completa conforme acceptance criteria
[ ] Testes unitários para novos use cases
[ ] Testes de integração para novos endpoints
[ ] Testes E2E para fluxo principal
[ ] ADR criado se decisão arquitetural
[ ] README do módulo atualizado (se novo módulo)
[ ] Eventos de domínio documentados (se novo evento)
```

#### ♻️ Refactor
```
[ ] Comportamento existente inalterado (testes passam)
[ ] Métricas de performance não degradadas
[ ] Nenhuma API pública quebrada
[ ] Razão da refatoração documentada no PR
```

#### 📚 Documentação
```
[ ] Revisada por pelo menos 1 pessoa do time
[ ] Links funcionando
[ ] Exemplos testáveis (código nos exemplos funciona)
```

#### 🔧 Config/Infra
```
[ ] Testado em staging antes de produção
[ ] Rollback testado
[ ] Variáveis de ambiente documentadas
[ ] Acesso restrito aos secrets
```

## Acceptance Criteria Template

```markdown
### Feature: [Nome]
**User Story:** Como [papel], quero [ação] para [benefício].

### Acceptance Criteria
- [x] Critério 1: descrição objetiva
- [x] Critério 2: descrição objetiva
- [x] Critério 3: descrição objetiva

### Regras de Negócio
- RN-001: [regra]
- RN-002: [regra]

### Checklist Técnico
- [ ] Testes de unidade para regras RN-001 e RN-002
- [ ] Teste de integração para endpoint
- [ ] Evento de domínio emitido
- [ ] Audit log registrado
- [ ] Traduções (i18n) adicionadas

### Notas
- Edge case: [descrição]
- Dúvidas: [pergunta pendente]
```

## DoD Matriz por Papel

| Critério | Dev | Reviewer | QA | PO |
|----------|-----|----------|----|----|
| Código implementado | ✅ | — | — | ✅ |
| Coding standards | ✅ | ✅ | — | — |
| Lint aprovado | ✅ | ✅ | — | — |
| Build aprovado | ✅ | ✅ | ✅ | — |
| Testes unitários | ✅ | ✅ | ✅ | — |
| Testes integração | ✅ | ✅ | ✅ | — |
| Testes E2E | — | ✅ | ✅ | — |
| Aceite PO | — | — | — | ✅ |
| Documentação | ✅ | ✅ | — | — |
| CHANGELOG | ✅ | ✅ | — | — |
| PR aprovado | — | ✅ | — | — |
| Staging testado | — | ✅ | ✅ | — |
| Sem vulnerabilidades | ✅ | ✅ | — | — |

## Exceptions

| Situação | Exceção | Ação Compensatória |
|----------|---------|-------------------|
| Hotfix (produção quebrada) | Pular testes E2E | Testes E2E adicionados no PR seguinte |
| MVP acelerado | Cobertura mínima 60% | Aumentar cobertura no sprint seguinte |
| Documentação extensa | Resumo no PR, doc completa em até 3 dias | Issue tracking criada |

## Glossary

| Termo | Definição |
|-------|-----------|
| **PR** | Pull Request |
| **QA** | Quality Assurance |
| **PO** | Product Owner |
| **AC** | Acceptance Criteria |
| **ADR** | Architecture Decision Record |
| **E2E** | End-to-End |
| **Lint** | Análise estática de código |
| **Staging** | Ambiente de homologação |
