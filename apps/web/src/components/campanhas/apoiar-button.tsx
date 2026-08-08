'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { Heart, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

const VALORES = [25, 50, 100, 200];

export function ApoiarButton({ slug }: { slug: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [valor, setValor] = useState(50);
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feito, setFeito] = useState(false);

  async function apoiar() {
    if (!valor || valor <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe um valor de apoio válido.', variant: 'danger' });
      return;
    }
    setLoading(true);
    try {
      await api.post(`/campanhas/${slug}/apoiar`, { valor, anonimo });
      setFeito(true);
      toast({ title: 'Apoio registrado!', description: 'Um grande axé para você. Aguarde a confirmação do pagamento.', variant: 'success' });
    } catch (e: any) {
      toast({ title: 'Não foi possível apoiar', description: e?.message || 'Tente novamente em instantes.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <Lock className="size-4" /> Acesse sua conta para apoiar campanhas.
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/login">Entrar para apoiar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {VALORES.map((v) => (
          <Button
            key={v}
            type="button"
            variant={valor === v ? 'brand' : 'outline'}
            onClick={() => setValor(v)}
          >
            R$ {v}
          </Button>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="valor-customizado">Ou escolha um valor</Label>
        <Input
          id="valor-customizado"
          type="number"
          min={1}
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={anonimo} onCheckedChange={(v) => setAnonimo(Boolean(v))} />
        Apoiar anonimamente
      </label>
      {feito ? (
        <Button variant="outline" className="w-full" disabled>
          <Heart className="mr-2 size-4 fill-turquoise text-turquoise" />
          Apoio enviado. Muito axé!
        </Button>
      ) : (
        <Button onClick={apoiar} loading={loading} className="w-full" variant="brand">
          {loading ? null : <Heart className="mr-2 size-4" />} Apoiar com R$ {valor}
        </Button>
      )}
    </div>
  );
}