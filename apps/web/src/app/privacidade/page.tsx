import type { Metadata } from 'next';
import Link from 'next/link';
import '../institucional/legal.css';

export const metadata: Metadata = {
  title: 'Política de Privacidade | AxéMap',
  description: 'Política de privacidade (LGPD) do AxéMap — como tratamos dados pessoais com transparência e respeito.',
};

export default function PrivacidadePage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Política de Privacidade</h1>
        <p>
          O respeito à sua privacidade é parte do compromisso do AxéMap com a confiança. Esta política explica, de forma clara,
          quais dados coletamos, por quê e como você os controla — em conformidade com a LGPD.
        </p>
      </div>

      <div className="legal-version">Versão 1.0 — data de vigência: 1º de janeiro de 2026</div>

      <nav className="legal-toc" aria-label="Sumário">
        <a href="#1">1. Controlador e contato</a>
        <a href="#2">2. Dados coletados</a>
        <a href="#3">3. Finalidades e bases legais</a>
        <a href="#4">4. Compartilhamento</a>
        <a href="#5">5. Dados sensíveis e religiosos</a>
        <a href="#6">6. Seus direitos</a>
        <a href="#7">7. Cookies e tecnologia</a>
        <a href="#8">8. Retenção</a>
        <a href="#9">9. Segurança</a>
        <a href="#10">10. Alterações</a>
      </nav>

      <div className="legal-body">
        <section className="legal-section" id="1">
          <h2>1. Controlador e contato</h2>
          <p>
            O AxéMap é o controlador dos dados pessoais tratados na plataforma. Dúvidas sobre esta política:
            <strong> privacidade@axemap.com.br</strong> ou pelo correio indicado na plataforma.
          </p>
        </section>

        <section className="legal-section" id="2">
          <h2>2. Dados coletados</h2>
          <ul>
            <li><strong>Cadastro:</strong> nome, e-mail e senha (criptografada).</li>
            <li><strong>Perfil:</strong> foto, localização, tradição, conteúdo que você publica.</li>
            <li><strong>Uso:</strong> interações com busca, mapa, eventos, avaliações e preferências.</li>
            <li><strong>Técnicos:</strong> endereço IP, tipo de navegador e dados anônimos de diagnóstico.</li>
          </ul>
        </section>

        <section className="legal-section" id="3">
          <h2>3. Finalidades e bases legais</h2>
          <ul>
            <li>Execução do contrato: criar sua conta e entregar os serviços que você usa.</li>
            <li>Interesse legítimo: segurança, prevenção a fraude e melhoria da plataforma.</li>
            <li>Consentimento: comunicações, ofertas e funcionalidades opcionais.</li>
            <li>Obrigação legal: cumprimento da legislação e de ordens judiciais.</li>
          </ul>
        </section>

        <section className="legal-section" id="4">
          <h2>4. Compartilhamento</h2>
          <p>
            Seus dados não são vendidos. Compartilhamos dados apenas com processadores essenciais (hospedagem, e-mail, pagamento),
            sempre sob contrato e com as mesmas garantias desta política. Informações públicas que você publicar (como o perfil do seu
            terreiro) ficam visíveis na plataforma conforme sua configuração.
          </p>
        </section>

        <section className="legal-section" id="5">
          <h2>5. Dados sensíveis e religiosos</h2>
          <p>
            Informações sobre pertencimento religioso são reconhecidas como sensíveis pela LGPD. O AxéMap trata esses dados com cuidado
            especial: uso estritamente vinculado à finalidade da plataforma, nunca para discriminação, e sob consentimento explícito
            sempre que aplicável. Você controla o que é público e pode restringir a veiculação a qualquer momento.
          </p>
        </section>

        <section className="legal-section" id="6">
          <h2>6. Seus direitos</h2>
          <p>Você pode, a qualquer momento, solicitar ao AxéMap:</p>
          <ul>
            <li>confirmação da existência de tratamento e acesso aos seus dados;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>portabilidade dos dados, nos termos da lei;</li>
            <li>revogação de consentimento e eliminação definitiva dos dados (direito ao esquecimento).</li>
          </ul>
          <div className="legal-note">
            Para exercer seus direitos, acesse sua conta em <Link href="/perfil" style={{ textDecoration: 'underline' }}>Perfil</Link> →
            Configurações de privacidade, ou escreva para <strong>privacidade@axemap.com.br</strong>. Responderemos em até 15 dias.
          </div>
        </section>

        <section className="legal-section" id="7">
          <h2>7. Cookies e tecnologia</h2>
          <p>
            Usamos cookies essenciais para autenticação e preferências (tema, idioma), e ferramentas anônimas de métrica.
            Você pode desativar cookies no seu navegador; algumas funções podem deixar de funcionar.
          </p>
        </section>

        <section className="legal-section" id="8">
          <h2>8. Retenção</h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa ou enquanto houver obrigação legal. Após exclusão da conta, dados
            pessoais são eliminados ou anonimizados, salvo os que a lei exigir conservar.
          </p>
        </section>

        <section className="legal-section" id="9">
          <h2>9. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais de segurança (criptografia em trânsito e em repouso, controle de acesso, auditoria)
            para proteger seus dados contra acessos não autorizados, perda ou alteração.
          </p>
        </section>

        <section className="legal-section" id="10">
          <h2>10. Alterações</h2>
          <p>
            Esta política pode ser atualizada para refletir mudanças legais ou do produto. Alterações relevantes serão comunicadas na
            plataforma com destaque, e a data de vigência será atualizada.
          </p>
        </section>
      </div>
    </div>
  );
}
