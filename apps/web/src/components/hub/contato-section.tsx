import type { TerreiroPerfil } from '@/types/terreiro';
import { MessageCircle, Phone, Mail, Globe, AtSign, Share2, CalendarClock } from 'lucide-react';

export function ContatoSection({ terreiro }: { terreiro: TerreiroPerfil }) {
  const links = [
    terreiro.whatsapp && {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: `https://wa.me/55${terreiro.whatsapp.replace(/\D/g, '')}`,
    },
    terreiro.telefone && { icon: Phone, label: 'Telefone', href: `tel:${terreiro.telefone}` },
    terreiro.email && { icon: Mail, label: 'E-mail', href: `mailto:${terreiro.email}` },
    terreiro.website && { icon: Globe, label: 'Site', href: terreiro.website },
    terreiro.instagram && { icon: AtSign, label: 'Instagram', href: `https://instagram.com/${terreiro.instagram.replace('@', '')}` },
    terreiro.facebook && { icon: Share2, label: 'Facebook', href: terreiro.facebook },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string }[];

  return (
    <section className="section-card" id="contato">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-copper" />
        <h2 className="section-title">Contato</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-copper/40 hover:bg-copper-soft/10"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-copper-soft text-copper-strong">
                <Icon className="size-5" />
              </span>
              <span className="truncate text-sm font-semibold text-card-foreground">{l.label}</span>
            </a>
          );
        })}
      </div>

      {terreiro.horarioFuncionamento && (
        <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-copper" />
          <span className="whitespace-pre-line">{terreiro.horarioFuncionamento}</span>
        </p>
      )}
    </section>
  );
}