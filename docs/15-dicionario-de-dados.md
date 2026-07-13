# 15 — Dicionário de Dados

## Domínios e Enumeradores

### tradicao_religiosa
| Valor | Descrição |
|-------|-----------|
| umbanda | Umbanda (tradição brasileira) |
| candomble | Candomblé (Nagô, Ketu, Angola, Jeje) |
| jurema | Jurema Sagrada |
| tambor_de_mina | Tambor de Mina (Maranhão) |
| xango | Xangô (Pernambuco) |
| omoloco | Omolocô |
| umbanda_esoterica | Umbanda Esotérica |
| umbanda_sagrada | Umbanda Sagrada |
| outra | Outra tradição afro-brasileira |

### cargo_terreiro
| Valor | Descrição |
|-------|-----------|
| dirigente | Dirigente geral do terreiro |
| pai_de_santo | Pai de Santo / Babalorixá |
| mae_de_santo | Mãe de Santo / Ialorixá |
| oga | Ogã (tocador de atabaque) |
| ekedi | Ekedi (cuidado dos Orixás) |
| filho_de_santo | Filho de Santo iniciado |
| cambono | Cambono (auxiliar de gira) |
| frequentador | Frequentador não iniciado |

### role_usuario
| Valor | Descrição |
|-------|-----------|
| admin | Administrador do sistema |
| super_admin | Super administrador |
| visitante | Usuário não autenticado |
| praticante | Usuário autenticado regular |
| dirigente | Dirigente de terreiro (pode ter múltiplos terreiros) |

### plano_terreiro
| Valor | Preço | Recursos |
|-------|-------|----------|
| gratuito | Grátis | 1 foto, 5 avaliações, visível na busca |
| basico | R$ 49/mês | 10 fotos, agenda, 10 membros, WhatsApp |
| profissional | R$ 99/mês | Fotos ilimitadas, vídeos, membros ilimitados, subdomínio, financeiro, cursos |
| enterprise | R$ 299/mês | Tudo do Profissional + API privada, white-label, suporte prioritário, múltiplos terreiros |

### status_avaliacao
| Valor | Descrição |
|-------|-----------|
| pendente | Aguardando moderação |
| aprovado | Aprovado e visível |
| rejeitado | Rejeitado pela moderação |
| sinalizado | Sinalizado por outros usuários |

### status_terreiro
| Valor | Descrição |
|-------|-----------|
| pendente | Aguardando aprovação administrativa |
| aprovado | Publicado e visível |
| rejeitado | Não atendeu critérios |
| suspenso | Suspenso por violação de termos |

### status_evento
| Valor | Descrição |
|-------|-----------|
| agendado | Evento futuro agendado |
| acontecendo | Evento em andamento |
| encerrado | Evento já ocorreu |
| cancelado | Evento cancelado |

### tipo_evento
| Valor | Descrição |
|-------|-----------|
| gira | Gira de Umbanda |
| toque | Toque de Candomblé |
| festa | Festa religiosa (Orixá, santo) |
| palestra | Palestra ou aula |
| curso | Curso ou workshop |
| desenvolvimento | Sessão de desenvolvimento mediúnico |
| social | Ação social/distribuição |
| outro | Outro tipo |

## Glossário de Termos

| Termo | Significado | Contexto |
|-------|-------------|----------|
| **Axé** | Energia vital, força sagrada | Conceito central nas religiões afro-brasileiras |
| **Orixá** | Divindade do panteão africano | Cultuado em Candomblé e Umbanda |
| **Guia** | Entidade espiritual guia | Umbanda |
| **Gira** | Sessão espiritual da Umbanda | Evento |
| **Toque** | Cerimônia com atabaques no Candomblé | Evento |
| **Filho de Santo** | Pessoa iniciada no terreiro | Cargo/membro |
| **Pai/Mãe de Santo** | Líder espiritual do terreiro | Dirigente |
| **Ogã** | Tocador de atabaque | Cargo |
| **Ekedi** | Cuidadora dos Orixás | Cargo |
| **Cambono** | Auxiliar de gira | Cargo |
| **Pemba** | Giz ritualístico | Item |
| **Ponto Cantado** | Música ritual | Conteúdo |
| **Atabaque** | Tambor sagrado | Instrumento |
| **Axó** | Roupa litúrgica | Vestuário |
| **Guias/Fios de Conta** | Colares sagrados | Item |
| **Defumação** | Limpeza espiritual com ervas | Ritual |
| **Búzios** | Jogo de adivinhação | Serviço/ferramenta |
| **Terreiro** | Espaço físico de culto | Local |
| **Roça** | Terreiro de Candomblé | Local |
| **Ebó** | Oferenda/ritual | Serviço |
| **Amaci** | Banho de ervas | Ritual |
| **Curimba** | Conjunto musical do terreiro | Grupo |
| **Incorporação** | Manifestação espiritual | Fenômeno mediúnico |

## Atributos de Acessibilidade (Terreiro)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| aceita_visitantes | BOOLEAN | Pessoa pode visitar sem ser membro |
| desenvolvimento_medio | BOOLEAN | Trabalho de desenvolvimento mediúnico |
| atendimento_social | BOOLEAN | Ações sociais (distribuição de comida, etc.) |
| tem_banheiros | BOOLEAN | Banheiros disponíveis para público |
| acessibilidade | BOOLEAN | Acessibilidade física (rampas, etc.) |
| respeito_nome_social | BOOLEAN | Respeita identidade de gênero |
| ambiente_inclusivo | BOOLEAN | Ambiente acolhedor para LGBTQIA+ |
| estacionamento | BOOLEAN | Estacionamento no local |
| aceita_criancas | BOOLEAN | Atividades para crianças |
| eventos_publicos | BOOLEAN | Eventos abertos ao público |
| idiomas | VARCHAR | Idiomas falados (ex: "Português, Yorubá") |
