/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const requestHandlers = [];
  const responseHandlers = [];
  const api = {
    get: vi.fn(),
    interceptors: {
      request: {
        use: (fn) => {
          requestHandlers.push(fn);
        },
      },
      response: {
        use: (ok, err) => {
          responseHandlers.push({ ok, err });
        },
      },
    },
  };
  return { api, requestHandlers, responseHandlers };
});

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mocks.api),
  },
}));

import api, { downloadFile, downloadPdf } from './api';

const requestOf = () => mocks.requestHandlers[0];
const errorOf = () => mocks.responseHandlers[0].err;
const successOf = () => mocks.responseHandlers[0].ok;

describe('api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    mocks.api.get.mockReset();
    window.history.pushState({}, '', '/v2/dashboard');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:reporte'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('agrega el token y quita el content-type en archivos', () => {
    const sinToken = requestOf()({ headers: { 'Content-Type': 'application/json' }, data: {} });
    expect(sinToken.headers.Authorization).toBeUndefined();

    localStorage.setItem('token', 'abc');
    const conToken = requestOf()({ headers: { 'Content-Type': 'application/json' }, data: { a: 1 } });
    expect(conToken.headers.Authorization).toBe('Bearer abc');

    const archivo = requestOf()({
      headers: { 'Content-Type': 'application/json' },
      data: new FormData(),
    });
    expect(archivo.headers['Content-Type']).toBeUndefined();
    expect(api).toBe(mocks.api);
  });

  it('deja pasar la respuesta y limpia la sesión en un 401', async () => {
    expect(successOf()({ data: 1 })).toEqual({ data: 1 });

    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', '{}');
    const listener = vi.fn();
    window.addEventListener('auth:logout', listener);

    await expect(errorOf()({
      config: { url: '/equipos' },
      response: { status: 401 },
    })).rejects.toMatchObject({ response: { status: 401 } });

    expect(localStorage.getItem('token')).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
  });

  it('no cierra sesión en el login ni si ya está en /login', async () => {
    localStorage.setItem('token', 'abc');
    const listener = vi.fn();
    window.addEventListener('auth:logout', listener);

    await expect(errorOf()({
      config: { url: '/auth/login' },
      response: { status: 401 },
    })).rejects.toBeTruthy();
    expect(localStorage.getItem('token')).toBe('abc');

    window.history.pushState({}, '', '/login');
    await expect(errorOf()({
      config: { url: '/equipos' },
      response: { status: 401 },
    })).rejects.toBeTruthy();
    expect(listener).not.toHaveBeenCalled();

    await expect(errorOf()({ config: { url: '/equipos' }, response: { status: 500 } })).rejects.toBeTruthy();
  });

  it('descarga un PDF válido y rechaza un cuerpo que no lo es', async () => {
    vi.useFakeTimers();
    mocks.api.get.mockResolvedValueOnce({
      data: new Blob(['%PDF-1.4 ok'], { type: 'application/pdf' }),
    });
    await downloadPdf('/reportes/1', 'uno.pdf');

    mocks.api.get.mockResolvedValueOnce({
      data: new Blob(['%PDF-1.4 ok'], { type: 'application/octet-stream' }),
    });
    await downloadPdf('/reportes/2');

    mocks.api.get.mockResolvedValueOnce({
      data: new Blob([JSON.stringify({ message: 'sin permiso' })], { type: 'application/json' }),
    });
    await expect(downloadPdf('/reportes/3')).rejects.toThrow('sin permiso');

    mocks.api.get.mockResolvedValueOnce({
      data: new Blob(['{}'], { type: 'application/json' }),
    });
    await expect(downloadPdf('/reportes/4')).rejects.toThrow('El servidor no devolvió un PDF válido.');

    mocks.api.get.mockResolvedValueOnce({
      data: new Blob(['no-json'], { type: 'text/plain' }),
    });
    await expect(downloadPdf('/reportes/5')).rejects.toThrow('El servidor no devolvió un PDF válido.');

    vi.advanceTimersByTime(60_000);
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('descarga un archivo con el tipo indicado', async () => {
    vi.useFakeTimers();
    mocks.api.get.mockResolvedValue({ data: new Blob(['xlsx']) });
    await downloadFile('/equipos/plantilla', 'plantilla.xlsx', 'application/vnd.ms-excel');
    expect(URL.createObjectURL).toHaveBeenCalled();
    vi.advanceTimersByTime(60_000);
  });
});
