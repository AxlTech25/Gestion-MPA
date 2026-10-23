import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../lib/api';
import { fichaTecnicaService } from './fichaTecnicaService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

describe('fichaTecnicaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene la ficha y busca por código recortado', async () => {
    api.get.mockResolvedValueOnce({ data: { id: 4 } });
    api.get.mockResolvedValueOnce({ data: { codigo: 'A B' } });

    await expect(fichaTecnicaService.getFicha(4)).resolves.toEqual({ id: 4 });
    await expect(fichaTecnicaService.buscarPorCodigo('  A B  ')).resolves.toEqual({ codigo: 'A B' });
    expect(api.get).toHaveBeenNthCalledWith(2, '/fichas-tecnicas/buscar/A%20B');
  });

  it('guarda con PUT o con POST si el cuerpo es un archivo', async () => {
    api.put.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: 'file' } });
    const form = new FormData();

    await expect(fichaTecnicaService.saveFicha(4, { marca: 'HP' })).resolves.toEqual({ ok: true });
    await expect(fichaTecnicaService.saveFicha(4, form, true)).resolves.toEqual({ ok: 'file' });

    expect(api.put).toHaveBeenCalledWith('/fichas-tecnicas/4', { marca: 'HP' }, { headers: undefined });
    expect(api.post).toHaveBeenCalledWith(
      '/fichas-tecnicas/4',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });
});
