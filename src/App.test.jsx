/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  },
}));

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuth,
}));

vi.mock('./components/Navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock('./features/auth/Login', () => ({
  default: () => <div data-testid="login-page" />,
}));

vi.mock('./features/dashboard/components/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page" />,
}));

vi.mock('./features/inventario/components/InventarioPage', () => ({
  InventarioPage: () => <div data-testid="inventario-page" />,
}));

vi.mock('./features/mantenimiento/components/MantenimientoPage', () => ({
  MantenimientoPage: () => <div data-testid="mantenimiento-page" />,
}));

vi.mock('./features/configuracion/components/ConfiguracionPage', () => ({
  ConfiguracionPage: () => <div data-testid="configuracion-page" />,
}));

vi.mock('./features/inventario/components/FichaTecnicaPage', () => ({
  FichaTecnicaPage: () => <div data-testid="ficha-page" />,
}));

vi.mock('./features/cronograma/components/CronogramaListPage', () => ({
  CronogramaListPage: () => <div data-testid="cronograma-list-page" />,
}));

vi.mock('./features/cronograma/components/CronogramaMatrizPage', () => ({
  CronogramaMatrizPage: () => <div data-testid="cronograma-matriz-page" />,
}));

function renderAt(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

function contentClassName() {
  return screen.getByTestId('navbar').nextElementSibling.className;
}

describe('App', () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    mockAuth.logout.mockClear();
    window.history.replaceState({}, '', '/');
    vi.unstubAllEnvs();
  });

  it('muestra el login público y redirige si no hay sesión', async () => {
    const publico = renderAt('/login');
    expect(await screen.findByTestId('login-page')).toBeTruthy();
    expect(screen.queryByTestId('navbar')).toBeNull();
    publico.unmount();

    renderAt('/v2/dashboard');
    expect(await screen.findByTestId('login-page')).toBeTruthy();
    expect(screen.queryByTestId('navbar')).toBeNull();
  });

  it.each([
    ['/v2/dashboard', 'dashboard-page', false],
    ['/v2/inventario', 'inventario-page', false],
    ['/v2/ficha-tecnica', 'ficha-page', false],
    ['/v2/mantenimiento', 'mantenimiento-page', false],
    ['/v2/cronograma', 'cronograma-list-page', false],
    ['/v2/cronograma/15', 'cronograma-matriz-page', true],
    ['/v2/cronograma/abc', 'cronograma-matriz-page', false],
  ])('ruta %s muestra %s (ancho=%s)', async (path, testId, wide) => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, rol: 'Administrador' };
    renderAt(path);
    expect(await screen.findByTestId(testId)).toBeTruthy();
    expect(screen.getByTestId('navbar')).toBeTruthy();
    expect(contentClassName().includes('max-w-[1800px]')).toBe(wide);
    expect(contentClassName().includes('max-w-7xl')).toBe(!wide);
  });

  it('envía la raíz y las rutas desconocidas al dashboard', async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, rol: 'Administrador' };
    const raiz = renderAt('/');
    expect(await screen.findByTestId('dashboard-page')).toBeTruthy();
    raiz.unmount();

    renderAt('/v2/no-existe');
    expect(await screen.findByTestId('dashboard-page')).toBeTruthy();
  });

  it('deja entrar a configuración al administrador y saca al técnico', async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, rol: 'Administrador' };
    const admin = renderAt('/v2/configuracion');
    expect(await screen.findByTestId('configuracion-page')).toBeTruthy();
    admin.unmount();

    mockAuth.user = { id: 2, rol: 'Tecnico' };
    const tecnico = renderAt('/v2/configuracion');
    expect(await screen.findByTestId('dashboard-page')).toBeTruthy();
    expect(screen.queryByTestId('configuracion-page')).toBeNull();
    tecnico.unmount();

    mockAuth.user = null;
    renderAt('/v2/configuracion');
    expect(await screen.findByTestId('dashboard-page')).toBeTruthy();
  });

  it('cierra la sesión al evento auth:logout y deja de escuchar al desmontar', async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, rol: 'Administrador' };
    const view = renderAt('/v2/dashboard');
    expect(await screen.findByTestId('dashboard-page')).toBeTruthy();

    window.dispatchEvent(new Event('auth:logout'));
    expect(mockAuth.logout).toHaveBeenCalledTimes(1);

    view.unmount();
    window.dispatchEvent(new Event('auth:logout'));
    expect(mockAuth.logout).toHaveBeenCalledTimes(1);
  });

  it('respeta VITE_BASE_PATH como basename', async () => {
    vi.stubEnv('VITE_BASE_PATH', '/sigemad/');
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: 1, rol: 'Administrador' };
    renderAt('/sigemad/v2/cronograma/8');
    expect(await screen.findByTestId('cronograma-matriz-page')).toBeTruthy();
    expect(contentClassName()).toContain('max-w-[1800px]');
  });
});
