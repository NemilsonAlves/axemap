# AxéMap — Privacidade de Localização

## Princípio

Segurança acima de precisão absoluta.

Comunidades religiosas podem ser alvo de perseguição, vandalismo e ataques
baseados em localização. O AxéMap protege a localização de cada comunidade
conforme o controle definido pelo próprio responsável.

---

## Níveis de Visibilidade

### PUBLICO
Endereço institucional confirmado. Coordenadas exatas são exibidas no mapa.

### APROXIMADA
Latitude e longitude são arredondadas a 3 casas decimais (~100-200m de imprecisão por grau).
O mapa exibe a área geral, não o endereço exato.
O campo `localizacaoAproximada: true` é adicionado à resposta da API.

### PRIVADA
Coordenadas não são exibidas. Apenas cidade e estado.
O campo `localizacaoPrivada: true` é adicionado.
Coordenadas nunca aparecem em APIs públicas.

---

## Controle pelo Responsável

No cadastro ou edição do perfil:

```
Como deseja exibir sua localização?
[ ] Endereço completo (PUBLICO)
[ ] Região aproximada (APROXIMADA)
[ ] Somente cidade (PRIVADA)
[ ] Não exibir publicamente (PRIVADA)
```

O campo `visibilidadeLocalizacao` no modelo `Terreiros` armazena a preferência.

---

## Implementação

A função `mascararLocalizacao()` em [`location-visibility.ts`](../apps/api/src/common/utils/location-visibility.ts)
aplica a máscara em tempo de resposta — **sem alterar o banco de dados**.

```typescript
// PUBLICO: coordenadas exatas
// APROXIMADA: Math.round(coord * 1000) / 1000
// PRIVADA: remove latitude, longitude, geoPoint
```

---

## Regras de Segurança

1. Administradores **não podem** alterar `visibilidadeLocalizacao` de um terreiro sem registro em `AuditLog`
2. APIs públicas (`/mapa`, `/discovery`) aplicam `mascararLocalizacao()` automaticamente
3. Coordenadas PostGIS (`geoPoint`) **nunca** são expostas em APIs públicas quando visibilidade for APROXIMADA ou PRIVADA
4. Buscas geográficas por raio respeitam a visibilidade — o resultado não revela a posição exata
5. Rate limiting protege contra scraping de localização aproximada

---

## Modelo Prisma

```prisma
model Terreiros {
  visibilidadeLocalizacao LocalizacaoVisibilidade @default(PUBLICO)
  ...
}

enum LocalizacaoVisibilidade {
  PUBLICO
  APROXIMADA
  PRIVADA
}
```

---

## Proteção contra Scraping de Localização

- Rate limiting global: 100 req/min
- Paginação máxima de 100 itens por request
- Coordenadas PostGIS não são incluídas em listagens públicas
- Monitoramento de queries anormais (a implementar com Redis)

---

## Status de Implementação

| Componente | Status |
|---|---|
| Enum `LocalizacaoVisibilidade` | ✅ |
| Campo `visibilidadeLocalizacao` no Terreiro | ✅ |
| `mascararLocalizacao()` utilitário | ✅ |
| Testes unitários (location-visibility.spec.ts) | ✅ |
| Testes de segurança (location-privacy.spec.ts) | ✅ |
| Aplicação nos endpoints públicos (/mapa, /discovery) | ⚠️ Verificar cobertura completa |
| UI de controle de visibilidade no painel | ⏳ Pendente |
| Auditoria de alterações de visibilidade | ⏳ Pendente |
