# DATA-GOVERNANCE.md — AxéMap

> Versão 1.0 — Julho 2026

---

## 1. Classificação de Dados

### 1.1 Dados de Titulares (LGPD Art. 5, I)

| Categoria | Exemplos | Sensibilidade | Localização no Sistema |
|-----------|----------|---------------|------------------------|
| Identificação | Nome, e-mail, ID | Alta | `Usuarios.nome`, `Usuarios.email` |
| Autenticação | Senha (bcrypt), tokens JWT, refresh token | Crítica | `Usuarios.senhaHash`, `Usuarios.refreshToken` |
| Religiosos (sensíveis) | Pertencimento a tradição, nação, linhagem | Sensível (LGPD Art. 11) | `Terreiros.tradicao`, `Terreiros.linhagem`, `MembrosTerreiro` |
| Localização | Lat/Lng, endereço | Alta | `Terreiros.latitude`, `Terreiros.longitude` |
| Financeiros | Valor de apoio, dados de pagamento | Crítica | `CampanhaApoio.valor`, `Campanhas.dadosPagamento` |
| Consentimento | Registro de aceite/rejeição | Alta (evidência legal) | `ConsentRecord` |
| Analíticos | Páginas visitadas, dispositivo | Baixa (pseudonimizada) | `AnalyticsEvent` |

### 1.2 Dados Operacionais (não pessoais)

| Categoria | Exemplos | Localização |
|-----------|----------|-------------|
| Configurações do sistema | Feature flags, planos SaaS | `FeatureFlag`, `PlanoSaaS` |
| Conteúdo cultural público | Textos, fotos públicas | `ConteudoCultural`, `TerreiroFoto` |
| Taxonomia | Categorias, tradições | `TaxonomyCategory` |

---

## 2. Bases Legais (LGPD Art. 7)

| Tratamento | Base Legal | Artigo LGPD |
|-----------|-----------|-------------|
| Criar conta e autenticar | Execução de contrato | Art. 7, V |
| Exibir terreiros no mapa | Legítimo interesse | Art. 7, IX |
| Analytics interno | Legítimo interesse (melhoria da plataforma) | Art. 7, IX |
| Marketing/publicidade | Consentimento | Art. 7, I |
| Preferências de idioma/tema | Consentimento | Art. 7, I |
| Obrigações fiscais/legais | Cumprimento de obrigação legal | Art. 7, II |
| Dados religiosos sensíveis | Consentimento explícito | Art. 11, I |

---

## 3. Retenção de Dados

| Dado | Período de Retenção | Ação ao Expirar |
|------|---------------------|-----------------|
| Conta ativa | Enquanto a conta existir | — |
| Conta excluída (`deletedAt` preenchido) | 90 dias após exclusão | Purge completo ou anonimização permanente |
| Tokens de reset de senha | 30 minutos | Limpos automaticamente após uso/expiração |
| Refresh tokens | 7 dias (expiração JWT) | Limpos no logout |
| Audit logs | 5 anos (obrigação legal) | Anonimizar dados pessoais, manter ação/timestamp |
| ConsentRecord | 5 anos (evidência legal LGPD) | Não excluir — manter como evidência |
| Logs de QR Code | 1 ano | Anonimizar IP |
| AnalyticsEvent | 1 ano | Agregar e anonimizar |
| Documentos de verificação | 2 anos após revisão | Excluir do storage S3/MinIO |
| Dados financeiros | 5 anos (Lei 9.613/98) | Manter, anonimizar titular |

---

## 4. Acesso a Dados

### 4.1 Controle de Acesso por Role

| Role | Acesso a Dados | Restrição |
|------|---------------|-----------|
| VISITOR | Terreiros públicos | Sem dados pessoais de outros |
| PRACTITIONER / MEMBER | Próprios dados + terreiros que frequenta | — |
| DIRIGENTE | Dados do próprio terreiro e membros | Não vê dados financeiros externos |
| MODERATOR | Denúncias, mediações | Não vê dados financeiros |
| VERIFIER | Documentos de verificação | Não vê dados fora do escopo |
| ADMIN | Todos os dados | Com audit log obrigatório |
| SUPER_ADMIN | Todos os dados + logs | Com audit log obrigatório |

### 4.2 Acesso a Dados Sensíveis (Religiosos)

- Dados de pertencimento religioso (`tradicao`, `linhagem`, `taxonomyCategory`) são controlados pelo próprio titular via `nivelPrivacidade`
- Membros de terreiro só são visíveis para dirigentes e admins (não exibidos publicamente)
- Informações iniciáticas e rituais são classificadas como `NivelPrivacidade.SENSIVEL` — nunca expostas automaticamente

---

## 5. Anonimização & Exclusão

### Fluxo de Exclusão de Conta (Art. 18, VI LGPD)

```
1. Usuário solicita exclusão via DELETE /auth/conta
2. Sistema invalida todos os tokens (refreshToken = null)
3. Sistema anonimiza:
   - email → anon_{userId}@excluido.axemap
   - nome  → [conta excluída]
   - senha → [deleted]
   - avatarUrl → null
4. deletedAt = NOW()
5. ConsentRecord.revokedAt = NOW() para todos os registros
6. Dados mantidos por obrigação legal (audit logs, transações) são mantidos
   anonimizados — o vínculo com o titular é quebrado
```

### Campos que sobrevivem à exclusão (obrigação legal)

- `AuditLogs` — mantidos sem identificação do titular após 90 dias
- `TransacaoFinanceira` — mantidos por 5 anos (Lei 9.613/98)
- `ConsentRecord` — mantidos como evidência legal (sem dados de contato)

---

## 6. Responsabilidades

| Papel | Responsável | Contato |
|-------|-------------|---------|
| Controlador de Dados | AxéMap | privacidade@axemap.com.br |
| DPO / Encarregado | A definir | privacidade@axemap.com.br |
| Segurança da Informação | Equipe técnica | — |
| Atendimento de Direitos do Titular | Equipe de suporte | privacidade@axemap.com.br |

---

## 7. Suboperadores (Art. 5, VII LGPD)

| Suboperador | Propósito | Dados Transferidos | Garantia |
|-------------|-----------|---------------------|----------|
| Cloudflare R2 / S3 / MinIO | Armazenamento de arquivos | Fotos, documentos, vídeos | Contrato de processamento |
| Provedor de e-mail (SMTP) | Envio de e-mails transacionais | E-mail, nome | Contrato de processamento |
| Provedor de banco de dados (PostgreSQL) | Armazenamento principal | Todos os dados | Servidor próprio / VPS dedicado |

---

## 8. Incidentes

Ver `INCIDENT-RESPONSE.md` para o fluxo de resposta a incidentes.

**Prazo legal de notificação (ANPD):** 72 horas a partir da ciência do incidente (LGPD Art. 48).
