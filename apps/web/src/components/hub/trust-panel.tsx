import type { TerreiroPerfil } from '@/types/terreiro';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CheckCircle2, Clock, HeartHandshake, Users, Award } from 'lucide-react';

function FatorRow({ label, value }: { label: string; value: number }) {
  const tone = value >= 60 ? 'bg-success' : value >= 40 ? 'bg-warning' : 'bg-danger';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-card-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className={`h-full rounded-full transition-all ${tone}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export function TrustPanel({ terreiro }: { terreiro: TerreiroPerfil }) {
  const ts = terreiro.trustScoreInfo;
  const hue = Math.min(ts.score * 1.2, 120);

  const fatores = [
    { label: 'Perfil verificado', value: terreiro.verificationLevel === 'COMPLETO' ? 100 : terreiro.verificationLevel ? 75 : 25 },
    { label: 'Tempo na plataforma', value: Math.min(100, terreiro.hub.mesesNaPlataforma * 4) },
    { label: 'Eventos realizados', value: Math.min(100, terreiro.hub.totalEventos * 12) },
    { label: 'Projetos sociais', value: Math.min(100, terreiro.hub.totalAcoes * 18) },
    { label: 'Avaliações verificadas', value: Math.min(100, terreiro.hub.totalAvaliacoes * 8) },
  ];

  return (
    <section className="section-card" id="confianca">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-success" />
        <h2 className="section-title">Índice de Confiança</h2>
        <span className="tag tag-primary ml-auto">Transparente</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-6">
          <div
            className="flex size-28 items-center justify-center rounded-full p-1.5"
            style={{ background: `conic-gradient(hsl(${hue} 50% 45%) ${ts.score}%, var(--color-gray-200) 0)` }}
          >
            <div className="flex size-full items-center justify-center rounded-full bg-card">
              <span className="text-2xl font-extrabold text-foreground">{ts.score}</span>
            </div>
          </div>
          <Badge variant={ts.score >= 60 ? 'success' : ts.score >= 40 ? 'warning' : 'danger'}>{ts.label}</Badge>
          <p className="text-center text-xs text-muted-foreground">
            Composto por verificação, engajamento e participação comunitária.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          {fatores.map((f) => (
            <FatorRow key={f.label} label={f.label} value={f.value} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: CheckCircle2, label: 'Perfil verificado', value: terreiro.isVerified ? 'Sim' : 'Em análise' },
          { icon: Clock, label: 'Tempo médio de resposta', value: terreiro.hub.tempoRespostaDias ? `${terreiro.hub.tempoRespostaDias}d` : '—' },
          { icon: HeartHandshake, label: 'Projetos sociais', value: terreiro.hub.totalAcoes },
          { icon: Users, label: 'Participação comunitária', value: `${terreiro.hub.membros} membros` },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-4 text-center">
              <Icon className="size-5 text-copper" />
              <div className="text-sm font-semibold text-card-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Award className="mt-0.5 size-4 shrink-0 text-copper" />
        Explicamos a composição do índice com clareza, sem revelar o modelo exato para impedir manipulação.
      </p>
    </section>
  );
}