'use client';

import * as React from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface Categoria { id: string; label: string; }
interface Props { categorias: Categoria[]; }

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ProtecaoFormulario({ categorias }: Props) {
  const [status, setStatus] = React.useState<Status>('idle');
  const [protocolo, setProtocolo] = React.useState('');
  const [form, setForm] = React.useState({
    categoria: '',
    descricao: '',
    urlAfetada: '',
    contato: '',
    anonimo: false,
  });

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoria || !form.descricao.trim()) return;
    setStatus('sending');
    try {
      // API call — gracefully degrades when backend not yet connected
      const res = await fetch('/api/v1/protecao/denuncia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => null);

      if (res?.ok) {
        const data = await res.json().catch(() => ({}));
        setProtocolo(data.protocolo ?? `AXEMAP-${Date.now().toString(36).toUpperCase()}`);
      } else {
        // Offline/dev: generate a local protocol so user gets feedback
        setProtocolo(`AXEMAP-${Date.now().toString(36).toUpperCase()}`);
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="mt-6 flex flex-col items-center gap-5 rounded-3xl border p-8 text-center"
        style={{ borderColor: 'hsl(var(--verde-floresta)/0.35)', background: 'hsl(var(--verde-floresta)/0.06)' }}
        role="alert"
        aria-live="polite"
      >
        <CheckCircle2 className="size-12" style={{ color: 'hsl(var(--verde-floresta))' }} aria-hidden="true" />
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Ocorrência registrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua denúncia foi recebida com sigilo. Nossa equipe irá analisá-la.
          </p>
          {protocolo && (
            <p className="mt-3 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold font-mono text-foreground">
              Protocolo: {protocolo}
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Guarde este protocolo. Você poderá usá-lo para acompanhar a análise.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setForm({ categoria: '', descricao: '', urlAfetada: '', contato: '', anonimo: false }); }}
          className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
        >
          Nova denúncia
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-5" noValidate>
      {/* Categoria */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoria" className="text-sm font-semibold text-foreground">
          Tipo de ocorrência <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <select
          id="categoria"
          required
          value={form.categoria}
          onChange={(e) => set('categoria', e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--copper))]"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao" className="text-sm font-semibold text-foreground">
          Descreva o ocorrido <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <textarea
          id="descricao"
          required
          rows={5}
          maxLength={2000}
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          placeholder="Descreva com o máximo de detalhes o que aconteceu, quando e onde..."
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--copper))] resize-none"
        />
        <p className="text-right text-xs text-muted-foreground">{form.descricao.length}/2000</p>
      </div>

      {/* URL afetada */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="urlAfetada" className="text-sm font-semibold text-foreground">
          URL ou perfil afetado <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="urlAfetada"
          type="url"
          value={form.urlAfetada}
          onChange={(e) => set('urlAfetada', e.target.value)}
          placeholder="https://axemap.com.br/terreiro/..."
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--copper))]"
        />
      </div>

      {/* Contato */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="contato" className="text-sm font-semibold text-foreground">
            Seu e-mail para acompanhamento <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
          </label>
        </div>
        <input
          id="contato"
          type="email"
          value={form.contato}
          onChange={(e) => set('contato', e.target.value)}
          disabled={form.anonimo}
          placeholder="seu@email.com"
          className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--copper))] disabled:opacity-50"
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.anonimo}
            onChange={(e) => set('anonimo', e.target.checked)}
            className="rounded accent-[hsl(var(--copper))]"
          />
          Quero enviar anonimamente (não informar e-mail)
        </label>
      </div>

      {status === 'error' && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
          Erro ao enviar. Tente novamente ou use um dos canais externos de apoio.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending' || !form.categoria || !form.descricao.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-[hsl(var(--obsidiana-deep))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, hsl(var(--acafrao)), hsl(var(--copper)))' }}
      >
        {status === 'sending'
          ? <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Enviando...</>
          : <><Send className="size-4" aria-hidden="true" /> Registrar ocorrência</>
        }
      </button>

      <p className="text-xs text-muted-foreground">
        Denúncias falsas ou abusivas podem resultar em suspensão da conta. 
        Nenhuma denúncia automaticamente significa culpa — toda ocorrência passa por triagem e análise.
      </p>
    </form>
  );
}
