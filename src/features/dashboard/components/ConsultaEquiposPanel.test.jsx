/** @vitest-environment jsdom */
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsultaEquiposPanel } from './ConsultaEquiposPanel';
import { dashboardService } from '../services/dashboardService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  downloadPdf: vi.fn(),
}));

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    consultarEquipos: vi.fn(),
  },
}));

const conteos = {
  porTipo: [
    { label: 'Laptop', total: 3 },
    { label: 'CPU', total: 1 },
    { label: 'Impresora', total: 2 },
    { label: 'Monitor', total: 0 },
    { label: 'Otro', total: 4 },
  ],
  porEstadoOperativo: [
    { label: 'Operativo', total: 5 },
    { label: 'Dañado', total: 1 },
    { label: 'En Reparacion', total: 1 },
    { label: 'Excedencia', total: 1 },
    { label: 'Baja', total: 1 },
  ],
  porEstadoConservacion: [
    { label: 'Nuevo', total: 1 },
    { label: 'Bueno', total: 2 },
    { label: 'Regular', total: 1 },
    { label: 'Malo', total: 1 },
  ],
};

const equipos = [
  {
    id: 1,
    codigo_patrimonial: 'A1',
    tipo_equipo: 'Laptop',
    marca: 'Dell',
    modelo: 'X',
    area_nombre: 'TI',
    estado_operativo: 'Operativo',
    estado_conservacion: 'Nuevo',
  },
  {
    id: 2,
    codigo_patrimonial: 'A2',
    tipo_equipo: 'CPU',
    marca: 'HP',
    modelo: '',
    area_nombre: '',
    estado_operativo: 'Dañado',
    estado_conservacion: 'Bueno',
  },
  {
    id: 3,
    codigo_patrimonial: 'A3',
    tipo_equipo: 'Monitor',
    marca: '',
    modelo: 'P24',
    area_nombre: null,
    estado_operativo: 'En Reparacion',
    estado_conservacion: 'Regular',
  },
  {
    id: 4,
    codigo_patrimonial: 'A4',
    tipo_equipo: 'Otro',
    marca: '',
    modelo: '',
    area_nombre: 'Lab',
    estado_operativo: 'Excedencia',
    estado_conservacion: 'Malo',
  },
  {
    id: 5,
    codigo_patrimonial: 'A5',
    tipo_equipo: 'Impresora',
    marca: null,
    modelo: null,
    area_nombre: undefined,
    estado_operativo: 'Baja',
    estado_conservacion: '',
  },
  {
    id: 6,
    codigo_patrimonial: 'A6',
    tipo_equipo: 'Scanner',
    marca: 'Z',
    modelo: '1',
    area_nombre: 'A',
    estado_operativo: 'Raro',
    estado_conservacion: 'Raro',
  },
];

function defer() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderPanel(props = conteos) {
  return render(
    <ConsultaEquiposPanel
      porTipo={props.porTipo}
      porEstadoOperativo={props.porEstadoOperativo}
      porEstadoConservacion={props.porEstadoConservacion}
    />,
  );
}

function abrir() {
  fireEvent.click(screen.getByRole('button', { name: /Consultar equipos/i }));
}

function quitarFiltro(label) {
  const barra = screen.getByText('Filtros activos:').parentElement;
  const chip = [...barra.querySelectorAll('span')].find(
    (el) => el.textContent.startsWith(label) && el.querySelector('button'),
  );
  fireEvent.click(chip.querySelector('button'));
}

