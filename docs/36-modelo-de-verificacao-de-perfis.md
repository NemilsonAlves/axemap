# 36 — Modelo de Verificação de Perfis

## Filosofia

Verificação não é "selo de qualidade espiritual". É **comprovação de identidade e informações**. Qualquer terreiro pode ser verificado se fornecer as provas necessárias.

## Níveis de Verificação

### Nível 0: Não Verificado
**Requisito:** Cadastro básico concluído.
**Trust Score:** Limitado a 40 pontos.

### Nível 1: Contato Verificado
**Requisitos:**
- WhatsApp confirmado (código SMS)
- Email confirmado
- Endereço com CEP válido

**Processo:** Automático (código de 6 dígitos).
**Trust Score:** +5 pontos.

### Nível 2: Informações Verificadas
**Requisitos:**
- Nível 1 completo
- Descrição do terreiro revisada (sem conteúdo proibido)
- Tradição religiosa informada
- Horários de funcionamento preenchidos
- Mínimo 3 fotos reais

**Processo:** Automático + revisão de IA para fotos (metadados, duplicidade).
**Trust Score:** +10 pontos.

### Nível 3: Identidade Confirmada
**Requisitos:**
- Nível 2 completo
- Documento de identidade do dirigente (frente e verso)
- Comprovante de residência ou vínculo com o endereço do terreiro
- Selfie do dirigente segurando o documento

**Processo:**
1. Upload dos documentos (criptografados)
2. Revisão manual por equipe do AxéMap (contratada ou voluntária treinada)
3. Comparação facial (selfie vs documento) — opcional, pode ser manual
4. Aprovação/rejeição em até 48h

**Privacidade:**
- Documentos armazenados criptografados (AES-256)
- Acesso apenas pela equipe de verificação
- Excluídos após 90 dias da confirmação
- NUNCA exibidos publicamente

**Trust Score:** +15 pontos.
**Selo no perfil:** 🛡️ "Identidade Confirmada"

### Nível 4: Verificação Premium (Planos pagos)
**Requisitos:**
- Nível 3 completo
- Assinatura de plano Profissional ou Enterprise
- Verificação adicional (pode incluir visita virtual)

**Processo:** Prioridade na fila de verificação.
**Trust Score:** +5 pontos adicionais.
**Selo no perfil:** ⭐ "Verificado Premium"

## Validação de Fotos

| Critério | Técnica |
|----------|---------|
| Foto é real (não IA) | Análise de metadados EXIF, detecção de artefatos |
| Foto não é duplicada | Hash perceptual (pHash) comparado ao banco |
| Foto não é de outro terreiro | Reverse image search (Google API) |
| Foto não contém conteúdo proibido | Moderação de conteúdo (NSFW, violência) |
| Foto tem qualidade mínima | Resolução > 800x600, sem blur excessivo |

## Verificação de Avaliadores

Para evitar avaliações fraudulentas, avaliadores também passam por verificação:

| Nível | Requisito | Impacto |
|-------|-----------|---------|
| 🟢 Novo | Email confirmado | Peso 0.5x |
| 🔵 Regular | 7+ dias de conta + email | Peso 1.0x |
| 🟣 Experiente | 30+ dias + 5+ avaliações aprovadas | Peso 1.5x |
| 🟠 Veterano | 6+ meses + 30+ avaliações | Peso 2.0x |
| ⚪ Verificado | Documento enviado (opcional) | Selo "Avaliador Verificado" |

## Ciclo de Vida da Verificação

```
Cadastro → Nível 0 (automático)
  → Confirma contato → Nível 1 (automático, 1 min)
    → Completa perfil → Nível 2 (automático, 5 min)
      → Envia documentos → Nível 3 (manual, até 48h)
        → Assina plano → Nível 4 (manual, prioridade)
```

## Revisão e Revogação

| Situação | Ação |
|----------|------|
| Denúncia de identidade falsa | Revisão em 24h |
| Documento expirado | Notificação para reenvio (30 dias para atualizar) |
| Mudança de dirigente | Nova verificação obrigatória |
| 2 denúncias confirmadas | Perda do selo de Identidade Confirmada |
| 3 denúncias confirmadas | Perda de TODOS os selos, volta ao Nível 0 |

## Métricas de Verificação

| Métrica | Meta |
|---------|------|
| % terreiros Nível 1+ | 80% |
| % terreiros Nível 3+ | 30% |
| Tempo médio Nível 3 | < 48h |
| Taxa de aprovação Nível 3 | 70% |
| Revogações/mês | < 2% |
| Falsos positivos (negar verificação a perfil legítimo) | < 1% |
