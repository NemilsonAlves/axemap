# 18 — Plano Marketplace

## Visão Geral

Marketplace B2C de artigos religiosos afro-brasileiros, conectando artesãos, lojistas e terreiros a compradores de todo o Brasil.

## Categorias de Produtos

| Categoria | Subcategorias | Exemplos | Ticket Médio |
|-----------|--------------|----------|-------------|
| **Velas** | 7 dias, 15 dias, votivas, coloridas | Vela para Exu, Vela para Iemanjá | R$ 12-35 |
| **Ervas e Defumadores** | Defumadores, ervas secas, banhos | Guiné, Arruda, Alecrim | R$ 8-25 |
| **Guias e Fios de Conta** | Guias, fios, pulseiras | Guia de Ogum, Fio de Oxalá | R$ 25-80 |
| **Vestuário** | Axós, saias, turbantes, batas, branco | Bata de gira, Saia rodada | R$ 60-200 |
| **Instrumentos** | Atabaques, agogôs, adjás, xequerês | Atabaque profissional, Agogô | R$ 80-1.500 |
| **Imagens e Esculturas** | Orixás, santos, guias | Imagem de Iemanjá, Oxóssi | R$ 30-300 |
| **Livros e Cursos** | Umbanda, Candomblé, história, rituais | "Umbanda de Preto Velho" | R$ 30-100 |
| **Incensos e Aromas** | Incensos, óleos, perfumes | Incenso de Arruda, Óleo de Oxalá | R$ 10-40 |
| **Acessórios** | Pembas, sinos, firmas, fumaçadores | Pemba, Sino de Oxalá | R$ 5-50 |

## Modelo de Negócio

### Vendedores
| Tipo | Taxa de Comissão | Diferenciais |
|------|-----------------|--------------|
| Artesão Individual | 10% | Cadastro simplificado |
| Loja Especializada | 12% | Catálogo ilimitado |
| Terreiro | 8% (desconto) | Integração com perfil do terreiro |

### Compradores
| Benefício | Grátis | Premium (R$ 19/mês) |
|-----------|--------|---------------------|
| Frete grátis em compras > R$ 150 | ❌ | ✓ |
| Desconto de 5% em todas compras | ❌ | ✓ |
| Acesso antecipado a lançamentos | ❌ | ✓ |
| Frete padrão | ✓ | ✓ |

## Fluxo Financeiro

```
Comprador → Pagamento (Stripe/Pix)
  → Retenção AxéMap (12% + taxa Stripe)
  → Repasse ao vendedor (líquido, semanal)
  → Emissão de NF (vendedor é responsável)
```

## Logística

| Opção | Descrição | Prazo |
|-------|-----------|-------|
| PAC Correios | Econômico | 5-15 dias úteis |
| SEDEX | Rápido | 1-3 dias úteis |
| Transportadora | Grandes volumes | Negociado |
| Retirada local | Comprador busca no terreiro/loja | Imediato |

## Segurança e Confiança

- **Verificação de vendedores:** Documento + foto do produto
- **Garantia AxéMap:** Reembolso em caso de não entrega
- **Avaliações de produtos:** Sistema de reviews
- **Mediação de conflitos:** Suporte para resolver disputas
- **Pagamento na plataforma:** Segurança do Stripe

## Projeção

| Métrica | Ano 1 | Ano 2 | Ano 3 |
|---------|-------|-------|-------|
| Vendedores ativos | 50 | 300 | 1.000 |
| Produtos cadastrados | 500 | 5.000 | 20.000 |
| Pedidos/mês | 500 | 5.000 | 25.000 |
| Ticket médio | R$ 80 | R$ 85 | R$ 90 |
| GMV mensal | R$ 40k | R$ 425k | R$ 2.250M |
| Receita AxéMap (12%) | R$ 4.800 | R$ 51k | R$ 270k |
