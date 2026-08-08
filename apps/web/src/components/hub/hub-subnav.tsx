'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { TerreiroPerfil } from '@/types/terreiro';
import { Menu, X } from 'lucide-react';

const ITENS = [
  { id: 'historia', label: 'História' },
  { id: 'lideranca', label: 'Liderança' },
  { id: 'confianca', label: 'Confiança' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'cursos', label: 'Cursos' },
  { id: 'impacto', label: 'Impacto' },
  { id: 'acoes-sociais', label: 'Projetos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'como-chegar', label: 'Como chegar' },
  { id: 'comunidade', label: 'Comunidade' },
  { id: 'governanca', label: 'Governança' },
  { id: 'ia-comunidade', label: 'IA' },
  { id: 'contato', label: 'Contato' },
];

export function HubSubnav({ terreiro }: { terreiro: TerreiroPerfil }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  function ir(id: string) {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      toast({ title: 'Seção em breve', description: 'Esta área ainda está sendo estruturada.' });
    }
  }

  function visitar() {
    setOpen(false);
    toast({
      title: 'Solicitação de visita',
      description: `Seu interesse em visitar ${terreiro.nome} foi registrado. Entraremos em contato.`,
      variant: 'success',
    });
  }

  return (
    <nav className="hub-subnav">
      <div className="hub-subnav-inner">
        <div className="hub-subnav-scroll">
          {ITENS.map((item) => (
            <button key={item.id} onClick={() => ir(item.id)} className="hub-subnav-link">
              {item.label}
            </button>
          ))}
        </div>
        <button onClick={visitar} className="hub-subnav-cta">
          Solicitar visita
        </button>
        <button
          className="hub-subnav-toggle"
          aria-label="Abrir navegação"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="hub-subnav-mobile">
          {ITENS.map((item) => (
            <button key={item.id} onClick={() => ir(item.id)} className="hub-subnav-mobile-link">
              {item.label}
            </button>
          ))}
          <button onClick={visitar} className="hub-subnav-cta">
            Solicitar visita
          </button>
        </div>
      )}
    </nav>
  );
}