import type { Metadata } from 'next';
import { JsonLd, websiteSchema } from '@/lib/seo/json-ld';
import { ProtecaoFormulario } from './protecao-formulario';
import { Shield, AlertTriangle, Phone, Scale, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Central de Proteção — AxéMap',
  description:
    'Reporte situações de intolerância religiosa, perfis falsos, assédio, exposição indevida, uso indevido da marca AxéMap e outras violações. Toda denúncia é tratada com sigilo.',
  alternates: { canonical: 'https://axemap.com.br/protecao' },
  openGraph: {
    title: 'Central de Proteção — AxéMap',
    description: 'Proteja sua comunidade. Reporte intolerância religiosa e violações na plataforma.',
    locale: 'pt_BR',
    siteName: 'AxéMap',
  },
  robots: { index: true, follow: true },
};

const CANAIS_EXTERNOS = [
  {
    nome: 'Ouvidoria Nacional de Direitos Humanos',
    descricao: 'Ligue 100 — Canal gratuito 24h para denúncias de violações de direitos humanos.',
    href: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/ouvidoria',
    fone: '100',
    icon: Phone,
    cor: 'hsl(var(--azul-atlantico))',
  },
  {
    nome: 'Ministério da Igualdade Racial',
    descricao: 'Políticas públicas para comunidades de terreiro, quilombolas e povos tradicionais.',
    href: 'https://www.gov.br/igualdaderacial/pt-br',
    icon: Scale,
    cor: 'hsl(var(--verde-floresta))',
  },
  {
    nome: 'SEPPIR — Secretaria de Políticas de Promoção da Igualdade Racial',
    descricao: 'Denúncias de racismo e discriminação racial.',
    href: 'https://www.gov.br/mdh/pt-br',
    icon: HeartHandshake,
    cor: 'hsl(var(--roxo-ancestral))',
  },
  {
    nome: 'Safernet Brasil',
    descricao: 'Denúncias de crimes e violações de direitos humanos na internet.',
    href: 'https://new.safernet.org.br/denuncie',
    icon: Shield,
    cor: 'hsl(var(--terracota))',
  },
];

const CATEGORIAS = [
  { id: 'intolerancia_religiosa', label: '⚡ Intolerância religiosa' },
  { id: 'perfil_falso', label: '👤 Perfil falso ou fraude' },
  { id: 'assedio', label: '🚫 Assédio ou ameaça' },
  { id: 'exposicao_indevida', label: '📍 Exposição indevida de localização' },
  { id: 'uso_indevido_marca', label: '®️ Uso indevido da marca AxéMap' },
  { id: 'violacao_privacidade', label: '🔒 Violação de privacidade' },
  { id: 'conteudo_ofensivo', label: '⛔ Conteúdo ofensivo' },
  { id: 'golpe', label: '💸 Tentativa de golpe ou fraude financeira' },
  { id: 'outro', label: '📋 Outro' },
];

export default function ProtecaoPage() {
  return (
    <>
      <JsonLd data={websiteSchema()} />

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-border"
        style={{ background: 'hsl(var(--obsidiana))' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 600px 400px at 80% -10%, hsl(var(--terracota)/0.25), transparent 55%)',
              'radial-gradient(ellipse 500px 350px at -5% 110%, hsl(var(--roxo-ancestral)/0.20), transparent 55%)',
            ].join(', '),
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: 'linear-gradient(90deg, hsl(var(--terracota)), hsl(var(--acafrao)), hsl(var(--verde-floresta)), hsl(var(--azul-atlantico)))' }}
          aria-hidden="true"
        />
        <div className="container-page relative py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ borderColor: 'hsl(var(--terracota)/0.40)', color: 'hsl(var(--terracota))', background: 'hsl(var(--terracota)/0.10)' }}
          >
            <Shield className="size-3.5" aria-hidden="true" />
            Central de Proteção
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-black tracking-tight md:text-5xl"
            style={{ color: 'hsl(var(--marfim))' }}
          >
            Proteja sua casa.{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--terracota)))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Proteja sua comunidade.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed md:text-lg"
            style={{ color: 'hsl(var(--marfim)/0.72)' }}
          >
            O AxéMap leva a sério a proteção das comunidades de terreiro e templos.
            Reporte intolerância religiosa, perfis falsos, assédio, exposição indevida
            ou qualquer violação — com <strong style={{ color: 'hsl(var(--marfim))' }}>total sigilo</strong>.
            Nunca revelamos quem denunciou.
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-2xl border p-3 max-w-xl"
            style={{ borderColor: 'hsl(var(--warning)/0.30)', background: 'hsl(var(--warning)/0.08)' }}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: 'hsl(var(--warning))' }} aria-hidden="true" />
            <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--marfim)/0.70)' }}>
              <strong style={{ color: 'hsl(var(--marfim))' }}>Emergência?</strong>{' '}
              Em situações de risco imediato, ligue <strong>190 (Polícia)</strong> ou <strong>100 (Direitos Humanos)</strong> antes de usar este formulário.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr]">
        {/* Formulário */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Registrar ocorrência</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua denúncia receberá um protocolo e será analisada pela equipe AxéMap.
            Prazos: triagem em até 48h, análise em até 7 dias úteis.
          </p>
          <ProtecaoFormulario categorias={CATEGORIAS} />
        </div>

        {/* Canais externos */}
        <aside className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Canais externos de apoio</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Para violações graves, use também os canais oficiais do governo.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {CANAIS_EXTERNOS.map((c) => (
              <a
                key={c.nome}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 transition hover:border-[hsl(var(--copper)/0.40)] hover:shadow-sm"
              >
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${c.cor}18` }}
                >
                  <c.icon className="size-4" style={{ color: c.cor }} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-card-foreground">{c.nome}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.descricao}</p>
                  {c.fone && (
                    <p className="mt-1.5 text-xs font-bold" style={{ color: c.cor }}>
                      ☎ {c.fone}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Dicas úteis — inspirado na imagem */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-base font-bold text-card-foreground">Dicas úteis</h3>
            <div className="mt-3 h-0.5 w-8 rounded-full bg-copper" aria-hidden="true" />
            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                { label: 'Ministério da Igualdade Racial', href: 'https://www.gov.br/igualdaderacial/pt-br' },
                { label: 'Políticas — Povos e Comunidades Tradicionais', href: 'https://www.gov.br/mdh/pt-br/navegue-por-temas/povos-e-comunidades-tradicionais' },
                { label: 'Ouvidoria Nacional de Direitos Humanos', href: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/ouvidoria' },
                { label: 'Cadastro Nacional de Pontos de Cultura', href: 'https://mapas.cultura.gov.br' },
                { label: 'INRC — Inventário Nacional de Referências Culturais', href: 'https://www.gov.br/iphan/pt-br' },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground underline underline-offset-2 transition hover:text-copper-strong"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
