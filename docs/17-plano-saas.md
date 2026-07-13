# 17 — Plano SaaS

## Visão Geral

O SaaS do AxéMap (SaaS = "Software as a Service para Terreiros") é o **coração da monetização**. Cada terreiro cadastrado no diretório pode optar por assinar um plano para acessar ferramentas de gestão profissional.

## Proposta de Valor

> "Gerencie seu terreiro com ferramentas tão boas quanto de qualquer empresa, mas feitas para a realidade do axé."

## Módulos do SaaS

### Módulo 1: Membros
| Funcionalidade | Grátis | Básico | Profissional | Enterprise |
|---------------|--------|--------|-------------|------------|
| Cadastro de membros | 5 | 10 | Ilimitado | Ilimitado |
| Cargos (ogã, ekedi, etc.) | ❌ | ✓ | ✓ | ✓ |
| Dados espirituais | ❌ | ✓ | ✓ | ✓ |
| Hierarquia | ❌ | ❌ | ✓ | ✓ |
| Histórico de frequência | ❌ | ✓ | ✓ | ✓ |
| Exportação de dados | ❌ | ❌ | ✓ | ✓ |
| Convite por WhatsApp | ✓ (manual) | ✓ | ✓ | ✓ |

### Módulo 2: Agenda e Eventos
| Funcionalidade | Grátis | Básico | Profissional | Enterprise |
|---------------|--------|--------|-------------|------------|
| Calendário de giras | ✓ | ✓ | ✓ | ✓ |
| Eventos públicos | 5/mês | Ilimitado | Ilimitado | Ilimitado |
| Recorrência semanal | ❌ | ✓ | ✓ | ✓ |
| Confirmação de presença | ❌ | ✓ | ✓ | ✓ |
| Notificação push | ❌ | ❌ | ✓ | ✓ |
| Sincronia Google Calendar | ❌ | ❌ | ✓ | ✓ |

### Módulo 3: Financeiro
| Funcionalidade | Grátis | Básico | Profissional | Enterprise |
|---------------|--------|--------|-------------|------------|
| Controle de doações | ❌ | ✓ | ✓ | ✓ |
| Gestão de despesas | ❌ | ❌ | ✓ | ✓ |
| Pix integrado | ❌ | ✓ (QR Code) | ✓ | ✓ |
| Extrato mensal | ❌ | ❌ | ✓ | ✓ |
| Relatórios | ❌ | ❌ | Básico | Avançado |
| Múltiplas contas | ❌ | ❌ | ❌ | ✓ |

### Módulo 4: Subdomínio Personalizado
| Funcionalidade | Grátis | Básico | Profissional | Enterprise |
|---------------|--------|--------|-------------|------------|
| URL: axemap.com.br/terreiro | ✓ | ✓ | ✓ | ✓ |
| URL: terreiro.axemap.com.br | ❌ | ❌ | ✓ | ✓ |
| Domínio próprio | ❌ | ❌ | ❌ | ✓ |
| Personalização de cores | ❌ | ❌ | ✓ | ✓ |
| Logo no header | ❌ | ❌ | ✓ | ✓ |

### Módulo 5: Galeria e Mídia
| Funcionalidade | Grátis | Básico | Profissional | Enterprise |
|---------------|--------|--------|-------------|------------|
| Fotos no perfil | 1 | 10 | Ilimitado | Ilimitado |
| Vídeos | ❌ | 1 | 10 | Ilimitado |
| Áudio (pontos cantados) | ❌ | ❌ | ✓ | ✓ |
| Biblioteca de documentos | ❌ | ❌ | ✓ | ✓ |

### Módulo 6: Comunicação
| Funcionalidade | Grátis | Básico | Profissional | Enterprise |
|---------------|--------|--------|-------------|------------|
| Botão WhatsApp | ✓ | ✓ | ✓ | ✓ |
| Mensagens internas | ❌ | ❌ | ✓ | ✓ |
| Newsletter para membros | ❌ | ❌ | ✓ | ✓ |
| Notificações push | ❌ | ❌ | ✓ | ✓ |
| API do terreiro | ❌ | ❌ | ❌ | ✓ |

## Estratégia de Conversão

**Funil Freemium → Pago:**

1. **Descoberta:** Terreiro se cadastra no diretório (grátis)
2. **Valor inicial:** Ganha visibilidade, recebe avaliações
3. **Dor:** Começa a receber muitos contatos, precisa organizar agenda e membros
4. **Upgrade:** Assina plano Básico por R$ 49/mês
5. **Expansão:** Precisa de mais recursos → Profissional → Enterprise

**Gatilhos de Upgrade:**
- Atingiu 5 membros cadastrados (limite grátis)
- Atingiu 5 eventos no mês (limite grátis)
- Quer subdomínio personalizado
- Quer controle financeiro

## Retenção

| Estratégia | Descrição |
|------------|-----------|
| Onboarding ativo | Tutorial guiado no primeiro login |
| Suporte via WhatsApp | Canal direto para dúvidas |
| Webinars mensais | "Como usar o painel para crescer seu terreiro" |
| Feedback loop | Pesquisa NPS a cada 90 dias |
| Migração assistida | Ajuda para trazer dados de Excel/outros sistemas |

## Estimativa de Custos Operacionais do SaaS

| Item | Custo Mensal (estimado) |
|------|------------------------|
| Infraestrutura (servidores) | R$ 2.000-5.000 |
| Armazenamento (R2) | R$ 500-2.000 |
| Processamento de pagamento (Stripe) | 2.9% + R$ 0,50 |
| Suporte (1 pessoa part-time) | R$ 3.000 |
| **Total** | **R$ 6.000-10.000/mês** |

**Breakeven:** ~120 terreiros pagantes (plano básico) ou ~60 (planos mistos)
