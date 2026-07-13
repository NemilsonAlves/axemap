# 73 — Estratégia de Machine Learning

## Princípios

1. **ML em produção só após MVP validado** — não otimizar o que não existe
2. **Modelos simples primeiro** — regressão logística e árvores antes de deep learning
3. **Feature store compartilhada** — features calculadas uma vez, usadas por múltiplos modelos
4. **Explainability > Accuracy** — em um contexto sensível como religião, modelos precisam ser explicáveis
5. **Feedback loop** — todo modelo tem um mecanismo de feedback para re-treino

## Mapa de Modelos

| Modelo | Problema | Algoritmo | Dados | Fase |
|--------|----------|-----------|-------|------|
| Trust Score Predictor | Prever trust score de novos terreiros | Regressão (XGBoost) | Características do terreiro + cidade | Pós-MVP |
| Spam Classifier | Detectar spam em avaliações | Naive Bayes + Regras | Texto + metadados do usuário | Pós-MVP |
| Review Verifier | Detectar avaliações falsas | Random Forest | Padrões de comportamento | Pós-MVP |
| Churn Predictor | Prever desistência de dirigentes | Regressão Logística | Engajamento, tempo, suporte | Escala |
| Recommendation | Recomendar terreiros/eventos | Collaborative Filtering + Graph | Histórico, avaliações, grafo | Pós-MVP |
| Fraud Detection | Detectar contas falsas | Isolation Forest | Comportamento, cadastro | Escala |
| Content Tagger | Tags automáticas para terreiros | NLP (BERT lightweight) | Descrição, texto livre | Escala |
| Revenue Forecaster | Prever receita mensal | ARIMA + XGBoost | Histórico financeiro | Escala |

## Pipeline de ML (Treino e Inferência)

```
┌─────────────────────────────────────────────────────────────┐
│                   PIPELINE DE TREINO                         │
│                                                              │
│  [Feature Store] → [Feature Engineering] → [Treino]          │
│       │                                      │               │
│       ▼                                      ▼               │
│  [PostgreSQL]                          [MLflow Registry]     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   PIPELINE DE INFERÊNCIA                     │
│                                                              │
│  [Evento] → [Feature Store] → [Modelo] → [Predição]         │
│                                         → [Ação]             │
│                                                              │
│  Modo: Batch (cron) + Real-time (webhook/evento)            │
└─────────────────────────────────────────────────────────────┘
```

## Modelo 1: Trust Score Predictor (Pós-MVP)

### Problema
Novos terreiros entram na plataforma sem Trust Score. Leva semanas para o score estabilizar. Queremos prever um score inicial baseado em características observáveis.

### Features

```
Features de Entrada:
├── Completude do perfil (0-100%)
│   ├── Tem foto? (0/1)
│   ├── Tem descrição? (0/1 + tamanho)
│   ├── Tem endereço? (0/1)
│   ├── Tem contato? (0/1)
│   ├── Tem tradição declarada? (0/1)
│   └── Tem horário de funcionamento? (0/1)
├── Características do dirigente
│   ├── Já tem outro terreiro na plataforma? (0/1)
│   ├── É verificado? (0/1)
│   └── Trust score do dirigente (se existir)
├── Características da cidade
│   ├── Média de trust score dos terreiros na cidade
│   ├── Desvio padrão de trust score
│   └── Quantidade de terreiros na cidade
└── Características da tradição
    ├── Média de trust score da tradição
    └── Quantidade de terreiros na tradição
```

### Implementação

```python
# models/trust_score_predictor.py

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

class TrustScorePredictor:
    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=3,
            learning_rate=0.1,
            random_state=42
        )
        self.feature_names = [
            'completude_perfil',
            'tem_foto',
            'tem_descricao',
            'tem_endereco',
            'tem_contato',
            'dirigente_verificado',
            'dirigente_tem_outro_terreiro',
            'dirigente_trust_score',
            'media_trust_cidade',
            'std_trust_cidade',
            'qtd_terreiros_cidade',
            'media_trust_tradicao',
            'dias_para_primeira_avaliacao',
        ]

    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        """Feature engineering a partir dos dados brutos"""
        features = pd.DataFrame()

        # Completude do perfil
        features['completude_perfil'] = (
            df['has_photo'].astype(int) +
            df['has_description'].astype(int) +
            df['has_address'].astype(int) +
            df['has_contact'].astype(int)
        ) / 4

        features['tem_foto'] = df['has_photo'].astype(int)
        features['tem_descricao'] = df['has_description'].astype(int)
        features['tem_endereco'] = df['has_address'].astype(int)
        features['tem_contato'] = df['has_contact'].astype(int)

        # Dirigente
        features['dirigente_verificado'] = df['director_is_verified'].astype(int)
        features['dirigente_tem_outro_terreiro'] = df['director_has_other_terreiro'].astype(int)
        features['dirigente_trust_score'] = df['director_trust_score'].fillna(0)

        # Contexto local
        features['media_trust_cidade'] = df['city_avg_trust_score'].fillna(0)
        features['std_trust_cidade'] = df['city_std_trust_score'].fillna(0)
        features['qtd_terreiros_cidade'] = df['city_terreiro_count'].fillna(0)
        features['media_trust_tradicao'] = df['tradition_avg_trust_score'].fillna(0)

        return features

    def train(self, df: pd.DataFrame):
        X = self.preprocess(df)
        y = df['trust_score_90_dias']  # target: trust score após 90 dias

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)

        print(f"MAE: {mae:.2f} pontos de trust score")
        print(f"R²: {r2:.3f}")
        print(f"Erro médio: ~{mae/100*100:.1f}% do range")

        # Feature importance
        importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        print("\nTop 5 features:")
        print(importance.head(5))

        return {'mae': mae, 'r2': r2}

    def predict(self, terreiro_data: dict) -> float:
        features = self.preprocess(pd.DataFrame([terreiro_data]))
        return self.model.predict(features)[0]

    def save(self, path: str):
        joblib.dump(self.model, f"{path}/trust_score_predictor.pkl")

    def load(self, path: str):
        self.model = joblib.load(f"{path}/trust_score_predictor.pkl")
```

