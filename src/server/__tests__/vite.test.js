import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('vite', () => ({ defineConfig: (config) => config }));
vi.mock('@vitejs/plugin-react', () => ({ default: () => ({ name: 'react' }) }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const loadConfig = async () => (await import('../../../vite.config.js')).default;

describe('Vite API proxy', () => {
  it('uses Aspire service endpoints and suppresses browser auto-open', async () => {
    vi.stubEnv('API_URL', 'http://localhost:43123');
    vi.stubEnv('BROWSER', 'none');
    const config = await loadConfig();

    expect(config.server.proxy['/api']).toBe('http://localhost:43123');
    expect(config.server.proxy['/auth']).toBe('http://localhost:43123');
    expect(config.server.open).toBe(false);
  });

  it('preserves standalone development with a configured API port', async () => {
    vi.stubEnv('API_URL', '');
    vi.stubEnv('PORT', '8181');
    vi.stubEnv('BROWSER', '');
    const config = await loadConfig();

    expect(config.server.proxy['/api']).toBe('http://localhost:8181');
    expect(config.server.open).toBe(true);
  });

  it('defaults the standalone API to port 8080', async () => {
    vi.stubEnv('API_URL', '');
    vi.stubEnv('PORT', '');

    expect((await loadConfig()).server.proxy['/api']).toBe('http://localhost:8080');
  });
});
