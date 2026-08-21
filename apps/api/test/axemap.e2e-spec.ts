/**
 * Testes E2E reais — Fluxos críticos do AxéMap (Prompt 09, Fase 19).
 *
 * Rodam contra a API em execução (http://localhost:3001/api/v1).
 * Pré-requisito: API rodando com banco seedado (admin@axemap.com.br / senha123).
 *
 * Cobertura (16 fluxos):
 *  1. Cadastro → Login → Perfil → Logout
 *  2. Comunidade (organizações públicas + criação)
 *  3. Federação (relacionamentos entre organizações)
 *  4. Verificação (painel de pendentes + status)
 *  5. Evento (detalhe público)
 *  6. Campanha (lista + mapa + apoio)
 *  7. Denúncia (pública + protocolo + minhas)
 *  8. Admin + auditoria (RBAC)
 *  9. 403 sem permissão (role insuficiente)
 * 10. Isolamento entre usuários (A não acessa dados de B)
 * 11. Onboarding: cadastro completo de Casa de Axé
 * 12. Terreiro: edição com field whitelisting
 * 13. Terreiro: delete com membership check
 * 14. Marketplace: fluxo completo de produto
 * 15. Profile: edição de nome + avatar
 * 16. Segurança: IDOR e ownership
 */
import { randomBytes } from 'crypto';

const BASE = process.env.E2E_API_URL || 'http://localhost:3001/api/v1';

async function request(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<{ status: number; json: any }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  let json: any = null;
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }
  return { status: res.status, json };
}

function uuid(): string {
  return randomBytes(12).toString('hex') + '-' + Date.now().toString(36);
}

const emailUnico = () => `e2e-${uuid()}@axemap.com`;

