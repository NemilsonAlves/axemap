'use client';

import { useState, useMemo } from 'react';
import type { TerreiroPerfil } from '@/types/terreiro';
import { Bot, Send, BadgeCheck, Sparkles } from 'lucide-react';

interface Resposta {
  texto: string;
  fonte: 'instituicao' | 'geral';
}

function buscar(pergunta: string, terreiro: TerreiroPerfil): Resposta | null {
  const q = pergunta.toLowerCase();

  const porPalavra = (palavras: string[]) => palavras.some((p) => q.includes(p));

  if (porPalavra(['história', 'historia', 'origem', 'linhagem', 'fundo'])) {
    return {
      texto: terreiro.descricaoLonga || `${terreiro.nome} preserva sua história e linhagem com respeito à tradição.`,
      fonte: 'instituicao',
    };
  }
  if (porPalavra(['evento', 'gira', 'agenda', 'festa', 'toque'])) {
    const total = terreiro.hub.totalEventos;
    return {
      texto:
        total > 0
          ? `A casa possui ${total} evento(s) na agenda. Confira a seção "Eventos" para datas, inscrições e como chegar.`
          : 'Não há eventos públicos cadastrados no momento. Acompanhe o perfil para novidades.',
      fonte: 'instituicao',
    };
  }
  if (porPalavra(['curso', 'aula', 'aprender', 'formação', 'formacao'])) {
    const total = terreiro.hub.totalCursos;
    return {
      texto:
        total > 0
          ? `${terreiro.nome} oferece ${total} curso(s). Veja modalidade, carga horária e matrícula na seção "Cursos".`
          : 'Ainda não há cursos abertos. Novidades são publicadas aqui no perfil.',
      fonte: 'instituicao',
    };
  }
  if (porPalavra(['horário', 'horario', 'funcionamento', 'aberto', 'fechado'])) {
    return terreiro.horarioFuncionamento
      ? { texto: `Horários: ${terreiro.horarioFuncionamento}.`, fonte: 'instituicao' }
      : { texto: 'Os horários de funcionamento não foram informados pela casa.', fonte: 'instituicao' };
  }
  if (porPalavra(['localização', 'localizacao', 'endereço', 'endereco', 'chegar', 'onde fica'])) {
    return {
      texto: `${terreiro.nome} fica em ${terreiro.cidade}, ${terreiro.estado}. Use o mapa na seção "Localização" para traçar a rota.`,
      fonte: 'instituicao',
    };
  }
  if (porPalavra(['projeto', 'social', 'doação', 'doacao', 'campanha', 'ajuda'])) {
    return {
      texto:
        terreiro.hub.totalAcoes > 0 || terreiro.campanhas.length > 0
          ? 'A casa realiza projetos sociais e pode ter campanhas abertas. Veja as seções "Projetos sociais" e "Impacto".'
          : 'A casa não listou projetos sociais no momento.',
      fonte: 'instituicao',
    };
  }
  if (porPalavra(['verificado', 'verificação', 'verificacao', 'confiança', 'confianca', 'segurança', 'seguranca'])) {
    return {
      texto: `O Trust Score atual é ${terreiro.trustScore} (${terreiro.trustScoreInfo.label}). A verificação indica que a identidade e a documentação da casa passaram por validação.`,
      fonte: 'instituicao',
    };
  }

  return {
    texto:
      'Posso ajudar com informações públicas sobre história, eventos, cursos, projetos, horários e localização desta casa. Também explico como funciona a verificação e o Índice de Confiança.',
    fonte: 'geral',
  };
}

const SUGESTOES = ['Como funciona o Índice de Confiança?', 'Quais são os próximos eventos?', 'Conte-me sobre a história da casa'];

export function ComunidadeAI({ terreiro }: { terreiro: TerreiroPerfil }) {
  const [pergunta, setPergunta] = useState('');
  const [historico, setHistorico] = useState<{ pergunta: string; resposta: Resposta }[]>([]);

  function enviar(texto: string) {
    const q = texto.trim();
    if (!q) return;
    const resposta = buscar(q, terreiro);
    if (!resposta) return;
    setHistorico((prev) => [{ pergunta: q, resposta }, ...prev]);
    setPergunta('');
  }

  const idx = useMemo(() => terreiro.nome, [terreiro.nome]);

  return (
    <section className="section-card" id="ia-comunidade">
      <div className="flex items-center gap-2">
        <Bot className="size-5 text-turquoise" />
        <h2 className="section-title">Assistente da Comunidade</h2>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGESTOES.map((s) => (
            <button
              key={s}
              onClick={() => enviar(s)}
              className="rounded-full border border-turquoise/30 bg-turquoise/5 px-3 py-1 text-xs font-medium text-turquoise-strong transition-colors hover:bg-turquoise/15"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
          {historico.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Faça uma pergunta sobre {idx}. As respostas usam informações públicas fornecidas pela própria instituição.
            </p>
          )}
          {historico.map((h, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-copper px-3 py-2 text-sm text-white">{h.pergunta}</div>
              </div>
              <div className="flex items-start gap-2">
                <Bot className="mt-1 size-4 shrink-0 text-turquoise" />
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-muted/40 px-3 py-2 text-sm text-card-foreground">
                  {h.resposta.texto}
                  <span
                    className={`mt-1.5 flex items-center gap-1 text-[11px] ${h.resposta.fonte === 'instituicao' ? 'text-success' : 'text-muted-foreground'}`}
                  >
                    {h.resposta.fonte === 'instituicao' ? (
                      <>
                        <BadgeCheck className="size-3" /> Baseado em conteúdo da instituição
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3" /> Informação geral
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(pergunta);
          }}
        >
          <input
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Pergunte sobre a casa..."
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-card-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-turquoise focus:ring-2 focus:ring-turquoise/30"
          />
          <button
            type="submit"
            aria-label="Enviar"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-turquoise text-white transition-colors hover:bg-turquoise-strong disabled:opacity-50"
            disabled={!pergunta.trim()}
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </section>
  );
}