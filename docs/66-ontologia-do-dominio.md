# 66 — Ontologia do Domínio

## Hierarquia Ontológica

```
AxéMap Domain Ontology
├── EntidadesFísicas
│   ├── Pessoa
│   │   ├── Usuario
│   │   │   ├── Visitante
│   │   │   ├── Praticante
│   │   │   ├── Dirigente (Pai/Mãe de Santo)
│   │   │   ├── Ogã
│   │   │   ├── Ekedi
│   │   │   ├── Cambono
│   │   │   ├── FilhoDeSanto
│   │   │   └── Administrador
│   │   └── Palestrante
│   │
│   ├── Local
│   │   ├── Terreiro
│   │   ├── CentroEspiritual
│   │   ├── Tenda
│   │   └── Roça
│   │
│   └── RegiaoGeografica
│       ├── Pais
│       ├── Estado
│       ├── Municipio
│       ├── Cidade
│       └── Bairro
│
├── EntidadesEspirituais
│   ├── Tradicao
│   │   ├── Umbanda
│   │   │   ├── UmbandaBranca
│   │   │   ├── UmbandaEsoterica
│   │   │   ├── UmbandaSagrada
│   │   │   └── UmbandaOmoloco
│   │   ├── Candomble
│   │   │   ├── Ketu
│   │   │   ├── Angola
│   │   │   ├── Jeje
│   │   │   └── Efón
│   │   ├── Jurema
│   │   ├── TamborDeMina
│   │   └── Xangô
│   │
│   ├── LinhaEspiritual
│   │   ├── Oxalá
│   │   ├── Iemanjá
│   │   ├── Ogum
│   │   ├── Oxóssi
│   │   ├── Xangô
│   │   ├── Iansã
│   │   └── ...
│   │
│   ├── Orixa
│   │   ├── OrixaPrincipal
│   │   └── OrixaAdjunto
│   │
│   ├── Entidade
│   │   ├── Caboclo
│   │   ├── PretoVelho
│   │   ├── Criança (Ibejada)
│   │   ├── Exu
│   │   ├── Pombagira
│   │   ├── Boiadeiro
│   │   ├── Marinheiro
│   │   └── Baiano
│   │
│   └── GuiaEspiritual (genérico)
│
├── EventosEOcorrencias
│   ├── Evento
│   │   ├── Gira
│   │   ├── Toque
│   │   ├── FestaReligiosa
│   │   ├── Palestra
│   │   ├── Curso
│   │   ├── DesenvolvimentoMediunico
│   │   └── AçãoSocial
│   │
│   ├── AçãoSocial
│   │   ├── DistribuiçãoAlimentar
│   │   ├── AssistênciaJurídica
│   │   ├── ApoioPsicológico
│   │   └── OficinaComunitária
│   │
│   └── Projeto
│       ├── ProjetoSocial
│       ├── ProjetoEducacional
│       └── ProjetoCultural
│
├── ConteudoEConhecimento
│   ├── Conteudo
│   │   ├── Artigo
│   │   ├── Guia
│   │   ├── Documento
│   │   ├── Video
│   │   ├── Audio
│   │   │   └── PontoCantado
│   │   └── Imagem
│   │
│   ├── Glossario
│   │   ├── Termo
│   │   ├── Verbete
│   │   └── Definição
│   │
│   ├── CalendárioReligioso
│   │   ├── DataFixa
│   │   ├── DataMovel
│   │   └── FaseLunar
│   │
│   └── FAQ
│
├── Marketplace
│   ├── Produto
│   │   ├── Vela
│   │   ├── Erva
│   │   ├── Defumador
│   │   ├── Guia
│   │   ├── FioDeConta
│   │   ├── Vestuário (Axó)
│   │   ├── Instrumento (Atabaque, Agogô)
│   │   ├── ImagemSacra
│   │   ├── Livro
│   │   └── Serviço (Búzios, Limpeza)
│   │
│   ├── Vendedor
│   └── Pedido
│
└── RelaçõesSociais
    ├── Comunidade
    │   ├── GrupoTematico
    │   ├── Forum
    │   └── Feed
    ├── Avaliação
    ├── Recomendação
    └── Mensagem
```

## Tipos de Nó no Grafo

| Tipo | Label | Descrição | Atributos Chave |
|------|-------|-----------|-----------------|
| `Pessoa` | `:Pessoa` | Pessoa física | nome, dataNascimento, genero |
| `Usuario` | `:Pessoa:Usuario` | Usuário da plataforma | email, role, trustScore |
| `Terreiro` | `:Terreiro` | Casa religiosa | nome, slug, tradicao, trustScore, status |
| `Tradicao` | `:Tradicao` | Tradição religiosa | nome, descricao, origem |
| `LinhaEspiritual` | `:LinhaEspiritual` | Linha de trabalho | nome, cor, diaSemana |
| `Orixa` | `:Orixa` | Divindade do panteão | nome, domínio, cor, elemento |
| `Entidade` | `:Entidade` | Entidade espiritual | nome, tipo, linha |
| `Evento` | `:Evento` | Ocorrência religiosa | titulo, data, tipo, capacidade |
| `AcaoSocial` | `:AcaoSocial` | Ação comunitária | nome, descricao, data |
| `Curso` | `:Curso` | Curso/Workshop | titulo, modalidade, cargaHoraria |
| `Cidade` | `:Cidade` | Município | nome, estado, latitude, longitude |
| `Estado` | `:Estado` | Unidade federativa | nome, sigla, regiao |
| `Produto` | `:Produto` | Item do marketplace | nome, preco, categoria |
| `Conteudo` | `:Conteudo` | Material educativo | titulo, tipo, url |
| `Avaliacao` | `:Avaliacao` | Review de terreiro | nota, texto, peso |
| `Grupo` | `:Grupo` | Grupo comunitário | nome, descricao, categoria |

## Propriedades de Nó (Schema)

```typescript
interface NodeSchema {
  terreiro: {
    required: ['id', 'nome', 'slug', 'tradicao', 'cidade', 'estado'];
    indexed: ['trustScore', 'status', 'cidade', 'estado', 'tradicao'];
    geo: ['latitude', 'longitude'];
  };
  usuario: {
    required: ['id', 'email', 'nome', 'role'];
    indexed: ['email', 'role', 'trustScore'];
  };
  evento: {
    required: ['id', 'titulo', 'dataInicio', 'tipo'];
    indexed: ['dataInicio', 'tipo', 'terreiroId', 'cidade'];
  };
  // ... each type follows same pattern
}
```

## Propriedades de Aresta (Relações)

Cada relação pode ter propriedades que enriquecem o significado:

| Relação | Propriedades |
|---------|-------------|
| `[:AVALIOU]` | nota, pesoAvaliador, data, util |
| `[:FREQUENTA]` | desde, frequencia, cargo |
| `[:REALIZA]` | dataInicio, dataFim, status |
| `[:PERTENCE_A]` | desde, comprovado |
| `[:LOCALIZADO_EM]` | latitude, longitude, precisao |
| `[:RECOMENDA]` | motivo, peso, data |
| `[:VENDIDO_POR]` | preco, estoque, status |
| `[:SIMILAR_A]` | similaridade (0-1), baseadaEm |

## Namespace de URIs

Cada entidade no grafo tem uma URI única e imutável:

```
axemap://terreiro/{uuid}
axemap://usuario/{uuid}
axemap://tradicao/umbanda
axemap://linha/oxala
axemap://orixa/iemanja
axemap://cidade/recife
axemap://evento/{uuid}
```

Essas URIs são usadas internamente para referenciar entidades de forma consistente, independente do banco subjacente.
