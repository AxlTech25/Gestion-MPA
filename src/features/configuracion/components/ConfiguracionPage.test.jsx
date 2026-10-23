/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ConfiguracionPage } from './ConfiguracionPage';
import { organizacionService } from '../services/organizacionService';

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: { user: { id: 1, rol: 'Administrador', nombre_completo: 'Admin' } },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../services/organizacionService', () => ({
  organizacionService: {
    getAreas: vi.fn(),
    getGerencias: vi.fn(),
    getUsuarios: vi.fn(),
    createGerencia: vi.fn(),
    deleteUsuario: vi.fn(),
    deleteArea: vi.fn(),
    deleteGerencia: vi.fn(),
  },
}));

vi.mock('./AreaForm', () => ({
  AreaForm: ({ onClose, onSuccess, area, gerencias }) => (
    <div data-testid="area-form">
      <span>{area ? area.nombre : 'nueva'}</span>
      <span>{`gerencias-${gerencias.length}`}</span>
      <button type="button" onClick={onClose}>cerrar-area</button>
      <button type="button" onClick={onSuccess}>exito-area</button>
    </div>
  ),
}));

vi.mock('./UsuarioForm', () => ({
  UsuarioForm: ({ onClose, onSuccess, user, areas }) => (
    <div data-testid="usuario-form">
      <span>{user ? user.nombre_completo : 'nuevo'}</span>
      <span>{`areas-${areas.length}`}</span>
      <button type="button" onClick={onClose}>cerrar-usuario</button>
      <button type="button" onClick={onSuccess}>exito-usuario</button>
    </div>
  ),
}));

const areaCompleta = {
  id: 3,
  nombre: 'Sistemas',
  jefe_encargado: 'Ada',
  descripcion: 'Redes',
  gerencia: 'Dirección de TI',
};
const areaVacia = { id: 4, nombre: 'Limpieza' };
const gerencias = [{ id: 10, nombre: 'GTI' }, { id: 11, nombre: 'GAF' }];

async function renderPage() {
  render(<ConfiguracionPage />);
  await waitFor(() => expect(screen.queryByText('Cargando...')).toBeNull());
}

function confirmEliminar() {
  const heading = screen.getByRole('heading', { name: 'Confirmar eliminación' });
  const dialog = heading.closest('div.rounded-2xl');
  within(dialog).getByRole('button', { name: 'Eliminar' }).click();
}

