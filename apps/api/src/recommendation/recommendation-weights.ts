import { PesoRecomendacao } from './recommendation.types';

export const PESOS_PADRAO: PesoRecomendacao = {
  distancia: 0.30,
  trustScore: 0.20,
  avaliacoes: 0.15,
  popularidade: 0.10,
  eventosAtivos: 0.10,
  cursos: 0.05,
  atualizacao: 0.05,
  afinidade: 0.05,
};

export class WeightConfig {
  private pesos: PesoRecomendacao;

  constructor(pesos?: Partial<PesoRecomendacao>) {
    this.pesos = { ...PESOS_PADRAO, ...pesos };
    this.normalizar();
  }

  get(key: keyof PesoRecomendacao): number {
    return this.pesos[key];
  }

  getAll(): PesoRecomendacao {
    return { ...this.pesos };
  }

  atualizar(pesos: Partial<PesoRecomendacao>): void {
    Object.assign(this.pesos, pesos);
    this.normalizar();
  }

  private normalizar(): void {
    const soma = Object.values(this.pesos).reduce((a, b) => a + b, 0);
    if (soma !== 1 && soma > 0) {
      for (const key of Object.keys(this.pesos) as (keyof PesoRecomendacao)[]) {
        this.pesos[key] = this.pesos[key] / soma;
      }
    }
  }
}
