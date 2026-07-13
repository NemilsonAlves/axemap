# 86 — Estratégia de Aquisição de Dados Geográficos

## Hierarquia das Fontes

```
Prioridade 1 — Cadastro Oficial do Dirigente
Prioridade 2 — Perfil Reivindicado
Prioridade 3 — Cadastro Colaborativo da Comunidade
Prioridade 4 — Importação de Bases Públicas Permitidas
Prioridade 5 — OpenStreetMap
Prioridade 6 — Federações
Prioridade 7 — Sites Públicos
Prioridade 8 — IA para Sugerir Cadastros
```

**Google Places:** Uso exclusivamente complementar, dentro dos Termos de Uso.
Nunca copiar avaliações, fotos, descrições ou conteúdos protegidos.

## Modelo de Confiança dos Dados

Cada registro geográfico possui metadados obrigatórios:

```typescript
interface DataTrustMetadata {
  source: DataSource;
  collectedAt: Date;
  lastUpdated: Date;
  responsible: string;
  validationMethod: ValidationMethod;
  confidenceLevel: 0.0 | 0.25 | 0.50 | 0.75 | 1.0;
  version: number;
  history: ChangeRecord[];
}
```

A confiança alimenta diretamente o **Trust Score** do terreiro.

## Arquitetura de Mapas

### Map Provider Abstraction

```
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION                            │
│                                                          │
│  [Components de Mapa] → [MapProvider Interface]          │
│       ↕ não acoplado ↕                                    │
│                                                          │
│  Implementações:                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ MapLibre   │  │ Leaflet    │  │ Google     │         │
│  │ GL JS      │  │ (MVP)      │  │ (futuro)   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└─────────────────────────────────────────────────────────┘
```

Nenhuma regra de negócio depende do provedor de mapas. Toda inteligência geográfica está no backend (PostGIS).

## Backend Geoespacial (PostGIS)

```sql
-- Spatial Index obrigatório
CREATE INDEX idx_terreiros_geo ON terreiros USING GIST (geo_point);

-- Bounding Box
SELECT * FROM terreiros
WHERE ST_Intersects(geo_point, ST_MakeEnvelope($west, $south, $east, $north, 4326));

-- Radius Search
SELECT *, ST_DistanceSphere(geo_point, ST_MakePoint($lng, $lat)) AS distance
FROM terreiros
WHERE ST_DWithin(geo_point::geography, ST_MakePoint($lng, $lat)::geography, $radiusMeters);

-- Nearest Neighbor
SELECT * FROM terreiros
ORDER BY geo_point <-> ST_MakePoint($lng, $lat)::geography
LIMIT 10;

-- Polygon Search (bairros, regiões)
SELECT * FROM terreiros
WHERE ST_Within(geo_point, (SELECT polygon FROM bairros WHERE nome = $bairro));
```

## Padrão Adotado

| Componente | Tecnologia | Observação |
|-----------|-----------|------------|
| Banco | PostgreSQL + PostGIS | Toda inteligência geográfica |
| Frontend (preferencial) | MapLibre GL JS | Futura migração |
| Frontend (MVP) | Leaflet | Se simplificar implementação |
| Tiles (MVP) | OpenStreetMap | Gratuito |
| Tiles (futuro) | MapTiler / OpenFreeMap / Servidor próprio | Preparar desde o início |

## Estrutura de Diretórios

```
apps/web/src/lib/map/
├── map-provider.interface.ts    # Interface abstrata
├── map-provider.tsx              # Provider React
├── map-view.tsx                  # Componente genérico
├── leaflet/
│   ├── leaflet-map.tsx           # Implementação Leaflet
│   └── leaflet.config.ts         # Config específica
├── maplibre/                     # (futuro)
│   ├── maplibre-map.tsx
│   └── maplibre.config.ts
└── types.ts                      # Tipos compartilhados
```

## Ativo Estratégico

> O maior patrimônio do AxéMap não é o mapa.
> É a base de conhecimento construída colaborativamente pela comunidade.
> Toda decisão arquitetural deve proteger esse ativo estratégico.
