import type { Curso } from '@/types/terreiro';
import { MatricularButton } from '@/components/terreiro/matricular-button';

export function CursosSection({ cursos }: { cursos: Curso[] }) {
  if (cursos.length === 0) return null;

  return (
    <section className="section-card" id="cursos">
      <h2 className="section-title">Cursos</h2>
      <div className="cursos-lista">
        {cursos.map((curso) => (
          <div key={curso.id} className="curso-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <h3 className="curso-titulo">{curso.titulo}</h3>
                {curso.descricao && <p className="curso-desc">{curso.descricao}</p>}
                <div className="curso-meta">
                  {curso.modalidade && <span className="tag">{curso.modalidade}</span>}
                  {curso.cargaHoraria && <span className="tag">{curso.cargaHoraria}h</span>}
                  {curso.vagas && <span className="tag">{curso.vagas} vagas</span>}
                </div>
              </div>
              <MatricularButton cursoId={curso.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
