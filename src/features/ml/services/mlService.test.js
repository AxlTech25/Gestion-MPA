import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../lib/api';
import { mlService } from './mlService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe('mlService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta estado, inventario, equipo y alertas', async () => {
    api.get.mockResolvedValue({ data: { ok: true } });
    await expect(mlService.getStatus()).resolves.toEqual({ ok: true });
    await expect(mlService.getRiesgoInventario()).resolves.toEqual({ ok: true });
    await expect(mlService.getRiesgoEquipo(7)).resolves.toEqual({ ok: true });
    await expect(mlService.getAlertas()).resolves.toEqual({ ok: true });

    expect(api.get).toHaveBeenCalledWith('/ml/status');
    expect(api.get).toHaveBeenCalledWith('/ml/equipos/riesgo', { timeout: 90000 });
    expect(api.get).toHaveBeenCalledWith('/ml/equipos/7/riesgo', { timeout: 90000 });
    expect(api.get).toHaveBeenCalledWith('/ml/alertas', { timeout: 90000 });
  });

  it('pide la categoría de un equipo', async () => {
    api.post.mockResolvedValue({ data: { nivel: 'Alto' } });
    await expect(mlService.predictCategoria(7)).resolves.toEqual({ nivel: 'Alto' });
    expect(api.post).toHaveBeenCalledWith('/ml/predict/categoria', { equipo_id: 7 });
  });
});
