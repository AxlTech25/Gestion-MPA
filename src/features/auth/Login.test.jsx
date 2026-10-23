/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { authService } from './services/authService';

const { navigate, login } = vi.hoisted(() => ({
  navigate: vi.fn(),
  login: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => navigate };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login }),
}));

vi.mock('./services/authService', () => ({
  authService: { login: vi.fn() },
}));

function renderLogin() {
  return render(<Login />);
}

async function submit(usuario = 'ana', password = 'secreta') {
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { name: 'usuario', value: usuario } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { name: 'password', value: password } });
  fireEvent.submit(screen.getByLabelText('Usuario').closest('form'));
}

describe('Login', () => {
  beforeEach(() => {
    navigate.mockReset();
    login.mockReset();
    authService.login.mockReset();
  });

  it('alterna la visibilidad de la contraseña y limpia el error al escribir', async () => {
    authService.login.mockResolvedValue({ success: false, message: 'Bloqueado' });
    renderLogin();

    const toggle = () => screen.getByLabelText('Contraseña').parentElement.querySelector('button');
    expect(screen.getByLabelText('Contraseña').type).toBe('password');
    fireEvent.click(toggle());
    expect(screen.getByLabelText('Contraseña').type).toBe('text');
    fireEvent.click(toggle());
    expect(screen.getByLabelText('Contraseña').type).toBe('password');

    await submit('ana', 'mala');
    expect(await screen.findByText('Bloqueado')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { name: 'usuario', value: 'otro' } });
    expect(screen.queryByText('Bloqueado')).toBeNull();
  });

  it('inicia sesión y navega al dashboard cuando hay token', async () => {
    let resolveLogin;
    authService.login.mockReturnValue(new Promise((resolve) => {
      resolveLogin = resolve;
    }));
    renderLogin();
    await submit('ana', 'secreta');

    expect(await screen.findByText('Verificando...')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Verificando...' }).disabled).toBe(true);

    resolveLogin({ success: true, token: 'tok-1', user: { id: 4, rol: 'Administrador' } });
    await waitFor(() => expect(login).toHaveBeenCalledWith({ id: 4, rol: 'Administrador' }, 'tok-1'));
    expect(navigate).toHaveBeenCalledWith('/v2/dashboard');
    expect(await screen.findByRole('button', { name: /iniciar sesión/i })).toBeTruthy();
  });

  it('muestra el mensaje del servidor o el texto por defecto si no hay token', async () => {
    authService.login.mockResolvedValueOnce({ success: true, user: { id: 1 } });
    renderLogin();
    await submit();
    expect(await screen.findByText('Credenciales incorrectas.')).toBeTruthy();
    expect(login).not.toHaveBeenCalled();

    authService.login.mockResolvedValueOnce({ success: false });
    await submit('ana', 'otra');
    expect(await screen.findByText('Credenciales incorrectas.')).toBeTruthy();
  });

  it('distingue caída de red, 401 y otros errores HTTP', async () => {
    authService.login.mockRejectedValueOnce(new Error('Network'));
    renderLogin();
    await submit();
    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeTruthy();

    authService.login.mockRejectedValueOnce({ response: { status: 401, data: { message: 'no' } } });
    await submit('ana', 'otra');
    expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeTruthy();

    authService.login.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Caído' } } });
    await submit('ana', 'otra');
    expect(await screen.findByText('Caído')).toBeTruthy();

    authService.login.mockRejectedValueOnce({ response: { status: 500 } });
    await submit('ana', 'otra');
    expect(await screen.findByText('Error al iniciar sesión.')).toBeTruthy();

    authService.login.mockRejectedValueOnce({ response: { status: 403, data: {} } });
    await submit('ana', 'otra');
    expect(await screen.findByText('Error al iniciar sesión.')).toBeTruthy();
  });
});
