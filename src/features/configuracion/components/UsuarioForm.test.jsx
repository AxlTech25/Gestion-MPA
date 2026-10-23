/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsuarioForm } from './UsuarioForm';
import { organizacionService } from '../services/organizacionService';

vi.mock('../services/organizacionService', () => ({
  organizacionService: {
    createUsuario: vi.fn(),
    updateUsuario: vi.fn(),
  },
}));

const areas = [{ id: 7, nombre: 'Sistemas' }, { id: 8, nombre: 'Archivo' }];

function renderForm(props = {}) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const view = render(
    <UsuarioForm onClose={onClose} onSuccess={onSuccess} areas={areas} {...props} />,
  );
  return { onClose, onSuccess, ...view };
}

describe('UsuarioForm', () => {
  beforeEach(() => {
    organizacionService.createUsuario.mockReset();
    organizacionService.updateUsuario.mockReset();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('crea un usuario con el área por defecto y permite cancelar', async () => {
    const { onClose, onSuccess } = renderForm({ areas: [] });
    expect(screen.getByRole('heading', { name: 'Registrar Personal' })).toBeTruthy();
    expect(screen.getByText(/Contraseña \*/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear Usuario' })).toBeTruthy();

    screen.getByRole('heading', { name: 'Registrar Personal' }).parentElement.querySelector('button').click();
    screen.getByRole('button', { name: 'Cancelar' }).click();
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.change(screen.getByLabelText(/Nombre Completo/), { target: { name: 'nombre_completo', value: 'Ana Ruiz' } });
    fireEvent.change(screen.getByLabelText(/Usuario de Acceso/), { target: { name: 'usuario', value: 'aruiz' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { name: 'password', value: '1234' } });
    fireEvent.change(screen.getByLabelText(/Rol en el Sistema/), { target: { name: 'rol', value: 'Tecnico' } });

    let resolveCreate;
    organizacionService.createUsuario.mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    fireEvent.submit(document.getElementById('usuario-form'));
    expect(await screen.findByRole('button', { name: 'Guardando...' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardando...' }).disabled).toBe(true);

    resolveCreate({ success: true });
    await waitFor(() => expect(organizacionService.createUsuario).toHaveBeenCalledWith({
      nombre_completo: 'Ana Ruiz',
      usuario: 'aruiz',
      password: '1234',
      rol: 'Tecnico',
      area_id: '',
    }));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('usa la primera área si el usuario no trae área', async () => {
    renderForm({ user: { area_id: 0, rol: '', nombre_completo: '', usuario: '' } });
    fireEvent.change(screen.getByLabelText(/Nombre Completo/), { target: { name: 'nombre_completo', value: 'Leo' } });
    fireEvent.change(screen.getByLabelText(/Usuario de Acceso/), { target: { name: 'usuario', value: 'leo' } });
    organizacionService.createUsuario.mockResolvedValue({ success: true });
    fireEvent.submit(document.getElementById('usuario-form'));
    await waitFor(() => expect(organizacionService.createUsuario).toHaveBeenCalledWith(expect.objectContaining({
      rol: 'Practicante',
      area_id: 7,
      password: '',
    })));
    expect(organizacionService.updateUsuario).not.toHaveBeenCalled();
  });

  it('actualiza un usuario existente y conserva su área', async () => {
    const user = {
      id: 4,
      nombre_completo: 'María Gómez',
      usuario: 'mgomez',
      rol: 'Administrador',
      area_id: 8,
    };
    const { onClose, onSuccess } = renderForm({ user, areas: [] });
    expect(screen.getByRole('heading', { name: 'Editar Personal' })).toBeTruthy();
    expect(screen.getByText(/dejar vacío para no cambiar/)).toBeTruthy();
    expect(screen.getByLabelText(/Nombre Completo/).value).toBe('María Gómez');
    expect(screen.getByLabelText(/Rol en el Sistema/).value).toBe('Administrador');
    expect(screen.getByRole('button', { name: 'Actualizar Usuario' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Usuario de Acceso/), { target: { name: 'usuario', value: 'maria' } });
    organizacionService.updateUsuario.mockResolvedValue({ success: true });
    fireEvent.submit(document.getElementById('usuario-form'));
    await waitFor(() => expect(organizacionService.updateUsuario).toHaveBeenCalledWith(4, expect.objectContaining({
      nombre_completo: 'María Gómez',
      usuario: 'maria',
      password: '',
      rol: 'Administrador',
      area_id: 8,
    })));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('avisa si el alta o la edición no se guardan', async () => {
    const { rerender, onClose, onSuccess } = renderForm();
    fireEvent.change(screen.getByLabelText(/Nombre Completo/), { target: { name: 'nombre_completo', value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/Usuario de Acceso/), { target: { name: 'usuario', value: 'ana' } });

    organizacionService.createUsuario.mockResolvedValueOnce({ success: false, message: 'Usuario ocupado' });
    fireEvent.submit(document.getElementById('usuario-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Usuario ocupado'));
    expect(onSuccess).not.toHaveBeenCalled();

    organizacionService.createUsuario.mockResolvedValueOnce({ success: false });
    fireEvent.submit(document.getElementById('usuario-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(undefined));

    organizacionService.createUsuario.mockRejectedValueOnce(new Error('offline'));
    fireEvent.submit(document.getElementById('usuario-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al registrar/actualizar usuario.'));

    rerender(
      <UsuarioForm
        onClose={onClose}
        onSuccess={onSuccess}
        areas={areas}
        user={{ id: 2, nombre_completo: 'Ana', usuario: 'ana', rol: 'Tecnico', area_id: 7 }}
      />,
    );
    organizacionService.updateUsuario.mockRejectedValueOnce({ response: { data: { message: 'no' } } });
    fireEvent.submit(document.getElementById('usuario-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al registrar/actualizar usuario.'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
