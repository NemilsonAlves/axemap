# 60 — Processo de Verificação Documental

## Visão Geral

A verificação documental é o processo de **confirmar a identidade do dirigente** e seu **vínculo com o terreiro**. Este é o Nível 3 do sistema de verificação e o mais importante para o Trust Score.

## Documentos Aceitos

### Para Identidade do Dirigente

| Documento | Tipo | Validação |
|-----------|------|-----------|
| RG (frente e verso) | Obrigatório | Validar data de emissão, órgão, não expirado |
| CNH (frente e verso) | Alternativo ao RG | Validar data de validade |
| Passaporte | Alternativo | Validar validade |
| RNE (estrangeiros) | Alternativo | Validar validade |

### Para Comprovação de Vínculo

| Documento | Aceito? | Facilidade |
|-----------|---------|-----------|
| Conta de água/luz no nome do dirigente no endereço do terreiro | ✅ Alta | Fácil |
| Declaração de federação (FBU, FBC, etc.) | ✅ Alta | Média |
| Fotos do dirigente no terreiro (mínimo 3, locais reconhecíveis) | ✅ Média | Fácil |
| Documento de propriedade do imóvel | ✅ Alta | Difícil |
| Contrato de aluguel | ✅ Alta | Médio |
| Matéria de jornal/menção pública | ✅ Média | Variável |
| Redes sociais do terreiro com dirigente identificado | ✅ Baixa | Fácil |
| Carta de outros dirigentes verificados (testemunho) | ✅ Média | Fácil |

## Fluxo de Verificação

### Etapa 1: Solicitação

```
Dirigente → Painel → "Verificar Identidade"
  → Step 1: Tipo de documento
    [RG] [CNH] [Passaporte] [RNE]
  → Step 2: Upload (criptografado)
    [Front do documento] [Verso] [Selfie segurando o doc]
  → Step 3: Comprovação de vínculo
    [Selecionar tipo] [Upload do arquivo]
  → Step 4: Declaração
    "Declaro que sou o responsável pelo terreiro [nome] 
     e que as informações fornecidas são verdadeiras."
    [Checkbox: Li e concordo com os termos]
  → [Enviar]
```

### Etapa 2: Análise (Admin/Verificador)

```
Fila de verificação
    │
    ▼
Verificador abre solicitação
    │
    ├── Verifica documentos (autenticidade + dados)
    │   ├── Documento não parece adulterado
    │   ├── Nome corresponde ao informado
    │   ├── Selfie corresponde ao documento
    │   └── Data de validade OK
    │
    ├── Verifica vínculo
    │   ├── Conta de luz: endereço do terreiro x nome do dirigente
    │   │   └── Confere parcialmente (mesmo bairro, rua similar)
    │   │
    │   └── Resultado geral
    │       ├── ✅ Documentos OK
    │       └── ❌ Suspeita de fraude
    │
    └── Decisão
        ├── ✅ Aprovar → Nível 3 concedido
        ├── 🔄 Solicitar mais documentos
        └── ❌ Rejeitar → Motivo documentado
```

### Etapa 3: Resolução

**Aprovado:**
- Selo 🛡️ "Identidade Confirmada" no perfil
- Trust Score: +15 pontos (componente Verificação)
- Notificação ao dirigente
- Documentos: mantidos criptografados por 90 dias, depois excluídos

**Documentos insuficientes:**
- Notificação com lista do que falta
- Prazo: 7 dias para reenviar
- Até 3 tentativas

**Rejeitado:**
- Notificação com motivo
- Possibilidade de recurso (48h)
- Bloqueio de nova tentativa por 30 dias (anti-fraude)

## Segurança dos Documentos

| Medida | Descrição |
|--------|-----------|
| **Criptografia AES-256** | Documentos criptografados em repouso (S3/R2) |
| **Acesso temporário** | Verificador só acessa durante a análise (logado) |
| **Expiração automática** | 90 dias após verificação concluída |
| **Audit trail** | Todo acesso a documentos é registrado |
| **Sem download** | Documentos são visualizados no navegador (streaming criptografado) |
| **Marca d'água** | "AxéMap - Verificação" sobreposta nos documentos visualizados |
| **LGPD** | Consentimento específico para tratamento de documentos |

## Tabela de Prazos

| Documento | Validade | Revalidação |
|-----------|----------|-------------|
| RG | Indeterminado | Apenas se suspeita de fraude |
| CNH | Até validade da CNH | Revalidar a cada 5 anos |
| Comprovante de vínculo | 1 ano | Anual |
| Selfie | 2 anos | A cada 2 anos |

## Casos Especiais

| Caso | Procedimento |
|------|-------------|
| **Dirigente faleceu** | Novo dirigente envia documentação + declaração de sucessão (ata, federação, fotos do funeral/rito de passagem) |
| **Terreiro sem documentação formal** | Federação + fotos + carta de 2 terreiros verificados |
| **Dirigente não tem RG (registro tardio)** | Aceitar outros documentos + fotos + federação |
| **Menor de idade como dirigente** | Documento do responsável legal + autorização |
| **Mudança de dirigente** | Novo dirigente passa pelo processo completo. Anterior perde acesso. |

## Métricas

| Métrica | Meta |
|---------|------|
| Tempo médio de verificação | < 12h |
| Taxa de aprovação | > 65% |
| Taxa de fraude detectada | < 3% |
| Documentos expirados e removidos | 100% em 90 dias |
| Satisfação com o processo | > 80% |
| Recursos de rejeição | < 5% |
