/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../../context/AuthContext';
import { cronogramaService } from '../services/cronogramaService';
import { CronogramaListPage } from './CronogramaListPage';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/cronogramaService', () => ({
  cronogramaService: {
    listar: vi.fn(),
    crear: vi.fn(),
    eliminar: vi.fn(),
  },
}));

const ANIO = new Date().getFullYear();

const planVisita = {
  id: 5,
  nombre: 'Plan A',
  anio: 2026,
  creado_por_nombre: 'Ana Ruiz',
  creado_en: '2026-03-02T10:15:00',
  celdas: 1,
};

const planVarias = {
  id: 6,
  nombre: 'Plan B',
  anio: 2025,
  creado_por_nombre: null,
  creado_en: null,
  celdas: 4,
};

function Destino() {
  const params = useParams();
  return <div>{`abierto-${params.id}`}</div>;
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

function renderList(user = { rol: 'Administrador' }) {
  useAuth.mockReturnValue({ user });
  return render(
    <MemoryRouter initialEntries={['/v2/cronograma']}>
      <Routes>
        <Route path="/v2/cronograma" element={<CronogramaListPage />} />
        <Route path="/v2/cronograma/:id" element={<Destino />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function abrirModal() {
  fireEvent.click(screen.getByRole('button', { name: /Nuevo cronograma/ }));
  expect(await screen.findByRole('heading', { name: 'Registrar cronograma' })).toBeTruthy();
}

describe('CronogramaListPage', () => {
  beforeEach(() => {
    cronogramaService.listar.mockReset();
    cronogramaService.crear.mockReset();
    cronogramaService.eliminar.mockReset();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.mocked(window.alert).mockRestore();
    vi.mocked(window.confirm).mockRestore();
    cleanup();
  });

  it('muestra el esqueleto y luego el historial', async () => {
    const pending = deferred();
    cronogramaService.listar.mockReturnValue(pending.promise);
    const { container } = renderList();

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3);
    expect(screen.queryByText('Aún no hay planes registrados')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Cronograma' })).toBeTruthy();

    await act(async () => {
      pending.resolve({ success: true, data: [planVisita, planVarias] });
    });

    expect(await screen.findByText('Plan A')).toBeTruthy();
    expect(screen.getByText('Plan B')).toBeTruthy();
    expect(screen.getByText(/Ana Ruiz ·/).textContent).toContain('Ana Ruiz');
    expect(screen.getByText(/Sin autor · —/).textContent).toContain('—');
    expect(screen.getByText((_, node) => node?.tagName === 'SPAN' && node.textContent === '1 visita')).toBeTruthy();
    expect(screen.getByText((_, node) => node?.tagName === 'SPAN' && node.textContent === '4 visitas')).toBeTruthy();
    expect(cronogramaService.listar).toHaveBeenCalledWith(undefined);
    expect(screen.getByRole('button', { name: 'Eliminar Plan A' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Nuevo cronograma/ })).toBeTruthy();
  });

  it('muestra el vacío cuando no hay planes o la respuesta no trae datos', async () => {
    cronogramaService.listar.mockResolvedValueOnce({ success: true, data: [] });
    renderList();
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    expect(screen.getByText('Cree el primer cronograma del año para empezar a marcar visitas.')).toBeTruthy();
    cleanup();

    cronogramaService.listar.mockResolvedValueOnce({ success: true, data: null });
    renderList();
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    expect(screen.queryByText('No se pudo cargar el historial.')).toBeNull();
  });

  it('informa los errores de carga', async () => {
    cronogramaService.listar.mockResolvedValueOnce({ success: false, message: 'sin permiso' });
    renderList();
    expect(await screen.findByText('sin permiso')).toBeTruthy();
    expect(screen.getByText('Aún no hay planes registrados')).toBeTruthy();
    cleanup();

    cronogramaService.listar.mockResolvedValueOnce({ success: false, message: '' });
    renderList();
    expect(await screen.findByText('No se pudo cargar el historial.')).toBeTruthy();
    cleanup();

    cronogramaService.listar.mockRejectedValueOnce({ response: { data: { message: 'caído' } } });
    renderList();
    expect(await screen.findByText('caído')).toBeTruthy();
    cleanup();

    cronogramaService.listar.mockRejectedValueOnce(new Error('red'));
    renderList();
    expect(await screen.findByText('No se pudo cargar el historial.')).toBeTruthy();
  });

  it('filtra por año y vuelve a mostrar todos', async () => {
    cronogramaService.listar.mockImplementation(async (anio) => {
      const todos = [planVisita, planVarias];
      if (!anio) return { success: true, data: todos };
      return { success: true, data: todos.filter((item) => String(item.anio) === String(anio)) };
    });
    renderList();
    expect(await screen.findByText('Plan A')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ver todos' })).toBeNull();

    fireEvent.change(screen.getByLabelText(/Filtrar por año/), { target: { value: '2024' } });
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    expect(screen.queryByText('Plan A')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }));
    await waitFor(() => expect(cronogramaService.listar).toHaveBeenCalledTimes(3));
    expect(await screen.findByText('Plan B')).toBeTruthy();
    expect(screen.getByText('Plan A')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ver todos' })).toBeNull();
    expect(cronogramaService.listar).toHaveBeenNthCalledWith(1, undefined);
    expect(cronogramaService.listar).toHaveBeenNthCalledWith(2, '2024');
    expect(cronogramaService.listar).toHaveBeenNthCalledWith(3, undefined);
  });

  it('abre el formulario desde el encabezado y desde el vacío, y lo cancela', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [] });
    renderList();
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Crear cronograma/ }));
    expect(screen.getByRole('heading', { name: 'Registrar cronograma' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('heading', { name: 'Registrar cronograma' })).toBeNull();

    await abrirModal();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Registrar cronograma')).toBeNull();
    expect(cronogramaService.crear).not.toHaveBeenCalled();
  });

  it('no envía el alta si faltan los campos obligatorios', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [] });
    renderList();
    expect(await screen.findByRole('button', { name: /Nuevo cronograma/ })).toBeTruthy();
    await abrirModal();

    const nombre = screen.getByLabelText(/Nombre \*/);
    const anio = screen.getByLabelText(/Año \*/);
    const form = nombre.closest('form');
    expect(nombre.required).toBe(true);
    expect(anio.required).toBe(true);
    expect(form.checkValidity()).toBe(false);

    fireEvent.change(anio, { target: { value: '1999' } });
    form.requestSubmit();
    expect(cronogramaService.crear).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Registrar cronograma' })).toBeTruthy();
  });

  it('crea el cronograma, recorta los textos y abre la matriz', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [] });
    cronogramaService.crear.mockResolvedValue({ success: true, data: { id: 9 } });
    renderList();
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    await abrirModal();

    fireEvent.change(screen.getByLabelText(/Año \*/), { target: { value: '2031' } });
    fireEvent.change(screen.getByLabelText(/Nombre \*/), { target: { value: '  Preventivo norte  ' } });
    fireEvent.change(screen.getByLabelText('Notas'), { target: { value: '  observar racks  ' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByText('abierto-9')).toBeTruthy();
    expect(cronogramaService.crear).toHaveBeenCalledWith({
      anio: 2031,
      nombre: 'Preventivo norte',
      notas: 'observar racks',
    });
  });

  it('guarda notas vacías como nulo', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [planVisita] });
    cronogramaService.crear.mockResolvedValue({ success: true, data: { id: 4 } });
    renderList();
    expect(await screen.findByText('Plan A')).toBeTruthy();
    await abrirModal();

    fireEvent.change(screen.getByLabelText(/Nombre \*/), { target: { value: 'Solo nombre' } });
    fireEvent.change(screen.getByLabelText('Notas'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));

    expect(await screen.findByText('abierto-4')).toBeTruthy();
    expect(cronogramaService.crear).toHaveBeenCalledWith({
      anio: ANIO,
      nombre: 'Solo nombre',
      notas: null,
    });
  });

  it('avisa cuando no puede crear y vuelve a habilitar el botón', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [] });
    renderList();
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    await abrirModal();
    fireEvent.change(screen.getByLabelText(/Nombre \*/), { target: { value: 'Plan nuevo' } });

    const pending = deferred();
    cronogramaService.crear.mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));
    expect((await screen.findByRole('button', { name: 'Guardando...' })).disabled).toBe(true);

    await act(async () => {
      pending.resolve({ success: false, message: 'duplicado' });
    });
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('duplicado'));
    expect(screen.getByRole('button', { name: /^Crear$/ }).disabled).toBe(false);

    cronogramaService.crear.mockResolvedValueOnce({ success: false, message: '' });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear.'));

    cronogramaService.crear.mockRejectedValueOnce({ response: { data: { message: 'rechazado' } } });
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('rechazado'));

    cronogramaService.crear.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: /^Crear$/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear el cronograma.'));
    expect(screen.getByRole('heading', { name: 'Registrar cronograma' })).toBeTruthy();
  });

  it('no elimina si se cancela la confirmación', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [planVisita] });
    window.confirm.mockReturnValueOnce(false);
    renderList();
    expect(await screen.findByText('Plan A')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Plan A' }));
    expect(window.confirm).toHaveBeenCalledWith(
      '¿Eliminar «Plan A» (2026)? Se borrarán las visitas programadas. Esta acción no se puede deshacer.',
    );
    expect(cronogramaService.eliminar).not.toHaveBeenCalled();
    expect(screen.getByText('Plan A')).toBeTruthy();
    expect(screen.queryByText(/abierto-/)).toBeNull();
  });

  it('elimina el plan confirmado y recarga el historial', async () => {
    let llamadas = 0;
    cronogramaService.listar.mockImplementation(async () => {
      llamadas += 1;
      if (llamadas === 1) return { success: true, data: [planVisita] };
      return { success: true, data: [] };
    });
    cronogramaService.eliminar.mockResolvedValue({ success: true });
    renderList();
    expect(await screen.findByText('Plan A')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Plan A' }));
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    expect(cronogramaService.eliminar).toHaveBeenCalledWith(5);
    expect(llamadas).toBe(2);
  });

  it('avisa cuando la eliminación falla', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [planVisita] });
    cronogramaService.eliminar
      .mockResolvedValueOnce({ success: false, message: 'en uso' })
      .mockResolvedValueOnce({ success: false, message: '' })
      .mockRejectedValueOnce({ response: { data: { message: 'bloqueado' } } })
      .mockRejectedValueOnce(new Error('x'));
    renderList();
    expect(await screen.findByText('Plan A')).toBeTruthy();

    const borrar = () => fireEvent.click(screen.getByRole('button', { name: 'Eliminar Plan A' }));
    borrar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('en uso'));
    borrar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar.'));
    borrar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('bloqueado'));
    borrar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar el cronograma.'));
    expect(screen.getByText('Plan A')).toBeTruthy();
  });

  it('abre un plan desde la fila o la flecha', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [planVisita, planVarias] });
    renderList();
    expect(await screen.findByText('Plan A')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Ana Ruiz/ }));
    expect(await screen.findByText('abierto-5')).toBeTruthy();
    cleanup();

    cronogramaService.listar.mockResolvedValue({ success: true, data: [planVisita, planVarias] });
    renderList();
    expect(await screen.findByText('Plan B')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Plan B' }));
    expect(await screen.findByText('abierto-6')).toBeTruthy();
  });

  it('oculta alta y borrado cuando el rol no puede escribir', async () => {
    cronogramaService.listar.mockResolvedValue({ success: true, data: [] });
    renderList({ rol: 'Practicante' });
    expect(await screen.findByText('Aún no hay planes registrados')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Nuevo cronograma/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Crear cronograma/ })).toBeNull();
    cleanup();

    cronogramaService.listar.mockResolvedValue({ success: true, data: [planVisita] });
    renderList({ rol: 'Practicante' });
    expect(await screen.findByText('Plan A')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Eliminar/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Nuevo cronograma/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Plan A' }));
    expect(await screen.findByText('abierto-5')).toBeTruthy();
  });
});
