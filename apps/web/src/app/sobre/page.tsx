import type { Metadata } from 'next';
import Link from 'next/link';
import '../institucional/legal.css';

export const metadata: Metadata = {
  title: 'Sobre o AxéMap | Plataforma de Religiões de Matriz Africana',
  description: 'Conheça a missão do AxéMap: infraestrutura digital de descoberta, conexão, confiança e cultura para o ecossistema de religiões de matriz africana.',
};

export default function SobrePage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <div className="legal-hero-stripe" aria-hidden="true" />
        <span className="legal-hero-eyebrow">🌍 Plataforma Digital</span>
        <h1>Sobre o AxéMap</h1>
        <p>
          Uma infraestrutura digital a serviço da tradição: mapa, identidade, confiança, governança, cultura,
          comunidade e serviços para as religiões de matriz africana.
        </p>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>Nossa missão</h2>
          <p>
            O AxéMap nasce para dar ao ecossistema das religiões de matriz africana uma infraestrutura digital própria,
            confiável e culturalmente respeitosa. Não somos um simples guia de endereços: somos uma plataforma de descoberta,
            conexão e fortalecimento da comunidade.
          </p>
        </section>

        <section className="legal-section">
          <h2>O que nos torna diferentes</h2>
          <ul>
            <li><strong>Mapa + significado:</strong> cada terreiro, evento, curso e patrimônio é um ponto no mapa e um nó em um grafo de conhecimento vivo.</li>
            <li><strong>Confiança com transparência:</strong> Trust Score explicável, verificação documentada e governança aberta — nunca um simples &quot;Reclame Aqui&quot;.</li>
            <li><strong>Cultura preservada:</strong> conteúdos, ontologia do domínio e patrimônio tratados com respeito aos saberes tradicionais.</li>
            <li><strong>Tecnologia a serviço da tradição:</strong> produto moderno, acessível e profissional, sem folclorização.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Nossos princípios</h2>
          <ul>
            <li>Respeito e acolhimento como base de toda experiência.</li>
            <li>Transparência sobre dados, verificação e decisões de governança.</li>
            <li>Privacidade e autonomia: você controla o que é público.</li>
            <li>Diversidade de tradições e linhas, sem hierarquia entre casas.</li>
            <li>Melhoria contínua a partir da comunidade.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Um produto construído com a comunidade</h2>
          <p>
            O AxéMap evolui com escuta ativa: feedback, mediação, governança e transparência pública. Conheça nosso modelo de
            governança em <Link href="/governanca" style={{ textDecoration: 'underline' }}>Governança</Link> e nossos números e decisões
            em <Link href="/transparencia" style={{ textDecoration: 'underline' }}>Transparência</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
