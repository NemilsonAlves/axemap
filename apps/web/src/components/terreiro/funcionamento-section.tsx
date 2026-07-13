import type { TerreiroPerfil } from '@/types/terreiro';

export function FuncionamentoSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  if (!terreiro.horarioFuncionamento) return null;

  let horarios: Record<string, string> = {};
  try {
    horarios = JSON.parse(terreiro.horarioFuncionamento);
  } catch {
    horarios = { 'Horário': terreiro.horarioFuncionamento };
  }

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <section className="section-card" id="funcionamento">
      <h2 className="section-title">Funcionamento</h2>
      <div className="horarios-grid">
        {diasSemana.map((dia) => {
          const chave = dia.toLowerCase();
          const valor = horarios[chave] || horarios[dia] || '';
          return (
            <div key={dia} className={`horario-row ${!valor ? 'fechado' : ''}`}>
              <span className="horario-dia">{dia}</span>
              <span className="horario-valor">{valor || 'Fechado'}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
