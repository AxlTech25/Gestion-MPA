import { beforeEach, describe, expect, it, vi } from 'vitest';
import api, { downloadFile } from '../../../lib/api';
import { equiposService } from './equiposService';

vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  downloadFile: vi.fn(),
}));

describe('equiposService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista, obtiene, crea, actualiza y elimina', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    api.get.mockResolvedValueOnce({ data: { id: 2 } });
    api.post.mockResolvedValue({ data: { id: 3 } });
    api.put.mockResolvedValue({ data: { id: 2, marca: 'HP' } });
    api.delete.mockResolvedValue({ data: { ok: true } });

    await expect(equiposService.getAllEquipos()).resolves.toEqual([{ id: 1 }]);
    await expect(equiposService.getEquipo(2)).resolves.toEqual({ id: 2 });
    await expect(equiposService.createEquipo({ marca: 'HP' })).resolves.toEqual({ id: 3 });
    await expect(equiposService.updateEquipo(2, { marca: 'HP' })).resolves.toEqual({ id: 2, marca: 'HP' });
    await expect(equiposService.deleteEquipo(2)).resolves.toEqual({ ok: true });

    expect(api.get).toHaveBeenNthCalledWith(1, '/equipos');
    expect(api.get).toHaveBeenNthCalledWith(2, '/equipos/2');
    expect(api.put).toHaveBeenCalledWith('/equipos/2', { marca: 'HP' });
    expect(api.delete).toHaveBeenCalledWith('/equipos/2');
  });

  it('descarga la plantilla y sube el archivo de carga masiva', async () => {
    const file = new File(['x'], 'equipos.xlsx');
    api.post.mockResolvedValue({ data: { insertados: 1 } });

    await equiposService.descargarPlantilla();
    await expect(equiposService.cargaMasiva(file)).resolves.toEqual({ insertados: 1 });

    expect(downloadFile).toHaveBeenCalledWith(
      '/equipos/plantilla',
      'plantilla_carga_equipos.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const body = api.post.mock.calls[0][1];
    expect(body).toBeInstanceOf(FormData);
    expect(api.post.mock.calls[0][0]).toBe('/equipos/carga-masiva');
  });
});
