/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EquipoForm } from './EquipoForm';
import { equiposService } from '../services/equiposService';
import { organizacionService } from '../../configuracion/services/organizacionService';

vi.mock('../services/equiposService', () => ({
  equiposService: {
    getEquipo: vi.fn(),
    createEquipo: vi.fn(),
    updateEquipo: vi.fn(),
  },
}));

vi.mock('../../configuracion/services/organizacionService', () => ({
  organizacionService: {
    getAreas: vi.fn(),
  },
}));

const AREAS = [
  { id: 1, nombre: 'Sistemas', jefe_encargado: 'Ana', descripcion: 'Piso 2' },
  { id: 2, nombre: 'Contabilidad', jefe_encargado: '', descripcion: '' },
];

const LAPTOP = {
  codigo_patrimonial: '740000001111',
  codigo_identificativo: '000121',
  tipo_equipo: 'Laptop',
  marca: 'Lenovo',
  modelo: 'T14',
  color: 'Negro',
  numero_serie: 'SN-9',
  ram_gb: 16,
  almacenamiento_gb: 512,
  tipo_disco: 'NVMe',
  procesador: 'Ryzen',
  sistema_operativo: 'Windows 11',
  fecha_adquisicion: '2023-05-01',
  area_id: 1,
  horas_uso: 10,
  errores_smart: 1,
  salud_bateria: 88,
  ultima_temp_cpu: 45.5,
  ultima_temp_disco: 35,
};

let onClose;
let onSuccess;

function renderNuevo() {
  render(<EquipoForm onClose={onClose} onSuccess={onSuccess} />);
}

function renderEdicion(id = 7) {
  render(<EquipoForm equipoId={id} onClose={onClose} onSuccess={onSuccess} />);
}

async function mostrarNuevo() {
  renderNuevo();
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Registrar Equipo' })).toBeTruthy();
  });
}

async function mostrarEdicion(equipo, id = 7) {
  equiposService.getEquipo.mockResolvedValue({ success: true, data: equipo });
  renderEdicion(id);
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Editar Equipo' })).toBeTruthy();
  });
}

function patrimonial() {
  return screen.getByLabelText(/Cód\. Patrimonial/);
}

function tipo() {
  return screen.getByLabelText(/Tipo de Equipo/);
}

function clickCerrarIcono() {
  const header = screen.getByRole('heading', { name: /Equipo/ }).parentElement;
  fireEvent.click(header.querySelector('button'));
}