### Estratégia de Re-treino

```typescript
// Re-treino mensal automático
@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
async function retrainTrustScorePredictor(): Promise<void> {
  // 1. Coleta dados dos últimos 12 meses
  // 2. Treina novo modelo
  // 3. Compara com modelo atual (validação cruzada)
  // 4. Se novo modelo é melhor (MAE menor), promove para produção
  // 5. Loga no MLflow
  // 6. Notifica time se houve degradação
}
```

## Modelo 2: Spam Classifier (Pós-MVP)

```python
# models/spam_classifier.py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

class SpamClassifier:
    def __init__(self):
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 3),
                stop_words=['portuguese']
            )),
            ('clf', MultinomialNB(alpha=0.1))
        ])

    def train(self, reviews_df):
        # reviews_df precisa ter: 'texto' e 'is_spam' (label)
        X = reviews_df['texto']
        y = reviews_df['is_spam']
        self.pipeline.fit(X, y)

    def predict_proba(self, text: str) -> float:
        # Retorna probabilidade de ser spam (0-1)
        return self.pipeline.predict_proba([text])[0][1]

    def predict(self, text: str) -> bool:
        return self.pipeline.predict([text])[0]

# Regras auxiliares (não-ML)
RULES_BASED_SPAM = [
    'link' in text.lower(),                      # Links suspeitos
    len(text) < 10,                               # Muito curto
    text.upper() == text,                         # CAIXA ALTA
    contains_profanity(text),                      # Palavrões
    same_text_repeated(text, 3),                   # Mesmo texto repetido
    user_is_new_and_negative(user),                # Usuário novo + nota baixa
]

# Combinação: ML (70%) + Regras (30%)
def is_spam(text: str, metadata: dict, ml_score: float) -> SpamResult:
    rules_score = sum(RULES_BASED_SPAM) / len(RULES_BASED_SPAM)
    final_score = ml_score * 0.7 + rules_score * 0.3
    return {
        'is_spam': final_score > 0.6,
        'confidence': final_score,
        'ml_score': ml_score,
        'rules_score': rules_score,
        'triggered_rules': [r for r in RULES_BASED_SPAM if r],
    }
```

## Modelo 3: Churn Predictor (Escala)

### Features

```
Features de Churn:
├── Engajamento (últimos 30 dias)
│   ├── Dias desde última ação
│   ├── Total de ações no período
│   ├── Variação vs mês anterior
│   └── Ações por tipo (avaliação, favorito, etc)
├── Perfil
│   ├── Tempo na plataforma
│   ├── Trust Score (atual e tendência)
│   ├── Nível de verificação
│   └── Plano (gratuito vs premium)
├── Social
│   ├── Número de seguidores
│   ├── Interações recebidas
│   └── Engajamento da comunidade local
└── Suporte
    ├── Tickets abertos (últimos 90 dias)
    ├── Tempo médio de resposta
    └── Sentimento dos tickets
```

### Thresholds de Ação

```typescript
// Probabilidade de churn vs ação recomendada
const CHURN_ACTIONS = [
  { threshold: 0.7, action: 'email_personalizado_do_ceo' },
  { threshold: 0.5, action: 'desconto_premium_50' },
  { threshold: 0.3, action: 'email_reengajamento_conteudo' },
  { threshold: 0.1, action: 'push_notification_destaque' },
];
```

## ML em Produção (Infra)

```
┌─────────────────────────────────────────────────────────────┐
│                      INFERÊNCIA                              │
│                                                              │
│  Modelos servidos via:                                       │
│  ┌────────────┐  ┌─────────────┐  ┌────────────┐            │
│  │ ONNX       │  │ NestJS      │  │ Python     │            │
│  │ Runtime    │  │ (embedding)  │  │ FastAPI    │            │
│  │ (rápido)   │  │ (modelos    │  │ (complexos)│            │
│  │            │  │  simples)   │  │            │            │
│  └────────────┘  └─────────────┘  └────────────┘            │
│                                                              │
│  Cache de predições no Redis (TTL configurável)             │
│  Feature Store: PostgreSQL + Redis                          │
└─────────────────────────────────────────────────────────────┘
```

## Estratégia de Dados para ML

| Dado | Coleta | Label | Uso |
|------|--------|-------|-----|
| Avaliações marcadas como spam | Ação do moderador | `is_spam: bool` | Treino spam classifier |
| Denúncias confirmadas | Revisão humana | `tipo_denuncia: string` | Treino moderation |
| Churn real (cancelamento) | Evento de domínio | `churned: bool` | Treino churn predictor |
| Trust Score consolidado | Algoritmo (6 componentes) | `trust_score: float` | Target do predictor |
| Preferências explícitas | Onboarding | `tradicoes_interesse: string[]` | Cold start recommendation |
| Feedback de recomendação | Clique/skip | `engaged: bool` | Treino recommendation |

## ML Ops (Pós-MVP)

```
1. Versionamento de modelos: MLflow Registry
2. Testes de modelo: pytest + validação cruzada
3. Deploy: CI/CD com canary (10% do tráfego)
4. Monitoramento: 
   - Data drift (distribuição das features)
   - Model degradation (acurácia vs baseline)
   - Latência de inferência
5. Rollback: automático se acurácia cai > 5%
6. Auditoria: todas as predições logadas com input/output
```
