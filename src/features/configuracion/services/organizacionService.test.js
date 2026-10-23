import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../lib/api';
import { organizacionService } from './organizacionService';

vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('organizacionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValue({ data: { id: 1 } });
    api.put.mockResolvedValue({ data: { id: 1 } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it('cubre áreas, gerencias y usuarios', async () => {
    await organizacionService.getAreas();
    await organizacionService.createArea({ nombre: 'Caja' });
    await organizacionService.updateArea(2, { nombre: 'Caja' });
    await organizacionService.deleteArea(2);

    await organizacionService.getGerencias();
    await organizacionService.createGerencia({ nombre: 'Obras' });
    await organizacionService.updateGerencia(3, { nombre: 'Obras' });
    await organizacionService.deleteGerencia(3);

    await organizacionService.getUsuarios();
    await organizacionService.createUsuario({ nombre: 'Ana' });
    await organizacionService.updateUsuario(4, { nombre: 'Ana' });
    await organizacionService.deleteUsuario(4);

    expect(api.get).toHaveBeenCalledWith('/areas');
    expect(api.post).toHaveBeenCalledWith('/areas', { nombre: 'Caja' });
    expect(api.put).toHaveBeenCalledWith('/areas?id=2', { nombre: 'Caja' });
    expect(api.delete).toHaveBeenCalledWith('/areas?id=2');
    expect(api.put).toHaveBeenCalledWith('/gerencias?id=3', { nombre: 'Obras' });
    expect(api.delete).toHaveBeenCalledWith('/usuarios?id=4');
  });
});