describe('ConsultaEquiposPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('abre y cierra la consulta vacía, también sin conteos', () => {
    const { rerender } = renderPanel();
    expect(screen.queryByText('Tipo de equipo')).toBeNull();
    expect(dashboardService.consultarEquipos).not.toHaveBeenCalled();

    abrir();
    expect(screen.getByRole('button', { name: /Ocultar consulta/i })).toBeTruthy();
    expect(screen.getByText('Tipo de equipo')).toBeTruthy();
    expect(screen.getByText(/Seleccione una o más etiquetas/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Laptop3' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Monitor0' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'En reparación1' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Ocultar consulta/i }));
    expect(screen.queryByText('Tipo de equipo')).toBeNull();

    rerender(<ConsultaEquiposPanel />);
    abrir();
    expect(screen.getByRole('button', { name: 'Laptop0' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Operativo0' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nuevo0' })).toBeTruthy();
  });

  it('consulta, muestra la carga y lista equipos con insignias y textos faltantes', async () => {
    const pendiente = defer();
    dashboardService.consultarEquipos.mockReturnValue(pendiente.promise);
    renderPanel();
    abrir();

    fireEvent.click(screen.getByRole('button', { name: /Laptop/ }));
    expect(screen.queryByText('Consultando equipos...')).toBeNull();
    expect(await screen.findByText('Consultando equipos...')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Laptop/ }).className).toContain('bg-blue-600');
    expect(screen.getByRole('button', { name: /CPU/ }).className).toContain('bg-white');

    await act(async () => {
      pendiente.resolve({ success: true, data: { total: 6, equipos } });
    });

    expect(await screen.findByText('A1')).toBeTruthy();
    expect(document.body.textContent).toContain('6 equipos encontrados');
    expect(dashboardService.consultarEquipos).toHaveBeenCalledWith({
      tipo_equipo: 'Laptop',
      estado_operativo: null,
      estado_conservacion: null,
    });

    const fila = (codigo) => screen.getByText(codigo).closest('tr');
    const insignias = (codigo) => [...fila(codigo).querySelectorAll('span')];

    expect(fila('A1').textContent).toContain('Dell X');
    expect(fila('A1').textContent).toContain('TI');
    expect(insignias('A1')[0].className).toContain('bg-emerald-100');
    expect(insignias('A1')[1].className).toContain('bg-emerald-100');

    expect(fila('A2').textContent).toContain('HP');
    expect(fila('A2').textContent).toContain('—');
    expect(insignias('A2')[0].className).toContain('bg-orange-100');
    expect(insignias('A2')[1].className).toContain('bg-blue-100');

    expect(fila('A3').textContent).toContain('P24');
    expect(insignias('A3')[0].className).toContain('bg-amber-100');
    expect(insignias('A3')[1].className).toContain('bg-amber-100');

    expect(insignias('A4')[0].className).toContain('bg-slate-200');
    expect(insignias('A4')[1].className).toContain('bg-red-100');
    expect(fila('A4').textContent).toContain('—');

    expect(insignias('A5')[0].className).toContain('bg-red-100');
    expect(insignias('A5')[1].textContent).toBe('—');
    expect(insignias('A5')[1].className).toContain('bg-slate-100');

    expect(insignias('A6')[0].className).toContain('bg-slate-100');
    expect(insignias('A6')[1].className).toContain('bg-slate-100');
    expect(fila('A6').textContent).toContain('Z 1');

    fireEvent.click(screen.getByRole('button', { name: /Laptop/ }));
    expect(await screen.findByText(/Seleccione una o más etiquetas/)).toBeTruthy();
    expect(screen.queryByText('A1')).toBeNull();
  });

  it('combina filtros, quita uno y limpia todos', async () => {
    dashboardService.consultarEquipos.mockResolvedValue({
      success: true,
      data: { total: 1, equipos: [equipos[0]] },
    });
    renderPanel();
    abrir();

    fireEvent.click(screen.getByRole('button', { name: /Laptop/ }));
    fireEvent.click(screen.getByRole('button', { name: /Operativo/ }));
    fireEvent.click(screen.getByRole('button', { name: /Bueno/ }));
    fireEvent.click(screen.getByRole('button', { name: /En reparación/ }));
    fireEvent.click(screen.getByRole('button', { name: /Dañado/ }));
    fireEvent.click(screen.getByRole('button', { name: /Excedencia/ }));
    fireEvent.click(screen.getByRole('button', { name: /Baja/ }));
    fireEvent.click(screen.getByRole('button', { name: /Nuevo/ }));
    fireEvent.click(screen.getByRole('button', { name: /Regular/ }));
    fireEvent.click(screen.getByRole('button', { name: /Malo/ }));
    fireEvent.click(screen.getByRole('button', { name: /Bueno/ }));
    fireEvent.click(screen.getByRole('button', { name: /Operativo/ }));

    await waitFor(() => {
      const ultima = dashboardService.consultarEquipos.mock.calls.at(-1)[0];
      expect(ultima).toEqual({
        tipo_equipo: 'Laptop',
        estado_operativo: 'Operativo',
        estado_conservacion: 'Bueno',
      });
    });
    expect(document.body.textContent).toContain('1 equipo encontrado');
    expect(screen.getByRole('button', { name: /Operativo/ }).className).toContain('bg-emerald-600');
    expect(screen.getByRole('button', { name: /Bueno/ }).className).toContain('bg-blue-600');

    quitarFiltro('Operativo');
    await waitFor(() => {
      const ultima = dashboardService.consultarEquipos.mock.calls.at(-1)[0];
      expect(ultima.estado_operativo).toBeNull();
      expect(ultima.tipo_equipo).toBe('Laptop');
    });
    expect(screen.getByText('Filtros activos:').parentElement.textContent).toContain('Laptop');
    expect(screen.queryByText('Consultando equipos...')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar todo' }));
    expect(await screen.findByText(/Seleccione una o más etiquetas/)).toBeTruthy();
    expect(screen.queryByText('Filtros activos:')).toBeNull();
  });

  it('refina el tipo Otro, cancela el texto al deseleccionar y al quitar el chip', async () => {
    dashboardService.consultarEquipos.mockResolvedValue({
      success: true,
      data: { total: 1, equipos: [equipos[3]] },
    });
    renderPanel();
    abrir();

    fireEvent.click(screen.getByRole('button', { name: /Otro/ }));
    const campo = screen.getByPlaceholderText(/Plotter, detector de billetes/);
    expect(screen.getByText(/Escriba el tipo específico/)).toBeTruthy();
    fireEvent.change(campo, { target: { value: 'Plo' } });
    fireEvent.change(campo, { target: { value: '  Plotter  ' } });

    await waitFor(() => {
      expect(dashboardService.consultarEquipos).toHaveBeenCalledWith({
        tipo_equipo: 'Otro',
        estado_operativo: null,
        estado_conservacion: null,
        tipo_otro: 'Plotter',
      });
    }, { timeout: 2000 });
    expect(screen.getByText('Otro: Plotter')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Otro/ }));
    expect(screen.queryByPlaceholderText(/Plotter, detector de billetes/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Otro/ }));
    const deNuevo = screen.getByPlaceholderText(/Plotter, detector de billetes/);
    expect(deNuevo.value).toBe('');
    const llamadasPrevias = dashboardService.consultarEquipos.mock.calls.length;
    fireEvent.change(deNuevo, { target: { value: '   ' } });
    await waitFor(() => {
      expect(dashboardService.consultarEquipos.mock.calls.length).toBeGreaterThan(llamadasPrevias);
    }, { timeout: 2000 });
    const nuevas = dashboardService.consultarEquipos.mock.calls.slice(llamadasPrevias);
    expect(nuevas.every(([payload]) => !payload.tipo_otro)).toBe(true);

    fireEvent.change(deNuevo, { target: { value: 'Plotter' } });
    expect(await screen.findByText('Otro: Plotter')).toBeTruthy();
    quitarFiltro('Otro: Plotter');
    expect(await screen.findByText(/Seleccione una o más etiquetas/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Otro/ }));
    expect(screen.getByPlaceholderText(/Plotter, detector de billetes/).value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: /Laptop/ }));
    expect(screen.queryByPlaceholderText(/Plotter, detector de billetes/)).toBeNull();
    await waitFor(() => {
      const ultima = dashboardService.consultarEquipos.mock.calls.at(-1)[0];
      expect(ultima.tipo_equipo).toBe('Laptop');
      expect(ultima.tipo_otro).toBeUndefined();
    });
  });

  it('consulta Otro vacío sin tipo específico', async () => {
    dashboardService.consultarEquipos.mockResolvedValue({
      success: true,
      data: { total: 0, equipos: [] },
    });
    renderPanel();
    abrir();
    fireEvent.click(screen.getByRole('button', { name: /Otro/ }));

    await waitFor(() => {
      expect(dashboardService.consultarEquipos).toHaveBeenCalledWith({
        tipo_equipo: 'Otro',
        estado_operativo: null,
        estado_conservacion: null,
      });
    }, { timeout: 2000 });
    expect(await screen.findByText(/No hay equipos que coincidan/)).toBeTruthy();
    expect(document.body.textContent).toContain('0 equipos encontrados');
    expect(screen.getByText('Filtros activos:').parentElement.textContent).toContain('Otro');
    expect(screen.queryByText(/Otro:/)).toBeNull();
  });

  it('muestra el error devuelto, el mensaje por defecto y el del catch', async () => {
    dashboardService.consultarEquipos.mockResolvedValue({ success: false, message: 'sin datos' });
    renderPanel();
    abrir();
    fireEvent.click(screen.getByRole('button', { name: /CPU/ }));
    expect(await screen.findByText('sin datos')).toBeTruthy();

    dashboardService.consultarEquipos.mockResolvedValue({ success: false, message: '' });
    fireEvent.click(screen.getByRole('button', { name: /Monitor/ }));
    expect(await screen.findByText('No se pudo consultar.')).toBeTruthy();

    dashboardService.consultarEquipos.mockRejectedValue({
      response: { data: { message: 'timeout de red' } },
    });
    fireEvent.click(screen.getByRole('button', { name: /Impresora/ }));
    expect(await screen.findByText('timeout de red')).toBeTruthy();

    dashboardService.consultarEquipos.mockRejectedValue(new Error('x'));
    fireEvent.click(screen.getByRole('button', { name: /Laptop/ }));
    expect(await screen.findByText('Error al consultar equipos.')).toBeTruthy();
    expect(screen.queryByText('A1')).toBeNull();
  });

  it('no pinta resultados si la consulta exitosa no trae data', async () => {
    dashboardService.consultarEquipos.mockResolvedValue({ success: true });
    renderPanel();
    abrir();
    fireEvent.click(screen.getByRole('button', { name: /Laptop/ }));
    await waitFor(() => expect(dashboardService.consultarEquipos).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText('Consultando equipos...')).toBeNull());
    expect(screen.queryByText(/encontrado/)).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });
});