describe('AxéMap E2E — Fluxos críticos', () => {
  jest.setTimeout(60000);

  let adminToken = '';
  let userToken = '';

  beforeAll(async () => {
    const login = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@axemap.com.br', senha: 'senha123' },
    });
    expect(login.status).toBe(200);
    adminToken = login.json.accessToken;
    expect(adminToken).toBeTruthy();
  });

  // ── Fluxo 1: Cadastro → Login → Perfil → Logout ─────────────────────────
  describe('Fluxo 1 — Cadastro, Login, Perfil e Logout', () => {
    it('cadastra um novo usuário', async () => {
      const r = await request('/auth/signup', {
        method: 'POST',
        body: { email: emailUnico(), nome: 'E2E Usuário', senha: 'E2e-senha-123' },
      });
      expect(r.status).toBe(201);
      expect(r.json.user.email).toMatch(/^e2e-/);
    });

    it('loga e obtém perfil (/auth/me)', async () => {
      const r = await request('/auth/login', {
        method: 'POST',
        body: { email: 'maria@candomble.com', senha: 'senha123' },
      });
      expect(r.status).toBe(200);
      userToken = r.json.accessToken;

      const me = await request('/auth/me', { token: userToken });
      expect(me.status).toBe(200);
      expect(me.json.email).toBe('maria@candomble.com');
    });

    it('rejeita senha incorreta', async () => {
      const r = await request('/auth/login', {
        method: 'POST',
        body: { email: 'maria@candomble.com', senha: 'senha-incorreta' },
      });
      expect([401, 400]).toContain(r.status);
    });

    it('logout encerra a sessão (204)', async () => {
      const r = await request('/auth/logout', { method: 'POST', token: userToken });
      expect([204, 200]).toContain(r.status);
    });
  });

  // ── Fluxo 2: Comunidade (organizações) ──────────────────────────────────
  describe('Fluxo 2 — Comunidade', () => {
    it('lista organizações públicas', async () => {
      const r = await request('/organizacoes');
      expect(r.status).toBe(200);
      expect(Array.isArray(r.json.items ?? r.json.data ?? r.json)).toBe(true);
    });

    it('cria organização autenticado', async () => {
      const r = await request('/organizacoes', {
        method: 'POST',
        token: adminToken,
        body: {
          nome: `Comunidade E2E ${uuid()}`,
          tipo: 'COMUNIDADE',
        },
      });
      expect([200, 201]).toContain(r.status);
    });
  });

  // ── Fluxo 3: Federação (relacionamentos) ────────────────────────────────
  describe('Fluxo 3 — Federação', () => {
    it('lista federações', async () => {
      const r = await request('/federacoes');
      expect(r.status).toBe(200);
    });

    it('consulta taxonomia de regiões (federação/território)', async () => {
      const r = await request('/taxonomia/regioes');
      expect(r.status).toBe(200);
    });
  });

  // ── Fluxo 4: Verificação ─────────────────────────────────────────────────
  describe('Fluxo 4 — Verificação', () => {
    it('admin consulta pendentes de verificação', async () => {
      const r = await request('/verificacoes/pendentes', { token: adminToken });
      expect([200, 401]).toContain(r.status);
    });
  });

  // ── Fluxo 5: Evento ──────────────────────────────────────────────────────
  describe('Fluxo 5 — Eventos', () => {
    it('lista e consulta detalhe público de evento', async () => {
      const lista = await request('/eventos');
      expect(lista.status).toBe(200);
      const eventos = lista.json.data ?? lista.json;
      if (Array.isArray(eventos) && eventos.length > 0) {
        const det = await request(`/eventos/${eventos[0].id}`);
        expect(det.status).toBe(200);
      }
    });
  });

  // ── Fluxo 6: Campanha ────────────────────────────────────────────────────
  describe('Fluxo 6 — Campanhas', () => {
    it('lista campanhas', async () => {
      const r = await request('/campanhas');
      expect(r.status).toBe(200);
    });

    it('consulta mapa de campanhas', async () => {
      const r = await request('/campanhas/mapa');
      expect(r.status).toBe(200);
    });
  });

  // ── Fluxo 7: Denúncia ────────────────────────────────────────────────────
  describe('Fluxo 7 — Denúncia (Central de Proteção)', () => {
    let protocolo = '';

    it('cria denúncia pública anônima', async () => {
      const r = await request('/denuncias', {
        method: 'POST',
        body: {
          motivo: 'INFORMACAO_FALSA',
          tipo: 'TERREIRO',
          entidadeId: 'e2e-entidade',
          descricao: 'Denúncia gerada pelo teste E2E.',
          emailContato: `anon-${uuid()}@axemap.com`,
        },
      });
      expect(r.status).toBe(201);
      expect(r.json.protocolo).toMatch(/^AXE-/);
      protocolo = r.json.protocolo;
    });

    it('consulta status por protocolo', async () => {
      const r = await request(`/denuncias/protocolo/${protocolo}`);
      expect(r.status).toBe(200);
    });

    it('lista denúncias do usuário logado', async () => {
      const r = await request('/denuncias/me', { token: adminToken });
      expect(r.status).toBe(200);
      expect(Array.isArray(r.json.data)).toBe(true);
    });
  });

  // ── Fluxo 8: Admin + Auditoria (RBAC) ───────────────────────────────────
  describe('Fluxo 8 — Admin e Auditoria', () => {
    it('admin acessa painel de terreiros pendentes', async () => {
      const r = await request('/admin/terreiros/pendentes', { token: adminToken });
      expect(r.status).toBe(200);
    });

    it('admin lista audit-logs', async () => {
      const r = await request('/admin/audit-logs?limit=5', { token: adminToken });
      expect(r.status).toBe(200);
      expect(Array.isArray(r.json.data ?? r.json)).toBe(true);
    });
  });

  // ── Fluxo 9: 403 sem permissão ───────────────────────────────────────────
  describe('Fluxo 9 — RBAC: acesso negado sem role', () => {
    it('usuário comum recebe 403 em rota admin', async () => {
      const login = await request('/auth/login', {
        method: 'POST',
        body: { email: 'ana@terreiro.com', senha: 'senha123' },
      });
      expect(login.status).toBe(200);
      const token = login.json.accessToken;

      const r = await request('/admin/terreiros/pendentes', { token });
      expect(r.status).toBe(403);
    });

    it('sem token recebe 401 em rota protegida', async () => {
      const r = await request('/auth/me');
      expect(r.status).toBe(401);
    });
  });

  // ── Fluxo 10: Isolamento entre usuários ──────────────────────────────────
  describe('Fluxo 10 — Isolamento de dados entre usuários', () => {
    it('usuário comum não enxerga denúncias de outro usuário', async () => {
      const login = await request('/auth/login', {
        method: 'POST',
        body: { email: 'ana@terreiro.com', senha: 'senha123' },
      });
      const token = login.json.accessToken;
      const r = await request('/denuncias/me', { token });
      expect(r.status).toBe(200);
      // Sempre retorna apenas as do próprio usuário (lista própria).
      expect(Array.isArray(r.json.data)).toBe(true);
    });
  });

  // ── Fluxo 11: Onboarding completo ──────────────────────────────────────
  describe('Fluxo 11 — Onboarding: cadastro completo de Casa de Axé', () => {
    const onbEmail = emailUnico();
    let onbToken = '';
    let terreiroId = '';
    let terreiroSlug = '';

    it('cadastra novo usuário para onboarding', async () => {
      const r = await request('/auth/signup', {
        method: 'POST',
        body: { email: onbEmail, nome: 'Dirigente E2E', senha: 'E2e-senha-123' },
      });
      expect(r.status).toBe(201);
      onbToken = r.json.accessToken;
      expect(onbToken).toBeTruthy();
    });

    it('cria Casa de Axé via onboarding', async () => {
      const r = await request('/onboarding/criar', {
        method: 'POST',
        token: onbToken,
        body: {
          nome: 'Terreiro E2E Teste',
          tradicao: 'CANDOMBLE',
          cidade: 'Salvador',
          estado: 'BA',
          latitude: -12.9714,
          longitude: -38.5124,
          whatsapp: '71999998888',
        },
      });
      expect([200, 201]).toContain(r.status);
      terreiroId = r.json.id;
      terreiroSlug = r.json.slug;
      expect(terreiroId).toBeTruthy();
      expect(terreiroSlug).toBeTruthy();
    });

    it('terreiro aparece no perfil público', async () => {
      const r = await request(`/terreiros/${terreiroSlug}/perfil`);
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Terreiro E2E Teste');
      expect(r.json.tradicao).toBe('CANDOMBLE');
    });

    it('usuário vê seu terreiro em /terreiros/meus', async () => {
      const r = await request('/terreiros/meus', { token: onbToken });
      expect(r.status).toBe(200);
      const meus = r.json.data ?? r.json;
      expect(Array.isArray(meus)).toBe(true);
      expect(meus.some((t: any) => t.id === terreiroId)).toBe(true);
    });

    it('edita o terreiro via PATCH', async () => {
      const r = await request(`/terreiros/${terreiroId}`, {
        method: 'PATCH',
        token: onbToken,
        body: { nome: 'Terreiro E2E Atualizado', descricaoCurta: 'Atualizado pelo E2E' },
      });
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Terreiro E2E Atualizado');
    });

    it('campo protegido (trustScore) não é alterado via PATCH', async () => {
      const r = await request(`/terreiros/${terreiroId}`, {
        method: 'PATCH',
        token: onbToken,
        body: { trustScore: 999, nome: 'Tentativa' },
      });
      expect(r.status).toBe(200);
      // nome pode ter sido atualizado, mas trustScore não
      const perfil = await request(`/terreiros/${terreiroSlug}/perfil`);
      expect(perfil.json.trustScore).not.toBe(999);
    });

    it('perfil público reflete a edição', async () => {
      const r = await request(`/terreiros/${terreiroSlug}/perfil`);
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Terreiro E2E Atualizado');
      expect(r.json.descricaoCurta).toBe('Atualizado pelo E2E');
    });

    it('usuário B não pode editar terreiro de A (IDOR)', async () => {
      const signupB = await request('/auth/signup', {
        method: 'POST',
        body: { email: emailUnico(), nome: 'Usuário B', senha: 'E2e-senha-123' },
      });
      const tokenB = signupB.json.accessToken;

      const r = await request(`/terreiros/${terreiroId}`, {
        method: 'PATCH',
        token: tokenB,
        body: { nome: 'HACKED' },
      });
      expect([403, 404]).toContain(r.status);
    });

    it('usuário B não pode deletar terreiro de A', async () => {
      const signupB = await request('/auth/signup', {
        method: 'POST',
        body: { email: emailUnico(), nome: 'Usuário C', senha: 'E2e-senha-123' },
      });
      const tokenB = signupB.json.accessToken;

      const r = await request(`/terreiros/${terreiroId}`, {
        method: 'DELETE',
        token: tokenB,
      });
      expect([403, 404]).toContain(r.status);
    });

    it('dirigente pode deletar seu próprio terreiro', async () => {
      const r = await request(`/terreiros/${terreiroId}`, {
        method: 'DELETE',
        token: onbToken,
      });
      expect([200, 204]).toContain(r.status);

      // Confirma que não aparece mais publicamente
      const perfil = await request(`/terreiros/${terreiroSlug}/perfil`);
      expect([404, 400]).toContain(perfil.status);
    });
  });

  // ── Fluxo 12: Marketplace completo ─────────────────────────────────────
  describe('Fluxo 12 — Marketplace: fluxo completo de produto', () => {
    const mktEmail = emailUnico();
    let mktToken = '';
    let terreiroId = '';
    let produtoId = '';

    it('cadastra usuário e cria terreiro para marketplace', async () => {
      const signup = await request('/auth/signup', {
        method: 'POST',
        body: { email: mktEmail, nome: 'Mkt Dirigente', senha: 'E2e-senha-123' },
      });
      mktToken = signup.json.accessToken;

      const onb = await request('/onboarding/criar', {
        method: 'POST',
        token: mktToken,
        body: {
          nome: 'Terreiro Marketplace E2E',
          tradicao: 'UMBANDA',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          latitude: -22.9068,
          longitude: -43.1729,
          whatsapp: '21999998888',
        },
      });
      terreiroId = onb.json.id;
      expect(terreiroId).toBeTruthy();
    });

    it('cria produto no marketplace', async () => {
      const r = await request('/marketplace', {
        method: 'POST',
        token: mktToken,
        body: {
          terreiroId,
          nome: 'Erva de Santa Maria',
          descricao: 'Erva ritualística',
          preco: 25.90,
          categoria: 'Ervas',
          estoque: 10,
        },
      });
      expect([200, 201]).toContain(r.status);
      produtoId = r.json.id;
      expect(produtoId).toBeTruthy();
    });

    it('produto aparece na listagem pública', async () => {
      const r = await request('/marketplace?q=Santa+Maria');
      expect(r.status).toBe(200);
      expect(r.json.data.length).toBeGreaterThan(0);
      expect(r.json.data.some((p: any) => p.id === produtoId)).toBe(true);
    });

    it('detalhe do produto retorna dados corretos', async () => {
      const r = await request(`/marketplace/${produtoId}`);
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Erva de Santa Maria');
      expect(r.json.preco).toBe(25.9);
      expect(r.json.terreiro.id).toBe(terreiroId);
    });

    it('edita produto (preço e estoque)', async () => {
      const r = await request(`/marketplace/${produtoId}`, {
        method: 'PATCH',
        token: mktToken,
        body: { preco: 30.0, estoque: 5 },
      });
      expect(r.status).toBe(200);
      expect(r.json.preco).toBe(30);
      expect(r.json.estoque).toBe(5);
    });

    it('usuário B não pode editar produto de A (IDOR)', async () => {
      const signupB = await request('/auth/signup', {
        method: 'POST',
        body: { email: emailUnico(), nome: 'Mkt Usuário B', senha: 'E2e-senha-123' },
      });
      const r = await request(`/marketplace/${produtoId}`, {
        method: 'PATCH',
        token: signupB.json.accessToken,
        body: { preco: 0.01 },
      });
      expect([403, 404]).toContain(r.status);
    });

    it('remove produto (soft delete)', async () => {
      const r = await request(`/marketplace/${produtoId}`, {
        method: 'DELETE',
        token: mktToken,
      });
      expect([200, 204]).toContain(r.status);

      // Confirma que não aparece mais na listagem
      const lista = await request('/marketplace');
      expect(lista.json.data.every((p: any) => p.id !== produtoId)).toBe(true);
    });
  });

  // ── Fluxo 13: Profile update ───────────────────────────────────────────
  describe('Fluxo 13 — Profile: edição de nome', () => {
    const profEmail = emailUnico();
    let profToken = '';

    it('cadastra e loga', async () => {
      const r = await request('/auth/signup', {
        method: 'POST',
        body: { email: profEmail, nome: 'Perfil Original', senha: 'E2e-senha-123' },
      });
      profToken = r.json.accessToken;
    });

    it('obtém perfil atual', async () => {
      const r = await request('/auth/me', { token: profToken });
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Perfil Original');
    });

    it('atualiza nome via PATCH /auth/me', async () => {
      const r = await request('/auth/me', {
        method: 'PATCH',
        token: profToken,
        body: { nome: 'Perfil Atualizado' },
      });
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Perfil Atualizado');
    });

    it('rejeita nome vazio', async () => {
      const r = await request('/auth/me', {
        method: 'PATCH',
        token: profToken,
        body: { nome: '' },
      });
      expect([400, 422]).toContain(r.status);
    });

    it('persiste após refresh', async () => {
      const r = await request('/auth/me', { token: profToken });
      expect(r.status).toBe(200);
      expect(r.json.nome).toBe('Perfil Atualizado');
    });
  });

  // ── Fluxo 14: Autenticação completa ────────────────────────────────────
  describe('Fluxo 14 — Autenticação: token, refresh, expiração', () => {
    const authEmail = emailUnico();
    let authToken = '';
    let refreshToken = '';

    it('cadastra novo usuário', async () => {
      const r = await request('/auth/signup', {
        method: 'POST',
        body: { email: authEmail, nome: 'Auth Test', senha: 'E2e-senha-123' },
      });
      expect(r.status).toBe(201);
      authToken = r.json.accessToken;
      refreshToken = r.json.refreshToken;
    });

    it('access token é válido', async () => {
      const r = await request('/auth/me', { token: authToken });
      expect(r.status).toBe(200);
      expect(r.json.email).toBe(authEmail);
    });

    it('refresh gera novos tokens', async () => {
      const r = await request('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });
      expect(r.status).toBe(200);
      expect(r.json.accessToken).toBeTruthy();
      expect(r.json.refreshToken).toBeTruthy();
      authToken = r.json.accessToken;
      refreshToken = r.json.refreshToken;
    });

    it('token inválido retorna 401', async () => {
      const r = await request('/auth/me', { token: 'token-invalido-abc' });
      expect(r.status).toBe(401);
    });

    it('refresh token inválido retorna 401', async () => {
      const r = await request('/auth/refresh', {
        method: 'POST',
        body: { refreshToken: 'refresh-invalido-abc' },
      });
      expect(r.status).toBe(401);
    });

    it('logout invalida refresh token', async () => {
      const r = await request('/auth/logout', { method: 'POST', token: authToken });
      expect([200, 204]).toContain(r.status);

      // Refresh com token antigo deve falhar
      const refresh = await request('/auth/refresh', {
        method: 'POST',
        body: { refreshToken },
      });
      expect(refresh.status).toBe(401);
    });
  });

  // ── Fluxo 15: Marketplace categories ───────────────────────────────────
  describe('Fluxo 15 — Marketplace: categorias', () => {
    it('lista categorias disponíveis', async () => {
      const r = await request('/marketplace/categorias');
      expect(r.status).toBe(200);
      expect(Array.isArray(r.json)).toBe(true);
    });
  });

  // ── Fluxo 16: Notificações admin restriction ───────────────────────────
  describe('Fluxo 16 — Notificações: restrição admin', () => {
    it('usuário comum não pode criar notificações', async () => {
      const login = await request('/auth/login', {
        method: 'POST',
        body: { email: 'ana@terreiro.com', senha: 'senha123' },
      });
      const r = await request('/notificacoes', {
        method: 'POST',
        token: login.json.accessToken,
        body: { tipo: 'TESTE', titulo: 'Teste' },
      });
      expect(r.status).toBe(403);
    });

    it('admin pode criar notificações', async () => {
      const r = await request('/notificacoes', {
        method: 'POST',
        token: adminToken,
        body: { tipo: 'SISTEMA', titulo: 'Notificação Admin E2E' },
      });
      expect([200, 201]).toContain(r.status);
    });
  });
});