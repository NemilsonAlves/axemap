# 47 — Riscos Legais Relacionados às Avaliações Públicas

## Riscos Identificados

### Risco 1: Responsabilidade por Conteúdo de Terceiros

**Problema:** O AxéMap pode ser responsabilizado por avaliações difamatórias publicadas por usuários.

**Base Legal:**
- **Marco Civil da Internet (Lei 12.965/2014), Art. 19:** O provedor só é responsabilizado se não remover conteúdo após ordem judicial.
- **Exceção:** Conteúdo com nudez/ato sexual (Art. 21) requer remoção imediata sem ordem judicial.

**Mitigação:**
- Seguir estritamente o Art. 19: remover apenas mediante ordem judicial, exceto casos previstos no Art. 21
- Ter termos de uso claros que estabelecem as regras
- Manter canal de denúncia extrajudicial para conteúdo manifestamente ilícito
- Documentar todas as remoções com justificativa legal

### Risco 2: Difamação e Injúria (Código Penal)

**Problema:** Terreiro pode processar o avaliador (e a plataforma) por calúnia/difamação.

**Artigos:**
- **Art. 138 CP (Calúnia):** Acusar falsamente de fato criminoso
- **Art. 139 CP (Difamação):** Atribuir fato ofensivo à reputação
- **Art. 140 CP (Injúria):** Ofender a dignidade/decoro

**Mitigação:**
- Política clara: avaliações são sobre a experiência, não sobre a fé ou a pessoa
- Moderação remove automaticamente ataques pessoais
- Termos de uso: avaliador é responsável pelo conteúdo
- Mecanismo de resposta para o terreiro se defender publicamente

### Risco 3: Intolerância Religiosa (Lei 9.459/1997)

**Problema:** Avaliações com conteúdo de intolerância religiosa.

**Lei:** Crime de discriminação religiosa com pena de 1 a 3 anos de prisão.

**Mitigação:**
- Moderação IA detecta hate speech religioso automaticamente
- Remoção imediata + banimento do usuário
- Registro de ocorrência em casos graves
- Canal de denúncia direto para autoridades

### Risco 4: Direito de Imagem (Lei 9.610/1998)

**Problema:** Fotos postadas em avaliações sem autorização.

**Mitigação:**
- Termos de uso: usuário declara ter autorização para publicar fotos
- Remoção imediata mediante notificação do fotografado
- Ferramenta para solicitar remoção de foto específica

### Risco 5: LGPD — Dados Sensíveis (Lei 13.709/2018)

**Problema:** Religião é dado pessoal sensível (Art. 5º, II, LGPD). Avaliações podem expor a religião do avaliador.

**Base Legal:**
- Art. 11: Dados sensíveis exigem consentimento específico e destacado
- Art. 7º, V: Quando necessário para execução de contrato

**Mitigação:**
- Consentimento específico para tratamento de dados de religião
- Avaliador não é obrigado a declarar sua religião
- Avaliações são anônimas (nome do avaliador não aparece publicamente)
- Direito de exclusão (Art. 18 LGPD): avaliador pode apagar sua avaliação

### Risco 6: Concorrência Desleal (Lei 12.529/2011)

**Problema:** Avaliações negativas como ferramenta de concorrência entre terreiros.

**Mitigação:**
- Detecção de padrão: avaliador que só avalia negativamente terreiros concorrentes
- Banimento por manipulação de reputação
- Transparência: histórico de avaliações do usuário é auditável

### Risco 7: Liberdade de Expressão vs. Moderação

**Problema:** Moderação excessiva pode ser vista como censura; moderação insuficiente como conivência.

**Mitigação:**
- Políticas de moderação transparentes e publicadas
- Direito de recurso para decisões de moderação
- Não moderar conteúdo doutrinário (a menos que seja hate speech)
- Comitê de governança com especialistas externos (futuro)

## Termos de Uso — Cláusulas Essenciais

### Sobre Avaliações

```
1. O usuário é o único responsável pelo conteúdo de suas avaliações.
2. O usuário declara que a avaliação reflete sua experiência real.
3. É proibido publicar:
   a) Discurso de ódio ou intolerância religiosa
   b) Ataques pessoais a dirigentes ou membros
   c) Informação comprovadamente falsa
   d) Conteúdo ilegal ou que viole direitos de terceiros
4. A plataforma pode remover conteúdo que viole estas regras.
5. O terreiro tem direito de resposta pública a cada avaliação.
6. O avaliador pode editar ou excluir sua avaliação a qualquer momento.
7. O terreiro não pode exigir a remoção de avaliação (salvo decisão judicial).
```

### Sobre Dados

```
1. O usuário consente com o tratamento de dados de religião para fins de funcionamento da plataforma.
2. Avaliações são anônimas (identidade do avaliador não é pública).
3. O usuário pode solicitar a exclusão de seus dados a qualquer momento (Art. 18 LGPD).
4. Fotos publicadas em avaliações devem ter autorização dos fotografados.
```

## Recomendações Legais

| Ação | Prioridade | Prazo |
|------|-----------|-------|
| **Contratar advogado especialista em direito digital e LGPD** | Crítica | Pré-lançamento |
| **Elaborar Termos de Uso e Política de Privacidade** | Crítica | Pré-lançamento |
| **Registrar na ANPD** (controlador de dados) | Obrigatória | Pré-lançamento |
| **Criar canal de contato com autoridades** (intolerância religiosa) | Alta | Pós-lançamento |
| **Seguro cibernético** com cobertura para conteúdo de terceiros | Recomendada | Pré-lançamento |
| **Comitê de governança** com especialistas em liberdade religiosa | Recomendada | Mês 6 |
| **Auditoria jurídica trimestral** das práticas de moderação | Recomendada | Contínuo |
