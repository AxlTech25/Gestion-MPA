/** @vitest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { dashboardService } from '../services/dashboardService';
import { mlService } from '../../ml/services/mlService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  downloadPdf: vi.fn(),
}));

vi.mock('../services/dashboardService', () => ({
  dashboardService: {
    getResumen: vi.fn(),
    consultarEquipos: vi.fn(),
  },
}));

vi.mock('../../ml/services/mlService', () => ({
  mlService: {
    getAlertas: vi.fn(),
  },
}));

vi.mock('./ConsultaEquiposPanel', () => ({
  ConsultaEquiposPanel: ({ porTipo, porEstadoOperativo, porEstadoConservacion }) => (
    <div data-testid="consulta-panel">
      {[
        porTipo?.length ?? 'na',
        porEstadoOperativo?.length ?? 'na',
        porEstadoConservacion?.length ?? 'na',
      ].join('-')}
    </div>
  ),
}));

const resumenVacio = {
  totales: {},
  por_estado_operativo: [],
  por_tipo_equipo: [],
  por_area: null,
  fallas_por_categoria: [],
  mantenimientos_recientes: [],
};

const resumenLleno = {
  totales: { equipos: 18, mantenimientos: 7, areas: 3, danados: null },
  por_estado_operativo: [
    { label: 'Operativo', total: '8' },
    { label: 'Dañado', total: 2 },
  ],
  por_estado_conservacion: [{ label: 'Bueno', total: 6 }],
  por_tipo_equipo: [{ label: 'Laptop', total: 8 }],
  por_area: [{ label: 'Archivo', total: 9 }],
  fallas_por_categoria: [
    { label: 'Fallo disco', severidad: 'Critica', total: 3 },
    { label: 'Polvo', severidad: 'Baja', total: 1 },
    { label: 'Red', severidad: 'Media', total: 2 },
    { label: 'Fuente', severidad: 'Alta', total: 1 },
    { label: 'Otro caso', severidad: 'Desconocida', total: 4 },
  ],
  mantenimientos_recientes: [
    {
      nro_orden: 'OT-90',
      codigo_patrimonial: 'PAT-90',
      tipo_mantenimiento: 'Correctivo',
      categoria_falla: 'Disco',
      fecha_intervencion: '2024-05-01T12:00:00',
    },
    {
      nro_orden: 'OT-80',
      codigo_patrimonial: 'PAT-80',
      tipo_mantenimiento: 'Preventivo',
      categoria_falla: null,
      fecha_intervencion: '2024-04-01T12:00:00',
    },
  ],
};

function alertasLargas() {
  return [
    {
      equipo_id: 1,
      codigo_patrimonial: 'SIN-DATO',
      tipo_equipo: '',
      area_nombre: '',
      nivel_riesgo: '',
      score_riesgo: 1,
    },
    ...Array.from({ length: 10 }, (_, index) => ({
      equipo_id: index + 2,
      codigo_patrimonial: `EQ-${index + 2}`,
      tipo_equipo: 'Laptop',
      area_nombre: 'Sistemas',
      nivel_riesgo: index === 0 ? 'Critico' : 'Bajo',
      score_riesgo: 20 + index,
    })),
  ];
}

function defer() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dashboardService.getResumen.mockResolvedValue({ success: true, data: resumenVacio });
    mlService.getAlertas.mockResolvedValue({ success: true, data: [] });
  });

  it('muestra la carga y después el resumen con listas, barras y alertas', async () => {
    const resumen = defer();
    const alertas = defer();
    dashboardService.getResumen.mockReturnValue(resumen.promise);
    mlService.getAlertas.mockReturnValue(alertas.promise);

    render(<DashboardPage />);
    expect(screen.getByText('Cargando métricas...')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();

    await act(async () => {
      resumen.resolve({ success: true, data: resumenLleno });
      alertas.resolve({ success: true, data: alertasLargas() });
    });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByText('Equipos registrados').nextElementSibling.textContent).toBe('18');
    expect(screen.getByText('Mantenimientos').nextElementSibling.textContent).toBe('7');
    expect(screen.getByText('Áreas activas').nextElementSibling.textContent).toBe('3');
    expect(screen.getByText('Equipos dañados').nextElementSibling.textContent).toBe('0');
    expect(screen.getByTestId('consulta-panel').textContent).toBe('1-2-1');

    const anchuras = [...document.querySelectorAll('.bg-emerald-500')].map((barra) => barra.style.width);
    expect(anchuras).toEqual(['100%', '25%']);
    expect(document.querySelector('.bg-blue-500').style.width).toBe('100%');
    expect(document.querySelector('.bg-violet-500').style.width).toBe('100%');
    expect(screen.getByText('Archivo')).toBeTruthy();
    expect(screen.getByText('Fallo disco')).toBeTruthy();

    expect(screen.getByText('Critica').className).toContain('text-red-600');
    expect(screen.getByText('Baja').className).toContain('text-emerald-600');
    expect(screen.getByText('Media').className).toContain('text-amber-600');
    expect(screen.getByText('Alta').className).toContain('text-orange-600');
    expect(screen.getByText('Desconocida').className).toContain('text-slate-600');

    expect(screen.getByText(/Top 11 equipos/)).toBeTruthy();
    const filaVacia = screen.getByText('SIN-DATO').closest('tr');
    expect(filaVacia.textContent).toContain('—');
    expect(filaVacia.textContent).toContain('N/D');
    expect(filaVacia.textContent).toContain('1.0');
    expect(screen.getByText('Crítico')).toBeTruthy();
    expect(screen.getByText('EQ-10')).toBeTruthy();
    expect(screen.queryByText('EQ-11')).toBeNull();

    const fecha = new Date('2024-05-01T12:00:00').toLocaleDateString('es-PE');
    expect(document.body.textContent).toContain(fecha);
    expect(screen.getByText('OT-80').closest('tr').textContent).toContain('—');
    expect(screen.getByText('PAT-90')).toBeTruthy();
  });

  it('muestra listas vacías y ceros cuando no hay datos', async () => {
    render(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByText('Equipos registrados').nextElementSibling.textContent).toBe('0');
    expect(screen.getAllByText('Sin datos registrados.')).toHaveLength(3);
    expect(screen.getByText('Aún no hay mantenimientos registrados.')).toBeTruthy();
    expect(screen.getByText('Sin predicciones disponibles.')).toBeTruthy();
    expect(screen.getByText('No hay intervenciones recientes.')).toBeTruthy();
    expect(screen.getByTestId('consulta-panel').textContent).toBe('0-0-na');
  });

  it('avisa si el resumen responde sin éxito', async () => {
    dashboardService.getResumen.mockResolvedValue({ success: false, message: 'sin permiso' });
    render(<DashboardPage />);
    expect(await screen.findByText('sin permiso')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();
  });

  it('usa el mensaje por defecto si el resumen falla sin texto', async () => {
    dashboardService.getResumen.mockResolvedValue({ success: false });
    render(<DashboardPage />);
    expect(await screen.findByText('No se pudo cargar el resumen.')).toBeTruthy();
  });

  it('muestra error de conexión si el resumen rechaza la petición', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    dashboardService.getResumen.mockRejectedValue(new Error('down'));
    render(<DashboardPage />);
    expect(await screen.findByText('Error al conectar con el servidor.')).toBeTruthy();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('sigue mostrando el dashboard si las alertas fallan con mensaje del servidor', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    dashboardService.getResumen.mockResolvedValue({ success: true, data: resumenVacio });
    mlService.getAlertas.mockRejectedValue({
      response: { data: { message: 'ml down' } },
      message: 'fail',
    });
    render(<DashboardPage />);
    expect(await screen.findByText('Sin predicciones disponibles.')).toBeTruthy();
    expect(warn).toHaveBeenCalledWith('ML alertas:', 'ml down');
    warn.mockRestore();
  });

  it('registra el mensaje de la excepción cuando las alertas no traen respuesta', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mlService.getAlertas.mockRejectedValue(new Error('timeout'));
    render(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(warn).toHaveBeenCalledWith('ML alertas:', 'timeout');
    warn.mockRestore();
  });

  it('ignora alertas que no vienen en un arreglo', async () => {
    mlService.getAlertas.mockResolvedValue({ success: true, data: { items: [] } });
    render(<DashboardPage />);
    expect(await screen.findByText('Sin predicciones disponibles.')).toBeTruthy();
  });

  it('ignora alertas cuando la respuesta no tiene éxito', async () => {
    mlService.getAlertas.mockResolvedValue({ success: false, data: [] });
    render(<DashboardPage />);
    expect(await screen.findByText('Sin predicciones disponibles.')).toBeTruthy();
  });

  it('ignora una respuesta nula de alertas', async () => {
    mlService.getAlertas.mockResolvedValue(null);
    render(<DashboardPage />);
    expect(await screen.findByText('Sin predicciones disponibles.')).toBeTruthy();
  });
});
