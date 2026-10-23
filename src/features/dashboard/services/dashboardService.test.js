import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../../lib/api';
import { dashboardService } from './dashboardService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn() },
}));

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide el resumen', async () => {
    api.get.mockResolvedValue({ data: { equipos: 1 } });
    await expect(dashboardService.getResumen()).resolves.toEqual({ equipos: 1 });
    expect(api.get).toHaveBeenCalledWith('/dashboard');
  });

  it('arma la consulta solo con los filtros presentes', async () => {
    api.get.mockResolvedValue({ data: { items: [] } });
    await dashboardService.consultarEquipos();
    expect(api.get).toHaveBeenCalledWith('/dashboard/consulta?');

    await dashboardService.consultarEquipos({
      tipo_equipo: 'Otro',
      tipo_otro: 'Plotter',
      estado_operativo: 'Operativo',
      estado_conservacion: 'Bueno',
    });
    const url = api.get.mock.calls[1][0];
    expect(url).toContain('tipo_equipo=Otro');
    expect(url).toContain('tipo_otro=Plotter');
    expect(url).toContain('estado_operativo=Operativo');
    expect(url).toContain('estado_conservacion=Bueno');
  });
});
