# 19 — Plano Mobile

## Estratégia

- **MVP Mobile:** PWA (Progressive Web App) — já cobre 90% das necessidades
- **Fase 2 (Mês 9+):** App React Native para iOS e Android
- **Justificativa:** PWA reduz custo inicial, app nativo justifica-se quando houver tração e demanda push

## MVP Mobile: PWA

### Funcionalidades
- Navegação completa do diretório
- Busca geográfica com mapa
- Perfil de terreiros
- Avaliações e fotos
- Favoritos offline
- Compartilhamento nativo
- Instalação na tela inicial

### Limitações do PWA
- Notificações push limitadas (apenas Android)
- Sem integração com Apple Pay/Google Pay
- Sem acesso a sensores avançados
- Performance inferior ao nativo

## App Nativo (React Native — Fase 2)

### Funcionalidades Exclusivas do App Nativo
| Funcionalidade | PWA | Nativo |
|---------------|-----|--------|
| Notificações push | Parcial (Android) | iOS + Android |
| Offline completo | Limitado | SQLite local |
| GPS em background | ❌ | ✓ |
| Câmera integrada | ✓ (navegador) | ✓ (nativo) |
| Apple Pay / Google Pay | ❌ | ✓ |
| Widgets | ❌ | iOS + Android |
| Compartilhar localização ao vivo | ❌ | ✓ |

### Features Adicionais do App
- **Modo offline:** Dados de terreiros favoritos disponíveis sem internet
- **Alerta de proximidade:** Notificação ao passar perto de um terreiro
- **Scanner de QR Code:** Check-in em eventos
- **Áudio de pontos cantados:** Player offline com letra sincronizada
- **Calendário espiritual integrado:** Datas com base na tradição do usuário

### Tecnologia
- **Framework:** React Native (Expo)
- **Navegação:** Expo Router
- **Estado:** TanStack Query + Zustand
- **Mapa:** react-native-maps (Apple Maps + Google Maps)
- **Notificações:** Expo Notifications / Firebase Cloud Messaging
- **Offline:** WatermelonDB / SQLite

## Roadmap Mobile

| Fase | Período | Entrega |
|------|---------|---------|
| PWA | Mês 1 | Instalação na tela inicial, funcionalidades básicas |
| Push Notifications | Mês 6 | Notificações para Android PWA |
| App Nativo Beta | Mês 9 | TestFlight + Play Console internal testing |
| App Nativo Launch | Mês 10 | Publicação nas lojas |
| App Nativo v2 | Mês 12 | Modo offline + áudio + widgets |

## Métricas Mobile

| Métrica | Meta 3 meses pós-lançamento |
|---------|----------------------------|
| Downloads | 10.000 |
| DAU/MAU | 25% |
| Retenção D7 | 40% |
| Retenção D30 | 20% |
| Avaliação na loja | 4.5+ |
| Push opt-in rate | 60%+ |
