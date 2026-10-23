/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../../context/AuthContext';
import { cronogramaService } from '../services/cronogramaService';
import { diasLaborablesDelMes, fechaDeHoy } from '../utils/cronogramaUtils';
import { CronogramaMatrizPage } from './CronogramaMatrizPage';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/cronogramaService', () => ({
  cronogramaService: {
    getMatriz: vi.fn(),
    marcarCelda: vi.fn(),
    liberarCelda: vi.fn(),
    exportarPdf: vi.fn(),
    guardarPersonal: vi.fn(),
  },
}));

vi.mock('./CronogramaPersonalPanel', () => ({
  CronogramaPersonalPanel: ({ personal, puedeEscribir, guardando, onSave }) => (
    <div>
      <p>{`${puedeEscribir ? 'personal-editable' : 'personal-lectura'}|${guardando ? 'guardando-personal' : 'personal-idle'}|${(personal || []).length}`}</p>
      {puedeEscribir && (
        <button
          type="button"
          onClick={() => onSave([{ nombre: 'Ana', hora_inicio: '10:00', hora_fin: '13:00' }])}
        >
          guardar-personal
        </button>
      )}
    </div>
  ),
}));

vi.mock('./CronogramaCantidadPopover', () => ({
  CronogramaCantidadPopover: ({
    areaNombre, fecha, max, puedeEscribir, busy, ocupada, onPick, onLiberar, onClose,
  }) => (
    <div>
      <p>{`${areaNombre}|${fecha}|max${max}|${puedeEscribir ? 'edita' : 'lee'}|${busy ? 'ocupado' : 'libre'}|${ocupada ? 'marcada' : 'vacia'}`}</p>
      <button type="button" onClick={() => onPick(2)}>elegir-cantidad</button>
      <button type="button" onClick={onLiberar}>liberar-dia</button>
      <button type="button" onClick={onClose}>cerrar-picker</button>
    </div>
  ),
}));

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function mesLabel(mes, anio) {
  return `${MESES[mes - 1]} ${anio}`;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function IrA() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/v2/cronograma/6')}>
      ir-6
    </button>
  );
}

let cal;

function calendario() {
  const now = new Date();
  const anio = now.getFullYear();
  const mes = now.getMonth() + 1;
  const hoy = fechaDeHoy();
  const dias = diasLaborablesDelMes(anio, mes);
  const otros = dias.filter((dia) => dia !== hoy);
  return { anio, mes, hoy, dias, dia: otros[0], dia2: otros[1] };
}

