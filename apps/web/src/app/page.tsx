import Link from 'next/link';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Conecte-se com as tradições</h1>
        <p className="hero-subtitle">
          Encontre terreiros, eventos e comunidades de religiões afro-brasileiras perto de você.
        </p>
        <div className="hero-actions">
          <Link href="/busca" className="btn btn-primary">
            Buscar Terreiros
          </Link>
          <Link href="/cadastro" className="btn btn-secondary">
            Cadastrar Terreiro
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Encontre Terreiros</h3>
          <p>Busque por tradição, cidade ou localização.</p>
        </div>
        <div className="feature-card">
          <h3>Avalie com Confiança</h3>
          <p>Trust Score transparente baseado em verificações.</p>
        </div>
        <div className="feature-card">
          <h3>Conecte-se</h3>
          <p>Participe de eventos e encontre sua comunidade.</p>
        </div>
      </section>
    </div>
  );
}
