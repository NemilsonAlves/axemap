# 63 — Plano para Expansão Internacional

## Quando Expandir

| Condição | Meta |
|----------|------|
| Brasil consolidado | 20k terreiros, 1M usuários, MRR > R$ 200k |
| Produto maduro | Trust Score validado, moderação escalando |
| Time preparado | Equipe dedicada de internacionalização |
| Demanda internacional identificada | Pesquisa com comunidades diaspóricas |

**Estimativa:** Mês 18-24 (após consolidação nacional)

## Mercados-Alvo Prioritários

### Fase 1: Diáspora Lusófona (Ano 2)

| País | Comunidade | Potencial | Facilidade |
|------|-----------|-----------|-----------|
| **Portugal** | Imigrantes brasileiros + portugueses interessados | Alto | Alta (idioma) |
| **Angola** | Candomblé de Angola, Umbanda | Médio | Média (idioma) |
| **Moçambique** | Tradições locais + influência brasileira | Médio | Média (idioma) |
| **Cabo Verde** | Comunidade religiosa afro | Baixo | Alta (idioma) |

### Fase 2: Diáspora nas Américas (Ano 3)

| País | Comunidade | Potencial | Facilidade |
|------|-----------|-----------|-----------|
| **EUA** (NY, FL, CA) | Santeria, Candomblé, Vodou, comunidades afro-latinas | Muito alto | Média (inglês) |
| **Uruguai** | Umbanda (forte presença, especialmente em Montevidéu) | Alto | Alta (portunhol) |
| **Argentina** | Umbanda (comunidade significativa) | Médio | Alta (espanhol) |
| **Cuba** | Santeria (Ifá, Ocha) | Alto (restrito) | Baixa (conectividade) |
| **Caribe** (Haiti, Rep. Dominicana, Jamaica) | Vodou, Santeria, Obeah | Médio | Baixa (conectividade + idioma) |

### Fase 3: África (Ano 4+)

| País | Comunidade | Potencial | Facilidade |
|------|-----------|-----------|-----------|
| **Nigéria** | Ifá, Orixá, cultura iorubá | Muito alto | Baixa (infraestrutura) |
| **Benin** | Vodun (berço do Vodu) | Alto | Baixa |
| **Gana** | Religiões tradicionais | Médio | Baixa |

## Modelo de Entrada

### Opção A: Domínio + Subdiretório (Recomendado)

```
axemap.com          → Brasil (pt-BR)
axemap.com/pt       → Portugal (pt-PT)
axemap.com/en       → EUA (en-US)
axemap.com/es       → América Hispânica (es)
```

**Prós:** Mesmo codebase, SEO consolidado, manutenção centralizada
**Contras:** Precisa de i18n desde o início

### Opção B: Subdomínio

```
br.axemap.com       → Brasil
pt.axemap.com       → Portugal
us.axemap.com       → EUA
```

**Prós:** Geolocalização nativa, independence de conteúdo
**Contras:** SEO fragmentado, mais complexo

### Opção C: TLD Próprio (Futuro)

```
axemap.com.br       → Brasil
axemap.pt           → Portugal
axemap.us           → EUA
```

**Prós:** Máximo SEO local
**Contras:** Alto custo operacional

### Recomendação: Opção B (subdomínio) para transição, Opção A (subdiretório) como padrão

## Adaptações Necessárias

### Técnicas

| Adaptação | Impacto | Esforço |
|-----------|---------|---------|
| **i18n** (next-intl) | Catálogo de traduções para UI | Alto |
| **Suporte a múltiplos idiomas** | Dados de terreiros em idioma local | Médio |
| **LGPD local** | GDPR (Europa), CCPA (Califórnia) | Alto |
| **Processador de pagamento local** | Stripe conecta, mas Pix e Boleto só Brasil | Médio |
| **Mapa local** | OpenStreetMap funciona globalmente | Baixo |
| **Fuso horário** | Eventos em fuso local | Médio |
| **Moeda** | BRL, EUR, USD, etc. | Médio |

### Conteúdo

| Adaptação | Descrição |
|-----------|-----------|
| **Glossário local** | Termos em iorubá, espanhol, inglês, francês |
| **Tradições locais** | Santeria (Cuba), Vodou (Haiti), Ifá (Nigéria) |
| **Conteúdo educativo** | Guias em cada idioma |
| **Calendário religioso global** | Datas de cada país/tradição |

### Legais

| País | Regulação | Ação Necessária |
|------|-----------|----------------|
| **Portugal** | GDPR europeu | Adequação à RGPD |
| **EUA** | CCPA, COPPA | Adequação estadual |
| **União Europeia** | GDPR geral | DPO, registro |
| **Nigéria** | NDPR | Adequação local |

## Parcerias Internacionais

| Tipo | Exemplo | Benefício |
|------|---------|-----------|
| **Federações locais** | Federación de Umbanda (Uruguai) | Credibilidade local |
| **Acadêmicos** | Universidades com estudos afro-diáspora | Pesquisa + dados |
| **ONGs** | UNESCO, PNUD | Impacto social |
| **Embaixadores** | Líderes religiosos na diáspora | Entrada orgânica |

## Roadmap Internacional

| Fase | Período | Ações |
|------|---------|-------|
| **Preparação** | Mês 12-18 | i18n, suporte a múltiplos países, pesquisa de demanda |
| **Portugal** | Mês 18-20 | Tradução, parcerias locais, 50 terreiros |
| **EUA** | Mês 20-24 | Versão inglês, Santeria/Candomblé communities, 100 terreiros |
| **Uruguai + Argentina** | Mês 24-28 | Versão espanhol, 50 terreiros |
| **África** | Mês 28+ | Parcerias locais, versão adaptada |
