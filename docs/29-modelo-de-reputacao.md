# 29 — Modelo de Reputação

## Visão Geral

O modelo de reputação do AxéMap opera em **duas dimensões**:

1. **Reputação do Terreiro** (Trust Score) — robustez e confiabilidade da casa
2. **Reputação do Avaliador** — credibilidade de quem avalia

## Reputação do Terreiro

Já detalhada no documento 28. Aqui estão as regras de transição e decaimento.

### Matriz de Evolução

| Nível Atual | Ação Necessária | Nível Seguinte |
|-------------|----------------|---------------|
| 🌱 Novo | Preencher 70%+ do perfil + verificar contato | 🌿 Estabelecido |
| 🌿 Estabelecido | 5+ avaliações positivas + identidade confirmada + calendário ativo | 🌳 Confiável |
| 🌳 Confiável | 20+ avaliações (média 4.0+) + 6 meses de atividade + 2 selos adicionais | 🏆 Referência |
| 🏆 Referência | 50+ avaliações + 12 meses + engajamento social + consistência | 👑 Excelência |

### Decaimento de Reputação

| Situação | Penalidade |
|----------|-----------|
| 30 dias sem login | -2 pontos |
| 60 dias sem login | -5 pontos |
| 90 dias sem login | -10 pontos (-5/mês a partir daqui) |
| Nenhum evento nos últimos 60 dias | -3 pontos no componente Atualização |
| Denúncia confirmada de informação falsa | -15 pontos + perda de selo "Informações Verificadas" |
| 2 denúncias confirmadas | -30 pontos + rebaixamento de nível |
| 3 denúncias confirmadas | Suspensão temporária do perfil |

### Recuperação

| Ação | Recuperação |
|------|------------|
| Fazer login | Para decaimento |
| Atualizar perfil | +2 pontos |
| Adicionar evento | +3 pontos |
| Responder avaliações | +1 ponto |
| Adicionar fotos verificadas | +3 pontos |
| 30 dias sem denúncias | +5 pontos (recuperação gradual) |

## Reputação do Avaliador

### Por que medir?

Para evitar:
- Avaliações falsas de contas recém-criadas
- Boicotes orquestrados contra terreiros
- Avaliações de pessoas que nunca visitaram o terreiro

### Componentes

| Fator | Peso | Descrição |
|-------|------|-----------|
| **Tempo de conta** | 20% | Usuário mais antigo = maior peso |
| **Número de avaliações** | 25% | Volume consistente de avaliações |
| **Histórico de aprovação** | 30% | % de avaliações aprovadas pela moderação |
| **Diversidade** | 15% | Avaliou terreiros diferentes (não só 1) |
| **Utilidade** | 10% | Avaliações marcadas como "úteis" por outros |

### Níveis de Avaliador

| Nível | Requisito | Peso da Avaliação |
|-------|-----------|-------------------|
| 🟢 Novo | < 3 avaliações | x0.5 |
| 🔵 Regular | 3-10 avaliações, >80% aprovadas | x1.0 |
| 🟣 Experiente | 10-30 avaliações, >90% aprovadas | x1.5 |
| 🟠 Veterano | 30+ avaliações, >95% aprovadas, >1 ano | x2.0 |

### Regras Anti-Manipulação

1. **Avaliações de contas novas (< 7 dias)** não afetam o score do terreiro até aprovação manual
2. **Múltiplas avaliações do mesmo IP** no mesmo terreiro sinalizam para moderação
3. **Padrão suspeito:** Avaliações 1 estrela em múltiplos terreiros em curto período
4. **Conta deletada:** Avaliações anteriores permanecem (integridade do sistema), mas perdem peso

## Cálculo Final da Reputação do Terreiro (com peso do avaliador)

```
Reputação Real = Soma(nota_avaliacao_i × peso_avaliador_i) / Soma(peso_avaliador_i)

Onde:
  nota_avaliacao_i: 1 a 5
  peso_avaliador_i: 0.5, 1.0, 1.5 ou 2.0 conforme nível
```

### Exemplo

| Avaliador | Nota | Peso | Contribuição |
|-----------|------|------|-------------|
| Usuário A (Veterano) | 5 | x2.0 | 10.0 |
| Usuário B (Novo) | 1 | x0.5 | 0.5 |
| Usuário C (Regular) | 4 | x1.0 | 4.0 |
| Usuário D (Experiente) | 3 | x1.5 | 4.5 |

- Soma pesos: 2.0 + 0.5 + 1.0 + 1.5 = 5.0
- Soma contribuições: 10.0 + 0.5 + 4.0 + 4.5 = 19.0
- **Reputação final:** 19.0 / 5.0 = **3.8 / 5.0**

Sem o peso, seria: (5+1+4+3)/4 = **3.25**. O peso do avaliador veterano e o desconto do novo corrigiram a distorção.

## Recomendações

O modelo de reputação alimenta o sistema de recomendação:

- Terreiros com score alto aparecem mais
- Avaliações de avaliadores experientes têm mais peso
- Terreiros com score baixo têm visibilidade reduzida (mas não zerada)
