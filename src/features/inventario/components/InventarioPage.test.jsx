/** @vitest-environment jsdom */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPdf } from '../../../lib/api';
import { mlService } from '../../ml/services/mlService';
import { equiposService } from '../services/equiposService';
import { InventarioPage } from './InventarioPage';

vi.mock('../../../lib/api', () => ({
  downloadPdf: vi.fn(),
}));

vi.mock('../services/equiposService', () => ({
  equiposService: {
    getAllEquipos: vi.fn(),
    deleteEquipo: vi.fn(),
  },
}));

vi.mock('../../ml/services/mlService', () => ({
  mlService: {
    getRiesgoInventario: vi.fn(),
  },
}));

vi.mock('./EquipoForm', () => ({
  EquipoForm: ({ equipoId, onClose, onSuccess }) => (
    <div data-testid={equipoId ? 'form-edit' : 'form-nuevo'}>
      <span>{equipoId ? `edit-${equipoId}` : 'nuevo'}</span>
      <button type="button" onClick={onClose}>cerrar-equipo</button>
      <button type="button" onClick={onSuccess}>guardar-equipo</button>
    </div>
  ),
}));

vi.mock('./FichaTecnicaModal', () => ({
  FichaTecnicaModal: ({ equipoId, onClose }) => (
    <div data-testid="ficha-modal">
      <span>{`ficha-${equipoId}`}</span>
      <button type="button" onClick={onClose}>cerrar-ficha</button>
    </div>
  ),
}));

vi.mock('./CargaMasivaModal', () => ({
  CargaMasivaModal: ({ onClose, onSuccess }) => (
    <div data-testid="carga-masiva">
      <button type="button" onClick={onClose}>cerrar-carga</button>
      <button type="button" onClick={onSuccess}>ok-carga</button>
    </div>
  ),
}));

const EQUIPOS = [
  {
    id: 1,
    codigo_patrimonial: '111111111111',
    codigo_identificativo: '000001',
    tipo_equipo: 'CPU',
    marca: 'Dell',
    modelo: 'Optiplex',
    area_nombre: 'Sistemas',
    area_id: 3,
    responsable_nombre: 'Ana Ruiz',
    ubicacion_fisica: 'Piso 1',
    estado_conservacion: 'Bueno',
  },
  {
    id: 2,
    codigo_patrimonial: '222222222222',
    codigo_identificativo: null,
    tipo_equipo: 'Laptop',
    marca: null,
    modelo: null,
    area_nombre: null,
    area_id: 9,
    responsable_nombre: null,
    area_jefe: 'Luis Peña',
    ubicacion_fisica: null,
    estado_conservacion: 'Nuevo',
  },
  {
    id: 3,
    codigo_patrimonial: '333333333333',
    codigo_identificativo: '000003',
    tipo_equipo: 'Monitor',
    marca: 'HP',
    modelo: 'E24',
    area_nombre: 'Contabilidad',
    area_id: 4,
    responsable_nombre: '',
    area_jefe: '',
    ubicacion_fisica: '',
    estado_conservacion: 'Malo',
  },
  {
    id: 4,
    codigo_patrimonial: '444444444444',
    codigo_identificativo: '000004',
    tipo_equipo: 'Impresora',
    marca: 'Epson',
    modelo: 'L3150',
    area_nombre: 'Archivo',
    area_id: 5,
    responsable_nombre: 'Marta',
    ubicacion_fisica: 'Sótano',
    estado_conservacion: 'Regular',
  },
  {
    id: 5,
    codigo_patrimonial: '',
    codigo_identificativo: '000005',
    tipo_equipo: 'CPU',
    marca: 'Xerox',
    modelo: 'B210',
    area_nombre: 'Logistica',
    area_id: 8,
    estado_conservacion: 'Dañado',
  },
  {
    id: 6,
    tipo_equipo: 'Laptop',
    estado_conservacion: 'Bueno',
    area_id: 1,
  },
];

function pill(text) {
  return screen.getByText(text, { selector: 'span' });
}