beforeEach(() => {
  onClose = vi.fn();
  onSuccess = vi.fn();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  organizacionService.getAreas.mockResolvedValue({ success: true, data: AREAS });
  equiposService.getEquipo.mockResolvedValue({ success: false, message: 'pendiente' });
  equiposService.createEquipo.mockResolvedValue({ success: true, message: 'creado' });
  equiposService.updateEquipo.mockResolvedValue({ success: true, message: 'actualizado' });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('EquipoForm', () => {
  it('muestra la carga y luego el alta con el área, el responsable y la ubicación', async () => {
    let resolveAreas;
    organizacionService.getAreas.mockReturnValue(new Promise((resolve) => {
      resolveAreas = resolve;
    }));
    renderNuevo();
    expect(screen.getByText('Cargando datos del equipo...')).toBeTruthy();

    await act(async () => {
      resolveAreas({ success: true, data: AREAS });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Registrar Equipo' })).toBeTruthy();
    });
    expect(screen.getByRole('button', { name: 'Registrar Equipo' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Sistemas (Jefe: Ana)' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Contabilidad (Jefe: S/N)' })).toBeTruthy();
    expect(screen.getByLabelText(/Área Asignada/).value).toBe('1');
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText(/Piso 2/)).toBeTruthy();
    expect(screen.getByText('0/12 dígitos').className).toContain('text-slate-400');
    expect(screen.getByText('0/6 dígitos').className).toContain('text-slate-400');
    expect(screen.getByLabelText('Procesador')).toBeTruthy();
    expect(screen.getByLabelText('Horas de uso')).toBeTruthy();
    expect(screen.queryByLabelText('Salud batería (%)')).toBeNull();
    expect(screen.queryByLabelText('Contador de páginas')).toBeNull();

    fireEvent.change(screen.getByLabelText(/Área Asignada/), { target: { value: '2' } });
    expect(screen.getByText('Sin jefe asignado')).toBeTruthy();
    expect(screen.queryByText(/Piso 2/)).toBeNull();

    fireEvent.change(screen.getByLabelText(/Área Asignada/), { target: { value: '' } });
    expect(screen.queryByText('Responsable del Equipo')).toBeNull();
    expect(screen.queryByText('Ubicación (Área)')).toBeNull();
  });

  it('no preselecciona área si el listado viene vacío o la consulta no tiene éxito', async () => {
    organizacionService.getAreas.mockResolvedValue({ success: true, data: [] });
    await mostrarNuevo();
    expect(screen.getByLabelText(/Área Asignada/).value).toBe('');
    expect(screen.queryByText('Responsable del Equipo')).toBeNull();

    cleanup();
    organizacionService.getAreas.mockResolvedValue({ success: false });
    await mostrarNuevo();
    expect(screen.getByLabelText(/Área Asignada/).value).toBe('');
    expect(screen.queryByText('Responsable del Equipo')).toBeNull();
  });

  it('avisa cuando no puede cargar las áreas y permite cerrar', async () => {
    organizacionService.getAreas.mockRejectedValue(new Error('red'));
    renderNuevo();
    await waitFor(() => {
      expect(screen.getByText('Error cargando áreas.')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('rechaza dígitos inválidos y marca de verde los códigos completos', async () => {
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '12a' } });
    expect(patrimonial().value).toBe('');
    fireEvent.change(patrimonial(), { target: { value: '12' } });
    fireEvent.change(patrimonial(), { target: { value: '12x' } });
    expect(patrimonial().value).toBe('12');
    expect(screen.getByText('2/12 dígitos').className).toContain('text-slate-400');
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    expect(screen.getByText('12/12 dígitos').className).toContain('text-emerald-500');

    const ident = screen.getByLabelText('Cód. Identificativo');
    fireEvent.change(ident, { target: { value: 'ab' } });
    expect(ident.value).toBe('');
    fireEvent.change(ident, { target: { value: '000121' } });
    expect(screen.getByText('6/6 dígitos').className).toContain('text-emerald-500');
  });

  it('exige código, área y tipo personalizado antes de enviar', async () => {
    await mostrarNuevo();
    const form = document.getElementById('equipo-form');
    expect(patrimonial().required).toBe(true);
    expect(form.checkValidity()).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));
    expect(equiposService.createEquipo).not.toHaveBeenCalled();

    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.change(tipo(), { target: { value: 'Otro' } });
    const otro = screen.getByLabelText('Especifique el tipo de equipo');
    expect(otro.required).toBe(true);
    expect(screen.getByText('—')).toBeTruthy();
    expect(form.checkValidity()).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));
    expect(equiposService.createEquipo).not.toHaveBeenCalled();
  });

  it('cambia especificaciones según Laptop, Monitor, Impresora, Escáner y Otro', async () => {
    await mostrarNuevo();

    fireEvent.change(tipo(), { target: { value: 'Laptop' } });
    expect(screen.getByLabelText('Salud batería (%)')).toBeTruthy();
    expect(screen.getByLabelText('Temp. CPU (°C)')).toBeTruthy();
    expect(screen.getByLabelText('Temp. disco (°C)')).toBeTruthy();
    expect(screen.getByLabelText('Errores SMART')).toBeTruthy();
    expect(screen.queryByLabelText('Contador de páginas')).toBeNull();

    fireEvent.change(tipo(), { target: { value: 'Monitor' } });
    expect(screen.queryByLabelText('Procesador')).toBeNull();
    expect(screen.queryByLabelText('Horas de uso')).toBeNull();
    expect(screen.queryByLabelText('Contador de páginas')).toBeNull();

    fireEvent.change(tipo(), { target: { value: 'Escaner' } });
    expect(screen.queryByText('Telemetría inicial (ML Fase 7)')).toBeNull();
    expect(screen.queryByText('Especificaciones Técnicas (ML-Ready)')).toBeNull();

    fireEvent.change(tipo(), { target: { value: 'Impresora' } });
    expect(screen.getByText('Telemetría inicial (ML Fase 7)')).toBeTruthy();
    expect(screen.getByLabelText('Contador de páginas')).toBeTruthy();
    expect(screen.queryByLabelText('Horas de uso')).toBeNull();
    expect(screen.queryByLabelText('Procesador')).toBeNull();

    fireEvent.change(tipo(), { target: { value: 'Otro' } });
    fireEvent.change(screen.getByLabelText('Especifique el tipo de equipo'), {
      target: { value: 'Router' },
    });
    expect(screen.getByText('Router')).toBeTruthy();
    expect(screen.queryByLabelText('Procesador')).toBeNull();
  });

  it('registra una CPU y cierra al tener éxito', async () => {
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.change(screen.getByLabelText('Cód. Identificativo'), { target: { value: '000121' } });
    fireEvent.change(screen.getByLabelText('Marca'), { target: { value: 'Dell' } });
    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'Optiplex' } });
    fireEvent.change(screen.getByLabelText('Color'), { target: { value: 'Negro' } });
    fireEvent.change(screen.getByLabelText('N° de Serie'), { target: { value: 'SN-1' } });
    fireEvent.change(screen.getByLabelText('Fecha Adquisición'), { target: { value: '2024-03-01' } });
    fireEvent.change(screen.getByLabelText('Procesador'), { target: { value: 'Core i7' } });
    fireEvent.change(screen.getByLabelText('Memoria RAM (GB)'), { target: { value: '16' } });
    fireEvent.change(screen.getByLabelText('Almacenamiento (GB)'), { target: { value: '512' } });
    fireEvent.change(screen.getByLabelText('Tipo de disco'), { target: { value: 'HDD' } });
    fireEvent.change(screen.getByLabelText('Sistema Operativo'), { target: { value: 'Windows 11' } });
    fireEvent.change(screen.getByLabelText('Horas de uso'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Errores SMART'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Temp. CPU (°C)'), { target: { value: '70' } });
    fireEvent.change(screen.getByLabelText('Temp. disco (°C)'), { target: { value: '40' } });

    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));

    await waitFor(() => expect(equiposService.createEquipo).toHaveBeenCalledOnce());
    expect(equiposService.createEquipo).toHaveBeenCalledWith(expect.objectContaining({
      codigo_patrimonial: '740000001111',
      codigo_identificativo: '000121',
      tipo_equipo: 'CPU',
      marca: 'Dell',
      modelo: 'Optiplex',
      color: 'Negro',
      numero_serie: 'SN-1',
      fecha_adquisicion: '2024-03-01',
      area_id: '1',
      procesador: 'Core i7',
      ram_gb: '16',
      almacenamiento_gb: '512',
      tipo_disco: 'HDD',
      sistema_operativo: 'Windows 11',
      horas_uso: '10',
      errores_smart: '2',
      ultima_temp_cpu: '70',
      ultima_temp_disco: '40',
      salud_bateria: null,
      contador_paginas: null,
    }));
    expect(window.alert).toHaveBeenCalledWith('creado');
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('registra una laptop aunque el servicio no devuelva mensaje', async () => {
    equiposService.createEquipo.mockResolvedValue({ success: true });
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.change(tipo(), { target: { value: 'Laptop' } });
    fireEvent.change(screen.getByLabelText('Salud batería (%)'), { target: { value: '90' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Equipo registrado exitosamente.'));
    expect(equiposService.createEquipo).toHaveBeenCalledWith(expect.objectContaining({
      tipo_equipo: 'Laptop',
      salud_bateria: '90',
    }));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('registra una impresora con contador de páginas', async () => {
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.change(tipo(), { target: { value: 'Impresora' } });
    fireEvent.change(screen.getByLabelText('Contador de páginas'), { target: { value: '1200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));

    await waitFor(() => expect(equiposService.createEquipo).toHaveBeenCalledWith(expect.objectContaining({
      tipo_equipo: 'Impresora',
      contador_paginas: '1200',
      ram_gb: null,
      horas_uso: 0,
      salud_bateria: null,
    })));
  });

  it('registra un tipo personalizado', async () => {
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.change(tipo(), { target: { value: 'Otro' } });
    fireEvent.change(screen.getByLabelText('Especifique el tipo de equipo'), {
      target: { value: 'Router' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));

    await waitFor(() => expect(equiposService.createEquipo).toHaveBeenCalledWith(expect.objectContaining({
      tipo_equipo: 'Router',
      procesador: null,
    })));
  });

  it('muestra Guardando... mientras crea el equipo', async () => {
    let resolveCreate;
    equiposService.createEquipo.mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Guardando...' }).disabled).toBe(true);
    });
    await act(async () => {
      resolveCreate({ success: true, message: 'listo' });
    });
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('avisa sin cerrar cuando el alta falla o la petición se rechaza', async () => {
    equiposService.createEquipo.mockResolvedValueOnce({ success: false, message: 'código duplicado' });
    await mostrarNuevo();
    fireEvent.change(patrimonial(), { target: { value: '740000001111' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('código duplicado'));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    equiposService.createEquipo.mockResolvedValueOnce({ success: false, message: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo guardar el equipo.'));

    equiposService.createEquipo.mockRejectedValueOnce({ response: { data: { message: 'sin permiso' } } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('sin permiso'));

    equiposService.createEquipo.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Equipo' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al registrar equipo.'));
    expect(screen.getByRole('button', { name: 'Registrar Equipo' }).disabled).toBe(false);
  });

  it('cierra con Cancelar y con la X', async () => {
    await mostrarNuevo();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    clickCerrarIcono();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('carga la edición de una laptop y guarda los cambios', async () => {
    await mostrarEdicion(LAPTOP);
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
    expect(patrimonial().value).toBe('740000001111');
    expect(screen.getByLabelText('Cód. Identificativo').value).toBe('000121');
    expect(screen.getByLabelText('Marca').value).toBe('Lenovo');
    expect(screen.getByLabelText('Salud batería (%)').value).toBe('88');
    expect(screen.getByLabelText('Sistema Operativo').value).toBe('Windows 11');
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('12/12 dígitos').className).toContain('text-emerald-500');
    expect(screen.getByText('6/6 dígitos').className).toContain('text-emerald-500');

    fireEvent.change(screen.getByLabelText('Modelo'), { target: { value: 'T14s' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(equiposService.updateEquipo).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ tipo_equipo: 'Laptop', modelo: 'T14s', salud_bateria: '88' }),
    ));
    expect(window.alert).toHaveBeenCalledWith('actualizado');
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('usa el aviso por defecto cuando la edición no trae mensaje', async () => {
    equiposService.updateEquipo.mockResolvedValue({ success: true });
    await mostrarEdicion(LAPTOP);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Equipo actualizado correctamente.'));
  });

  it('no cierra si la edición falla o la petición se rechaza', async () => {
    await mostrarEdicion(LAPTOP);

    equiposService.updateEquipo.mockResolvedValueOnce({ success: false, message: 'en uso' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('en uso'));

    equiposService.updateEquipo.mockResolvedValueOnce({ success: false });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo guardar el equipo.'));

    equiposService.updateEquipo.mockRejectedValueOnce({ response: { data: { message: 'conflicto' } } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('conflicto'));

    equiposService.updateEquipo.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al actualizar equipo.'));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('muestra un monitor sin área coincidente ni telemetría', async () => {
    await mostrarEdicion({
      codigo_patrimonial: '740000001111',
      tipo_equipo: 'Monitor',
      area_id: 99,
      marca: 'HP',
    });
    expect(screen.queryByText('Responsable del Equipo')).toBeNull();
    expect(screen.queryByLabelText('Procesador')).toBeNull();
    expect(screen.queryByText('Telemetría inicial (ML Fase 7)')).toBeNull();
    expect(screen.getByLabelText('Marca').value).toBe('HP');
  });

  it('trata un tipo desconocido como Otro', async () => {
    await mostrarEdicion({
      codigo_patrimonial: '740000009999',
      tipo_equipo: 'Proyector',
      area_id: 2,
    });
    expect(screen.getByLabelText('Especifique el tipo de equipo').value).toBe('Proyector');
    expect(screen.getByText('Proyector')).toBeTruthy();
    expect(screen.getByText('Sin jefe asignado')).toBeTruthy();
    expect(tipo().value).toBe('Otro');
  });

  it('muestra la carga de la edición hasta recibir el equipo', async () => {
    let resolveEquipo;
    equiposService.getEquipo.mockReturnValue(new Promise((resolve) => {
      resolveEquipo = resolve;
    }));
    renderEdicion();
    expect(screen.getByText('Cargando datos del equipo...')).toBeTruthy();
    await act(async () => {
      resolveEquipo({ success: true, data: LAPTOP });
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Editar Equipo' })).toBeTruthy();
    });
  });

  it('muestra el error de carga del equipo y el mensaje por defecto', async () => {
    equiposService.getEquipo.mockResolvedValue({ success: false, message: 'no existe' });
    renderEdicion();
    await waitFor(() => expect(screen.getByText('no existe')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();

    equiposService.getEquipo.mockResolvedValue({ success: false, message: '' });
    renderEdicion(8);
    await waitFor(() => expect(screen.getByText('No se pudo cargar el equipo.')).toBeTruthy());
  });

  it('avisa si la edición no puede leer áreas o el equipo', async () => {
    organizacionService.getAreas.mockRejectedValue(new Error('red'));
    renderEdicion();
    await waitFor(() => expect(screen.getByText('Error al cargar el equipo.')).toBeTruthy());

    organizacionService.getAreas.mockResolvedValue({ success: true, data: AREAS });
    equiposService.getEquipo.mockRejectedValue(new Error('red'));
    renderEdicion(8);
    await waitFor(() => expect(screen.getAllByText('Error al cargar el equipo.')).toHaveLength(2));
  });
});
