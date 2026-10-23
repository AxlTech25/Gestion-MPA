import { beforeEach, describe, expect, it, vi } from 'vitest';
import api, { downloadPdf } from '../../../lib/api';
import { mantenimientoService } from './mantenimientoService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  downloadPdf: vi.fn(),
}));

describe('mantenimientoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista, obtiene, busca y crea', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.get.mockResolvedValueOnce({ data: { id: 8 } });
    api.get.mockResolvedValueOnce({ data: { codigo: 'EQ 1' } });
    api.post.mockResolvedValue({ data: { id: 9 } });

    await expect(mantenimientoService.getAll()).resolves.toEqual([]);
    await expect(mantenimientoService.getById(8)).resolves.toEqual({ id: 8 });
    await expect(mantenimientoService.buscarHistorialPorCodigo(' EQ 1 ')).resolves.toEqual({ codigo: 'EQ 1' });
    await expect(mantenimientoService.create({ tipo: 'Correctivo' })).resolves.toEqual({ id: 9 });

    expect(api.get).toHaveBeenNthCalledWith(3, '/mantenimientos/historial/EQ%201');
    expect(api.post).toHaveBeenCalledWith('/mantenimientos', { tipo: 'Correctivo' });
  });

  it('pide los PDF de historial y de ficha', async () => {
    await mantenimientoService.exportHistorialPdf(' EQ 1 ');
    await mantenimientoService.exportFichaPdf(8);
    expect(downloadPdf).toHaveBeenNthCalledWith(1, '/reportes/mantenimiento/historial/EQ%201');
    expect(downloadPdf).toHaveBeenNthCalledWith(2, '/reportes/mantenimiento/8');
  });
});
