import type { Metadata } from 'next';
import Link from 'next/link';
import '../institucional/legal.css';

export const metadata: Metadata = {
  title: 'Termos de Uso | AxéMap',
  description: 'Termos de uso da plataforma AxéMap — direitos, deveres e responsabilidades de quem utiliza o ecossistema.',
};

export default function TermosPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Termos de Uso</h1>
        <p>
          O AxéMap é uma infraestrutura digital da comunidade de religiões de matriz africana.
          Estes termos definem as regras de uso da plataforma com respeito, transparência e segurança.
        </p>
      </div>

      <div className="legal-version">Versão 1.0 — data de vigência: 1º de janeiro de 2026</div>

      <nav className="legal-toc" aria-label="Sumário">
        <a href="#1">1. Aceitação</a>
        <a href="#2">2. Cadastro e conta</a>
        <a href="#3">3. Conteúdo e conduta</a>
        <a href="#4">4. Terreiros e dirigentes</a>
        <a href="#5">5. Avaliações e denúncias</a>
        <a href="#6">6. Verificação e Trust Score</a>
        <a href="#7">7. Planos e pagamentos</a>
        <a href="#8">8. Privacidade e dados</a>
        <a href="#9">9. Limitação de responsabilidade</a>
        <a href="#10">10. Suspensão e exclusão</a>
        <a href="#11">11. Contato</a>
      </nav>

      <div className="legal-body">
        <section className="legal-section" id="1">
          <h2>1. Aceitação dos termos</h2>
          <p>
            Ao acessar ou utilizar o AxéMap, você concorda com estes Termos de Uso e com a nossa{' '}
            <Link href="/privacidade" style={{ textDecoration: 'underline' }}>Política de Privacidade</Link>.
            Se você não concordar com qualquer parte destes termos, não utilize a plataforma.
          </p>
        </section>

        <section className="legal-section" id="2">
          <h2>2. Cadastro e conta</h2>
          <ul>
            <li>Você deve ter 18 anos ou mais para criar uma conta, ou estar representado por responsável legal.</li>
            <li>As informações fornecidas no cadastro devem ser verdadeiras e mantidas atualizadas.</li>
            <li>Você é responsável pela confidencialidade das suas credenciais e por todas as atividades na sua conta.</li>
            <li>O AxéMap pode recusar ou suspender contas que violem estes termos ou que apresentem indícios de fraude.</li>
          </ul>
        </section>

        <section className="legal-section" id="3">
          <h2>3. Conteúdo e conduta</h2>
          <p>Ao publicar conteúdo na plataforma, você declara que tem direito de fazê-lo e que ele não viola direitos de terceiros.</p>
          <ul>
            <li>É proibido publicar conteúdo ofensivo, discriminatório, fraudulento ou que incite ódio.</li>
            <li>É proibido usar a plataforma para assédio, perseguição ou exposição não autorizada de pessoas.</li>
            <li>É proibido reproduzir, de forma não autorizada, símbolos, liturgias, saberes e imagens sagradas fora do contexto de respeito ao qual se destinam.</li>
            <li>O AxéMap pode remover conteúdo que viole estes termos, com aviso quando aplicável e direito de contestação.</li>
          </ul>
        </section>

        <section className="legal-section" id="4">
          <h2>4. Terreiros e dirigentes</h2>
          <p>
            A reivindicação de um perfil de terreiro exige comprovação de vínculo. Informações publicadas sobre um terreiro devem
            respeitar suas práticas, sua tradição e a privacidade dos seus membros. O AxéMap nunca afirma ser porta-voz de nenhuma
            tradição ou casa.
          </p>
        </section>

        <section className="legal-section" id="5">
          <h2>5. Avaliações e denúncias</h2>
          <ul>
            <li>Avaliações devem ser honestas, baseadas em experiência própria e não podem conter ataques pessoais.</li>
            <li>Denúncias são analisadas com confidencialidade; denúncias falsas podem levar à suspensão.</li>
            <li>Todo denunciado tem direito de resposta e ao devido processo dentro da plataforma.</li>
          </ul>
        </section>

        <section className="legal-section" id="6">
          <h2>6. Verificação e Trust Score</h2>
          <p>
            Selos de verificação e o Índice de Confiança refletem sinais verificados pela plataforma naquela data. Nenhum índice é garantia
            de conduta futura. Selos e certificações são concedidos mediante processo documentado e podem ser revogados.
          </p>
        </section>

        <section className="legal-section" id="7">
          <h2>7. Planos e pagamentos</h2>
          <p>
            Assinaturas e pagamentos são regidos pelos termos do plano contratado, por estas regras e pela legislação aplicável (CDC).
            Cobranças são processadas por operadoras de pagamento independentes; o AxéMap não armazena dados de cartão.
          </p>
        </section>

        <section className="legal-section" id="8">
          <h2>8. Privacidade e dados</h2>
          <p>
            O tratamento de dados pessoais segue a{' '}
            <Link href="/privacidade" style={{ textDecoration: 'underline' }}>Política de Privacidade</Link> em conformidade com a LGPD.
          </p>
        </section>

        <section className="legal-section" id="9">
          <h2>9. Limitação de responsabilidade</h2>
          <p>
            O AxéMap atua como plataforma de conexão e informação. Não somos responsáveis por atos, serviços ou condutas de terceiros,
            incluindo terreiros, educadores, artesãos e vendedores. Use seu discernimento e denuncie irregularidades.
          </p>
        </section>

        <section className="legal-section" id="10">
          <h2>10. Suspensão e exclusão</h2>
          <p>
            Contas podem ser suspensas em caso de violação grave destes termos, garantido o contraditório. Você pode solicitar a exclusão
            da sua conta a qualquer momento; seus dados serão tratados conforme a legislação aplicável.
          </p>
        </section>

        <section className="legal-section" id="11">
          <h2>11. Contato</h2>
          <div className="legal-contact">
            <strong>Dúvidas sobre estes termos?</strong>
            <span>Fale com nosso time: <a href="mailto:contato@axemap.com.br">contato@axemap.com.br</a></span>
          </div>
        </section>
      </div>
    </div>
  );
}
