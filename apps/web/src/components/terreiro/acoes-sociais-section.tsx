import type { AcaoSocial } from '@/types/terreiro';

export function AcoesSociaisSection({ acoes }: { acoes: AcaoSocial[] }) {
  if (acoes.length === 0) return null;

  return (
    <section className="section-card" id="acoes-sociais">
      <h2 className="section-title">Ações Sociais</h2>
      <div className="acoes-lista">
        {acoes.map((acao) => (
          <div key={acao.id} className="acao-card">
            <h3 className="acao-nome">{acao.nome}</h3>
            {acao.descricao && <p className="acao-desc">{acao.descricao}</p>}
            <div className="acao-meta">
              {acao.tipo && <span className="tag">{acao.tipo}</span>}
              {acao.alcance && <span className="tag">{acao.alcance} pessoas alcançadas</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
