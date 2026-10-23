import { describe, expect, it, vi } from 'vitest';

describe('config', () => {
  it('usa la ruta por defecto y las claves de sesión', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    const { API_BASE_URL, TOKEN_KEY, USER_KEY } = await import('./config');
    expect(API_BASE_URL).toBe('/gestion_mpa/backend/api/v2');
    expect(TOKEN_KEY).toBe('token');
    expect(USER_KEY).toBe('user');
  });

  it('respeta VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
    vi.resetModules();
    const { API_BASE_URL } = await import('./config.js');
    expect(API_BASE_URL).toBe('http://api.test');
  });
});
