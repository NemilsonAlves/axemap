'use client';

import Link from 'next/link';
import { SectionHeading } from './section-heading';
import { Reveal } from './reveal';
import { CalendarDays, Users, ArrowRight } from 'lucide-react';
import { tradicaoLabel, type HomeData } from './data';
import { useI18n } from '@/lib/i18n/i18n-context';

// Static lookup avoids toLocaleString() which can differ between
// Node.js (server) and browser ICU data — causing hydration mismatches.
const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
                   'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function isHoje(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isAmanha(iso: string) {
  const d = new Date(iso);
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return d.toDateString() === amanha.toDateString();
}

export function HomeEvents({ data }: { data: HomeData }) {
  const { formatNumber } = useI18n();
  const eventos = data.eventosAlta.slice(0, 6);

  if (!eventos.length) return null;

  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="eventos-titulo">
      <Reveal>
        <SectionHeading
          eyebrow="Eventos"
          id="eventos-titulo"
          title="Viva a tradição, não só leia sobre ela"
          description="Giras, festas, encontros e celebrações abertos. Descubra o que está acontecendo perto de você."
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {eventos.map((ev, i) => {
          const data = new Date(ev.dataInicio);
          const dia = data.getDate();
          // Static array lookup — guaranteed identical on server and client.
          const mes = MESES_PT[data.getMonth()];
          const hoje = isHoje(ev.dataInicio);
          const amanha = isAmanha(ev.dataInicio);
          return (
            <Reveal key={ev.id ?? i} delay={i * 0.05}>
              <Link
                href={`/terreiro/${ev.terreiroSlug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-copper/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-copper-soft/70 text-copper-strong">
                    <span className="font-display text-xl font-bold leading-none">{dia}</span>
                    <span className="text-[11px] font-medium capitalize leading-tight">{mes}</span>
                  </div>
                  {(hoje || amanha) && (
                    <span className="rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {hoje ? 'Hoje' : 'Amanhã'}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-copper-strong">
                  {ev.titulo}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ev.terreiroNome}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {tradicaoLabel(ev.tipo)} · {ev.cidade}, {ev.estado}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden="true" />
                    {formatNumber(ev.totalPresencas)} {ev.totalPresencas === 1 ? 'presença' : 'presenças'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-copper">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Ver evento
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-10 flex justify-center">
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 rounded-full border border-copper/30 bg-copper-soft/40 px-5 py-2.5 text-sm font-semibold text-copper-strong transition-colors hover:bg-copper-soft/70"
        >
          Ver todos os eventos
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}