function renderMatriz(user = { rol: 'Administrador' }) {
  useAuth.mockReturnValue({ user });
  return render(
    <MemoryRouter initialEntries={['/v2/cronograma/5']}>
      <IrA />
      <Routes>
        <Route path="/v2/cronograma/:id" element={<CronogramaMatrizPage />} />
        <Route path="/v2/cronograma" element={<p>historial</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockMatriz(data) {
  cronogramaService.getMatriz.mockResolvedValue({ success: true, data });
}

async function montar(data, user) {
  mockMatriz(data);
  renderMatriz(user);
  expect(await screen.findByRole('heading', { name: data.cronograma.nombre })).toBeTruthy();
  const anioDoc = Number(data.cronograma.anio);
  const mesInicial = anioDoc === cal.anio ? cal.mes : 1;
  const anioVisible = anioDoc || cal.anio;
  expect(await screen.findByText(mesLabel(mesInicial, anioVisible))).toBeTruthy();
}

describe('CronogramaMatrizPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 19, 15, 0, 0));
    cal = calendario();
    cronogramaService.getMatriz.mockReset();
    cronogramaService.marcarCelda.mockReset();
    cronogramaService.liberarCelda.mockReset();
    cronogramaService.exportarPdf.mockReset();
    cronogramaService.guardarPersonal.mockReset();
    cronogramaService.marcarCelda.mockResolvedValue({ ok: true });
    cronogramaService.liberarCelda.mockResolvedValue({ ok: true });
    cronogramaService.exportarPdf.mockResolvedValue(undefined);
    cronogramaService.guardarPersonal.mockResolvedValue({ ok: true });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.mocked(window.alert).mockRestore();
    vi.mocked(window.confirm).mockRestore();
    vi.useRealTimers();
    cleanup();
  });

  it('muestra el esqueleto y luego la matriz del mes en curso', async () => {
    const pending = deferred();
    cronogramaService.getMatriz.mockReturnValue(pending.promise);
    renderMatriz();
    expect(document.querySelector('.h-28.animate-pulse')).toBeTruthy();
    expect(document.querySelector('.h-48.animate-pulse')).toBeTruthy();

    const filas = [
      {
        area_id: 11,
        area: 'Sistemas',
        gerencia_id: 2,
        gerencia: 'Gerencia TI',
        pc: 3,
        laptop: 1,
        impresora: 1,
        computadoras: 4,
        programados: 2,
        subtotal: 5,
        celdas: [{ id: 70, fecha: cal.hoy, cantidad: 2 }],
      },
      {
        area_id: 12,
        area: 'Redes',
        gerencia_id: 2,
        gerencia: 'Gerencia TI',
        pc: 1,
        laptop: 0,
        impresora: 0,
        celdas: [],
      },
      {
        area_id: 13,
        area: 'Archivo',
        gerencia_id: 5,
        gerencia: '  gerencia admin ',
        pc: 0,
        laptop: 0,
        impresora: 4,
        computadoras: 0,
        programados: 0,
        subtotal: 4,
        celdas: [],
      },
      {
        area_id: 14,
        area: 'Bodega',
        gerencia_id: 0,
        gerencia: '',
        pc: 2,
        laptop: 0,
        impresora: 0,
        computadoras: 2,
        programados: 2,
        celdas: [{ id: 71, fecha: cal.dia, cantidad: 2 }],
      },
    ];

    await act(async () => {
      pending.resolve({
        success: true,
        data: {
          cronograma: { nombre: 'Preventivo 2026', anio: cal.anio },
          filas,
          cobertura: [
            { area_id: 11, area: 'Sistemas', programados: 2, computadoras: 4 },
            { area_id: 12, area: 'Redes', programados: 0, computadoras: 1 },
          ],
          personal: [{ nombre: 'Ana', hora_inicio: '10:00', hora_fin: '13:00' }],
          totales: { pc: 41, laptop: 42, impresora: 43, subtotal: 126, total: 127 },
        },
      });
    });

    expect(await screen.findByRole('heading', { name: 'Preventivo 2026' })).toBeTruthy();
    expect(await screen.findByText(mesLabel(cal.mes, cal.anio))).toBeTruthy();
    expect(cronogramaService.getMatriz).toHaveBeenCalledWith('5');
    expect(screen.getByText(/Clic en un día para elegir X1, X2, X3/)).toBeTruthy();
    expect(screen.getByText('Día marcado (Xn)')).toBeTruthy();
    expect(screen.getByText(`Lunes a viernes · ${cal.anio}`)).toBeTruthy();
    expect(screen.getByText('Áreas con parque').parentElement.textContent).toContain('3');
    expect(screen.getByText('Cubiertas').parentElement.textContent).toContain('1');
    expect(screen.getByText('Pendientes').parentElement.textContent).toContain('2');
    expect(screen.getByText('2 áreas con PC/laptop aún no cubiertos')).toBeTruthy();
    expect(screen.getByText('Sistemas · 2/4')).toBeTruthy();
    expect(screen.getByText('Redes · 0/1')).toBeTruthy();
    expect(screen.getByText('GERENCIA TI')).toBeTruthy();
    expect(screen.getByText('GERENCIA ADMIN')).toBeTruthy();
    expect(screen.getByText('OTRAS ÁREAS')).toBeTruthy();
    expect(screen.getByText('2/4')).toBeTruthy();
    expect(screen.getByText('0/1')).toBeTruthy();
    expect(screen.getByText('2/2')).toBeTruthy();
    expect(screen.getByText('Bodega').closest('tr').innerHTML).toContain('bg-emerald-500');
    expect(screen.getByText('Sistemas').closest('tr').innerHTML).toContain('bg-[#00a8cc]');
    expect(screen.getByText('127')).toBeTruthy();
    expect(screen.getByText('personal-editable|personal-idle|1')).toBeTruthy();
    expect(screen.getByRole('button', { name: `Sistemas, ${cal.hoy}, X2` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Redes, ${cal.hoy}, libre` })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Historial/ })).toBeTruthy();
  });

  it('informa errores de carga y vuelve al historial', async () => {
    cronogramaService.getMatriz.mockResolvedValueOnce({ success: false, message: 'No existe' });
    renderMatriz();
    expect(await screen.findByText('No existe')).toBeTruthy();
    cleanup();

    cronogramaService.getMatriz.mockResolvedValueOnce({ success: false, message: '' });
    renderMatriz();
    expect(await screen.findByText('No se encontró el cronograma.')).toBeTruthy();
    cleanup();

    cronogramaService.getMatriz.mockRejectedValueOnce({ response: { data: { message: 'caída' } } });
    renderMatriz();
    expect(await screen.findByText('caída')).toBeTruthy();
    cleanup();

    cronogramaService.getMatriz.mockRejectedValueOnce(new Error('red'));
    renderMatriz();
    expect(await screen.findByText('No se pudo cargar la matriz.')).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Volver al historial' }));
    expect(screen.getByText('historial')).toBeTruthy();
  });

  it('advierte en singular el área pendiente', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 1,
        area: 'Sistemas',
        pc: 2,
        laptop: 0,
        impresora: 0,
        computadoras: 2,
        programados: 0,
        celdas: [],
      }],
      cobertura: [{ area_id: 1, area: 'Sistemas', programados: 0, computadoras: 2 }],
      personal: [],
      totales: { pc: 2, laptop: 0, impresora: 0, subtotal: 2, total: 2 },
    });

    expect(screen.getByText('1 área con PC/laptop aún no cubierto')).toBeTruthy();
    expect(screen.getByText('Sistemas · 0/2')).toBeTruthy();
    expect(screen.getByText('Cubiertas').parentElement.textContent).toContain('0');
    expect(screen.getByText('Pendientes').parentElement.textContent).toContain('1');
  });

  it('recorre el mes actual y, en un año anterior, no pasa de enero ni de diciembre', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [],
      cobertura: [],
      personal: [],
    });

    expect(screen.queryByRole('button', { name: 'Hoy' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByText(mesLabel(cal.mes + 1, cal.anio))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(screen.getByText(mesLabel(cal.mes, cal.anio))).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Hoy' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByText(mesLabel(cal.mes - 1, cal.anio))).toBeTruthy();

    cleanup();
    const pasado = cal.anio - 1;
    await montar({
      cronograma: { nombre: 'Archivo pasado', anio: pasado },
      filas: [],
      cobertura: [],
      personal: [],
    });
    expect(screen.queryByRole('button', { name: 'Hoy' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByText(mesLabel(1, pasado))).toBeTruthy();
    for (let i = 0; i < 11; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    }
    expect(screen.getByText(mesLabel(12, pasado))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByText(mesLabel(12, pasado))).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Hoy' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByText(mesLabel(11, pasado))).toBeTruthy();
  });

  it('abre el día, elige cantidad, cierra y avisa si no puede programar', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 11,
        area: 'Sistemas',
        pc: 3,
        laptop: 1,
        impresora: 0,
        computadoras: 4,
        programados: 0,
        celdas: [],
      }],
      cobertura: [],
      personal: [],
    });

    fireEvent.click(screen.getByRole('button', { name: `Sistemas, ${cal.dia}, libre` }));
    expect(screen.getByText(new RegExp(`Sistemas\\|${cal.dia}\\|max4\\|edita\\|libre\\|vacia`))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'cerrar-picker' }));
    expect(screen.queryByText(/max4/)).toBeNull();
    expect(cronogramaService.marcarCelda).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: `Sistemas, ${cal.dia}, libre` }));
    cronogramaService.marcarCelda.mockRejectedValueOnce({ response: { data: { message: 'sin cupo' } } });
    fireEvent.click(screen.getByRole('button', { name: 'elegir-cantidad' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('sin cupo'));
    expect(screen.getByText(new RegExp(`Sistemas\\|${cal.dia}\\|max4`))).toBeTruthy();

    cronogramaService.marcarCelda.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: 'elegir-cantidad' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo programar.'));

    cronogramaService.marcarCelda.mockResolvedValueOnce({ ok: true });
    fireEvent.click(screen.getByRole('button', { name: 'elegir-cantidad' }));
    await waitFor(() => expect(screen.queryByText(/max4/)).toBeNull());
    expect(cronogramaService.marcarCelda).toHaveBeenLastCalledWith('5', {
      area_id: 11,
      fecha: cal.dia,
      cantidad: 2,
    });
    expect(cronogramaService.getMatriz.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('programa X1 directo cuando el día solo admite uno', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 4,
        area: 'Unica',
        pc: 1,
        laptop: 0,
        impresora: 0,
        celdas: [],
      }],
      cobertura: [],
      personal: [],
    });

    const boton = screen.getByRole('button', { name: `Unica, ${cal.dia}, libre` });
    fireEvent.click(boton);
    await waitFor(() => expect(cronogramaService.marcarCelda).toHaveBeenCalledWith('5', {
      area_id: 4,
      fecha: cal.dia,
      cantidad: 1,
    }));
    expect(screen.queryByRole('button', { name: 'elegir-cantidad' })).toBeNull();
  });

  it('ignora otro clic mientras guarda la celda', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 4,
        area: 'Unica',
        pc: 1,
        laptop: 0,
        impresora: 0,
        celdas: [],
      }],
      cobertura: [],
      personal: [],
    });

    const pending = deferred();
    cronogramaService.marcarCelda.mockReturnValueOnce(pending.promise);
    const boton = screen.getByRole('button', { name: `Unica, ${cal.dia}, libre` });
    fireEvent.click(boton);
    await waitFor(() => expect(boton.className).toContain('opacity-50'));
    fireEvent.click(boton);
    fireEvent.click(screen.getByRole('button', { name: `Unica, ${cal.dia2}, libre` }));
    expect(cronogramaService.marcarCelda).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve({ ok: true });
    });
    await waitFor(() => expect(cronogramaService.getMatriz).toHaveBeenCalledTimes(2));
    expect(boton.className).not.toContain('opacity-50');
  });

  it('avisa cuando el área ya no tiene equipos libres', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 3,
        area: 'Bodega',
        pc: 1,
        laptop: 1,
        impresora: 0,
        computadoras: 2,
        programados: 2,
        celdas: [{ id: 9, fecha: cal.dia, cantidad: 2 }],
      }],
      cobertura: [],
      personal: [],
    });

    fireEvent.click(screen.getByRole('button', { name: `Bodega, ${cal.dia2}, libre` }));
    expect(window.alert).toHaveBeenCalledWith(
      'Ya programó todos los PC/laptop de esta área. Reduzca la cantidad en otro día o libere uno.',
    );
    expect(cronogramaService.marcarCelda).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'elegir-cantidad' })).toBeNull();
  });

  it('libera un día marcado, cancela la confirmación y avisa si falla', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 11,
        area: 'Sistemas',
        pc: 2,
        laptop: 0,
        impresora: 0,
        computadoras: 2,
        programados: 1,
        celdas: [{ id: 70, fecha: cal.hoy, cantidad: 1 }],
      }],
      cobertura: [],
      personal: [],
    });

    fireEvent.click(screen.getByRole('button', { name: `Sistemas, ${cal.hoy}, X1` }));
    window.confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'liberar-dia' }));
    expect(window.confirm).toHaveBeenCalledWith('¿Liberar este día?');
    expect(cronogramaService.liberarCelda).not.toHaveBeenCalled();
    expect(screen.getByText(new RegExp(`Sistemas\\|${cal.hoy}\\|max\\d+\\|edita\\|libre\\|marcada`))).toBeTruthy();

    cronogramaService.liberarCelda.mockRejectedValueOnce({ response: { data: { message: '' } } });
    fireEvent.click(screen.getByRole('button', { name: 'liberar-dia' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo liberar.'));
    expect(screen.getByText(new RegExp(`Sistemas\\|${cal.hoy}\\|max\\d+\\|edita\\|libre\\|marcada`))).toBeTruthy();

    cronogramaService.liberarCelda.mockRejectedValueOnce({ response: { data: { message: 'ocupada' } } });
    fireEvent.click(screen.getByRole('button', { name: 'liberar-dia' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('ocupada'));

    const pending = deferred();
    cronogramaService.liberarCelda.mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: 'liberar-dia' }));
    expect(await screen.findByText(new RegExp(`Sistemas\\|${cal.hoy}\\|max\\d+\\|edita\\|ocupado\\|marcada`))).toBeTruthy();
    await act(async () => {
      pending.resolve({ ok: true });
    });
    await waitFor(() => expect(screen.queryByText(/marcada/)).toBeNull());
    expect(cronogramaService.liberarCelda).toHaveBeenCalledWith('5', 70);
  });

  it('libera una marca sin id guardando cantidad cero', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 11,
        area: 'Sistemas',
        pc: 2,
        laptop: 0,
        impresora: 0,
        computadoras: 2,
        programados: 1,
        celdas: [{ fecha: cal.hoy, cantidad: 1 }],
      }],
      cobertura: [],
      personal: [],
    });

    fireEvent.click(screen.getByRole('button', { name: `Sistemas, ${cal.hoy}, X1` }));
    fireEvent.click(screen.getByRole('button', { name: 'liberar-dia' }));
    await waitFor(() => expect(cronogramaService.marcarCelda).toHaveBeenCalledWith('5', {
      area_id: 11,
      fecha: cal.hoy,
      cantidad: 0,
    }));
    expect(cronogramaService.liberarCelda).not.toHaveBeenCalled();
  });

  it('un rol sin permiso no programa días libres y sí consulta uno marcado', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [{
        area_id: 11,
        area: 'Sistemas',
        pc: 3,
        laptop: 1,
        impresora: 0,
        computadoras: 4,
        programados: 1,
        celdas: [{ id: 70, fecha: cal.hoy, cantidad: 1 }],
      }],
      cobertura: [],
      personal: [],
    }, { rol: 'Practicante' });

    expect(screen.queryByText(/Clic en un día/)).toBeNull();
    expect(screen.getByText('personal-lectura|personal-idle|0')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'guardar-personal' })).toBeNull();

    const libre = screen.getByRole('button', { name: `Sistemas, ${cal.dia}, libre` });
    expect(libre.disabled).toBe(true);
    expect(libre.className).toContain('cursor-default');
    libre.disabled = false;
    fireEvent.click(libre);
    expect(screen.queryByRole('button', { name: 'elegir-cantidad' })).toBeNull();
    expect(cronogramaService.marcarCelda).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: `Sistemas, ${cal.hoy}, X1` }));
    expect(screen.getByText(new RegExp(`Sistemas\\|${cal.hoy}\\|max\\d+\\|lee\\|libre\\|marcada`))).toBeTruthy();
  });

  it('genera el PDF y avisa cuando falla', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [],
      cobertura: [],
      personal: [],
    });

    const pending = deferred();
    cronogramaService.exportarPdf.mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: /Imprimir PDF/ }));
    expect((await screen.findByRole('button', { name: 'Generando...' })).disabled).toBe(true);
    await act(async () => {
      pending.resolve();
    });
    await screen.findByRole('button', { name: /Imprimir PDF/ });
    expect(cronogramaService.exportarPdf).toHaveBeenCalledWith('5');
    expect(window.alert).not.toHaveBeenCalled();

    cronogramaService.exportarPdf.mockRejectedValueOnce(new Error('pdf roto'));
    fireEvent.click(screen.getByRole('button', { name: /Imprimir PDF/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('pdf roto'));

    cronogramaService.exportarPdf.mockRejectedValueOnce(new Error(''));
    fireEvent.click(screen.getByRole('button', { name: /Imprimir PDF/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo generar el PDF.'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Imprimir PDF/ }).disabled).toBe(false);
    });
  });

  it('guarda el personal y avisa cuando falla', async () => {
    await montar({
      cronograma: { nombre: 'Preventivo', anio: cal.anio },
      filas: [],
      cobertura: [],
      personal: [],
    });

    const pending = deferred();
    cronogramaService.guardarPersonal.mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: 'guardar-personal' }));
    expect(await screen.findByText('personal-editable|guardando-personal|0')).toBeTruthy();
    await act(async () => {
      pending.resolve({ ok: true });
    });
    await screen.findByText('personal-editable|personal-idle|0');
    expect(cronogramaService.guardarPersonal).toHaveBeenCalledWith('5', [
      { nombre: 'Ana', hora_inicio: '10:00', hora_fin: '13:00' },
    ]);
    expect(cronogramaService.getMatriz).toHaveBeenCalledTimes(2);

    cronogramaService.guardarPersonal.mockRejectedValueOnce({ response: { data: { message: 'equipo mal' } } });
    fireEvent.click(screen.getByRole('button', { name: 'guardar-personal' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('equipo mal'));

    cronogramaService.guardarPersonal.mockRejectedValueOnce(new Error('x'));
    fireEvent.click(screen.getByRole('button', { name: 'guardar-personal' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo guardar el equipo de trabajo.'));
    expect(screen.getByText('personal-editable|personal-idle|0')).toBeTruthy();
  });

  it('vuelve a cargar cuando cambia el cronograma de la ruta', async () => {
    cronogramaService.getMatriz.mockImplementation(async (id) => ({
      success: true,
      data: {
        cronograma: { nombre: `Doc ${id}`, anio: cal.anio },
        filas: [],
        cobertura: [],
        personal: [],
      },
    }));
    renderMatriz();
    expect(await screen.findByRole('heading', { name: 'Doc 5' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'ir-6' }));
    expect(await screen.findByRole('heading', { name: 'Doc 6' })).toBeTruthy();
    expect(cronogramaService.getMatriz).toHaveBeenCalledWith('6');
  });

  it('tolera un documento sin año, sin filas y sin totales', async () => {
    cronogramaService.getMatriz.mockResolvedValue({
      success: true,
      data: { cronograma: { nombre: 'Sin año' } },
    });
    renderMatriz();
    expect(await screen.findByRole('heading', { name: 'Sin año' })).toBeTruthy();
    expect(await screen.findByText(mesLabel(1, cal.anio))).toBeTruthy();
    expect(screen.getByText('personal-editable|personal-idle|0')).toBeTruthy();
    expect(screen.queryByText(/aún no cubiert/)).toBeNull();
    expect(screen.getByText('Subtotal')).toBeTruthy();
    expect(screen.getByText('Total equipos')).toBeTruthy();
    expect(screen.getByText('Áreas con parque').parentElement.textContent).toContain('0');
    fireEvent.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(screen.getByText(mesLabel(cal.mes, cal.anio))).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Hoy' })).toBeNull();

    fireEvent.click(screen.getByRole('link', { name: /Historial/ }));
    expect(screen.getByText('historial')).toBeTruthy();
  });
});
