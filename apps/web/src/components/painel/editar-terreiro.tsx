'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

const TRADICOES = [
  'UMBANDA', 'CANDOMBLE_KETU', 'CANDOMBLE_ANGOLA', 'CANDOMBLE_JEJE',
  'JUREMA', 'TAMBOR_DE_MINA', 'XANGO',
];

const DIAS = [
  { chave: 'segunda', label: 'Segunda' },
  { chave: 'terca', label: 'Terça' },
  { chave: 'quarta', label: 'Quarta' },
  { chave: 'quinta', label: 'Quinta' },
  { chave: 'sexta', label: 'Sexta' },
  { chave: 'sabado', label: 'Sábado' },
  { chave: 'domingo', label: 'Domingo' },
];

interface FormState {
  nome: string;
  tradicao: string;
  descricaoCurta: string;
  descricaoLonga: string;
  cidade: string;
  estado: string;
  anoFundacao: string;
  linhagem: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  website: string;
  email: string;
  acessibilidade: boolean;
  estacionamento: string;
  horarios: Record<string, string>;
}

export function EditarTerreiro({ terreiroId, slug }: { terreiroId: string; slug: string }) {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [form, setForm] = useState<FormState>({
    nome: '', tradicao: '', descricaoCurta: '', descricaoLonga: '',
    cidade: '', estado: '', anoFundacao: '', linhagem: '', telefone: '',
    whatsapp: '', instagram: '', facebook: '', website: '', email: '',
    acessibilidade: false, estacionamento: '', horarios: {},
  });

  useEffect(() => {
    api
      .get<any>(`/terreiros/${slug}/perfil`)
      .then((t) => {
        let horarios: Record<string, string> = {};
        if (t.horarioFuncionamento) {
          try {
            const parsed = JSON.parse(t.horarioFuncionamento);
            if (parsed && typeof parsed === 'object') horarios = parsed;
          } catch {
            horarios = {};
          }
        }
        setForm({
          nome: t.nome || '',
          tradicao: t.tradicao || '',
          descricaoCurta: t.descricaoCurta || '',
          descricaoLonga: t.descricaoLonga || '',
          cidade: t.cidade || '',
          estado: t.estado || '',
          anoFundacao: t.anoFundacao ? String(t.anoFundacao) : '',
          linhagem: t.linhagem || '',
          telefone: t.telefone || '',
          whatsapp: t.whatsapp || '',
          instagram: t.instagram || '',
          facebook: t.facebook || '',
          website: t.website || '',
          email: t.email || '',
          acessibilidade: !!t.acessibilidade,
          estacionamento: t.estacionamento || '',
          horarios,
        });
      })
      .catch(() => setErro('Não foi possível carregar o perfil.'))
      .finally(() => setCarregando(false));
  }, [slug]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSalvo(false);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    setSalvo(false);
    try {
      const payload: Record<string, unknown> = {
        nome: form.nome,
        tradicao: form.tradicao,
        descricaoCurta: form.descricaoCurta || null,
        descricaoLonga: form.descricaoLonga || null,
        cidade: form.cidade,
        estado: form.estado,
        acessibilidade: form.acessibilidade,
        estacionamento: form.estacionamento || null,
        anoFundacao: form.anoFundacao ? Number(form.anoFundacao) : null,
        linhagem: form.linhagem || null,
        telefone: form.telefone || null,
        whatsapp: form.whatsapp || null,
        instagram: form.instagram || null,
        facebook: form.facebook || null,
        website: form.website || null,
        email: form.email || null,
        horarioFuncionamento: JSON.stringify(form.horarios),
      };
      await api.patch(`/terreiros/${terreiroId}`, payload);
      setSalvo(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) return <p className="painel-empty">Carregando perfil...</p>;

  return (
    <form onSubmit={salvar}>
      {erro && <div className="painel-error">{erro}</div>}
      {salvo && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 70%, transparent)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--success-foreground)' }}>
          Perfil salvo com sucesso.{' '}
          <Link href={`/t/${slug}`} style={{ textDecoration: 'underline' }}>Ver página pública</Link>
        </div>
      )}

      <div className="painel-form-card">
        <div className="painel-form-grid">
          <div className="painel-field">
            <label>Nome do terreiro *</label>
            <input value={form.nome} onChange={(e) => set('nome', e.target.value)} required />
          </div>
          <div className="painel-field">
            <label>Tradição *</label>
            <select value={form.tradicao} onChange={(e) => set('tradicao', e.target.value)} required>
              <option value="">Selecione...</option>
              {TRADICOES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="painel-field">
            <label>Cidade *</label>
            <input value={form.cidade} onChange={(e) => set('cidade', e.target.value)} required />
          </div>
          <div className="painel-field">
            <label>Estado (UF) *</label>
            <input value={form.estado} maxLength={2} onChange={(e) => set('estado', e.target.value.toUpperCase())} required />
          </div>
          <div className="painel-field">
            <label>Ano de fundação</label>
            <input type="number" min={1500} max={2100} value={form.anoFundacao} onChange={(e) => set('anoFundacao', e.target.value)} />
          </div>
          <div className="painel-field">
            <label>Linhagem</label>
            <input value={form.linhagem} onChange={(e) => set('linhagem', e.target.value)} />
          </div>
        </div>

        <div className="painel-field">
          <label>Descrição curta (máx. 500 caracteres)</label>
          <input maxLength={500} value={form.descricaoCurta} onChange={(e) => set('descricaoCurta', e.target.value)} />
        </div>
        <div className="painel-field">
          <label>Descrição completa</label>
          <textarea rows={5} value={form.descricaoLonga} onChange={(e) => set('descricaoLonga', e.target.value)} />
        </div>
      </div>

      <div className="painel-form-card">
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--color-primary)' }}>Contato</h3>
        <div className="painel-form-grid">
          <div className="painel-field"><label>Telefone</label><input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} /></div>
          <div className="painel-field"><label>WhatsApp</label><input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></div>
          <div className="painel-field"><label>E-mail</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div className="painel-field"><label>Site</label><input value={form.website} onChange={(e) => set('website', e.target.value)} /></div>
          <div className="painel-field"><label>Instagram</label><input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} /></div>
          <div className="painel-field"><label>Facebook</label><input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} /></div>
        </div>
      </div>

      <div className="painel-form-card">
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--color-primary)' }}>Funcionamento e acessos</h3>
        <div className="painel-form-grid">
          {DIAS.map((d) => (
            <div className="painel-field" key={d.chave}>
              <label>{d.label}</label>
              <input
                placeholder="Ex: 08:00 - 18:00"
                value={form.horarios[d.chave] || ''}
                onChange={(e) => set('horarios', { ...form.horarios, [d.chave]: e.target.value })}
              />
            </div>
          ))}
          <div className="painel-field">
            <label>Estacionamento</label>
            <select value={form.estacionamento} onChange={(e) => set('estacionamento', e.target.value)}>
              <option value="">Nenhum / não informado</option>
              <option value="PRIVADO">Privado</option>
              <option value="RUA">Na rua</option>
            </select>
          </div>
          <div className="painel-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="acessibilidade"
              type="checkbox"
              checked={form.acessibilidade}
              onChange={(e) => set('acessibilidade', e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="acessibilidade" style={{ marginBottom: 0 }}>Possui acessibilidade</label>
          </div>
        </div>
      </div>

      <button type="submit" className="painel-btn" disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
