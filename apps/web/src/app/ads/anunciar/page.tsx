'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { api } from '@/lib/api-client';
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';

// Deve corresponder exatamente ao enum AdPlacement no backend
const PLACEMENTS = [
  { value: 'BANNER_HOME',              label: 'Banner Home' },
  { value: 'BANNER_MAPA',              label: 'Banner no Mapa' },
  { value: 'CARD_PATROCINADO',         label: 'Card Patrocinado' },
  { value: 'EVENTO_PATROCINADO',       label: 'Evento Patrocinado' },
  { value: 'CONTEUDO_PATROCINADO',     label: 'Conteúdo Patrocinado' },
  { value: 'PAGINA_INSTITUCIONAL',     label: 'Página Institucional' },
  { value: 'MIDIA_REGIONAL',           label: 'Mídia Regional' },
  { value: 'MIDIA_NACIONAL',           label: 'Mídia Nacional' },
  { value: 'ORGANIZACAO_PATROCINADORA',label: 'Organização Patrocinadora' },
] as const;

// Deve corresponder exatamente ao enum AdCategory no backend
const CATEGORIES = [
  { value: 'CULTURAL',     label: 'Cultural' },
  { value: 'SOCIAL',       label: 'Social' },
  { value: 'EDUCACIONAL',  label: 'Educacional' },
  { value: 'COMERCIAL',    label: 'Comercial' },
  { value: 'INSTITUCIONAL',label: 'Institucional' },
  { value: 'RELIGIOSO',    label: 'Religioso' },
  { value: 'EVENTO',       label: 'Evento' },
  { value: 'PRODUTO',      label: 'Produto' },
  { value: 'SERVICO',      label: 'Serviço' },
] as const;

type Placement = (typeof PLACEMENTS)[number]['value'];
type Category  = (typeof CATEGORIES)[number]['value'];

interface FormState {
  titulo: string;
  placement: Placement | '';
  category: Category | '';
  destinatarioUrl: string;
  textoAnuncio: string;
  orcamentoBRL: string;
  dataInicio: string;
  dataFim: string;
  responsavelNome: string;
  responsavelEmail: string;
  mensagem: string;
}

const INITIAL: FormState = {
  titulo: '',
  placement: '',
  category: '',
  destinatarioUrl: '',
  textoAnuncio: '',
  orcamentoBRL: '',
  dataInicio: '',
  dataFim: '',
  responsavelNome: '',
  responsavelEmail: '',
  mensagem: '',
};

