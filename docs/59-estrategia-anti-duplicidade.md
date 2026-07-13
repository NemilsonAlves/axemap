# 59 — Estratégia Anti-Duplicidade

## Por que duplicatas acontecem

| Causa | Cenário |
|-------|---------|
| **Cadastro colaborativo** | Usuário A sugere "Terreiro Pai João". Depois Usuário B sugere o mesmo terreiro com nome ligeiramente diferente. |
| **Reivindicação vs cadastro** | Terreiro já existe como "Pendente" e dirigente cria outro "Oficial". |
| **Múltiplas tradições** | Mesmo terreiro cadastrado como "Umbanda" e como "Candomblé" por pessoas diferentes. |
| **Nome com variações** | "Terreiro Pai João de Oxalá" vs "Terreiro Pai João" vs "Tenda Pai João". |
| **Mudança de endereço** | Terreiro se mudou e alguém cadastrou o novo endereço como novo perfil. |

## Camadas de Detecção

### Camada 1: No Cadastro (Prevenção)

Ao submeter um novo terreiro, o sistema verifica automaticamente:

```typescript
async function detectDuplicates(input: NewTerreiroInput): Promise<DuplicateWarning[]> {
  const warnings: DuplicateWarning[] = [];

  // 1. Similaridade de nome (fuzzy matching)
  const nomeSimilar = await findSimilar('nome', input.nome, 0.8); // 80%+
  if (nomeSimilar.length > 0) warnings.push({ type: 'NOME_SIMILAR', matches: nomeSimilar });

  // 2. Mesmo WhatsApp/telefone
  if (input.whatsapp) {
    const mesmoWhatsApp = await findByWhatsApp(input.whatsapp);
    if (mesmoWhatsApp) warnings.push({ type: 'MESMO_WHATSAPP', matches: [mesmoWhatsApp] });
  }

  // 3. Mesmo endereço (CEP + número)
  if (input.cep && input.numero) {
    const mesmoEndereco = await findByEndereco(input.cep, input.numero);
    if (mesmoEndereco) warnings.push({ type: 'MESMO_ENDERECO', matches: [mesmoEndereco] });
  }

  return warnings;
}
```

**Comportamento:**
- Se duplicata provável (>90% de match): bloqueia cadastro e redireciona para perfil existente
- Se duplicata possível (70-90%): avisa o usuário "Este terreiro já pode estar cadastrado" e permite continuar

### Camada 2: Na Moderação (Revisão)

Ao aprovar um terreiro pendente, o admin vê:

```
⚠️ Possível duplicata detectada:
  Terreiro sugerido: "Terreiro Pai João" — Recife-PE
  Terreiro existente: "Tenda Pai João de Oxalá" — Recife-PE (PUBLICADO)
  
  Similaridade: 85%
  [Ignorar] [Marcar como duplicata e mesclar]
```

### Camada 3: Batch Periódico (Correção)

Job agendado (semanal) que varre toda a base em busca de duplicatas:

```typescript
async function batchDuplicateDetection() {
  // 1. Group by cidade + estado
  const grupos = await groupByLocation();
  
  for (const grupo of grupos) {
    // 2. Compara pares dentro do mesmo grupo
    for (let i = 0; i < grupo.length; i++) {
      for (let j = i + 1; j < grupo.length; j++) {
        const similarity = calculateSimilarity(grupo[i], grupo[j]);
        if (similarity > 0.8) {
          await registerDuplicatePair(grupo[i], grupo[j], similarity);
        }
      }
    }
  }
}
```

**Algoritmo de similaridade:**

| Fator | Peso | Comparação |
|-------|------|-----------|
| Nome | 0.40 | Levenshtein distance + token sort ratio |
| Endereço | 0.30 | CEP + número + bairro |
| WhatsApp | 0.20 | Exato |
| Tradição | 0.10 | Exata ou similar |

## Fluxo de Mesclagem

```
Duplicata identificada
    │
    ▼
Admin analisa os dois perfis
    │
    ├── Perfil A (principal): mais completo, mais avaliações, mais antigo
    └── Perfil B (duplicata): menos completo
        │
        ▼
Admin confirma mesclagem
    │
    ▼
Sistema executa:
  1. Preserva Perfil A (todos os dados)
  2. Migra do Perfil B:
     ├── Avaliações (com nota "migrada de perfil duplicado")
     ├── Fotos (se não existirem em A)
     ├── Eventos futuros
     └── Sugeridor ganha crédito
  3. Perfil B → status DUPLICADO → redireciona para Perfil A
  4. Audit log da mesclagem
  5. Notificação:
     ├── Dirigente de A (se houver): "Um perfil duplicado foi mesclado ao seu."
     ├── Sugeridor de B: "O terreiro que você sugeriu foi mesclado a outro perfil."
```

## Prevenção de Recriação

Após mesclagem:
- Perfil DUPLICADO não pode ser recriado (verificação de slug + nome + endereço)
- Tentativa de cadastro com dados similares → redireciona para o perfil principal
- Sugestão de correção: "Este terreiro já existe como [Nome]. É ele?" com link

## Métricas Anti-Duplicidade

| Métrica | Meta | Frequência |
|---------|------|-----------|
| % de duplicatas detectadas no cadastro | > 90% | Contínuo |
| Precisão da detecção automática | > 95% | Semanal |
| Tempo médio entre criação e mesclagem | < 7 dias | Mensal |
| Recriação de duplicatas mescladas | < 1% | Mensal |
| Falsos positivos (marcar como duplicata o que não é) | < 2% | Mensal |
