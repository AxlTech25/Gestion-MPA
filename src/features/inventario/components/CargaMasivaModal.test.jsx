/** @vitest-environment jsdom */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { equiposService } from '../services/equiposService';
import { CargaMasivaModal } from './CargaMasivaModal';

vi.mock('../services/equiposService', () => ({
  equiposService: {
    descargarPlantilla: vi.fn(),
    cargaMasiva: vi.fn(),
  },
}));

let onClose;
let onSuccess;

function elegirArchivo(file) {
  const input = screen.getByLabelText('Archivo Excel de equipos');
  const files = file ? [file] : [];
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  fireEvent.change(input);
  return input;
}

beforeEach(() => {
  onClose = vi.fn();
  onSuccess = vi.fn();
  equiposService.descargarPlantilla.mockResolvedValue(undefined);
  equiposService.cargaMasiva.mockResolvedValue({
    success: true,
    data: { importados: 1, total_filas: 1, errores: [] },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CargaMasivaModal', () => {
  it('explica la carga y cierra desde la X y desde Cerrar', () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.getByText('Instrucciones')).toBeTruthy();
    expect(screen.getByText(/Obligatorios: código patrimonial/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Importar equipos/ }).disabled).toBe(true);

    const header = screen.getByRole('heading', { name: /Carga masiva/ }).parentElement;
    fireEvent.click(header.querySelector('button'));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('descarga la plantilla y avisa si no puede', async () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /Descargar plantilla Excel/ }));
    await waitFor(() => expect(equiposService.descargarPlantilla).toHaveBeenCalledOnce());
    expect(screen.queryByText('No se pudo descargar la plantilla.')).toBeNull();

    equiposService.descargarPlantilla.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: /Descargar plantilla Excel/ }));
    await waitFor(() => expect(screen.getByText('No se pudo descargar la plantilla.')).toBeTruthy());
  });

  it('abre el selector, muestra el archivo y lo quita si el input queda vacío', () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: /Seleccionar archivo/ }));
    expect(clickSpy).toHaveBeenCalled();

    const file = new File(['pk'], 'equipos.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    elegirArchivo(file);
    expect(screen.getByText('equipos.xlsx')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Importar equipos/ }).disabled).toBe(false);

    fireEvent.drop(screen.getByRole('button', { name: /equipos.xlsx/ }), {
      dataTransfer: { files: [new File(['otro'], 'drop.xlsx')] },
    });
    expect(screen.getByText('equipos.xlsx')).toBeTruthy();
    expect(screen.queryByText('drop.xlsx')).toBeNull();

    elegirArchivo(null);
    expect(screen.getByText('Seleccionar archivo .xlsx')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Importar equipos/ }).disabled).toBe(true);

    const input = screen.getByLabelText('Archivo Excel de equipos');
    Object.defineProperty(input, 'files', { configurable: true, value: undefined });
    fireEvent.change(input);
    expect(screen.getByText('Seleccionar archivo .xlsx')).toBeTruthy();
  });

  it('pide un archivo si se importa sin selección', () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    const boton = screen.getByRole('button', { name: /Importar equipos/ });
    expect(boton.disabled).toBe(true);
    const propsKey = Object.keys(boton).find((key) => key.startsWith('__reactProps$'));
    act(() => {
      boton[propsKey].onClick();
    });
    expect(screen.getByText('Seleccione un archivo Excel (.xlsx).')).toBeTruthy();
    expect(equiposService.cargaMasiva).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('importa, lista errores por fila y limpia el resultado al elegir otro archivo', async () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    const file = new File(['x'], 'lote.xlsx');
    elegirArchivo(file);
    equiposService.cargaMasiva.mockResolvedValue({
      success: true,
      data: {
        importados: 2,
        total_filas: 4,
        errores: [
          { fila: 3, codigo: '740000000003', mensaje: 'duplicado' },
          { fila: 4, mensaje: 'área inválida' },
        ],
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(equiposService.cargaMasiva).toHaveBeenCalledWith(file);
    expect(screen.getByText('2 equipo(s) importado(s) de 4 fila(s)')).toBeTruthy();
    expect(screen.getByText('Errores (2):')).toBeTruthy();
    expect(screen.getByText('Fila 3 (740000000003): duplicado')).toBeTruthy();
    expect(screen.getByText('Fila 4: área inválida')).toBeTruthy();

    elegirArchivo(new File(['y'], 'nuevo.xlsx'));
    expect(screen.queryByText(/importado\(s\)/)).toBeNull();
    expect(screen.getByText('nuevo.xlsx')).toBeTruthy();
  });

  it('no recarga el inventario cuando no se importó ninguna fila', async () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    elegirArchivo(new File(['x'], 'vacio.xlsx'));
    equiposService.cargaMasiva.mockResolvedValue({
      success: true,
      data: { importados: 0, total_filas: 1 },
    });
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));
    await waitFor(() => {
      expect(screen.getByText('0 equipo(s) importado(s) de 1 fila(s)')).toBeTruthy();
    });
    expect(screen.queryByText(/Errores \(/)).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('muestra Procesando... y un resultado sin detalle de errores', async () => {
    let resolveCarga;
    equiposService.cargaMasiva.mockReturnValue(new Promise((resolve) => {
      resolveCarga = resolve;
    }));
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    elegirArchivo(new File(['x'], 'uno.xlsx'));
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Procesando/ }).disabled).toBe(true);
    });
    await act(async () => {
      resolveCarga({
        success: true,
        data: { importados: 1, total_filas: 1, errores: [] },
      });
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(screen.queryByText(/Errores \(/)).toBeNull();
    expect(screen.getByRole('button', { name: /Importar equipos/ }).disabled).toBe(false);
  });

  it('muestra el error del servicio y el de la petición', async () => {
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    elegirArchivo(new File(['x'], 'mal.xlsx'));

    equiposService.cargaMasiva.mockResolvedValueOnce({ success: false, message: 'columna faltante' });
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));
    await waitFor(() => expect(screen.getByText('columna faltante')).toBeTruthy());
    expect(onSuccess).not.toHaveBeenCalled();

    equiposService.cargaMasiva.mockResolvedValueOnce({ success: false, message: '' });
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));
    await waitFor(() => expect(screen.getByText('Error en la carga.')).toBeTruthy());

    equiposService.cargaMasiva.mockRejectedValueOnce({ response: { data: { message: 'xlsx dañado' } } });
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));
    await waitFor(() => expect(screen.getByText('xlsx dañado')).toBeTruthy());

    equiposService.cargaMasiva.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: /Importar equipos/ }));
    await waitFor(() => expect(screen.getByText('Error al procesar el archivo.')).toBeTruthy());
  });

  it('limpia el error al elegir un archivo después de un fallo', async () => {
    equiposService.descargarPlantilla.mockRejectedValue(new Error('red'));
    render(<CargaMasivaModal onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /Descargar plantilla Excel/ }));
    await waitFor(() => expect(screen.getByText('No se pudo descargar la plantilla.')).toBeTruthy());
    elegirArchivo(new File(['x'], 'corrige.xlsx'));
    expect(screen.queryByText('No se pudo descargar la plantilla.')).toBeNull();
  });
});
