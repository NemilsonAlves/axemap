# INCIDENT-RESPONSE.md — AxéMap

> Versão 1.0 — Julho 2026  
> Base legal: LGPD Art. 48 + ANPD Resolução CD/ANPD nº 2/2022

---

## Fluxo de Resposta a Incidentes

### Fase 1 — Detecção

**Fontes de detecção:**
- Alertas automáticos de monitoramento (logs, health checks)
- Relatório de usuário ou terceiro
- Descoberta interna (equipe técnica)

**Ações imediatas:**
1. Registrar data/hora da ciência do incidente (⚠️ inicia o prazo de 72h)
2. Identificar sistemas potencialmente afetados
3. Acionar DPO/Encarregado de Dados e líder técnico

---

### Fase 2 — Contenção

**Ações:**
1. Isolar sistemas comprometidos (revogar tokens, bloquear IPs maliciosos)
2. Se vazamento de credenciais: forçar logout de todos os usuários afetados (`refreshToken = null`)
3. Desabilitar endpoints afetados via feature flags se necessário
4. Preservar evidências (logs, dumps de banco) antes de qualquer modificação

**Checklist de contenção:**
- [ ] Tokens de acesso revogados para usuários afetados?
- [ ] Acessos não autorizados bloqueados?
- [ ] Evidências preservadas?
- [ ] Time de liderança notificado?

---

### Fase 3 — Investigação

**Ações:**
1. Analisar `AuditLogs` para reconstruir a sequência de eventos
2. Determinar: quais dados foram expostos, de quantos titulares, por quanto tempo
3. Classificar o incidente (ver Fase 4)
4. Documentar a timeline completa

**Perguntas-chave:**
- Quais dados pessoais foram afetados?
- Inclui dados sensíveis (religiosos, financeiros, saúde)?
- Há menores de 18 anos afetados?
- O acesso foi externo ou interno?

---

### Fase 4 — Classificação de Gravidade

| Nível | Critério | Prazo de Comunicação |
|-------|----------|----------------------|
| **CRÍTICO** | Vazamento em massa, dados sensíveis, credenciais expostas | ANPD: 72h; Titulares: imediato |
| **ALTO** | Dados pessoais de >100 titulares, dados financeiros | ANPD: 72h; Titulares: 5 dias |
| **MÉDIO** | Acesso não autorizado restrito, sem confirmação de vazamento | ANPD: conforme avaliação; Titulares: se necessário |
| **BAIXO** | Tentativa frustrada, sem dados expostos | Registro interno |

---

### Fase 5 — Correção

**Ações:**
1. Aplicar patch de segurança
2. Redefinir senhas/tokens afetados
3. Auditar e corrigir a vulnerabilidade raiz
4. Testar em staging antes de reimplantar

---

### Fase 6 — Registro

**Obrigatório (LGPD Art. 48 §2):**
- Data e hora da ciência do incidente
- Data e hora de cada ação de resposta
- Dados afetados (tipos, volume estimado, categorias)
- Causa raiz identificada
- Ações de contenção e correção
- Comunicações realizadas

Registrar em documento interno `INCIDENT_LOG_{DATA}.md` + notificar ANPD se aplicável.

---

### Fase 7 — Comunicação

**Para a ANPD (se incidente de alto risco):**
- Prazo: 72 horas após ciência
- Canal: Portal da ANPD (gov.br/anpd)
- Conteúdo: dados afetados, causa, medidas adotadas, contato do DPO

**Para os titulares afetados:**
- Canal: e-mail registrado na conta
- Linguagem: clara e acessível
- Conteúdo: o que aconteceu, quais dados, o que já foi feito, o que o titular deve fazer

**Template de comunicação ao titular:**
```
Assunto: [AxéMap] Aviso de incidente de segurança

Prezado(a) {NOME},

Identificamos um incidente de segurança que pode ter afetado sua conta no AxéMap.

O que aconteceu: [DESCRIÇÃO BREVE]
Dados potencialmente afetados: [TIPOS DE DADOS]
O que já fizemos: [AÇÕES TOMADAS]
O que você deve fazer: [RECOMENDAÇÕES]

Para dúvidas: privacidade@axemap.com.br

Pedimos desculpas pelo transtorno.
Equipe AxéMap
```

---

### Contatos de Emergência

| Papel | Contato |
|-------|---------|
| DPO / Encarregado | privacidade@axemap.com.br |
| Segurança técnica | (definir canal interno) |
| ANPD | www.gov.br/anpd / ouvidoria@anpd.gov.br |
