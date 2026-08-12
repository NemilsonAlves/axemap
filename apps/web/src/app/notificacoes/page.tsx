'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BellOff } from 'lucide-react';
import { api } from '@/lib/api-client';
import './notificacoes.css';

interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  mensagem?: string;
  lida: boolean;
  criadaEm: string;
  link?: string;
}

const CATEGORIAS = [
  'todas',
  'sistema',
  'eventos',
  'mensagens',
  'avaliacoes',
  'verificacao',
  'seguranca',
  'governanca',
  'cursos',
  'marketplace',
] as const;

type Categoria = (typeof CATEGORIAS)[number];

const TIPO_PARA_CATEGORIA: Record<string, string> = {
  sistema: 'sistema',
  evento: 'eventos',
  mensagem: 'mensagens',
  avaliacao: 'avaliacoes',
  verificacao: 'verificacao',
  seguranca: 'seguranca',
  governanca: 'governanca',
  curso: 'cursos',
  marketplace: 'marketplace',
};

const PREFS_INICIAIS: Record<string, boolean> = {
  sistema: true,
  eventos: true,
  mensagens: true,
  avaliacoes: true,
  verificacao: true,
  seguranca: true,
  governanca: true,
  cursos: true,
  marketplace: false,
};

function formatarData(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('todas');
  const [prefs, setPrefs] = useState(PREFS_INICIAIS);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Notificacao[]; total: number }>('/notificacoes?limit=100');
      setNotificacoes(res?.data ?? []);
    } catch {
      setErro('Não foi possível carregar suas notificações.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtradas = notificacoes.filter((n) =>
    categoria === 'todas' ? true : TIPO_PARA_CATEGORIA[n.tipo] === categoria,
  );

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarLida = (id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const remover = (id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h1 className="notif-title">Notificações</h1>
          <p className="notif-subtitle">
            {naoLidas > 0 ? `${naoLidas} não lida(s)` : 'Tudo em dia'} · central de avisos do AxéMap
          </p>
        </div>
        <div className="notif-actions">
          <button
            className="notif-action"
            onClick={() => setNotificacoes((prev) => prev.map((n) => (n.lida ? n : { ...n, lida: true })))}
          >
            Marcar todas como lidas
          </button>
        </div>
      </div>

      <div className="notif-tabs" role="tablist" aria-label="Filtrar por categoria">
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={categoria === c}
            className={`notif-tab ${categoria === c ? 'active' : ''}`}
            onClick={() => setCategoria(c)}
          >
            {c === 'todas' ? 'Todas' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="notif-empty">
          <span className="notif-empty-icon">⏳</span>
          Carregando notificações...
        </div>
      ) : erro ? (
        <div className="notif-empty">
          <span className="notif-empty-icon" role="img" aria-label="Erro">⚠️</span>
          <p>{erro}</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="notif-empty">
          <BellOff className="h-8 w-8 text-muted-foreground" />
          <p>{categoria === 'todas' ? 'Nenhuma notificação por aqui ainda.' : 'Nada nesta categoria.'}</p>
          <Link href="/busca" className="notif-action" style={{ textDecoration: 'none' }}>
            Explorar a plataforma
          </Link>
        </div>
      ) : (
        <ul className="notif-list" aria-label="Lista de notificações">
          {filtradas.map((n) => (
            <li key={n.id} className={`notif-item ${n.lida ? '' : 'nao-lida'}`}>
              <span className="notif-dot" aria-hidden="true" />
              <div className="notif-body">
                <div className="notif-tipo">{TIPO_PARA_CATEGORIA[n.tipo] ?? n.tipo}</div>
                <h2 className="notif-item-titulo">{n.titulo}</h2>
                {n.mensagem && <p className="notif-mensagem">{n.mensagem}</p>}
                <div className="notif-data">{formatarData(n.criadaEm)}</div>
              </div>
              <div className="notif-item-actions">
                {!n.lida && (
                  <button className="notif-action" onClick={() => marcarLida(n.id)}>
                    Lida
                  </button>
                )}
                <button className="notif-action" onClick={() => remover(n.id)} aria-label="Excluir notificação">
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="notif-prefs">
        <h2>Preferências de notificação</h2>
        {Object.entries(prefs).map(([chave, valor]) => (
          <label key={chave} className="notif-pref-row">
            <span>
              {chave.charAt(0).toUpperCase() + chave.slice(1)}
              {chave === 'marketplace' && ' (experimental)'}
            </span>
            <input
              type="checkbox"
              checked={valor}
              onChange={() => setPrefs((prev) => ({ ...prev, [chave]: !prev[chave] }))}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
