/** @vitest-environment jsdom */
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantenimientoForm } from './MantenimientoForm';
import { mantenimientoService } from '../services/mantenimientoService';
import { mlService } from '../../ml/services/mlService';
import { fichaTecnicaService } from '../../inventario/services/fichaTecnicaService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
  downloadPdf: vi.fn(),
}));

vi.mock('../services/mantenimientoService', () => ({
  mantenimientoService: { create: vi.fn() },
}));

vi.mock('../../ml/services/mlService', () => ({
  mlService: { predictCategoria: vi.fn() },
}));

vi.mock('../../inventario/services/fichaTecnicaService', () => ({
  fichaTecnicaService: { buscarPorCodigo: vi.fn() },
}));

const laptop = { id: 7, tipo_equipo: 'Laptop', modelo: 'Latitude', marca: 'Dell' };
const impresora = { id: 3, tipo_equipo: 'Impresora', modelo: 'Laser', marca: 'HP' };
const monitor = { id: 9, tipo_equipo: 'Monitor', modelo: 'P24', marca: '' };

function defer() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function codigo() {
  return screen.getByLabelText(/Código patrimonial/i);
}

async function identificar(valor, equipo) {
  fichaTecnicaService.buscarPorCodigo.mockResolvedValue({ success: true, data: equipo });
  fireEvent.change(codigo(), { target: { value: valor } });
  await waitFor(() => {
    expect(fichaTecnicaService.buscarPorCodigo).toHaveBeenCalledWith(valor);
  }, { timeout: 2000 });
  expect(await screen.findByText(equipo.modelo || 'Sin modelo', {}, { timeout: 2000 })).toBeTruthy();
}

function enviar() {
  fireEvent.submit(document.getElementById('mant-form'));
}

