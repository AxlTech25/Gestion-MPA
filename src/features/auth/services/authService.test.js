import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../lib/api';
import { authService } from './authService';

vi.mock('../../../lib/api', () => ({
  default: { post: vi.fn() },
}));

describe('authService', () => {
  beforeEach(() => {
    api.post.mockReset();
  });

  it('envía las credenciales y devuelve el cuerpo', async () => {
    api.post.mockResolvedValue({ data: { token: 'abc' } });
    await expect(authService.login({ usuario: 'admin' })).resolves.toEqual({ token: 'abc' });
    expect(api.post).toHaveBeenCalledWith('/auth/login', { usuario: 'admin' });
  });
});
