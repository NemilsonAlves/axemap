# 48 — Plano de Governança da Plataforma

## Princípios de Governança

1. **Transparência radical:** Regras, algoritmos e decisões documentados publicamente
2. **Neutralidade:** Sem viés religioso, político ou comercial
3. **Participação comunitária:** A comunidade tem voz nas decisões
4. **Responsabilidade:** Decisões são auditáveis e recorríveis
5. **Evolução constante:** Regras são revisadas periodicamente com a comunidade

## Estrutura de Governança

### Fase 1: Fundadores (MVP — Mês 6)

```
Fundadores (equipe)
  ├── Decisões técnicas
  ├── Moderação
  ├── Termos de uso
  └── Roadmap
```

### Fase 2: Comitê Consultivo (Mês 6 — Mês 18)

```
Fundadores + Conselho Consultivo (3-5 membros externos)
  ├── Representantes de federações (FBU, FBC)
  ├── Especialista em liberdade religiosa
  ├── Defensor de direitos digitais
  └── Representante da comunidade (dirigente eleito)
```

### Fase 3: Governança Compartilhada (Mês 18+)

```
Assembleia da Comunidade
  ├── Conselho de Administração (eleito)
  ├── Comitê de Moderação (voluntários treinados)
  ├── Comitê de Ética (especialistas externos)
  └── Fórum de Sugestões (comunidade vota)
```

## Conselho Consultivo (Fase 2)

### Quem deve participar?

| Perfil | Por quê? | Indicação |
|--------|----------|-----------|
| **Líder religioso** | Representatividade | Federação Brasileira de Umbanda |
| **Acadêmico** | Isenção e pesquisa | Antropólogo especializado |
| **Jurista** | LGPD e direito digital | Advogado especialista |
| **Ativista** | Liberdade religiosa | ONG de direitos humanos |
| **Comunidade** | Voz do usuário | Dirigente eleito |

### Funções

- Revisar políticas de moderação
- Aprovar mudanças nos Termos de Uso
- Mediar conflitos complexos
- Recomendar prioridades de impacto social
- Auditar o Trust Score (transparência)

## Política de Transparência

### O que é público

| Item | Onde | Atualização |
|------|------|-------------|
| **Algoritmo do Trust Score** | axemap.com.br/trust-score | Sempre atual |
| **Política de moderação** | axemap.com.br/moderation | Sempre atual |
| **Termos de Uso** | axemap.com.br/termos | Com aviso prévio |
| **Relatório trimestral** | axemap.com.br/transparencia | Trimestral |
| **Mudanças no algoritmo** | Blog + notificação | Com 30 dias de aviso |
| **Remoções de conteúdo** | Relatório anonimizado | Mensal |

### Relatório Trimestral de Transparência

```
Relatório de Transparência — Q3 2026
─────────────────────────────────────

Conteúdo removido:
  - Avaliações removidas: 45 (0.5% do total)
  - Perfis banidos: 3 (motivos: identidade falsa)
  - Posts removidos (comunidade): 12

Moderação:
  - Moderação IA: 82% das decisões
  - Moderação humana: 18%
  - Precisão IA: 96.3%
  - Recursos recebidos: 8 (4 aceitos)

Trust Score:
  - Score médio: 38
  - Maior score: 87
  - Recalques realizados: 4.856

LGPD:
  - Solicitações de exclusão: 12
  - Solicitações de portabilidade: 3
  - Todas atendidas dentro do prazo legal
```

## Processo de Tomada de Decisão

### Decisões Unilaterais (Equipe Fundadora)
- Roadmap técnico
- Preços e planos
- Contratações

### Decisões Consultivas (Conselho + Comunidade)
- Mudanças no Trust Score
- Políticas de moderação
- Termos de Uso (antes da implementação)
- Funcionalidades de impacto social

### Decisões Deliberativas (Votação)
- Remoção de membro do conselho
- Mudanças nos valores fundamentais
- Parcerias institucionais relevantes

## Canais de Comunicação

| Canal | Propósito | Público |
|-------|-----------|---------|
| **Fórum de Governança** | Discussão de políticas | Comunidade |
| **GitHub público** | Documentos de governança | Todos |
| **Newsletter trimestral** | Relatório de transparência | Todos |
| **Canal de denúncia** | Reportar abusos da plataforma | Todos |
| **Ouvidoria** | Recursos de moderação | Usuários |

## Resolução de Conflitos

### Escalabilidade de Conflitos

```
Nível 1: Automático (IA)
  └── Conteúdo removido, notificação enviada
      └── Recurso do usuário
          │
Nível 2: Moderador humano
  └── Decisão em 48h
      └── Recurso do usuário
          │
Nível 3: Comitê de Ética
  └── 3 membros do conselho revisam
  └── Decisão final em 7 dias
      └── (sem recurso adicional)
```

### Mediação entre Usuário e Terreiro

Para conflitos entre avaliadores e terreiros:
1. Tentativa de acordo via plataforma (resposta pública)
2. Mediação pelo time do AxéMap
3. Se não resolver, conselho consultivo avalia
4. Decisão final documentada publicamente

## Código de Conduta da Equipe

| Regra | Descrição |
|-------|-----------|
| **Neutralidade** | Membros da equipe não expressam preferência religiosa em canais oficiais |
| **Confidencialidade** | Dados de usuários são protegidos (LGPD) |
| **Conflito de interesses** | Declarar se tiver vínculo com terreiro cadastrado |
| **Responsabilidade** | Erros são admitidos e corrigidos publicamente |
| **Segurança** | Relatar vulnerabilidades imediatamente |

## Revisão Anual

Todo ano, a governança passa por:
1. Auditoria externa do Trust Score
2. Auditoria de privacidade (LGPD)
3. Pesquisa de satisfação da comunidade
4. Revisão do conselho consultivo (renovação de membros)
5. Publicação do relatório anual de transparência