async function renderPage() {
  render(<InventarioPage />);
  await waitFor(() => expect(screen.getByText('111111111111')).toBeTruthy());
}

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  equiposService.getAllEquipos.mockResolvedValue({ success: true, data: EQUIPOS });
  equiposService.deleteEquipo.mockResolvedValue({ message: 'Equipo eliminado.' });
  mlService.getRiesgoInventario.mockResolvedValue({
    success: true,
    data: [
      { equipo_id: 1, nivel_riesgo: 'Alto', score_riesgo: 80 },
      { equipo_id: 99, nivel_riesgo: 'Bajo', score_riesgo: 10 },
    ],
  });
  downloadPdf.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('InventarioPage', () => {
  it('muestra la carga y después la tabla con riesgo, estados y datos faltantes', async () => {
    let resolveEquipos;
    equiposService.getAllEquipos.mockReturnValue(new Promise((resolve) => {
      resolveEquipos = resolve;
    }));
    render(<InventarioPage />);
    expect(screen.getByText('Cargando inventario...')).toBeTruthy();
    await act(async () => {
      resolveEquipos({ success: true, data: EQUIPOS });
    });
    await waitFor(() => expect(screen.getByText('Alto')).toBeTruthy());

    expect(screen.getByText('80 pts')).toBeTruthy();
    expect(screen.getAllByText('N/D')).toHaveLength(4);
    expect(screen.getByText('S/N Ident.')).toBeTruthy();
    expect(screen.getByText('ID: 9')).toBeTruthy();
    expect(screen.getByText('Ana Ruiz')).toBeTruthy();
    expect(screen.getByText('Luis Peña')).toBeTruthy();
    expect(screen.getByText('Marta')).toBeTruthy();
    expect(screen.getByText('Piso 1')).toBeTruthy();
    expect(screen.getByText('Sótano')).toBeTruthy();
    expect(screen.getAllByText('Contabilidad').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Logistica').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    expect(pill('Bueno').className).toContain('bg-emerald-100');
    expect(pill('Nuevo').className).toContain('bg-emerald-100');
    expect(pill('Malo').className).toContain('bg-rose-100');
    expect(pill('Regular').className).toContain('bg-amber-100');
    expect(pill('Dañado').className).toContain('bg-amber-100');
    expect(screen.queryByText('Cargando inventario...')).toBeNull();
  });

  it('deja la tabla vacía si el listado no tiene éxito y sigue pidiendo el riesgo', async () => {
    equiposService.getAllEquipos.mockResolvedValue({ success: false, data: EQUIPOS });
    render(<InventarioPage />);
    await waitFor(() => expect(screen.getByText('No se encontraron equipos.')).toBeTruthy());
    await waitFor(() => expect(mlService.getRiesgoInventario).toHaveBeenCalledOnce());
  });

  it('registra el fallo de red sin consultar el riesgo', async () => {
    equiposService.getAllEquipos.mockRejectedValue(new Error('down'));
    render(<InventarioPage />);
    await waitFor(() => expect(screen.getByText('No se encontraron equipos.')).toBeTruthy());
    expect(console.error).toHaveBeenCalledWith('Fallo al cargar la tabla');
    expect(mlService.getRiesgoInventario).not.toHaveBeenCalled();
  });

  it('omite insignias si el riesgo no es una lista', async () => {
    mlService.getRiesgoInventario.mockResolvedValue({ success: true, data: { equipo_id: 1 } });
    await renderPage();
    expect(screen.getAllByText('N/D')).toHaveLength(5);
    expect(screen.queryByText('Alto')).toBeNull();
  });

  it('omite insignias si el riesgo no tiene éxito', async () => {
    mlService.getRiesgoInventario.mockResolvedValue({ success: false, data: [] });
    await renderPage();
    expect(screen.getAllByText('N/D')).toHaveLength(5);
    expect(screen.queryByText('Alto')).toBeNull();
  });

  it('omite insignias si el servicio de riesgo falla', async () => {
    mlService.getRiesgoInventario.mockRejectedValue(new Error('ml down'));
    await renderPage();
    expect(screen.getByText('Dell')).toBeTruthy();
    expect(screen.getAllByText('N/D')).toHaveLength(5);
  });

  it('busca por código, identificador, marca y modelo', async () => {
    await renderPage();
    const search = screen.getByPlaceholderText('Buscar código o marca...');

    fireEvent.change(search, { target: { value: 'DELL' } });
    expect(screen.getByText('111111111111')).toBeTruthy();
    expect(screen.queryByText('222222222222')).toBeNull();

    fireEvent.change(search, { target: { value: 'optiplex' } });
    expect(screen.getByText('Optiplex')).toBeTruthy();
    expect(screen.queryByText('Epson')).toBeNull();

    fireEvent.change(search, { target: { value: '000003' } });
    expect(screen.getByText('333333333333')).toBeTruthy();
    expect(screen.queryByText('111111111111')).toBeNull();

    fireEvent.change(search, { target: { value: '222222222222' } });
    expect(screen.getByText('S/N Ident.')).toBeTruthy();
    expect(screen.queryByText('Dell')).toBeNull();

    fireEvent.change(search, { target: { value: 'xerox' } });
    expect(screen.getByText('B210')).toBeTruthy();
    expect(screen.queryByText('HP')).toBeNull();

    fireEvent.change(search, { target: { value: 'no-existe' } });
    expect(screen.getByText('No se encontraron equipos.')).toBeTruthy();

    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByText('Dell')).toBeTruthy();
    expect(screen.getByText('Epson')).toBeTruthy();
  });

  it('filtra por tipo y estado', async () => {
    await renderPage();
    const tipo = screen.getByDisplayValue('Todos los tipos');
    const estado = screen.getByDisplayValue('Todos los estados');

    fireEvent.change(tipo, { target: { value: 'Laptop' } });
    expect(screen.getByText('222222222222')).toBeTruthy();
    expect(screen.queryByText('111111111111')).toBeNull();

    fireEvent.change(tipo, { target: { value: 'Monitor' } });
    fireEvent.change(estado, { target: { value: 'Malo' } });
    expect(screen.getByText('HP')).toBeTruthy();
    expect(screen.queryByText('222222222222')).toBeNull();

    fireEvent.change(tipo, { target: { value: 'CPU' } });
    fireEvent.change(estado, { target: { value: 'Bueno' } });
    expect(screen.getByText('Dell')).toBeTruthy();
    expect(screen.queryByText('Xerox')).toBeNull();

    fireEvent.change(tipo, { target: { value: 'Impresora' } });
    fireEvent.change(estado, { target: { value: '' } });
    expect(screen.getByText('Epson')).toBeTruthy();

    fireEvent.change(tipo, { target: { value: '' } });
    fireEvent.change(estado, { target: { value: 'Nuevo' } });
    expect(screen.getByText('222222222222')).toBeTruthy();
    expect(screen.queryByText('Dell')).toBeNull();

    fireEvent.change(estado, { target: { value: 'Regular' } });
    expect(screen.getByText('L3150')).toBeTruthy();

    fireEvent.change(tipo, { target: { value: 'CPU' } });
    fireEvent.change(estado, { target: { value: 'Malo' } });
    expect(screen.getByText('No se encontraron equipos.')).toBeTruthy();
  });

  it('abre y cierra el alta, y al guardar limpia filtros y recarga', async () => {
    await renderPage();
    const search = screen.getByPlaceholderText('Buscar código o marca...');
    const tipo = screen.getByDisplayValue('Todos los tipos');
    const estado = screen.getByDisplayValue('Todos los estados');
    fireEvent.change(search, { target: { value: 'zzz' } });
    fireEvent.change(tipo, { target: { value: 'Laptop' } });
    fireEvent.change(estado, { target: { value: 'Malo' } });
    expect(screen.getByText('No se encontraron equipos.')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Nuevo Equipo/ }));
    expect(screen.getByTestId('form-nuevo')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'cerrar-equipo' }));
    expect(screen.queryByTestId('form-nuevo')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Nuevo Equipo/ }));
    fireEvent.click(screen.getByRole('button', { name: 'guardar-equipo' }));
    await waitFor(() => expect(screen.getByText('111111111111')).toBeTruthy());
    expect(search.value).toBe('');
    expect(tipo.value).toBe('');
    expect(estado.value).toBe('');
    expect(equiposService.getAllEquipos).toHaveBeenCalledTimes(2);
  });

  it('abre la edición y al guardar recarga sin limpiar la búsqueda', async () => {
    await renderPage();
    const search = screen.getByPlaceholderText('Buscar código o marca...');
    fireEvent.change(search, { target: { value: 'dell' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar equipo' })[0]);
    expect(screen.getByText('edit-1')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'cerrar-equipo' }));
    expect(screen.queryByTestId('form-edit')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Editar equipo' }));
    fireEvent.click(screen.getByRole('button', { name: 'guardar-equipo' }));
    await waitFor(() => expect(equiposService.getAllEquipos).toHaveBeenCalledTimes(2));
    expect(search.value).toBe('dell');
    expect(screen.getByText('111111111111')).toBeTruthy();
    expect(screen.queryByText('Epson')).toBeNull();
  });

  it('abre y cierra la carga masiva y recarga al importar', async () => {
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Carga Excel/ }));
    expect(screen.getByTestId('carga-masiva')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'cerrar-carga' }));
    expect(screen.queryByTestId('carga-masiva')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Carga Excel/ }));
    fireEvent.click(screen.getByRole('button', { name: 'ok-carga' }));
    await waitFor(() => expect(equiposService.getAllEquipos).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('carga-masiva')).toBeTruthy();
  });

  it('abre y cierra la ficha técnica del equipo', async () => {
    await renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ver / Editar Ficha Técnica' })[1]);
    expect(screen.getByText('ficha-2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'cerrar-ficha' }));
    expect(screen.queryByTestId('ficha-modal')).toBeNull();
  });

  it('no elimina si se cancela la confirmación', async () => {
    await renderPage();
    window.confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar equipo' })[0]);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('111111111111'));
    expect(equiposService.deleteEquipo).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('elimina con el mensaje del servicio y recarga', async () => {
    await renderPage();
    equiposService.deleteEquipo.mockResolvedValueOnce({ message: 'Listo' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar equipo' })[1]);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Listo'));
    expect(equiposService.deleteEquipo).toHaveBeenCalledWith(2);
    expect(equiposService.getAllEquipos).toHaveBeenCalledTimes(2);
  });

  it('avisa con el texto por defecto cuando el borrado no trae mensaje', async () => {
    await renderPage();
    equiposService.deleteEquipo.mockResolvedValueOnce({});
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar equipo' })[2]);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Equipo eliminado.'));
    expect(equiposService.deleteEquipo).toHaveBeenCalledWith(3);
  });

  it('avisa si el borrado responde error o se rechaza, e identifica al equipo sin código', async () => {
    await renderPage();
    equiposService.deleteEquipo.mockRejectedValueOnce({ response: { data: { message: 'tiene historial' } } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar equipo' })[3]);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('tiene historial'));

    equiposService.deleteEquipo.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Eliminar equipo' })[4]);
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar el equipo.'));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('ID 5'));
    expect(equiposService.getAllEquipos).toHaveBeenCalledTimes(1);
  });

  it('descarga el PDF y registra el fallo', async () => {
    await renderPage();
    fireEvent.click(screen.getAllByRole('button', { name: 'Descargar Ficha PDF' })[0]);
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledWith('/reportes/equipo/1'));

    downloadPdf.mockRejectedValueOnce(new Error('sin red'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Descargar Ficha PDF' })[1]);
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('sin red'));

    downloadPdf.mockRejectedValueOnce({ message: '' });
    fireEvent.click(screen.getAllByRole('button', { name: 'Descargar Ficha PDF' })[2]);
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('No se pudo descargar el PDF'));
  });
});
