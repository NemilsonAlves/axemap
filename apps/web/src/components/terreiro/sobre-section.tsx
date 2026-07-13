import type { TerreiroPerfil } from '@/types/terreiro';

export function SobreSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const hasContent = terreiro.descricaoLonga || terreiro.anoFundacao || terreiro.linhagem;

  if (!hasContent) return null;

  return (
    <section className="section-card" id="sobre">
      <h2 className="section-title">Sobre</h2>

      {terreiro.descricaoLonga && (
        <p className="sobre-texto">{terreiro.descricaoLonga}</p>
      )}

      <div className="sobre-info">
        {terreiro.anoFundacao && (
          <div className="info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Fundado em <strong>{terreiro.anoFundacao}</strong></span>
          </div>
        )}
        {terreiro.linhagem && (
          <div className="info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Linhagem: <strong>{terreiro.linhagem}</strong></span>
          </div>
        )}
        {terreiro.dirigente && (
          <div className="info-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Dirigente: <strong>{terreiro.dirigente.nome}</strong></span>
          </div>
        )}
      </div>
    </section>
  );
}
