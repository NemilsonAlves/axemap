# 33 — Estratégia de SEO

## Pilares de SEO

### 1. SEO Técnico

| Requisito | Implementação | Prioridade |
|-----------|--------------|-----------|
| **SSR/SSG** | Next.js App Router com renderização no servidor | Crítica |
| **Core Web Vitals** | LCP < 2.5s, FID < 100ms, CLS < 0.1 | Crítica |
| **Sitemap dinâmico** | /sitemap.xml com todas as URLs públicas (terreiros, eventos, categorias) | Crítica |
| **Robots.txt** | /robots.txt com regras claras | Crítica |
| **Meta tags dinâmicas** | Título, descrição, Open Graph, Twitter Card por página | Crítica |
| **Schema.org (JSON-LD)** | LocalBusiness + Event + Review + Organization | Alta |
| **Canonical tags** | Evitar conteúdo duplicado | Alta |
| **Hreflang** | Preparação para expansão internacional | Média |
| **PWA + AMP** | PWA suficiente, AMP desnecessário | Baixa |

### 2. Schema.org (Dados Estruturados)

#### Perfil de Terreiro (LocalBusiness)
```json
{
  "@context": "https://schema.org",
  "@type": "Place",
  "name": "Terreiro Pai João de Oxalá",
  "description": "Terreiro de Umbanda localizado em Recife-PE...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Exemplo, 123",
    "addressLocality": "Recife",
    "addressRegion": "PE",
    "postalCode": "50000-000",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -8.05428,
    "longitude": -34.8812
  },
  "telephone": "+5581999999999",
  "url": "https://axemap.com.br/terreiro/paijoaodeoxala",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "bestRating": "5",
    "ratingCount": "23"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "19:00",
      "closes": "23:00"
    }
  ]
}
```

#### Evento
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Gira de Preto Velho",
  "startDate": "2026-07-15T19:00",
  "endDate": "2026-07-15T23:00",
  "location": {
    "@type": "Place",
    "name": "Terreiro Pai João de Oxalá",
    "address": { ... }
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  }
}
```

### 3. SEO de Conteúdo

#### Cluster de Conteúdo por Cidade

```
Pilar: "Guia de Terreiros no Brasil"
  ├── Terreiros em Recife
  │   ├── Terreiro Pai João (Recife)
  │   ├── Terreiro Mãe Maria (Recife)
  │   └── ...
  ├── Terreiros em Salvador
  │   ├── Terreiro X (Salvador)
  │   └── ...
  └── Terreiros em Porto Alegre
      └── ...
```

#### Páginas Estratégicas

| URL | Foco | Keyword |
|-----|------|---------|
| /terreiros/[cidade] | Lista de terreiros por cidade | "terreiros em [cidade]" |
| /terreiros/[cidade]/umbanda | Filtro por tradição | "terreiro de umbanda em [cidade]" |
| /eventos/calendario-religioso | Calendário | "calendário religioso afro-brasileiro" |
| /guia/como-visitar-um-terreiro | Guia informativo | "como visitar um terreiro" |
| /sobre/religioes-afro-brasileiras | Informacional | "religiões de matriz africana" |

### 4. SEO Local

| Tática | Descrição |
|--------|-----------|
| **Google Business Profile** | Cada terreiro com perfil no Google (auxiliamos o cadastro) |
| **Mapa嵌入** | Google Maps embed nos perfis (complementar ao Leaflet) |
| **Citações locais** | Presença em diretórios locais (Guia Mais, Apontador) |
| **Reviews** | Incentivar avaliações no Google (integração futura) |

### 5. Link Building

| Tática | Prioridade | Dificuldade |
|--------|-----------|-------------|
| **Parceiros institucionais** | Alta | Baixa |
| **Guest posts em blogs de cultura afro** | Alta | Média |
| **Menções em veículos de imprensa** | Média | Alta |
| **Backlinks de federações (FBU, etc.)** | Alta | Média |
| **Parcerias com universidades** | Média | Média |
| **Diretórios locais** | Baixa | Muito baixa |

## Plano de SEO (6 meses)

| Mês | Ação | Impacto Esperado |
|-----|------|-----------------|
| **Mês 1** | SEO técnico: sitemap, meta tags, schema.org, robots.txt | Indexação completa |
| **Mês 2** | Páginas de cidade (top 10 cidades) | Tráfego local |
| **Mês 3** | Conteúdo informacional (10 artigos) | Autoridade de domínio |
| **Mês 4** | Link building (parcerias + guest posts) | DR aumentando |
| **Mês 5** | Páginas de eventos + calendário | Tráfego sazonal |
| **Mês 6** | Análise e iteração | DR 30+, tráfego orgânico >10k/mês |

## Métricas de SEO

| Métrica | Mês 3 | Mês 6 | Mês 12 |
|---------|-------|-------|--------|
| Páginas indexadas | 500 | 5.000 | 50.000 |
| Domain Rating (DR) | 15 | 30 | 45 |
| Tráfego orgânico/mês | 5k | 50k | 300k |
| Keywords no top 10 | 50 | 500 | 5.000 |
| Core Web Vitals (pass) | 80% | 95% | 99% |
