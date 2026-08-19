import type { Metadata } from 'next';
import Link from 'next/link';
import '../institucional/legal.css';

export const metadata: Metadata = {
  title: 'Governança | AxéMap',
  description: 'Modelo de governança do AxéMap: verificação, mediação, certificação e índice de confiança com transparência.',
};

export default function GovernancaPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Governança</h1>
        <p>
          Como o AxéMap decide, mede e garante a confiança na plataforma — com transparência, devido processo e direito de resposta.
        </p>
      </div>

      <div className="legal-body">
        <section className="legal-section">
          <h2>Confiança com método</h2>
          <p>
            O Índice de Confiança (Trust Score) não é uma nota subjetiva. Ele combina sinais objetivos e auditáveis:
            verificação documental, transparência do perfil, presença e atividade, governança e histórico da comunidade.
            Cada fator é explicável e visível no perfil público.
          </p>
        </section>

        <section className="legal-section">
          <h2>Verificação</h2>
          <ul>
            <li>Solicitação com envio de evidências documentais.</li>
            <li>Análise por equipe humana com apoio de IA assistida (nunca decisão automática).</li>
            <li>Acompanhamento do status em tempo real no painel do dirigente.</li>
            <li>Revogação possível mediante reanálise, com direito a recurso.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Mediação e direito de resposta</h2>
          <p>
            Conflitos entre usuários, terreiros e avaliadores passam por um fluxo de mediação estruturado: registro, análise,
            resposta das partes, decisão e histórico. Nenhuma decisão importante é tomada à revelia da pessoa afetada.
          </p>
        </section>

        <section className="legal-section">
          <h2>Certificação</h2>
          <p>
            Certificações concedidas pelo AxéMap possuem requisitos públicos, validade e renovação periódica, e página pública
            verificável por código ou QR Code. Selos só são exibidos quando efetivamente concedidos — nunca como sugestão.
          </p>
        </section>

        <section className="legal-section">
          <h2>Transparência das decisões</h2>
          <p>
            Métricas agregadas de moderação, mediação e verificação são publicadas em{' '}
            <Link href="/transparencia" style={{ textDecoration: 'underline' }}>Transparência</Link> para que a comunidade acompanhe
            como a plataforma governa a si mesma.
          </p>
        </section>

        <section className="legal-section">
          <h2>Denúncias</h2>
          <ul>
            <li>Denúncias são confidenciais e nunca expõem o denunciante publicamente.</li>
            <li>Toda denúncia gera protocolo, evidências, análise e decisão.</li>
            <li>Denúncia falsa ou abusiva pode resultar em sanções ao autor.</li>
          </ul>
          <div className="legal-note">
            Achou algo errado? Acesse a{' '}
            <Link href="/protecao" style={{ textDecoration: 'underline' }}>Central de Proteção AxéMap</Link> para
            registrar uma denúncia com protocolo — também disponível nos perfis e conteúdos.
          </div>
        </section>
      </div>
    </div>
  );
}
