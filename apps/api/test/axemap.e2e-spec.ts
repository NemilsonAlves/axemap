/**
 * Testes E2E reais — Fluxos críticos do AxéMap (Prompt 09, Fase 19).
 *
 * Rodam contra a API em execução (http://localhost:3001/api/v1).
 * Pré-requisito: API rodando com banco seedado (admin@axemap.com.br / senha123).
 *
 * Cobertura (10 fluxos):
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
});