import type { TerreiroPerfil } from '@/types/terreiro';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Scale, ShieldCheck, FileCheck2, History, ArrowRight } from 'lucide-react';

export function GovernancaSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const g = terreiro.governanca;

  return (
    <section className="section-card" id="governanca">
      <div className="flex items-center gap-2">
        <Scale className="size-5 text-copper" />
        <h2 className="section-title">Governança & Transparência</h2>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <ShieldCheck className="mt-0.5 size-5 text-success" />
          <div>
            <div className="text-sm font-semibold text-card-foreground">Perfil verificado</div>
            <p className="text-xs text-muted-foreground">
              {g.verificado ? 'Identidade validada pela plataforma.' : 'Identidade em processo de validação.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <FileCheck2 className="mt-0.5 size-5 text-copper" />
          <div>
            <div className="text-sm font-semibold text-card-foreground">Documentação validada</div>
            <p className="text-xs text-muted-foreground">
              {g.documentosValidos} documento(s) validado(s) para garantir a legitimidade da casa.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 sm:col-span-2">
          <History className="mt-0.5 size-5 text-copper" />
          <div>
            <div className="text-sm font-semibold text-card-foreground">Nível de verificação</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Nível atual: <strong className="text-card-foreground">{g.nivelVerificacao ?? '—'}</strong>. Alterações
              relevantes do perfil são registradas para fins de auditoria e direito de resposta.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">Histórico de alterações</Badge>
              <Badge variant="outline">Mediações concluídas</Badge>
              <Badge variant="outline">Direito de resposta</Badge>
              <Badge variant="outline">Políticas da comunidade</Badge>
            </div>
          </div>
        </div>

        <Link
          href={`/transparencia/${terreiro.slug}`}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2"
        >
          <FileCheck2 className="size-4" />
          Central de Transparência
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}