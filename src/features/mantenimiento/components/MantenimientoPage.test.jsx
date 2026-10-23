/** @vitest-environment jsdom */
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantenimientoPage } from './MantenimientoPage';
import { mantenimientoService } from '../services/mantenimientoService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  downloadPdf: vi.fn(),
}));

vi.mock('../services/mantenimientoService', () => ({
  mantenimientoService: {
    getAll: vi.fn(),
    buscarHistorialPorCodigo: vi.fn(),
    exportHistorialPdf: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    exportFichaPdf: vi.fn(),
  },
}));

vi.mock('./MantenimientoForm', () => ({
  MantenimientoForm: ({ onClose, onSuccess }) => (
    <div data-testid="mant-form">
      <button type="button" onClick={onClose}>Cerrar formulario</button>
      <button type="button" onClick={onSuccess}>Guardar formulario</button>
    </div>
  ),
}));

vi.mock('./MantenimientoDetalleModal', () => ({
  MantenimientoDetalleModal: ({ mantenimientoId, onClose }) => (
    <div data-testid="mant-detalle">
      <p>{`detalle-${mantenimientoId}`}</p>
      <button type="button" onClick={onClose}>Cerrar detalle</button>
    </div>
  ),
}));

const registros = [
  {
    id: 11,
    codigo_patrimonial: 'PAT-11',
    nro_orden: 'OT-11',
    tipo_mantenimiento: 'Correctivo',
    fecha_intervencion: '2024-01-15T08:30:00',
    categoria_falla: 'Disco',
    estado_post_mantenimiento: 'Operativo',
    actividades_realizadas: 'Cambio de disco',
    sintoma_usuario: 'No enciende',
  },
  {
    id: 12,
    codigo_patrimonial: '',
    nro_orden: 'OT-12',
    tipo_mantenimiento: 'Preventivo',
    fecha_intervencion: '2024-02-02T09:15:00',
    categoria_falla: null,
    estado_post_mantenimiento: '',
    actividades_realizadas: '',
    sintoma_usuario: 'Hace ruido',
  },
  {
    id: 13,
    codigo_patrimonial: null,
    nro_orden: 'OT-13',
    tipo_mantenimiento: 'Predictivo',
    fecha_intervencion: '2024-03-03T10:00:00',
    categoria_falla: '',
    estado_post_mantenimiento: null,
    actividades_realizadas: null,
    sintoma_usuario: null,
  },
];

const equipoCompleto = {
  codigo_patrimonial: 'PAT-11',
  tipo_equipo: 'Laptop',
  marca: 'Dell',
  modelo: 'Latitude',
  area_nombre: 'TI',
  fecha_ultimo_mantenimiento: '2024-01-10T12:00:00',
};

function defer() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function codigoInput() {
  return screen.getByLabelText(/Código patrimonial/i);
}