describe('ConfiguracionPage', () => {
  beforeEach(() => {
    mockAuth.user = { id: 1, rol: 'Administrador', nombre_completo: 'Admin' };
    organizacionService.getAreas.mockReset();
    organizacionService.getGerencias.mockReset();
    organizacionService.getUsuarios.mockReset();
    organizacionService.createGerencia.mockReset();
    organizacionService.deleteUsuario.mockReset();
    organizacionService.deleteArea.mockReset();
    organizacionService.deleteGerencia.mockReset();
    organizacionService.getAreas.mockResolvedValue({ success: true, data: [] });
    organizacionService.getGerencias.mockResolvedValue({ success: true, data: [] });
    organizacionService.getUsuarios.mockResolvedValue({ success: true, data: [] });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'click').mockImplementation(function mockClick() {
      fireEvent.click(this);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra la carga y los vacíos de áreas y gerencias', async () => {
    let resolveAreas;
    organizacionService.getAreas.mockReturnValue(new Promise((resolve) => {
      resolveAreas = resolve;
    }));
    render(<ConfiguracionPage />);
    expect(screen.getByText('Cargando...')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Nueva área/ })).toBeTruthy();

    await act(async () => {
      resolveAreas({ success: true, data: null });
    });
    await waitFor(() => expect(screen.getByText('No hay áreas registradas.')).toBeTruthy());
    expect(screen.getByText(/Aún no hay gerencias/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Áreas y departamentos/ }).className).toContain('text-blue-600');
  });

  it('ignora respuestas fallidas y registra errores de cada listado', async () => {
    organizacionService.getAreas.mockResolvedValueOnce({ success: false, data: [{ id: 1, nombre: 'Oculta' }] });
    organizacionService.getGerencias.mockResolvedValueOnce({ success: false, data: [{ id: 2, nombre: 'Secreta' }] });
    await renderPage();
    expect(screen.queryByText('Oculta')).toBeNull();
    expect(screen.queryByText('Secreta')).toBeNull();

    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('No hay personal de TI registrado.')).toBeTruthy());

    organizacionService.getAreas.mockRejectedValueOnce(new Error('areas'));
    organizacionService.getGerencias.mockRejectedValueOnce(new Error('gerencias'));
    screen.getByRole('button', { name: /Áreas y departamentos/ }).click();
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error al cargar áreas', expect.any(Error)));
    expect(console.error).toHaveBeenCalledWith('Error al cargar gerencias', expect.any(Error));
  });

  it('lista gerencias y áreas con y sin datos opcionales, y abre el formulario', async () => {
    organizacionService.getAreas.mockResolvedValue({ success: true, data: [areaCompleta, areaVacia] });
    organizacionService.getGerencias.mockResolvedValue({ success: true, data: gerencias });
    await renderPage();

    expect(screen.getByText('GTI')).toBeTruthy();
    expect(screen.getByText('Dirección de TI')).toBeTruthy();
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByText('Redes')).toBeTruthy();
    expect(screen.getByText('Sin jefe asignado')).toBeTruthy();
    expect(screen.getByText('Sin descripción')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eliminar gerencia GTI' })).toBeTruthy();

    screen.getByRole('button', { name: /Nueva área/ }).click();
    expect(screen.getByTestId('area-form').textContent).toContain('nueva');
    expect(screen.getByTestId('area-form').textContent).toContain('gerencias-2');
    screen.getByText('cerrar-area').click();
    expect(screen.queryByTestId('area-form')).toBeNull();

    screen.getByRole('button', { name: 'Editar Sistemas' }).click();
    expect(screen.getByTestId('area-form').textContent).toContain('Sistemas');
    screen.getByRole('button', { name: /Nueva área/ }).click();
    expect(screen.getByTestId('area-form').textContent).toContain('nueva');

    organizacionService.getAreas.mockClear();
    screen.getByText('exito-area').click();
    await waitFor(() => expect(organizacionService.getAreas).toHaveBeenCalled());
  });

  it('alta de gerencia: vacío, éxito, fallo y error de red', async () => {
    await renderPage();
    const input = screen.getByPlaceholderText(/Nombre de gerencia/);
    const anadir = screen.getByRole('button', { name: 'Añadir' });

    fireEvent.change(input, { target: { value: '   ' } });
    anadir.click();
    expect(organizacionService.createGerencia).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: 'Gerencia Municipal' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(organizacionService.createGerencia).not.toHaveBeenCalled();

    organizacionService.createGerencia.mockResolvedValueOnce({ success: true });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(organizacionService.createGerencia).toHaveBeenCalledWith({ nombre: 'Gerencia Municipal' }));
    await waitFor(() => expect(input.value).toBe(''));

    fireEvent.change(input, { target: { value: 'Otra' } });
    organizacionService.createGerencia.mockResolvedValueOnce({ success: false, message: 'Ya existe' });
    anadir.click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Ya existe'));

    window.alert.mockClear();
    organizacionService.createGerencia.mockResolvedValueOnce({ success: false, message: '' });
    anadir.click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));

    window.alert.mockClear();
    organizacionService.createGerencia.mockRejectedValueOnce({ response: { data: { message: 'Prohibido' } } });
    anadir.click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Prohibido'));

    window.alert.mockClear();
    organizacionService.createGerencia.mockRejectedValueOnce(new Error('offline'));
    anadir.click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));

    window.alert.mockClear();
    organizacionService.createGerencia.mockRejectedValueOnce({ response: { data: {} } });
    anadir.click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));
  });

  it('confirma, cancela y elimina un área', async () => {
    organizacionService.getAreas.mockResolvedValue({ success: true, data: [areaCompleta] });
    organizacionService.deleteArea.mockResolvedValue({ success: true });
    await renderPage();

    screen.getByRole('button', { name: 'Eliminar Sistemas' }).click();
    expect(screen.getByText('Confirmar eliminación')).toBeTruthy();
    expect(screen.getByText(/Se quitarán las marcas de cronograma/)).toBeTruthy();
    screen.getByRole('button', { name: 'Cancelar' }).click();
    expect(screen.queryByText('Confirmar eliminación')).toBeNull();

    screen.getByRole('button', { name: 'Eliminar Sistemas' }).click();
    confirmEliminar();
    await waitFor(() => expect(organizacionService.deleteArea).toHaveBeenCalledWith(3));
    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
  });

  it('elimina una gerencia y avisa si el servidor rechaza el borrado', async () => {
    organizacionService.getGerencias.mockResolvedValue({ success: true, data: gerencias });
    organizacionService.deleteGerencia.mockResolvedValueOnce({ success: true });
    await renderPage();

    screen.getByRole('button', { name: 'Eliminar gerencia GAF' }).click();
    expect(screen.getByText(/quedan sin agrupar/)).toBeTruthy();
    confirmEliminar();
    await waitFor(() => expect(organizacionService.deleteGerencia).toHaveBeenCalledWith(11));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    screen.getByRole('button', { name: 'Eliminar gerencia GTI' }).click();
    organizacionService.deleteGerencia.mockResolvedValueOnce({ success: false, message: 'Tiene áreas' });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Tiene áreas'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    screen.getByRole('button', { name: 'Eliminar gerencia GTI' }).click();
    organizacionService.deleteGerencia.mockResolvedValueOnce({ success: false, message: '' });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar.'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    screen.getByRole('button', { name: 'Eliminar gerencia GTI' }).click();
    organizacionService.deleteGerencia.mockRejectedValueOnce({ response: { data: { message: 'Bloqueada' } } });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Bloqueada'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    screen.getByRole('button', { name: 'Eliminar gerencia GTI' }).click();
    organizacionService.deleteGerencia.mockRejectedValueOnce(new Error('offline'));
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al eliminar.'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    screen.getByRole('button', { name: 'Eliminar gerencia GTI' }).click();
    organizacionService.deleteGerencia.mockRejectedValueOnce({ response: {} });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al eliminar.'));
  });

  it('muestra personal por rol, abre el formulario y recarga al guardar', async () => {
    const usuarios = [
      { id: 1, nombre_completo: 'Admin Uno', usuario: 'admin', rol: 'Administrador' },
      { id: 2, nombre_completo: 'Admin Dos', usuario: 'admin2', rol: 'Administrador' },
      { id: 3, nombre_completo: 'Tec Nico', usuario: 'tecnico', rol: 'Tecnico' },
      { id: 4, nombre_completo: 'Practi', usuario: 'pract', rol: 'Practicante' },
    ];
    organizacionService.getUsuarios.mockResolvedValue({ success: true, data: usuarios });
    organizacionService.getAreas.mockResolvedValue({ success: true, data: [areaCompleta] });
    await renderPage();

    screen.getByRole('button', { name: /Personal técnico/ }).click();
    expect(screen.getByRole('button', { name: /Nuevo personal/ })).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Tec Nico')).toBeTruthy());
    expect(screen.getByRole('button', { name: /Personal técnico/ }).className).toContain('text-blue-600');
    expect(screen.getAllByText('Administrador')[0].className).toContain('bg-purple-100');
    expect(screen.getByText('Tecnico').className).toContain('bg-blue-100');
    expect(screen.getByText('Practicante').className).toContain('bg-slate-100');

    screen.getByRole('button', { name: /Nuevo personal/ }).click();
    expect(screen.getByTestId('usuario-form').textContent).toContain('nuevo');
    expect(screen.getByTestId('usuario-form').textContent).toContain('areas-1');
    screen.getByText('cerrar-usuario').click();
    expect(screen.queryByTestId('usuario-form')).toBeNull();

    within(screen.getByText('Tec Nico').closest('tr')).getByRole('button', { name: 'Editar' }).click();
    expect(screen.getByTestId('usuario-form').textContent).toContain('Tec Nico');
    organizacionService.getUsuarios.mockClear();
    screen.getByText('exito-usuario').click();
    await waitFor(() => expect(organizacionService.getUsuarios).toHaveBeenCalled());
  });

  it('impide borrar la propia cuenta o al último administrador', async () => {
    organizacionService.getUsuarios.mockResolvedValue({
      success: true,
      data: [
        { id: 1, nombre_completo: 'Admin Uno', usuario: 'admin', rol: 'Administrador' },
        { id: 3, nombre_completo: 'Tec Nico', usuario: 'tecnico', rol: 'Tecnico' },
      ],
    });
    await renderPage();
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('Admin Uno')).toBeTruthy());

    within(screen.getByText('Admin Uno').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    expect(window.alert).toHaveBeenCalledWith('No puedes eliminar tu propia cuenta mientras estés autenticado.');
    expect(screen.queryByText('Confirmar eliminación')).toBeNull();
  });

  it('impide borrar al último administrador si la sesión es de otra cuenta', async () => {
    mockAuth.user = { id: 99, rol: 'Administrador' };
    organizacionService.getUsuarios.mockResolvedValue({
      success: true,
      data: [{ id: 5, nombre_completo: 'Único Admin', usuario: 'unico', rol: 'Administrador' }],
    });
    await renderPage();
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('Único Admin')).toBeTruthy());

    within(screen.getByText('Único Admin').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    expect(window.alert).toHaveBeenCalledWith('No se puede eliminar al último usuario con rol Administrador.');
    expect(screen.queryByText('Confirmar eliminación')).toBeNull();
  });

  it('elimina un técnico y a un administrador cuando hay más de uno', async () => {
    const usuarios = [
      { id: 1, nombre_completo: 'Admin Uno', usuario: 'admin', rol: 'Administrador' },
      { id: 2, nombre_completo: 'Admin Dos', usuario: 'admin2', rol: 'Administrador' },
      { id: 3, nombre_completo: 'Tec Nico', usuario: 'tecnico', rol: 'Tecnico' },
    ];
    organizacionService.getUsuarios.mockResolvedValue({ success: true, data: usuarios });
    organizacionService.deleteUsuario.mockResolvedValue({ success: true });
    await renderPage();
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('Tec Nico')).toBeTruthy());

    within(screen.getByText('Tec Nico').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    expect(screen.queryByText(/Se quitarán las marcas/)).toBeNull();
    expect(screen.queryByText(/quedan sin agrupar/)).toBeNull();
    confirmEliminar();
    await waitFor(() => expect(organizacionService.deleteUsuario).toHaveBeenCalledWith(3));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    within(screen.getByText('Admin Dos').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    organizacionService.deleteUsuario.mockResolvedValueOnce({ success: false, message: 'No se puede' });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se puede'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    within(screen.getByText('Admin Dos').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    organizacionService.deleteUsuario.mockResolvedValueOnce({ success: false });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo eliminar.'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    within(screen.getByText('Admin Dos').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    organizacionService.deleteUsuario.mockRejectedValueOnce({ response: { data: { message: 'Activo' } } });
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Activo'));

    await waitFor(() => expect(screen.queryByText('Confirmar eliminación')).toBeNull());
    window.alert.mockClear();
    within(screen.getByText('Admin Dos').closest('tr')).getByRole('button', { name: 'Eliminar' }).click();
    organizacionService.deleteUsuario.mockRejectedValueOnce(new Error('offline'));
    confirmEliminar();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al eliminar.'));
  });

  it('oculta acciones si quien mira no es administrador y tolera fallos del listado', async () => {
    mockAuth.user = { id: 9, rol: 'Tecnico' };
    organizacionService.getUsuarios.mockResolvedValueOnce({ success: false, data: [{ id: 1, nombre_completo: 'Fantasma', usuario: 'f', rol: 'Tecnico' }] });
    organizacionService.getAreas.mockResolvedValueOnce({ success: true, data: [areaCompleta] });
    await renderPage();
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('No hay personal de TI registrado.')).toBeTruthy());
    expect(screen.queryByText('Acciones')).toBeNull();
    expect(screen.queryByText('Fantasma')).toBeNull();

    screen.getByRole('button', { name: /Áreas y departamentos/ }).click();
    await waitFor(() => expect(screen.queryByText('Cargando...')).toBeNull());
    organizacionService.getUsuarios.mockResolvedValueOnce({
      success: true,
      data: [{ id: 3, nombre_completo: 'Tec Nico', usuario: 'tecnico', rol: 'Tecnico' }],
    });
    organizacionService.getAreas.mockResolvedValueOnce({ success: false, data: [areaCompleta] });
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('Tec Nico')).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'Eliminar' })).toBeNull();
    expect(screen.queryByText('Acciones')).toBeNull();

    screen.getByRole('button', { name: /Áreas y departamentos/ }).click();
    await waitFor(() => expect(screen.queryByText('Cargando...')).toBeNull());
    organizacionService.getUsuarios.mockRejectedValueOnce(new Error('red'));
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error al cargar configuración', expect.any(Error)));
    expect(screen.getByText('Tec Nico')).toBeTruthy();
  });

  it('muestra el vacío de personal también para un administrador', async () => {
    await renderPage();
    screen.getByRole('button', { name: /Personal técnico/ }).click();
    await waitFor(() => expect(screen.getByText('No hay personal de TI registrado.')).toBeTruthy());
    expect(screen.getByText('Acciones')).toBeTruthy();
  });
});
