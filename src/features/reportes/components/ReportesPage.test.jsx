/** @vitest-environment jsdom */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { reportesService } from '../services/reportesService';
import { ReportesPage } from './ReportesPage';

vi.mock('../services/reportesService', () => ({
  reportesService: {
    anios: vi.fn(),
    fichaTecnicaEquipo: vi.fn(),
    fichasTecnicasAnio: vi.fn(),
    fichasMantenimientoEquipo: vi.fn(),
    fichasMantenimientoAnio: vi.fn(),
  },
}));

describe('ReportesPage', () => {
  beforeEach(() => {
    reportesService.anios.mockReset();
    reportesService.fichaTecnicaEquipo.mockReset();
    reportesService.fichasTecnicasAnio.mockReset();
    reportesService.fichasMantenimientoEquipo.mockReset();
    reportesService.fichasMantenimientoAnio.mockReset();
    reportesService.anios.mockResolvedValue({
      data: { data: { tecnicas: [2026, 2025], mantenimientos: [2026] } },
    });
  });

  it('pide el código y descarga la ficha técnica y las de mantenimiento', async () => {
    reportesService.fichaTecnicaEquipo.mockResolvedValue(undefined);
    reportesService.fichasMantenimientoEquipo.mockResolvedValue(undefined);
    render(<ReportesPage />);

    const tecnica = screen.getByLabelText('Código patrimonial', { selector: '#reporte-ficha-tecnica' });
    fireEvent.click(tecnica.closest('form').querySelector('button'));
    expect(screen.getByText('Ingrese el código patrimonial.')).toBeTruthy();

    fireEvent.change(tecnica, { target: { value: '740000001111' } });
    fireEvent.click(tecnica.closest('form').querySelector('button'));
    await waitFor(() => expect(reportesService.fichaTecnicaEquipo).toHaveBeenCalledWith('740000001111'));

    reportesService.fichaTecnicaEquipo.mockRejectedValue({
      response: { data: new Blob([JSON.stringify({ message: 'Equipo no encontrado.' })]) },
    });
    fireEvent.click(tecnica.closest('form').querySelector('button'));
    expect(await screen.findByText('Equipo no encontrado.')).toBeTruthy();

    const mantenimiento = screen.getByLabelText('Código patrimonial', { selector: '#reporte-ficha-mantenimiento' });
    fireEvent.change(mantenimiento, { target: { value: '740000001111' } });
    fireEvent.click(mantenimiento.closest('form').querySelector('button'));
    await waitFor(() => expect(reportesService.fichasMantenimientoEquipo).toHaveBeenCalledWith('740000001111'));
  });

  it('exige el año y descarga las fichas de ese año', async () => {
    render(<ReportesPage />);
    const anioTecnica = await screen.findByLabelText('Año', { selector: '#reporte-anio-tecnica' });
    fireEvent.click(anioTecnica.closest('form').querySelector('button'));
    expect(screen.getByText('Elija el año.')).toBeTruthy();
    expect(screen.getByRole('option', { name: '2025' })).toBeTruthy();

    fireEvent.change(anioTecnica, { target: { value: '2026' } });
    reportesService.fichasTecnicasAnio.mockResolvedValue(undefined);
    fireEvent.click(anioTecnica.closest('form').querySelector('button'));
    await waitFor(() => expect(reportesService.fichasTecnicasAnio).toHaveBeenCalledWith('2026'));

    const anioMant = screen.getByLabelText('Año', { selector: '#reporte-anio-mantenimiento' });
    fireEvent.change(anioMant, { target: { value: '2026' } });
    reportesService.fichasMantenimientoAnio.mockRejectedValue(new Error('sin datos'));
    fireEvent.click(anioMant.closest('form').querySelector('button'));
    await waitFor(() => expect(screen.getByText('sin datos')).toBeTruthy());
    expect(reportesService.fichasMantenimientoAnio).toHaveBeenCalledWith('2026');
  });
});
