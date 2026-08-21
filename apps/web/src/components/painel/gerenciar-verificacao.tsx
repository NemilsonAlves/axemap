'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/auth-context';

interface Documento {
  id: string;
  tipo: string;
  arquivoUrl: string;
  status: string;
  createdAt: string;
}

const TIPOS = [
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'REGISTRO', label: 'Registro do terreiro' },
  { value: 'RESPONSAVEL', label: 'Documento do dirigente' },
  { value: 'ENDERECO', label: 'Comprovante de endereço' },
  { value: 'OUTROS', label: 'Outros' },
];

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REJEITADO: 'Recusado',
};

function statusClasse(status: string) {
  return `painel-status ${status === 'APROVADO' ? 'ok' : status === 'REJEITADO' ? 'bad' : 'pend'}`;
}

export function GerenciarVerificacao({ terreiroId, isVerified }: { terreiroId: string; isVerified?: boolean }) {
  const { token } = useAuth();
  const [docs, setDocs] = useState<Documento[]>([]);
  const [tipo, setTipo] = useState('CNPJ');
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

  const carregar = useCallback(async () => {
    try {
      const res = await api.get<Documento[]>(`/verificacoes?terreiroId=${terreiroId}`);
      setDocs(Array.isArray(res) ? res : []);
    } catch {}
  }, [terreiroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const enviar = async () => {
    if (!file) {
      setErro('Selecione um arquivo (foto ou scan do documento)');
      return;
    }
    setEnviando(true);
    setErro('');
    setSucesso('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(
        `${API_URL}/api/v1/verificacoes?terreiroId=${encodeURIComponent(terreiroId)}&tipo=${encodeURIComponent(tipo)}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Erro ao enviar documento');
      }
      setFile(null);
      setSucesso('Documento enviado! Ele será analisado pela equipe AxéMap.');
      await carregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      {isVerified ? (
        <div className="painel-form-card">
          <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            ✓ Este terreiro está <span className="tag tag-primary">Verificado</span>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)' }}>
            O selo de verificado aparece na página pública. Você ainda pode enviar mais documentos abaixo.
          </p>
        </div>
      ) : (
        <div className="painel-form-card">
          <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Obtenha o selo de verificação</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-300)', lineHeight: 1.6 }}>
            Envie uma foto ou scan de um documento (CNPJ, registro do terreiro, documento do dirigente ou
            comprovante de endereço). A equipe AxéMap analisa em até alguns dias úteis.
          </p>
          <div className="painel-form-grid" style={{ marginTop: '1rem' }}>
            <div className="painel-field">
              <label>Tipo de documento</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="painel-field">
              <label>Arquivo (JPG, PNG ou WebP)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div className="painel-item-actions" style={{ marginTop: '1rem' }}>
            <button className="painel-btn" onClick={enviar} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar documento'}
            </button>
          </div>
          {erro && <p className="painel-erro">{erro}</p>}
          {sucesso && <p style={{ color: 'var(--success)', fontSize: '0.85rem' }}>{sucesso}</p>}
        </div>
      )}

      <div className="painel-form-card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Documentos enviados</h3>
        {docs.length === 0 ? (
          <p className="painel-empty">Nenhum documento enviado ainda.</p>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="painel-item">
              <div>
                <div className="painel-item-title">{TIPOS.find((t) => t.value === doc.tipo)?.label || doc.tipo}</div>
                <div className="painel-item-meta">
                  {new Date(doc.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                  <a href={doc.arquivoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
                    ver arquivo
                  </a>
                </div>
              </div>
              <span className={statusClasse(doc.status)}>{STATUS_LABEL[doc.status] || doc.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
