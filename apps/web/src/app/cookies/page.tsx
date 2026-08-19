import type { Metadata } from 'next';
import Link from 'next/link';
import '../institucional/legal.css';

export const metadata: Metadata = {
  title: 'Política de Cookies | AxéMap',
  description:
    'Inventário completo de cookies e armazenamento local do AxéMap — o que é armazenado, por quê, e como gerenciar.',
};

export default function CookiesPage() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1>Política de Cookies</h1>
        <p>
          Esta página lista todos os cookies e itens de armazenamento local usados pelo AxéMap,
          com transparência total sobre propósito e duração. Você pode gerenciar suas preferências
          a qualquer momento.
        </p>
      </div>

      <div className="legal-version">Versão 1.0 — data de vigência: 1º de janeiro de 2026</div>

      <nav className="legal-toc" aria-label="Sumário">
        <a href="#o-que-sao">O que são cookies?</a>
        <a href="#inventario">Inventário completo</a>
        <a href="#categorias">Categorias</a>
        <a href="#terceiros">Terceiros</a>
        <a href="#gerenciar">Como gerenciar</a>
        <a href="#contato">Contato</a>
      </nav>

      <div className="legal-body">

        <section className="legal-section" id="o-que-sao">
          <h2>O que são cookies?</h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu dispositivo ao visitar um site.
            O AxéMap também usa o <strong>localStorage</strong> e o <strong>sessionStorage</strong> do navegador
            para salvar preferências e a sessão de forma mais eficiente.
          </p>
        </section>

        <section className="legal-section" id="inventario">
          <h2>Inventário Completo de Armazenamento</h2>
          <p>
            Abaixo estão <strong>todos</strong> os itens de armazenamento encontrados no código-fonte da
            plataforma auditado em julho de 2026.
          </p>

          <h3>localStorage</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Chave</th>
                <th style={{ padding: '6px 8px' }}>Categoria</th>
                <th style={{ padding: '6px 8px' }}>Propósito</th>
                <th style={{ padding: '6px 8px' }}>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>axemap:cookie-consent</td>
                <td style={{ padding: '6px 8px' }}>Essencial</td>
                <td style={{ padding: '6px 8px' }}>Armazena as preferências de consentimento de cookies do usuário</td>
                <td style={{ padding: '6px 8px' }}>Permanente (até remoção manual)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>axemap_auth</td>
                <td style={{ padding: '6px 8px' }}>Essencial</td>
                <td style={{ padding: '6px 8px' }}>Armazena os tokens JWT (accessToken + refreshToken) para manter a sessão autenticada</td>
                <td style={{ padding: '6px 8px' }}>Até logout ou 7 dias (expiração do refreshToken)</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: '1.5rem' }}>sessionStorage</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Chave</th>
                <th style={{ padding: '6px 8px' }}>Categoria</th>
                <th style={{ padding: '6px 8px' }}>Propósito</th>
                <th style={{ padding: '6px 8px' }}>Duração</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>axemap_session</td>
                <td style={{ padding: '6px 8px' }}>Essencial / Analytics</td>
                <td style={{ padding: '6px 8px' }}>ID de sessão anônimo (UUID gerado localmente) para analytics interno agregado — sem PII</td>
                <td style={{ padding: '6px 8px' }}>Até fechar o navegador (sessionStorage)</td>
              </tr>
            </tbody>
          </table>

          <h3 style={{ marginTop: '1.5rem' }}>Cookies HTTP</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Nome</th>
                <th style={{ padding: '6px 8px' }}>Categoria</th>
                <th style={{ padding: '6px 8px' }}>Propósito</th>
                <th style={{ padding: '6px 8px' }}>Atributos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>axemap_auth</td>
                <td style={{ padding: '6px 8px' }}>Essencial</td>
                <td style={{ padding: '6px 8px' }}>Flag de sessão ativa (valor &quot;1&quot; ou vazio) — usado pelo servidor para detectar se o usuário está logado</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '0.75rem' }}>samesite=lax; secure (HTTPS); max-age=7d</td>
              </tr>
            </tbody>
          </table>

          <div className="legal-note" style={{ marginTop: '1rem' }}>
            <strong>Trackers de terceiros:</strong> O AxéMap <strong>não utiliza</strong> cookies de rastreamento
            de terceiros (Google Analytics, Facebook Pixel, etc.) na versão atual. Analytics é processado
            internamente com dados pseudonimizados.
          </div>
        </section>

        <section className="legal-section" id="categorias">
          <h2>Categorias de Cookies</h2>

          <h3>Essenciais</h3>
          <p>
            Necessários para o funcionamento básico da plataforma. Incluem autenticação, segurança e
            preferências de consentimento. Não podem ser desativados.
          </p>

          <h3>Analytics (opcionais)</h3>
          <p>
            Dados agregados sobre como você usa o site — páginas visitadas, duração da sessão.
            Nenhum dado pessoal identificável é transmitido para terceiros. Processados internamente.
            Podem ser desativados no painel de preferências.
          </p>

          <h3>Publicidade — AxéMap ADS (opcionais)</h3>
          <p>
            Usados para exibir anúncios <strong>PATROCINADOS</strong> relevantes ao seu perfil geográfico.
            Publicidade <strong>nunca altera</strong> Trust Score, verificação ou posição orgânica das casas de axé.
            Podem ser desativados no painel de preferências.
          </p>

          <h3>Preferências (opcionais)</h3>
          <p>
            Salvam seu idioma, tema (claro/escuro) e localização preferidos.
            Podem ser desativados, mas algumas preferências precisarão ser reconfiguradas a cada visita.
          </p>
        </section>

        <section className="legal-section" id="terceiros">
          <h2>Terceiros</h2>
          <p>
            Na versão atual auditada (julho de 2026), <strong>nenhum script de terceiro</strong> é carregado
            automaticamente. Qualquer script futuro de terceiro só será carregado após consentimento
            explícito na categoria correspondente, usando o componente
            {' '}<code>ConsentScriptLoader</code> que bloqueia o carregamento antes do aceite.
          </p>
          <p>
            Serviços de infraestrutura (hospedagem, armazenamento) processam dados conforme descrito na{' '}
            <Link href="/privacidade" style={{ textDecoration: 'underline' }}>Política de Privacidade</Link>.
          </p>
        </section>

        <section className="legal-section" id="gerenciar">
          <h2>Como Gerenciar seus Cookies</h2>

          <h3>No AxéMap</h3>
          <p>
            Clique em <strong>&ldquo;Preferências de privacidade&rdquo;</strong> no rodapé desta página ou acesse sua{' '}
            <Link href="/meus-dados" style={{ textDecoration: 'underline' }}>Central de Privacidade</Link>{' '}
            para gerenciar cookies, exportar dados ou revogar consentimentos.
          </p>

          <h3>No seu navegador</h3>
          <p>Você pode gerenciar ou excluir cookies diretamente no seu navegador:</p>
          <ul>
            <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
            <li><strong>Firefox:</strong> Preferências → Privacidade e Segurança</li>
            <li><strong>Safari:</strong> Preferências → Privacidade</li>
            <li><strong>Edge:</strong> Configurações → Cookies e permissões de site</li>
          </ul>
          <p>
            Ao limpar cookies essenciais, você precisará fazer login novamente e reconfigurar preferências.
          </p>
        </section>

        <section className="legal-section" id="contato">
          <h2>Contato</h2>
          <p>
            Dúvidas sobre cookies ou privacidade:{' '}
            <strong>privacidade@axemap.com.br</strong> — respondemos em até 15 dias úteis.
          </p>
        </section>

      </div>
    </div>
  );
}
