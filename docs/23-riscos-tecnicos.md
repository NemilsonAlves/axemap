# 23 — Riscos Técnicos

## Matriz de Riscos

| ID | Risco | Probabilidade | Impacto | Nível | Mitigação |
|----|-------|:------------:|:-------:|:-----:|-----------|
| R1 | Baixa adoção inicial (terraço frio) | Alta | Crítico | 🔴 Crítico | MVP focado em problema real; parcerias com federações; divulgação em redes sociais do segmento |
| R2 | Intolerância religiosa na plataforma (ataques, reviews de ódio) | Alta | Crítico | 🔴 Crítico | Moderação humana + IA; sistema de denúncia; bloqueio automático de hate speech; parceria com advogados |
| R3 | Dados sensíveis vazados (religião é LGPD categoria especial) | Baixa | Catastrófico | 🔴 Crítico | Criptografia em repouso e trânsito; minimização de dados; auditoria constante; RLS PostgreSQL |
| R4 | Performance de busca geográfica com milhares de pins | Média | Alto | 🟠 Alto | PostGIS + índices GIST; clustering de pins no mapa; paginação + virtual scroll |
| R5 | Moderação manual não escala | Alta | Alto | 🟠 Alto | IA para pré-moderação; comunidade reports; moderação por pares (dirigentes confiáveis) |
| R6 | Concorrente estabelecido copiar funcionalidades | Média | Médio | 🟡 Médio | Velocidade de execução; ecossistema integrado é difícil de copiar; comunidade como moat |
| R7 | Stripe/processador de pagamento recusar por ser "religião afro" | Média | Alto | 🟠 Alto | Múltiplos processadores (Stripe + Asaas + Pix direto); documentação legal do negócio |
| R8 | Dependência de OpenStreetMap (qualidade dos dados no Brasil) | Média | Médio | 🟡 Médio | Fallback Google Maps (mediante custo); contribuição com OSM; geocoding com Nominatim + fallback |
| R9 | Escalabilidade do PostgreSQL com milhões de registros | Média | Médio | 🟡 Médio | Índices corretos; read replicas; sharding futuro; cache Redis agressivo |
| R10 | Dificuldade de onboarding de dirigentes não digitais | Alta | Médio | 🟠 Alto | Onboarding guiado; suporte WhatsApp; ajuda de filhos de santo jovens; vídeos tutoriais |
| R11 | Fraude no marketplace (vendedor não entrega) | Média | Alto | 🟠 Alto | Escrow (pagamento retido até confirmação); verificação de vendedores; seguro AxéMap |
| R12 | Ataque DDoS / scraping de dados do diretório | Alta | Médio | 🟠 Alto | Cloudflare WAF + Rate limiting; honeypot; bloqueio de IPs maliciosos; API pública como alternativa |
| R13 | Custo de infraestrutura crescer antes da receita | Alta | Médio | 🟠 Alto | Cloudflare R2 (storage barato); VPS ao invés de cloud cara; otimização de queries |
| R14 | Viés algorítmico (IA favorecer tradições majoritárias) | Média | Alto | 🟠 Alto | Auditoria de viés; diversidade no dataset de treino; transparência nos critérios; opt-out |
| R15 | Manutenção de equipe enxuta (single point of failure) | Alta | Alto | 🔴 Crítico | Documentação rigorosa; código limpo; CI/CD; bus factor mitigado por boas práticas |

## Planos de Contingência

### R1 — Baixa adoção
- **Trigger:** < 50 terreiros cadastrados após 2 meses do lançamento
- **Ação:** Campanha de cadastro assistido; parceria com federações estaduais; incentivo com plano grátis vitalício para primeiros 100 terreiros

### R2 — Ataques de intolerância
- **Trigger:** 10+ denúncias de hate speech em 24h
- **Ação:** Moderação manual imediata; bloqueio temporário do ofensor; contato com advogado; notificação às autoridades (se for crime)

### R3 — Vazamento de dados
- **Trigger:** Qualquer incidente de segurança confirmado
- **Ação:** Isolamento imediato; notificação ANPD (LGPD obriga em 72h); comunicação transparente aos afetados; investigação forense

### R9 — Degradação de performance
- **Trigger:** P95 latency > 2s nas queries de busca
- **Ação:** Cache Redis mais agressivo; read replica; otimização de queries; escalonamento vertical temporário

## Seguros e Proteções

| Tipo | Cobertura | Prioridade |
|------|-----------|-----------|
| Seguro cibernético | Vazamento de dados, ataques | Pré-lançamento |
| Termos de uso + LGPD | Proteção legal contra conteúdo de terceiros | Pré-lançamento |
| CNPJ adequado | MEI → LTDA (proteção patrimonial) | Pré-lançamento |
| Contrato de termos | Isenção de responsabilidade sobre conteúdo de terreiros | Pré-lançamento |

## Riscos Legais Específicos

1. **Liberdade religiosa x Moderação:** A plataforma não pode ser acusada de censura. A moderação deve se ater estritamente a conteúdo ilegal (discurso de ódio, ameaças) sem interferir em questões doutrinárias.
2. **Responsabilidade sobre conteúdo:** Seguir artigo 19 do Marco Civil da Internet — remoção apenas mediante ordem judicial ou para conteúdo explicitamente ilegal.
3. **Direito de imagem:** Termos de uso devem garantir que o terreiro autoriza o uso das fotos na plataforma.
4. **Propriedade intelectual:** Pontos cantados, letras e músicas podem ter direitos autorais — cuidado com upload de terceiros.
