import { Injectable } from '@nestjs/common';
import { RecommendationEngine } from './recommendation-engine.service';
import { WeightConfig } from './recommendation-weights';
import {
  Recomendacao, BlocoHome, ContextoRecomendacao,
  PesoRecomendacao,
} from './recommendation.types';

@Injectable()
export class RecommendationService {
  private weights: WeightConfig;

  constructor(private engine: RecommendationEngine) {
    this.weights = new WeightConfig();
  }

  async recomendar(contexto: ContextoRecomendacao, limite = 20): Promise<Recomendacao[]> {
    this.engine.setWeights(this.weights.getAll());
    return this.engine.recomendar(contexto, limite);
  }

  async home(contexto: ContextoRecomendacao): Promise<BlocoHome[]> {
    this.engine.setWeights(this.weights.getAll());
    return this.engine.homeBlocos(contexto);
  }

  async recomendarParaTerreiro(terreiroId: string, limite = 6): Promise<Recomendacao[]> {
    this.engine.setWeights(this.weights.getAll());
    return this.engine.recomendarParaTerreiro(terreiroId, limite);
  }

  getPesos(): PesoRecomendacao {
    return this.weights.getAll();
  }

  atualizarPesos(pesos: Partial<PesoRecomendacao>): PesoRecomendacao {
    this.weights.atualizar(pesos);
    this.engine.setWeights(this.weights.getAll());
    return this.weights.getAll();
  }

  resetarPesos(): PesoRecomendacao {
    this.weights = new WeightConfig();
    this.engine.setWeights(this.weights.getAll());
    return this.weights.getAll();
  }
}
