/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FichaTecnicaPage } from './FichaTecnicaPage';
import { fichaTecnicaService } from '../services/fichaTecnicaService';

vi.mock('../services/fichaTecnicaService', () => ({
  fichaTecnicaService: { buscarPorCodigo: vi.fn() },
}));

vi.mock('./FichaTecnicaPanel', () => ({
  FichaTecnicaPanel: ({ equipoId, showHeader }) => (
    <div data-testid="ficha-panel">{`${equipoId}-${String(showHeader)}`}</div>
  ),
}));

function submitBusqueda(codigo) {
  const input = screen.getByLabelText(/Código patrimonial/);
  if (codigo !== undefined) {
    fireEvent.change(input, { target: { value: codigo } });
  }
  fireEvent.submit(input.closest('form'));
}

describe('FichaTecnicaPage', () => {
  beforeEach(() => {
    fichaTecnicaService.buscarPorCodigo.mockReset();
  });

  it('pide un código y no consulta el servicio si viene vacío', () => {
    render(<FichaTecnicaPage />);
    expect(document.body.textContent).toContain('Ingrese el código patrimonial');
    submitBusqueda('   ');
    expect(screen.getByText('Ingrese el código patrimonial del equipo.')).toBeTruthy();
    expect(fichaTecnicaService.buscarPorCodigo).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain('presione');
  });

  it('muestra la ficha cuando encuentra el equipo y limpia el error al escribir', async () => {
    let resolveBusqueda;
    fichaTecnicaService.buscarPorCodigo.mockReturnValue(new Promise((resolve) => {
      resolveBusqueda = resolve;
    }));
    render(<FichaTecnicaPage />);
    submitBusqueda('  PAT-1  ');

    expect(await screen.findByRole('button', { name: 'Buscando...' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buscando...' }).disabled).toBe(true);
    expect(document.body.textContent).not.toContain('Ingrese el código patrimonial');

    resolveBusqueda({ success: true, data: { id: 12, codigo: 'PAT-1' } });
    expect(await screen.findByTestId('ficha-panel')).toBeTruthy();
    expect(screen.getByTestId('ficha-panel').textContent).toBe('12-false');
    expect(fichaTecnicaService.buscarPorCodigo).toHaveBeenCalledWith('PAT-1');

    fichaTecnicaService.buscarPorCodigo.mockResolvedValueOnce({ success: false, message: 'Dado de baja' });
    submitBusqueda('PAT-2');
    expect(await screen.findByText('Dado de baja')).toBeTruthy();
    expect(screen.queryByTestId('ficha-panel')).toBeNull();

    fireEvent.change(screen.getByLabelText(/Código patrimonial/), { target: { value: 'PAT-3' } });
    expect(screen.queryByText('Dado de baja')).toBeNull();
    expect(document.body.textContent).toContain('Ingrese el código patrimonial');
  });

  it('cubre respuestas vacías y errores con y sin response', async () => {
    render(<FichaTecnicaPage />);

    fichaTecnicaService.buscarPorCodigo.mockResolvedValueOnce({ success: false });
    submitBusqueda('X1');
    expect(await screen.findByText('Equipo no encontrado.')).toBeTruthy();

    fichaTecnicaService.buscarPorCodigo.mockResolvedValueOnce({ success: false, message: '' });
    submitBusqueda('X2');
    expect(await screen.findByText('Equipo no encontrado.')).toBeTruthy();

    fichaTecnicaService.buscarPorCodigo.mockRejectedValueOnce({ response: { data: { message: 'Sin acceso' } } });
    submitBusqueda('X3');
    expect(await screen.findByText('Sin acceso')).toBeTruthy();

    fichaTecnicaService.buscarPorCodigo.mockRejectedValueOnce(new Error('offline'));
    submitBusqueda('X4');
    expect(await screen.findByText('No se encontró equipo con ese código.')).toBeTruthy();

    fichaTecnicaService.buscarPorCodigo.mockRejectedValueOnce({ response: {} });
    submitBusqueda('X5');
    expect(await screen.findByText('No se encontró equipo con ese código.')).toBeTruthy();

    fichaTecnicaService.buscarPorCodigo.mockRejectedValueOnce({ response: { data: {} } });
    submitBusqueda('X6');
    await waitFor(() => expect(screen.getByText('No se encontró equipo con ese código.')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Buscar Equipo' })).toBeTruthy();
  });
});
