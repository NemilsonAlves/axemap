# LGPD Audit — AxéMap

> **Lei Geral de Proteção de Dados (Lei nº 13.709/2018)**
> Versão: 2025-07 | Status: Em Conformidade Parcial

---

## 1. Resumo Executivo

O AxéMap coleta e processa dados pessoais de usuários cadastrados (dirigentes de casas, pesquisadores, visitantes autenticados) e de casas/terreiros. Este documento mapeia as bases legais, os fluxos de dados, as lacunas identificadas e as ações corretivas.

---

## 2. Categorias de Dados Coletados

| Categoria | Exemplos | Base legal (LGPD art. 7º) |
|-----------|----------|--------------------------|
| Identificação | Nome, e-mail, CPF (opcional) | Contrato / Legítimo interesse |
| Localização | Endereço, cidade, estado, coordenadas GPS (terreiros públicos) | Legítimo interesse / Consentimento |
| Dados religiosos | Tradição, nação, orixá (categoria sensível — art. 11) | **Consentimento explícito** |
| Uso da plataforma | Páginas visitadas, buscas, cliques | Legítimo interesse |
| Publicidade | Cliques em anúncios PATROCINADOS | Consentimento (cookie marketing) |
| Pagamentos | Token de cartão (Stripe) | Contrato |

---

## 3. Dados Sensíveis (Art. 11)

Dados de **filiação religiosa** são classificados como dados sensíveis pela LGPD.

- **Tratamento atual**: campos de tradição/nação/orixá são **opcionais e públicos**, exibidos apenas se o dirigente optar por torná-los visíveis.
- **Base legal aplicada**: consentimento explícito na criação da conta (`termoAceito`, `termoData`).
- **Ação pendente**: formulário de onboarding deve apresentar linguagem clara de consentimento separado para dados sensíveis.

---

## 4. Direitos dos Titulares

| Direito (art. 18) | Implementado | Mecanismo |
|-------------------|:------------:|-----------|
| Confirmação de tratamento | ✅ | `/privacidade` + `/termos` |
| Acesso aos dados | ⚠️ Parcial | Perfil exibe dados; exportação completa pendente |
| Correção | ✅ | Edição de perfil + painel do dirigente |
| Anonimização/bloqueio | ❌ Pendente | Endpoint `DELETE /auth/conta` a implementar |
| Eliminação | ❌ Pendente | Soft-delete de usuário; purge completo pendente |
| Portabilidade | ❌ Pendente | Endpoint `GET /auth/exportar-dados` a implementar |
| Oposição ao tratamento | ⚠️ Parcial | Configurações de notificação; consentimento de cookies implementado |
| Revogação de consentimento | ⚠️ Parcial | Banner de cookies com revogação; formulários manuais |
| Informação sobre compartilhamento | ✅ | Política de privacidade descreve parceiros (Stripe, AWS/S3) |
| Petição à ANPD | ✅ (informativo) | Mencionado na política de privacidade |

---

## 5. Fluxo de Dados — Terceiros

| Terceiro | Finalidade | Localização | Cláusula DPA |
|----------|-----------|-------------|:------------:|
| Stripe | Pagamentos | EUA (SCCs) | A confirmar |
| AWS S3 | Armazenamento de imagens | São Paulo (sa-east-1) | A confirmar |
| Plausible / GA | Analytics anônima | EU / EUA | A confirmar |

---

## 6. Retenção de Dados

| Dado | Retenção atual | Recomendado |
|------|---------------|-------------|
| Logs de auditoria | Indefinido | Máx. 2 anos |
| Sessões expiradas | 30 dias | 30 dias ✅ |
| Conta excluída | Mantida (soft-delete) | Purge após 90 dias |
| Dados de análise | Indefinido | Máx. 13 meses |

---

## 7. Lacunas Identificadas e Plano de Ação

### Alta prioridade

- [ ] **Exportação de dados** (`GET /auth/exportar-dados`): retorna JSON com todos os dados do titular
- [ ] **Exclusão completa de conta** (`DELETE /auth/conta`): anonimização + purge de dados pessoais
- [ ] **Endpoint de revogação de consentimento** (`POST /auth/revogar-consentimento`)
- [ ] **DPA formal** com Stripe e AWS
- [ ] **Consentimento separado para dados sensíveis** no onboarding

### Média prioridade

- [ ] Política de retenção configurada no banco de dados (job de purge)
- [ ] Registro de operações de tratamento (art. 37) — ROPA interno
- [ ] Indicação de Encarregado de Dados (DPO) na política

### Baixa prioridade

- [ ] Privacy by Design: auditoria de campos opcionais no schema Prisma
- [ ] Revisão de logs de acesso para minimização de dados

---

## 8. Encarregado de Dados (DPO)

> A indicar. Conforme art. 41 da LGPD, organizações que realizam tratamento em larga escala devem indicar um encarregado.

Contato provisório para solicitações LGPD: **privacidade@axemap.com.br**

---

## 9. Histórico de Revisões

| Data | Versão | Alteração |
|------|--------|-----------|
| 2025-07 | 1.0 | Auditoria inicial |

---

*Este documento deve ser revisado a cada 6 meses ou após qualquer mudança significativa no tratamento de dados.*
