import { Test } from '@nestjs/testing';
import { INestApplication, RequestMethod } from '@nestjs/common';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { AxegraphPublicController, AxegraphUserController } from './axegraph.controller';
import { AxegraphAdminController } from './axegraph-admin.controller';
import { AxegraphService } from './axegraph.service';
import { AxegraphModule } from './axegraph.module';
import { AppModule } from '../app.module';

const PREFIXO_GLOBAL = 'api/v1';

// ---------------------------------------------------------------------------
// Garante a superfície de rotas do Axé Graph e o registro do módulo.
// As rotas reais usam o segmento "graph" (não "axegraph"):
//   público:  GET /api/v1/graph/buscar, /graph/recomendacoes, ...
//   usuário:  /api/v1/graph/relacionamentos (JWT), ...
//   admin:    /api/v1/admin/graph/dashboard (estatísticas), ...
// ---------------------------------------------------------------------------

describe('Axegraph — registro do módulo', () => {
  it('AxegraphModule está importado no AppModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule) as any[];
    expect(imports).toContain(AxegraphModule);
  });

  it('AxegraphModule registra os 3 controllers', () => {
    const controllers = Reflect.getMetadata('controllers', AxegraphModule) as any[];
    expect(controllers).toContain(AxegraphPublicController);
    expect(controllers).toContain(AxegraphUserController);
    expect(controllers).toContain(AxegraphAdminController);
  });
});

describe('Axegraph — prefixos dos controllers', () => {
  it.each([
    [AxegraphPublicController, '/'],
    [AxegraphUserController, 'graph'],
    [AxegraphAdminController, 'admin/graph'],
  ])('%s usa prefixo de controller "%s"', (ctrl: any, prefixo: string) => {
    expect(Reflect.getMetadata(PATH_METADATA, ctrl)).toBe(prefixo);
  });
});

describe('Axegraph — rotas públicas (GET /api/v1/graph/*)', () => {
  it.each([
    ['buscar', 'graph/buscar', RequestMethod.GET],
    ['recomendar', 'graph/recomendacoes', RequestMethod.GET],
    ['vizinhanca', 'graph/vizinhanca/:tipo/:id', RequestMethod.GET],
    ['relacionamentos', 'graph/relacionamentos', RequestMethod.GET],
    ['conteudos', 'graph/conteudos', RequestMethod.GET],
    ['patrimonios', 'graph/patrimonios', RequestMethod.GET],
    ['rotas', 'graph/rotas', RequestMethod.GET],
  ])('rota %s => /api/v1/%s (%s)', (method, path, verb) => {
    const fn = (AxegraphPublicController.prototype as any)[method];
    expect(Reflect.getMetadata(METHOD_METADATA, fn)).toBe(verb);
    expect(Reflect.getMetadata(PATH_METADATA, fn)).toBe(path);
  });

  it('GET buscar => caminho completo /api/v1/graph/buscar', () => {
    const fn = AxegraphPublicController.prototype.buscar;
    const caminho = `/${PREFIXO_GLOBAL}/${Reflect.getMetadata(PATH_METADATA, fn)}`;
    expect(caminho).toBe('/api/v1/graph/buscar');
  });
});

describe('Axegraph — estatísticas (admin) => GET /api/v1/admin/graph/dashboard', () => {
  it('dashboard está em admin/graph e é GET', () => {
    const fn = AxegraphAdminController.prototype.dashboard;
    expect(Reflect.getMetadata(PATH_METADATA, AxegraphAdminController)).toBe('admin/graph');
    expect(Reflect.getMetadata(METHOD_METADATA, fn)).toBe(RequestMethod.GET);
    expect(Reflect.getMetadata(PATH_METADATA, fn)).toBe('dashboard');
  });

  it('caminho completo esperado => /api/v1/admin/graph/dashboard', () => {
    const fn = AxegraphAdminController.prototype.dashboard;
    const caminho = `/${PREFIXO_GLOBAL}/${Reflect.getMetadata(PATH_METADATA, AxegraphAdminController)}/${Reflect.getMetadata(PATH_METADATA, fn)}`;
    expect(caminho).toBe('/api/v1/admin/graph/dashboard');
  });

  it('demais rotas admin => /api/v1/admin/graph/*', () => {
    const fn = AxegraphAdminController.prototype.listarDuplicidades;
    expect(Reflect.getMetadata(METHOD_METADATA, fn)).toBe(RequestMethod.GET);
    expect(Reflect.getMetadata(PATH_METADATA, fn)).toBe('duplicidades');
  });
});

describe('Axegraph — HTTP real (controller público, serviço mockado)', () => {
  let app: INestApplication;
  let baseUrl: string;
  const serviceMock = { buscar: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AxegraphPublicController],
      providers: [{ provide: AxegraphService, useValue: serviceMock }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix(PREFIXO_GLOBAL);
    await app.init();
    await app.listen(0);
    const address = app.getHttpServer().address() as { port: number };
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/graph/buscar?q=terreiro&limit=1 => 200 e repassa query', async () => {
    serviceMock.buscar.mockResolvedValue({ consulta: 'terreiro', total: 1, resultados: [] });
    const res = await globalThis.fetch(`${baseUrl}/api/v1/graph/buscar?q=terreiro&limit=1`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { total: number };
    expect(body.total).toBe(1);
    expect(serviceMock.buscar).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'terreiro', limit: 1 }),
    );
  });

  it('GET /api/v1/axegraph/buscar (segmento errado) => 404', async () => {
    const res = await globalThis.fetch(`${baseUrl}/api/v1/axegraph/buscar?q=terreiro`);
    expect(res.status).toBe(404);
  });
});