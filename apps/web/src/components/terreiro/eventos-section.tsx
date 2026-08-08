import type { Evento } from '@/types/terreiro';
import { PresencaButton } from './presenca-button';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const tipoLabels: Record<string, string> = {
  GIRA: 'Gira',
  TOQUE: 'Toque',
  FESTA_RELIGIOSA: 'Festa Religiosa',
  PALESTRA: 'Palestra',
  CURSO: 'Curso',
  DESENVOLVIMENTO_MEDIUNICO: 'Desenvolvimento Mediúnico',
  ACAO_SOCIAL: 'Ação Social',
};

export function EventosSection({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) return null;

  return (
    <section className="section-card" id="eventos">
      <h2 className="section-title">Próximos Eventos</h2>
      <div className="eventos-lista">
        {eventos.map((evento) => (
          <div key={evento.id} className="evento-card">
            <div className="evento-data">
              <span className="evento-dia">{new Date(evento.dataInicio).getDate()}</span>
              <span className="evento-mes">
                {new Date(evento.dataInicio).toLocaleDateString('pt-BR', { month: 'short' })}
              </span>
            </div>
            <div className="evento-info">
              <h3 className="evento-titulo">{evento.titulo}</h3>
              <span className="tag">{tipoLabels[evento.tipo] || evento.tipo}</span>
              {evento.descricao && <p className="evento-desc">{evento.descricao}</p>}
            </div>
            <PresencaButton eventoId={evento.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