export default function AnunciarPage() {
  const { user, loading } = useAuth();

  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.placement) {
      setError('Selecione um formato de anúncio.');
      return;
    }
    if (!form.category) {
      setError('Selecione uma categoria de anúncio.');
      return;
    }
    if (!form.dataInicio) {
      setError('Informe a data de início da campanha.');
      return;
    }
    const orcamento = parseFloat(form.orcamentoBRL);
    if (!orcamento || orcamento <= 0) {
      setError('Informe um orçamento válido (maior que zero).');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Mapeamento exato para CreateAdOrderDto do backend
      await api.post('/ads/pedidos', {
        titulo: form.titulo.trim(),
        placement: form.placement,
        category: form.category,
        descricao: form.textoAnuncio.trim() || undefined,
        destinatarioUrl: form.destinatarioUrl.trim() || undefined,
        orcamentoBRL: orcamento,
        dataInicio: form.dataInicio,
        dataFim: form.dataFim || undefined,
        // Campos extras (não são parte do DTO mas são ignorados pelo whitelist NestJS)
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-page py-24 text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-verde-floresta/10">
          <CheckCircle2 className="size-8 text-verde-floresta" />
        </div>
        <h1 className="font-display text-2xl font-black">Solicitação enviada!</h1>
        <p className="mx-auto mt-3 max-w-sm text-base text-muted-foreground">
          Nossa equipe revisará sua campanha em até 2 dias úteis e entrará em contato pelo e-mail informado.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/ads/campanhas"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Ver minhas campanhas
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/ads"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition hover:bg-accent"
          >
            Voltar ao AxéMap ADS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-page max-w-2xl py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Megaphone className="size-3" aria-hidden="true" />
            AxéMap ADS
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight">Solicitar campanha</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Preencha o formulário abaixo e nossa equipe entrará em contato com orçamento e próximos passos.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-verde-floresta" aria-hidden="true" />
            Publicidade nunca afeta Trust Score ou verificação
          </div>
        </div>

        {!user && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            Você não está logado. Recomendamos{' '}
            <Link href="/auth/login" className="font-semibold underline">entrar</Link>{' '}
            para vincular a campanha à sua conta, mas pode enviar como visitante preenchendo os dados de contato abaixo.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="titulo" className="mb-1.5 block text-sm font-semibold text-foreground">
              Título da campanha <span className="text-destructive">*</span>
            </label>
            <input
              id="titulo"
              type="text"
              required
              maxLength={120}
              value={form.titulo}
              onChange={set('titulo')}
              placeholder="ex.: Festival de Candomblé – Salvador 2025"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Formato + Categoria */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="placement" className="mb-1.5 block text-sm font-semibold text-foreground">
                Formato do anúncio <span className="text-destructive">*</span>
              </label>
              <select
                id="placement"
                required
                value={form.placement}
                onChange={set('placement')}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione um formato…</option>
                {PLACEMENTS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-foreground">
                Categoria <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                required
                value={form.category}
                onChange={set('category')}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione uma categoria…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* URL + Orçamento */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="destinatarioUrl" className="mb-1.5 block text-sm font-semibold text-foreground">
                URL de destino
              </label>
              <input
                id="destinatarioUrl"
                type="url"
                value={form.destinatarioUrl}
                onChange={set('destinatarioUrl')}
                placeholder="https://seusite.com.br"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="orcamentoBRL" className="mb-1.5 block text-sm font-semibold text-foreground">
                Orçamento estimado (R$)
              </label>
              <input
                id="orcamentoBRL"
                type="number"
                min={0}
                step={0.01}
                value={form.orcamentoBRL}
                onChange={set('orcamentoBRL')}
                placeholder="500,00"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dataInicio" className="mb-1.5 block text-sm font-semibold text-foreground">
                Data de início
              </label>
              <input
                id="dataInicio"
                type="date"
                value={form.dataInicio}
                onChange={set('dataInicio')}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="dataFim" className="mb-1.5 block text-sm font-semibold text-foreground">
                Data de encerramento
              </label>
              <input
                id="dataFim"
                type="date"
                value={form.dataFim}
                onChange={set('dataFim')}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Texto do anúncio */}
          <div>
            <label htmlFor="textoAnuncio" className="mb-1.5 block text-sm font-semibold text-foreground">
              Texto do anúncio
            </label>
            <textarea
              id="textoAnuncio"
              rows={3}
              maxLength={300}
              value={form.textoAnuncio}
              onChange={set('textoAnuncio')}
              placeholder="Breve descrição que aparecerá no anúncio (até 300 caracteres)"
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Dados de contato (visível quando não logado, ou sempre para referência) */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Dados de contato</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="responsavelNome" className="mb-1.5 block text-sm font-semibold text-foreground">
                  Nome do responsável
                </label>
                <input
                  id="responsavelNome"
                  type="text"
                  value={form.responsavelNome}
                  onChange={set('responsavelNome')}
                  placeholder="Seu nome completo"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="responsavelEmail" className="mb-1.5 block text-sm font-semibold text-foreground">
                  E-mail de contato
                </label>
                <input
                  id="responsavelEmail"
                  type="email"
                  value={form.responsavelEmail}
                  onChange={set('responsavelEmail')}
                  placeholder="seu@email.com.br"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Mensagem adicional */}
          <div>
            <label htmlFor="mensagem" className="mb-1.5 block text-sm font-semibold text-foreground">
              Informações adicionais
            </label>
            <textarea
              id="mensagem"
              rows={3}
              value={form.mensagem}
              onChange={set('mensagem')}
              placeholder="Contexto extra, público-alvo, região de interesse, etc."
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Link
              href="/ads"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Voltar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Enviando…
                </>
              ) : (
                <>
                  Enviar solicitação
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
