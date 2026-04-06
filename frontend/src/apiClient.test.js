import { beforeEach, describe, expect, it, vi } from 'vitest';

const createSpy = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: (...args) => createSpy(...args),
  },
}));

function createAxiosClientStub() {
  const requestHandlers = [];
  const responseHandlers = [];
  return {
    interceptors: {
      request: {
        use: (handler) => {
          requestHandlers.push(handler);
        },
      },
      response: {
        use: (handler) => {
          responseHandlers.push(handler);
        },
      },
    },
    get: vi.fn(),
    __requestHandlers: requestHandlers,
    __responseHandlers: responseHandlers,
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  createSpy.mockReset();
  vi.stubGlobal('document', { cookie: '' });
});

describe('apiClient', () => {
  it('normalizes VITE_API_BASE_URL variants and enables credentials', async () => {
    const clientA = createAxiosClientStub();
    createSpy.mockReturnValueOnce(clientA);
    vi.stubEnv('VITE_API_BASE_URL', 'amazon-api.vercel.app');
    await import('./apiClient');
    expect(createSpy).toHaveBeenLastCalledWith({
      baseURL: 'https://amazon-api.vercel.app',
      withCredentials: true,
    });

    const clientB = createAxiosClientStub();
    createSpy.mockReturnValueOnce(clientB);
    vi.resetModules();
    vi.stubEnv('VITE_API_BASE_URL', 'https://amazon-api.vercel.app/');
    await import('./apiClient');
    expect(createSpy).toHaveBeenLastCalledWith({
      baseURL: 'https://amazon-api.vercel.app',
      withCredentials: true,
    });

    const clientC = createAxiosClientStub();
    createSpy.mockReturnValueOnce(clientC);
    vi.resetModules();
    vi.stubEnv('VITE_API_BASE_URL', '//amazon-api.vercel.app/');
    await import('./apiClient');
    expect(createSpy).toHaveBeenLastCalledWith({
      baseURL: 'https://amazon-api.vercel.app',
      withCredentials: true,
    });
  });

  it('injects csrf header for write methods and caches token from responses', async () => {
    const client = createAxiosClientStub();
    createSpy.mockReturnValueOnce(client);
    const mod = await import('./apiClient');

    document.cookie = 'csrf_token=cookie-token';
    const requestHandler = client.__requestHandlers[0];
    const responseHandler = client.__responseHandlers[0];

    const getConfig = await requestHandler({ method: 'get', headers: {} });
    expect(getConfig.headers['x-csrf-token']).toBeUndefined();

    const postConfig = await requestHandler({ method: 'post', headers: {} });
    expect(postConfig.headers['x-csrf-token']).toBe('cookie-token');

    responseHandler({ data: { csrfToken: 'cached-token' } });
    document.cookie = '';
    const putConfig = await requestHandler({ method: 'put', headers: {} });
    expect(putConfig.headers['x-csrf-token']).toBe('cached-token');

    client.get.mockResolvedValueOnce({ data: { csrfToken: 'init-token' } });
    await mod.initializeCsrfToken();
    const patchConfig = await requestHandler({ method: 'patch', headers: {} });
    expect(patchConfig.headers['x-csrf-token']).toBe('init-token');
  });

  it('swallows initializeCsrfToken failures', async () => {
    const client = createAxiosClientStub();
    createSpy.mockReturnValueOnce(client);
    const mod = await import('./apiClient');
    client.get.mockRejectedValueOnce(new Error('offline'));
    await expect(mod.initializeCsrfToken()).resolves.toBeUndefined();
  });
});