describe('MantenimientoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mantenimientoService.getAll.mockResolvedValue({ success: true, data: [] });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('muestra la carga y el historial vacío', async () => {
    const pendiente = defer();
    mantenimientoService.getAll.mockReturnValue(pendiente.promise);
    render(<MantenimientoPage />);
    expect(screen.getByText('Cargando línea de tiempo...')).toBeTruthy();
    expect(screen.getByText('Todas las intervenciones recientes')).toBeTruthy();

    await act(async () => {
      pendiente.resolve({ success: true, data: [] });
    });
    expect(await screen.findByText('No hay intervenciones registradas.')).toBeTruthy();
  });

  it('deja la lista vacía si el historial no tiene éxito', async () => {
    mantenimientoService.getAll.mockResolvedValue({ success: false, data: registros });
    render(<MantenimientoPage />);
    expect(await screen.findByText('No hay intervenciones registradas.')).toBeTruthy();
    expect(screen.queryByText('Eq. PAT-11')).toBeNull();
  });

  it('registra el fallo al cargar el historial', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mantenimientoService.getAll.mockRejectedValue(new Error('boom'));
    render(<MantenimientoPage />);
    expect(await screen.findByText('No hay intervenciones registradas.')).toBeTruthy();
    expect(error).toHaveBeenCalledWith('Fallo al cargar historial');
    error.mockRestore();
  });

  it('pinta la línea de tiempo con correctivo, preventivo y sin descripción', async () => {
    mantenimientoService.getAll.mockResolvedValue({ success: true, data: registros });
    render(<MantenimientoPage />);

    expect(await screen.findByText('Eq. PAT-11')).toBeTruthy();
    expect(screen.getByText('Orden OT-12')).toBeTruthy();
    expect(screen.getByText('Orden OT-13')).toBeTruthy();
    expect(screen.getByText('Correctivo').className).toContain('bg-rose-100');
    expect(screen.getByText('Preventivo').className).toContain('bg-blue-100');
    expect(screen.getByText('Predictivo').className).toContain('bg-blue-100');
    expect(screen.getByText('Disco')).toBeTruthy();
    expect(screen.getByText('→ Operativo')).toBeTruthy();
    expect(screen.getByText('Cambio de disco')).toBeTruthy();
    expect(screen.getByText('Hace ruido')).toBeTruthy();
    expect(screen.getByText('Sin descripción de actividades.')).toBeTruthy();
    expect(document.querySelector('.text-rose-500')).toBeTruthy();
    expect(document.querySelector('.text-emerald-600')).toBeTruthy();

    const fecha = new Date('2024-01-15T08:30:00').toLocaleString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    expect(document.body.textContent).toContain(fecha);

    fireEvent.click(screen.getAllByRole('button', { name: /Ver detalle/i })[0]);
    expect(screen.getByText('detalle-11')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar detalle' }));
    expect(screen.queryByTestId('mant-detalle')).toBeNull();
  });

  it('abre y cierra el formulario sin volver a consultar', async () => {
    render(<MantenimientoPage />);
    await screen.findByText('No hay intervenciones registradas.');
    fireEvent.click(screen.getByRole('button', { name: /Registrar Intervención/i }));
    expect(screen.getByTestId('mant-form')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar formulario' }));
    expect(screen.queryByTestId('mant-form')).toBeNull();
    expect(mantenimientoService.getAll).toHaveBeenCalledTimes(1);
  });

  it('al guardar fuera de una búsqueda solo recarga el listado', async () => {
    render(<MantenimientoPage />);
    await screen.findByText('No hay intervenciones registradas.');
    fireEvent.click(screen.getByRole('button', { name: /Registrar Intervención/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar formulario' }));
    await waitFor(() => expect(mantenimientoService.getAll).toHaveBeenCalledTimes(2));
    expect(mantenimientoService.buscarHistorialPorCodigo).not.toHaveBeenCalled();
  });

  it('exige un código, limpia el aviso al escribir y muestra Buscando', async () => {
    const pendiente = defer();
    mantenimientoService.buscarHistorialPorCodigo.mockReturnValue(pendiente.promise);
    render(<MantenimientoPage />);
    await screen.findByText('No hay intervenciones registradas.');

    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(screen.getByText('Ingrese el código patrimonial del equipo.')).toBeTruthy();
    expect(mantenimientoService.buscarHistorialPorCodigo).not.toHaveBeenCalled();

    fireEvent.change(codigoInput(), { target: { value: 'P' } });
    expect(screen.queryByText('Ingrese el código patrimonial del equipo.')).toBeNull();

    fireEvent.change(codigoInput(), { target: { value: '  PAT-11  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(await screen.findByText('Buscando...')).toBeTruthy();
    expect(mantenimientoService.buscarHistorialPorCodigo).toHaveBeenCalledWith('PAT-11');

    await act(async () => {
      pendiente.resolve({
        success: true,
        data: { equipo: equipoCompleto, historial: [registros[0]] },
      });
    });

    expect(await screen.findByText('Equipo encontrado')).toBeTruthy();
    expect(document.body.textContent).toContain('Laptop · Dell Latitude · TI');
    expect(document.body.textContent).toContain('1 intervención registrada');
    const ultima = new Date('2024-01-10T12:00:00').toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
    expect(document.body.textContent).toContain(`Última: ${ultima}`);
    expect(screen.getByText('Historial del equipo (por fecha)')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ver todo' })).toBeTruthy();
  });

  it('muestra un equipo sin área, sin fecha y sin intervenciones', async () => {
    mantenimientoService.getAll.mockResolvedValue({ success: true, data: registros });
    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({
      success: true,
      data: {
        equipo: {
          codigo_patrimonial: 'PAT-0',
          tipo_equipo: 'Monitor',
          marca: 'LG',
          modelo: '24',
        },
        historial: [],
      },
    });
    render(<MantenimientoPage />);
    await screen.findByText('Eq. PAT-11');
    fireEvent.change(codigoInput(), { target: { value: 'PAT-0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));

    expect(await screen.findByText('Este equipo no tiene intervenciones registradas.')).toBeTruthy();
    expect(document.body.textContent).toContain('Monitor · LG 24');
    expect(document.body.textContent).not.toContain(' · TI');
    expect(document.body.textContent).toContain('0 intervenciónes registradas');
    expect(document.body.textContent).not.toContain('Última:');
  });

  it('informa cuando la búsqueda no encuentra el equipo', async () => {
    render(<MantenimientoPage />);
    await screen.findByText('No hay intervenciones registradas.');
    fireEvent.change(codigoInput(), { target: { value: 'XXX' } });

    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({
      success: false,
      message: 'dado de baja',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(await screen.findByText('dado de baja')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Ver todo' })).toBeNull();

    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({ success: false });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(await screen.findByText('Equipo no encontrado.')).toBeTruthy();

    mantenimientoService.buscarHistorialPorCodigo.mockRejectedValue({
      response: { data: { message: 'no autorizado' } },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(await screen.findByText('no autorizado')).toBeTruthy();

    mantenimientoService.buscarHistorialPorCodigo.mockRejectedValue(new Error('x'));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(await screen.findByText('No se encontró equipo con ese código.')).toBeTruthy();
  });

  it('vuelve al listado general y, si el código quedó en blanco, guardar no repite la búsqueda', async () => {
    mantenimientoService.getAll.mockResolvedValue({ success: true, data: registros });
    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({
      success: true,
      data: { equipo: equipoCompleto, historial: [registros[0], registros[1]] },
    });
    render(<MantenimientoPage />);
    await screen.findByText('Eq. PAT-11');
    fireEvent.change(codigoInput(), { target: { value: 'PAT-11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    expect(await screen.findByText('Historial del equipo (por fecha)')).toBeTruthy();
    expect(document.body.textContent).toContain('2 intervenciónes registradas');

    fireEvent.click(screen.getByRole('button', { name: 'Ver todo' }));
    expect(codigoInput().value).toBe('');
    expect(screen.queryByText('Equipo encontrado')).toBeNull();
    expect(screen.getByText('Todas las intervenciones recientes')).toBeTruthy();
    expect(screen.getByText('Eq. PAT-11')).toBeTruthy();

    fireEvent.change(codigoInput(), { target: { value: 'PAT-11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    await screen.findByText('Historial del equipo (por fecha)');
    fireEvent.change(codigoInput(), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /Registrar Intervención/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar formulario' }));
    await waitFor(() => expect(mantenimientoService.getAll).toHaveBeenCalledTimes(2));
    expect(mantenimientoService.buscarHistorialPorCodigo).toHaveBeenCalledTimes(2);
  });

  it('al guardar durante una búsqueda vuelve a pedir ese historial', async () => {
    mantenimientoService.getAll.mockResolvedValue({ success: true, data: registros });
    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({
      success: true,
      data: { equipo: equipoCompleto, historial: [registros[0]] },
    });
    render(<MantenimientoPage />);
    await screen.findByText('Eq. PAT-11');
    fireEvent.change(codigoInput(), { target: { value: ' PAT-11 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    await screen.findByText('Historial del equipo (por fecha)');

    fireEvent.click(screen.getByRole('button', { name: /Registrar Intervención/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar formulario' }));
    await waitFor(() => {
      expect(mantenimientoService.getAll).toHaveBeenCalledTimes(2);
      expect(mantenimientoService.buscarHistorialPorCodigo).toHaveBeenNthCalledWith(2, 'PAT-11');
    });
  });

  it('exporta el PDF del historial y avisa si falla', async () => {
    const pendiente = defer();
    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({
      success: true,
      data: { equipo: equipoCompleto, historial: [registros[0]] },
    });
    mantenimientoService.exportHistorialPdf.mockReturnValue(pendiente.promise);
    render(<MantenimientoPage />);
    await screen.findByText('No hay intervenciones registradas.');
    fireEvent.change(codigoInput(), { target: { value: 'PAT-11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    await screen.findByRole('button', { name: /Exportar historial PDF/i });

    fireEvent.click(screen.getByRole('button', { name: /Exportar historial PDF/i }));
    expect(await screen.findByText('Generando PDF...')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Generando PDF/i }).disabled).toBe(true);

    await act(async () => {
      pendiente.resolve();
    });
    expect(await screen.findByRole('button', { name: /Exportar historial PDF/i })).toBeTruthy();
    expect(mantenimientoService.exportHistorialPdf).toHaveBeenCalledWith('PAT-11');

    mantenimientoService.exportHistorialPdf.mockRejectedValue(new Error('pdf'));
    fireEvent.click(screen.getByRole('button', { name: /Exportar historial PDF/i }));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('No se pudo generar el PDF del historial.');
    });
    expect(screen.getByRole('button', { name: /Exportar historial PDF/i })).toBeTruthy();
  });

  it('no exporta si el equipo encontrado no tiene código patrimonial', async () => {
    mantenimientoService.buscarHistorialPorCodigo.mockResolvedValue({
      success: true,
      data: {
        equipo: { tipo_equipo: 'Laptop', marca: 'Dell', modelo: 'X' },
        historial: [],
      },
    });
    render(<MantenimientoPage />);
    await screen.findByText('No hay intervenciones registradas.');
    fireEvent.change(codigoInput(), { target: { value: 'PAT-11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar Historial' }));
    const exportar = await screen.findByRole('button', { name: /Exportar historial PDF/i });
    fireEvent.click(exportar);
    expect(mantenimientoService.exportHistorialPdf).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });
});
