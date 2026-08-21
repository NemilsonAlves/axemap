'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api-client';
import { labelTradicao, TRADICOES_CATALOGO } from '@/lib/tradicoes';

const TRADICOES = TRADICOES_CATALOGO.map((t) => t.nome);

const DIAS = [
  { chave: 'segunda', label: 'Segunda' },
  { chave: 'terca', label: 'Terça' },
  { chave: 'quarta', label: 'Quarta' },
  { chave: 'quinta', label: 'Quinta' },
  { chave: 'sexta', label: 'Sexta' },
  { chave: 'sabado', label: 'Sábado' },
  { chave: 'domingo', label: 'Domingo' },
];

interface FormData {
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
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormData>({
    defaultValues: {
      nome: '', tradicao: '', descricaoCurta: '', descricaoLonga: '',
      cidade: '', estado: '', anoFundacao: '', linhagem: '', telefone: '',
      whatsapp: '', instagram: '', facebook: '', website: '', email: '',
      acessibilidade: false, estacionamento: '', horarios: {},
    },
  });

  const horarios = watch('horarios');

  useEffect(() => {
    api
      .get<any>(`/terreiros/${slug}/perfil`)
      .then((t) => {
        let parsedHorarios: Record<string, string> = {};
        if (t.horarioFuncionamento) {
          try {
            const parsed = JSON.parse(t.horarioFuncionamento);
            if (parsed && typeof parsed === 'object') parsedHorarios = parsed;
          } catch {
            parsedHorarios = {};
          }
        }
        reset({
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
          horarios: parsedHorarios,
        });
      })
      .catch(() => setErro('Não foi possível carregar o perfil.'))
      .finally(() => setCarregando(false));
  }, [slug, reset]);

  const onSubmit = async (data: FormData) => {
    setErro('');
    setSalvo(false);
    try {
      const payload = {
        nome: data.nome,
        tradicao: data.tradicao,
        descricaoCurta: data.descricaoCurta || null,
        descricaoLonga: data.descricaoLonga || null,
        cidade: data.cidade,
        estado: data.estado,
        acessibilidade: data.acessibilidade,
        estacionamento: data.estacionamento || null,
        anoFundacao: data.anoFundacao ? Number(data.anoFundacao) : null,
        linhagem: data.linhagem || null,
        telefone: data.telefone || null,
        whatsapp: data.whatsapp || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        website: data.website || null,
        email: data.email || null,
        horarioFuncionamento: JSON.stringify(data.horarios),
      };
      await api.patch(`/terreiros/${terreiroId}`, payload);
      setSalvo(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  if (carregando) return <p className="painel-empty">Carregando perfil...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            <label>Nome da Casa de Axé *</label>
            <input {...register('nome')} />
            {errors.nome && <span className="painel-field-error">{errors.nome.message}</span>}
          </div>
          <div className="painel-field">
            <label>Tradição *</label>
            <select {...register('tradicao')}>
              <option value="">Selecione...</option>
              {TRADICOES.map((t) => <option key={t} value={t}>{labelTradicao(t)}</option>)}
            </select>
            {errors.tradicao && <span className="painel-field-error">{errors.tradicao.message}</span>}
          </div>
          <div className="painel-field">
            <label>Cidade *</label>
            <input {...register('cidade')} />
            {errors.cidade && <span className="painel-field-error">{errors.cidade.message}</span>}
          </div>
          <div className="painel-field">
            <label>Estado (UF) *</label>
            <input {...register('estado')} maxLength={2} />
            {errors.estado && <span className="painel-field-error">{errors.estado.message}</span>}
          </div>
          <div className="painel-field">
            <label>Ano de fundação</label>
            <input type="number" min={1500} max={2100} {...register('anoFundacao')} />
          </div>
          <div className="painel-field">
            <label>Linhagem</label>
            <input {...register('linhagem')} />
          </div>
        </div>

        <div className="painel-field">
          <label>Descrição curta (máx. 500 caracteres)</label>
          <input maxLength={500} {...register('descricaoCurta')} />
        </div>
        <div className="painel-field">
          <label>Descrição completa</label>
          <textarea rows={5} {...register('descricaoLonga')} />
        </div>
      </div>

      <div className="painel-form-card">
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--color-primary)' }}>Contato</h3>
        <div className="painel-form-grid">
          <div className="painel-field"><label>Telefone</label><input {...register('telefone')} /></div>
          <div className="painel-field"><label>WhatsApp</label><input {...register('whatsapp')} /></div>
          <div className="painel-field"><label>E-mail</label><input type="email" {...register('email')} /></div>
          <div className="painel-field"><label>Site</label><input {...register('website')} /></div>
          <div className="painel-field"><label>Instagram</label><input {...register('instagram')} /></div>
          <div className="painel-field"><label>Facebook</label><input {...register('facebook')} /></div>
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
                value={horarios[d.chave] || ''}
                onChange={(e) => setValue('horarios', { ...horarios, [d.chave]: e.target.value }, { shouldValidate: true })}
              />
            </div>
          ))}
          <div className="painel-field">
            <label>Estacionamento</label>
            <select {...register('estacionamento')}>
              <option value="">Nenhum / não informado</option>
              <option value="PRIVADO">Privado</option>
              <option value="RUA">Na rua</option>
            </select>
          </div>
          <div className="painel-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id="acessibilidade"
              type="checkbox"
              {...register('acessibilidade')}
              style={{ width: 'auto' }}
            />
            <label htmlFor="acessibilidade" style={{ marginBottom: 0 }}>Possui acessibilidade</label>
          </div>
        </div>
      </div>

      <button type="submit" className="painel-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  );
}
