/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <span>{auth.user?.nombre || 'sin-usuario'}</span>
      <span>{auth.token || 'sin-token'}</span>
      <span>{String(auth.isAuthenticated)}</span>
      <button type="button" onClick={() => auth.login({ nombre: 'Ana' }, 'abc')}>entrar</button>
      <button type="button" onClick={auth.logout}>salir</button>
    </div>
  );
}

function SoloHook() {
  useAuth();
  return <span>fuera</span>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restaura la sesión guardada y permite entrar y salir', () => {
    localStorage.setItem('user', JSON.stringify({ nombre: 'Luis' }));
    localStorage.setItem('token', 'guardado');
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByText('Luis')).toBeTruthy();
    expect(screen.getByText('guardado')).toBeTruthy();
    expect(screen.getByText('true')).toBeTruthy();

    act(() => {
      screen.getByText('entrar').click();
    });
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(localStorage.getItem('token')).toBe('abc');

    act(() => {
      screen.getByText('salir').click();
    });
    expect(screen.getByText('sin-usuario')).toBeTruthy();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('empieza vacío y responde al evento de cierre', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByText('false')).toBeTruthy();

    act(() => {
      screen.getByText('entrar').click();
    });
    act(() => {
      window.dispatchEvent(new Event('auth:logout'));
    });
    expect(screen.getByText('sin-token')).toBeTruthy();
  });

  it('expone el hook fuera del proveedor', () => {
    render(<SoloHook />);
    expect(screen.getByText('fuera')).toBeTruthy();
  });
});
