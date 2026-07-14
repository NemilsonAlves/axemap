export interface EvolutionMission {
  id: string;
  key: string;
  titulo: string;
  descricao: string;
  categoria: string | null;
  rewardAxScore: number;
  rewardTrustScore: number;
  progresso: number;
  completo: boolean;
  completadoEm: string | null;
}

export interface EvolutionAchievement {
  id: string;
  key: string;
  titulo: string;
  descricao: string;
  icone: string | null;
  categoria: string | null;
  rewardAxScore: number;
  obtida: boolean;
  earnedAt: string | null;
}

export interface AxScorePoint {
  id: string;
  score: number;
  delta: number;
  razao: string;
  createdAt: string;
}

export interface EvolutionAction {
  id: string;
  actionType: string;
  descricao: string;
  axScoreDelta: number;
  trustScoreDelta: number;
  createdAt: string;
}

export interface EvolutionGoal {
  id: string;
  titulo: string;
  descricao: string | null;
  targetDate: string | null;
  completado: boolean;
  completadoEm: string | null;
}

export interface ComparacaoMedia {
  axScoreMedio: number;
  trustScoreMedio: number;
  completudeMedia: number;
  totalTerreiros: number;
}

export interface EvolutionDashboard {
  axScore: number;
  completude: number;
  missoes: EvolutionMission[];
  conquistas: EvolutionAchievement[];
  comparacao: {
    cidade: ComparacaoMedia;
    estado: ComparacaoMedia;
  };
  historico: AxScorePoint[];
  acoes: EvolutionAction[];
  metas: EvolutionGoal[];
  stats: {
    totalMissoes: number;
    missoesCompletas: number;
    totalConquistas: number;
    conquistasObtidas: number;
  };
}
