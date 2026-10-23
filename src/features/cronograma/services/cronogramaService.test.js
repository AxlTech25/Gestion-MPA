import { beforeEach, describe, expect, it, vi } from 'vitest';
import api, { downloadPdf } from '../../../lib/api';
import { cronogramaService } from './cronogramaService';

vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  downloadPdf: vi.fn(),
}));

describe('cronogramaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { id: 1 } });
    api.put.mockResolvedValue({ data: { guardado: true } });
    api.delete.mockResolvedValue({ data: { eliminado: true } });
  });

  it('lista con año o sin filtro', async () => {
    await cronogramaService.listar(2026);
    await cronogramaService.listar();
    expect(api.get).toHaveBeenNthCalledWith(1, '/cronogramas', { params: { anio: 2026 } });
    expect(api.get).toHaveBeenNthCalledWith(2, '/cronogramas', { params: undefined });
  });

  it('crea, elimina, lee la matriz y marca o libera celdas', async () => {
    await expect(cronogramaService.crear({ anio: 2026 })).resolves.toEqual({ id: 1 });
    await expect(cronogramaService.eliminar(3)).resolves.toEqual({ eliminado: true });
    await expect(cronogramaService.getMatriz(3)).resolves.toEqual({ ok: true });
    await expect(cronogramaService.marcarCelda(3, { fecha: '2026-01-02' })).resolves.toEqual({ id: 1 });
    await expect(cronogramaService.liberarCelda(3, 9)).resolves.toEqual({ eliminado: true });

    expect(api.post).toHaveBeenCalledWith('/cronogramas', { anio: 2026 });
    expect(api.delete).toHaveBeenCalledWith('/cronogramas/3/celdas/9');
    expect(api.get).toHaveBeenCalledWith('/cronogramas/3');
  });

  it('exporta el PDF y guarda horarios y personal', async () => {
    await cronogramaService.exportarPdf(3);
    await expect(cronogramaService.guardarHorarios(3, 9, [{ inicio: '10:00' }])).resolves.toEqual({ guardado: true });
    await expect(cronogramaService.guardarPersonal(3, [{ nombre: 'Ana' }])).resolves.toEqual({ guardado: true });

    expect(downloadPdf).toHaveBeenCalledWith('/reportes/cronograma/3', 'cronograma_3.pdf');
    expect(api.put).toHaveBeenCalledWith('/cronogramas/3/celdas/9/horarios', { horarios: [{ inicio: '10:00' }] });
    expect(api.put).toHaveBeenCalledWith('/cronogramas/3/personal', { personal: [{ nombre: 'Ana' }] });
  });
});