describe('MantenimientoForm', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mlService.predictCategoria.mockResolvedValue({ success: true, data: { sugerencias: [] } });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('cambia los campos según el tipo y el equipo', async () => {
    mlService.predictCategoria.mockResolvedValue({
      success: true,
      data: {
        sugerencias: [{ categoria_falla_id: 8, nombre: 'Fallo Disco', probabilidad: 0.826 }],
      },
    });
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.queryByText('Validando equipo...')).toBeNull();
    expect(mlService.predictCategoria).not.toHaveBeenCalled();

    await identificar('PAT-7', laptop);
    expect(screen.getByText('(Dell)', { exact: false })).toBeTruthy();
    expect(screen.getByLabelText('Nivel de polvo')).toBeTruthy();
    expect(screen.getByLabelText('Horas de uso (lectura)')).toBeTruthy();
    expect(screen.queryByLabelText('Síntoma reportado')).toBeNull();
    expect(screen.queryByLabelText('Contador páginas (impresora)')).toBeNull();
    expect(screen.getByRole('button', { name: 'Guardar Ficha' }).disabled).toBe(false);

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Correctivo' } });
    expect(await screen.findByText('Sugerencia IA: Fallo Disco (83%)')).toBeTruthy();
    expect(screen.getByLabelText('Categoría Falla *').value).toBe('8');
    expect(screen.getByLabelText('Síntoma reportado')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Fuser' })).toBeTruthy();
    expect(screen.queryByLabelText('Nivel de polvo')).toBeNull();
    expect(screen.getByLabelText('Horas de uso (lectura)')).toBeTruthy();
    expect(mlService.predictCategoria).toHaveBeenCalledWith(7);

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Predictivo' } });
    expect(screen.queryByText(/Sugerencia IA/)).toBeNull();
    expect(screen.getByLabelText('Nivel de polvo')).toBeTruthy();
    expect(screen.queryByLabelText('Síntoma reportado')).toBeNull();

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Evaluacion' } });
    expect(screen.getByLabelText('Temp. CPU (°C)')).toBeTruthy();
    expect(screen.getByLabelText('Temp. disco (°C)')).toBeTruthy();

    await identificar('IMP-3', impresora);
    expect(screen.queryByLabelText('Nivel de polvo')).toBeNull();
    expect(screen.queryByLabelText('Horas de uso (lectura)')).toBeNull();
    expect(screen.getByLabelText('Contador páginas (impresora)')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Correctivo' } });
    expect(await screen.findByLabelText('Síntoma reportado')).toBeTruthy();
    expect(screen.getByLabelText('Contador páginas (impresora)')).toBeTruthy();
    expect(screen.queryByLabelText('Salud batería (%)')).toBeNull();

    await identificar('MON-9', { ...monitor, modelo: '' });
    expect(screen.getByText('Sin modelo')).toBeTruthy();
    expect(screen.queryByText(/\(HP\)/)).toBeNull();
    expect(screen.queryByLabelText('Contador páginas (impresora)')).toBeNull();
    expect(screen.queryByLabelText('Horas de uso (lectura)')).toBeNull();
    expect(screen.queryByLabelText('Nivel de polvo')).toBeNull();
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Preventivo' } });
    expect(screen.queryByLabelText('Nivel de polvo')).toBeNull();
    expect(screen.queryByLabelText('Síntoma reportado')).toBeNull();
  });

  it('muestra la validación del código y los errores de búsqueda', async () => {
    const pendiente = defer();
    fichaTecnicaService.buscarPorCodigo.mockReturnValue(pendiente.promise);
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);

    fireEvent.change(codigo(), { target: { value: '   ' } });
    await act(async () => {
      await new Promise((resolve) => { setTimeout(resolve, 600); });
    });
    expect(fichaTecnicaService.buscarPorCodigo).not.toHaveBeenCalled();

    fireEvent.change(codigo(), { target: { value: 'PAT-1' } });
    fireEvent.change(codigo(), { target: { value: 'PAT-2' } });
    expect(await screen.findByText('Validando equipo...', {}, { timeout: 2000 })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardar Ficha' }).disabled).toBe(true);
    expect(fichaTecnicaService.buscarPorCodigo).not.toHaveBeenCalledWith('PAT-1');

    await act(async () => {
      pendiente.resolve({ success: false, message: 'No existe' });
    });
    expect(await screen.findByText('No existe')).toBeTruthy();
    expect(screen.queryByText('Equipo identificado')).toBeNull();

    fichaTecnicaService.buscarPorCodigo.mockResolvedValue({ success: false });
    fireEvent.change(codigo(), { target: { value: 'PAT-3' } });
    expect(screen.queryByText('No existe')).toBeNull();
    expect(await screen.findByText('Equipo no encontrado.', {}, { timeout: 2000 })).toBeTruthy();

    fichaTecnicaService.buscarPorCodigo.mockRejectedValue(new Error('x'));
    fireEvent.change(codigo(), { target: { value: 'PAT-4' } });
    expect(await screen.findByText('No se encontró equipo con ese código patrimonial.', {}, { timeout: 2000 })).toBeTruthy();

    fireEvent.change(codigo(), { target: { value: '' } });
    expect(screen.queryByText('No se encontró equipo con ese código patrimonial.')).toBeNull();
  });

  it('guarda un correctivo de computadora y conserva su telemetría', async () => {
    const pendiente = defer();
    mantenimientoService.create.mockReturnValue(pendiente.promise);
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);
    await identificar('PAT-7', laptop);

    fireEvent.change(screen.getByLabelText('Nivel de polvo'), { target: { value: 'Alto' } });
    fireEvent.change(screen.getByLabelText('Temp. CPU (°C)'), { target: { value: '70.5' } });
    fireEvent.change(screen.getByLabelText('Temp. disco (°C)'), { target: { value: '41' } });
    fireEvent.change(screen.getByLabelText('Horas de uso (lectura)'), { target: { value: '1200' } });
    fireEvent.change(screen.getByLabelText('Salud batería (%)'), { target: { value: '88' } });
    fireEvent.change(screen.getByLabelText('Inactividad (minutos)'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Fecha y Hora *'), { target: { value: '2024-08-01T09:30' } });

    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Correctivo' } });
    await waitFor(() => expect(mlService.predictCategoria).toHaveBeenCalled());
    fireEvent.change(screen.getByLabelText('Síntoma reportado'), { target: { value: 'No enciende' } });
    fireEvent.change(screen.getByLabelText('Componente principal *'), { target: { value: 'Disco' } });
    fireEvent.change(screen.getByLabelText('Causa raíz'), { target: { value: 'Polvo' } });
    fireEvent.change(screen.getByLabelText('Diagnóstico técnico'), { target: { value: 'SMART' } });
    fireEvent.change(screen.getByLabelText('Piezas reemplazadas'), { target: { value: 'SSD' } });
    fireEvent.change(screen.getByLabelText('Costo de reparación (S/)'), { target: { value: '150.5' } });
    fireEvent.change(screen.getByLabelText('Actividades realizadas'), { target: { value: 'Cambio de disco' } });
    fireEvent.change(screen.getByLabelText('Estado posterior *'), { target: { value: 'Dañado' } });
    fireEvent.change(screen.getByLabelText('Categoría Falla *'), { target: { value: '4' } });

    enviar();
    expect(await screen.findByRole('button', { name: 'Guardando...' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardando...' }).disabled).toBe(true);

    await act(async () => {
      pendiente.resolve({ success: true });
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledOnce();

    const payload = mantenimientoService.create.mock.calls[0][0];
    expect(payload).toMatchObject({
      equipo_id: '7',
      tecnico_id: '1',
      fecha_intervencion: '2024-08-01T09:30',
      tipo_mantenimiento: 'Correctivo',
      categoria_falla_id: '4',
      sintoma_usuario: 'No enciende',
      causa_raiz: 'Polvo',
      componente_principal: 'Disco',
      nivel_polvo: 'Alto',
      temperatura_cpu: '70.5',
      temperatura_disco: '41',
      horas_uso_acumuladas: '1200',
      salud_bateria_pct: '88',
      tiempo_inactividad_min: '15',
      diagnostico_texto: 'SMART',
      piezas_reemplazadas: 'SSD',
      costo_reparacion: '150.5',
      actividades_realizadas: 'Cambio de disco',
      estado_post_mantenimiento: 'Dañado',
      contador_paginas_lectura: '',
    });
  });

  it('al guardar una impresora limpia la telemetría de computadora', async () => {
    mantenimientoService.create.mockResolvedValue({ success: true });
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);
    await identificar('PAT-7', laptop);
    fireEvent.change(screen.getByLabelText('Nivel de polvo'), { target: { value: 'Critico' } });
    fireEvent.change(screen.getByLabelText('Temp. CPU (°C)'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText('Temp. disco (°C)'), { target: { value: '45' } });
    fireEvent.change(screen.getByLabelText('Horas de uso (lectura)'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Salud batería (%)'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Inactividad (minutos)'), { target: { value: '9' } });

    await identificar('IMP-3', impresora);
    fireEvent.change(screen.getByLabelText('Contador páginas (impresora)'), { target: { value: '900' } });
    fireEvent.change(screen.getByLabelText('Actividades realizadas'), { target: { value: 'Cambio de tóner' } });
    enviar();

    await waitFor(() => expect(mantenimientoService.create).toHaveBeenCalled());
    const payload = mantenimientoService.create.mock.calls[0][0];
    expect(payload.equipo_id).toBe('3');
    expect(payload.contador_paginas_lectura).toBe('900');
    expect(payload.nivel_polvo).toBe('');
    expect(payload.temperatura_cpu).toBe('');
    expect(payload.temperatura_disco).toBe('');
    expect(payload.horas_uso_acumuladas).toBe('');
    expect(payload.salud_bateria_pct).toBe('');
    expect(payload.tiempo_inactividad_min).toBe('0');
    expect(payload.actividades_realizadas).toBe('Cambio de tóner');
  });

  it('avisa si el servicio rechaza el registro o lanza un error', async () => {
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);
    enviar();
    expect(window.alert).toHaveBeenCalledWith('Ingrese un código patrimonial válido.');
    expect(mantenimientoService.create).not.toHaveBeenCalled();

    await identificar('PAT-7', laptop);
    mantenimientoService.create.mockResolvedValueOnce({ success: false, message: 'duplicado' });
    enviar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('duplicado'));
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Guardar Ficha' })).toBeTruthy();

    mantenimientoService.create.mockResolvedValueOnce({ success: false });
    enviar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(undefined));

    mantenimientoService.create.mockRejectedValueOnce(new Error('red'));
    enviar();
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error al registrar mantenimiento.');
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('no sugiere categoría si la predicción viene vacía, falla o se rechaza', async () => {
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);
    await identificar('PAT-7', laptop);

    mlService.predictCategoria.mockResolvedValueOnce({ success: false, data: { sugerencias: [{ nombre: 'X' }] } });
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Correctivo' } });
    await waitFor(() => expect(mlService.predictCategoria).toHaveBeenCalled());
    expect(screen.queryByText(/Sugerencia IA/)).toBeNull();
    expect(screen.getByLabelText('Categoría Falla *').value).toBe('1');

    mlService.predictCategoria.mockResolvedValueOnce({ success: true, data: {} });
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Preventivo' } });
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Correctivo' } });
    await waitFor(() => expect(mlService.predictCategoria).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/Sugerencia IA/)).toBeNull();

    mlService.predictCategoria.mockRejectedValueOnce(new Error('ml'));
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Predictivo' } });
    fireEvent.change(screen.getByLabelText('Tipo *'), { target: { value: 'Correctivo' } });
    await waitFor(() => expect(mlService.predictCategoria).toHaveBeenCalledTimes(3));
    expect(screen.queryByText(/Sugerencia IA/)).toBeNull();
  });

  it('cierra desde la equis y desde Cancelar', () => {
    render(<MantenimientoForm onClose={onClose} onSuccess={onSuccess} />);
    const equis = screen.getAllByRole('button').find((boton) => boton.textContent.trim() === '');
    fireEvent.click(equis);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
