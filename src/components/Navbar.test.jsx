/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import Navbar from './Navbar';

function renderNav(path, user) {
  localStorage.clear();
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'abc');
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Navbar />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Navbar', () => {
  it('muestra Configuración al administrador y cierra la sesión', () => {
    renderNav('/v2/cronograma/4', { rol: 'Administrador', nombre_completo: 'Ana Ruiz' });
    expect(screen.getByText('Configuración')).toBeTruthy();
    expect(screen.getByText('Ana Ruiz')).toBeTruthy();
    expect(screen.getByText('Cronograma').className).toContain('text-[#00a8cc]');
    expect(screen.getByText('Dashboard').className).toContain('text-slate-300');

    screen.getByRole('button', { name: /salir/i }).click();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('oculta Configuración y usa el nombre por defecto', () => {
    renderNav('/v2/dashboard', { rol: 'Tecnico' });
    expect(screen.queryByText('Configuración')).toBeNull();
    expect(screen.getByText('Administrador')).toBeTruthy();
    expect(screen.getByText('Dashboard').className).toContain('text-[#00a8cc]');
  });
});
