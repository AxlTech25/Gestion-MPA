/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPdf } from '../../../lib/api';
import { mlService } from '../../ml/services/mlService';
import { fichaTecnicaService } from '../services/fichaTecnicaService';
import { FichaTecnicaPanel } from './FichaTecnicaPanel';

vi.mock('../../../lib/api', () => ({
  downloadPdf: vi.fn(),
}));

vi.mock('../../ml/services/mlService', () => ({
  mlService: {
    getRiesgoEquipo: vi.fn(),
  },
}));

vi.mock('../services/fichaTecnicaService', () => ({
  fichaTecnicaService: {
    getFicha: vi.fn(),
    getHistorial: vi.fn(),
    saveFicha: vi.fn(),
  },
}));

const fichaCpu = {
  tipo_equipo: 'CPU',
  marca: 'Dell',
  modelo: 'Optiplex',
  codigo_patrimonial: '740000001111',
  codigo_identificativo: '000121',
  numero_serie: 'SN-1',
  area_nombre: 'Sistemas',
  responsable_nombre: 'Ana',
  ubicacion_fisica: 'Piso 2',
  costo_estimado: 1500,
  fecha_adquisicion: '2024-01-15',
  fecha_registro: '2024-02-01T10:00:00',
  fecha_evaluacion: '2024-06-01T15:30:00',
  procesador: 'i7',
  sistema_operativo: 'Windows 10',
  licencia_so: 'LIC-1',
  mac_address: 'AA:BB:CC:DD:EE:FF',
  ip_asignada: '10.0.0.5',
  software_base: 'Office',
  ram_gb: 16,
  almacenamiento_gb: 512,
  tipo_disco: 'NVMe',
  estado_conservacion: 'Bueno',
  estado_operativo: 'Operativo',
  diagnostico: 'Sin fallas',
  conclusion_motivo: 'Continúa',
  imagen_1: 'frente.jpg',
  imagen_2: 'serie.jpg',
};

const riesgoCompleto = {
  nivel_riesgo: 'Alto',
  score_riesgo: 80,
  modelo_version: 'v3',
  factores: [
    { feature: 'horas', importancia: 0.5 },
    { nombre: 'smart', importancia: 0 },
    { importancia: null },
    { feature: '', nombre: '', importancia: 1.234 },
    { feature: 'temp', importancia: 0.1 },
    { feature: 'oculto', importancia: 0.01 },
  ],
};

function ponerArchivo(input, files) {
  Object.defineProperty(input, 'files', { configurable: true, value: files });
  fireEvent.change(input);
}

beforeAll(() => {
  if (typeof URL.createObjectURL !== 'function') {
    URL.createObjectURL = vi.fn(() => 'blob:mock-preview');
  }
  if (typeof URL.revokeObjectURL !== 'function') {
    URL.revokeObjectURL = vi.fn();
  }
});

function forzarCambio(element, value) {
  const propsKey = Object.keys(element).find((key) => key.startsWith('__reactProps$'));
  act(() => {
    element[propsKey].onChange({ target: { name: element.name, value } });
  });
}

async function cargarFicha(data = fichaCpu, props = {}) {
  cleanup();
  fichaTecnicaService.getFicha.mockResolvedValue({ success: true, data });
  if (props.riesgo) {
    mlService.getRiesgoEquipo.mockResolvedValue({ success: true, data: props.riesgo });
  } else if (props.riesgoError) {
    mlService.getRiesgoEquipo.mockRejectedValue(new Error('ml'));
  } else {
    mlService.getRiesgoEquipo.mockResolvedValue({ success: false });
  }
  render(
    <FichaTecnicaPanel
      equipoId={props.equipoId ?? 9}
      onClose={props.onClose}
      showHeader={props.showHeader}
    />,
  );
  await waitFor(() => expect(screen.getByText('Información del Equipo')).toBeTruthy());
  if (props.riesgo) {
    await waitFor(() => expect(screen.getByText('Evaluación predictiva')).toBeTruthy());
  }
}

function badge(text) {
  return screen.getByText(text, { selector: 'span' });
}

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  fichaTecnicaService.getFicha.mockResolvedValue({ success: true, data: fichaCpu });
  fichaTecnicaService.getHistorial.mockResolvedValue({ success: true, data: [] });
  fichaTecnicaService.saveFicha.mockResolvedValue({ success: true });
  mlService.getRiesgoEquipo.mockResolvedValue({ success: false });
  downloadPdf.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FichaTecnicaPanel', () => {
  it('mantiene la carga si no hay equipo', async () => {
    render(<FichaTecnicaPanel equipoId={0} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(fichaTecnicaService.getFicha).not.toHaveBeenCalled();
    expect(screen.getByText('Cargando ficha técnica...')).toBeTruthy();
  });

  it('muestra la carga hasta que llega la ficha', async () => {
    let resolveFicha;
    fichaTecnicaService.getFicha.mockReturnValue(new Promise((resolve) => {
      resolveFicha = resolve;
    }));
    render(<FichaTecnicaPanel equipoId={4} onClose={vi.fn()} />);
    expect(screen.getByText('Cargando ficha técnica...')).toBeTruthy();
    await act(async () => {
      resolveFicha({ success: true, data: fichaCpu });
    });
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Ficha Técnica' })).toBeTruthy());
  });

  it('muestra el error de carga, el mensaje por defecto y el fallo de red', async () => {
    fichaTecnicaService.getFicha.mockResolvedValue({ success: false, message: 'sin ficha' });
    render(<FichaTecnicaPanel equipoId={3} />);
    await waitFor(() => expect(screen.getByText('sin ficha')).toBeTruthy());

    fichaTecnicaService.getFicha.mockResolvedValue({ success: false, message: '' });
    render(<FichaTecnicaPanel equipoId={4} />);
    await waitFor(() => expect(screen.getByText('No se pudo cargar la ficha.')).toBeTruthy());

    fichaTecnicaService.getFicha.mockRejectedValue(new Error('red'));
    render(<FichaTecnicaPanel equipoId={5} />);
    await waitFor(() => expect(screen.getByText('Error al cargar la ficha técnica.')).toBeTruthy());
    expect(mlService.getRiesgoEquipo).not.toHaveBeenCalled();
  });

  it('pinta la ficha técnica, la evaluación predictiva y permite editar', async () => {
    const onClose = vi.fn();
    await cargarFicha(fichaCpu, { onClose, riesgo: riesgoCompleto });

    expect(screen.getByRole('heading', { name: 'Ficha Técnica' })).toBeTruthy();
    expect(screen.getAllByText('740000001111').length).toBeGreaterThan(0);
    expect(screen.getByText('Dell / Optiplex')).toBeTruthy();
    expect(screen.getByText('S/ 1500')).toBeTruthy();
    expect(screen.getByText('000121')).toBeTruthy();
    expect(screen.getByText('SN-1')).toBeTruthy();
    expect(screen.getByText('Sistemas')).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Piso 2')).toBeTruthy();
    expect(screen.getAllByText('CPU').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Fecha').value).toBe('2024-06-01');
    expect(screen.getByLabelText('N° de orden')).toBeTruthy();
    expect(screen.getByText(new Date(fichaCpu.fecha_adquisicion).toLocaleDateString('es-PE'))).toBeTruthy();
    expect(screen.getByText(new Date(fichaCpu.fecha_registro).toLocaleDateString('es-PE'))).toBeTruthy();
    expect(screen.getByText('Imagen actual: frente.jpg')).toBeTruthy();
    expect(screen.getByText('Imagen actual: serie.jpg')).toBeTruthy();
    expect(screen.getByText('Hardware')).toBeTruthy();
    expect(screen.getByText('Software')).toBeTruthy();
    expect(screen.getByText('Red')).toBeTruthy();
    expect(screen.getByLabelText('Procesador').value).toBe('i7');
    expect(badge('Bueno').className).toContain('bg-blue-100');
    expect(badge('Operativo').className).toContain('bg-emerald-100');
    expect(screen.getByText('80.0')).toBeTruthy();
    expect(screen.getByText('80 pts')).toBeTruthy();
    expect(screen.getByText('modelo v3')).toBeTruthy();
    expect(screen.getByText('horas')).toBeTruthy();
    expect(screen.getByText('0.50')).toBeTruthy();
    expect(screen.getByText('smart')).toBeTruthy();
    expect(screen.getByText('0.00')).toBeTruthy();
    expect(screen.getByText('Factor 3')).toBeTruthy();
    expect(screen.getByText('Factor 4')).toBeTruthy();
    expect(screen.getByText('1.23')).toBeTruthy();
    expect(screen.getByText('temp')).toBeTruthy();
    expect(screen.queryByText('oculto')).toBeNull();
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Descargar PDF/ })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(2);

    downloadPdf.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole('button', { name: 'PDF' }));
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledWith('/reportes/equipo/9'));
  });

  it('recorre el estado físico y la evaluación de la hoja', async () => {
    await cargarFicha();
    const fisico = screen.getByLabelText('Estado físico');

    [
      ['Nuevo', 'bg-emerald-100'],
      ['Bueno', 'bg-blue-100'],
      ['Regular', 'bg-amber-100'],
      ['Malo', 'bg-red-100'],
    ].forEach(([valor, clase]) => {
      fireEvent.change(fisico, { target: { value: valor } });
      expect(badge(valor).className).toContain(clase);
    });
    forzarCambio(fisico, '');
    expect(badge('—').className).toContain('bg-slate-100');
    forzarCambio(fisico, 'Desconocido');
    expect(badge('Desconocido').className).toContain('bg-slate-100');
    fireEvent.change(fisico, { target: { value: 'Bueno' } });

    fireEvent.change(screen.getByLabelText('N° de orden'), { target: { value: 'N° 51' } });
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-13' } });
    fireEvent.change(screen.getByLabelText('Funcionamiento'), { target: { value: 'Con fallas' } });
    fireEvent.change(screen.getByLabelText('Obsolescencia tecnológica'), { target: { value: 'No' } });
    fireEvent.change(screen.getByLabelText('Repuestos disponibles'), { target: { value: 'No' } });
    fireEvent.change(screen.getByLabelText('Resultado de la evaluación'), {
      target: { value: 'Se recomienda retirar del servicio' },
    });
    expect(screen.getByText('Resultado: Se recomienda retirar del servicio')).toBeTruthy();
    expect(badge('Operativo').className).toContain('bg-emerald-100');
  });

  it('usa valores por defecto en una laptop incompleta y en un PC', async () => {
    await cargarFicha({
      tipo_equipo: 'Laptop',
      diagnostico: '',
      observaciones_evaluacion: 'Obs previa',
    });
    expect(screen.getByText('Hardware')).toBeTruthy();
    expect(screen.getByLabelText('Diagnóstico').value).toBe('Obs previa');
    expect(document.querySelector('select[name="tipo_disco"]').value).toBe('SSD');
    expect(screen.getByLabelText('Sistema Operativo').value).toBe('');
    expect(badge('Bueno')).toBeTruthy();
    expect(badge('Operativo')).toBeTruthy();
    expect(screen.queryByText(/Última evaluación/)).toBeNull();
    expect(screen.queryByText(/Imagen actual/)).toBeNull();
    expect(screen.getByText('— / —')).toBeTruthy();
    expect(screen.queryByText('Evaluación predictiva')).toBeNull();

    await cargarFicha({
      tipo_equipo: 'All-in-one PC',
      diagnostico: 'dx',
      sistema_operativo: 'Linux',
      costo_estimado: 0,
    }, { equipoId: 11 });
    expect(screen.getByText('Hardware')).toBeTruthy();
    expect(screen.getByLabelText('Sistema Operativo').value).toBe('Linux');
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('omite hardware en impresora y cuando no hay tipo', async () => {
    await cargarFicha({ tipo_equipo: 'Impresora', marca: 'Epson', modelo: '' });
    expect(screen.queryByText(/no aplican para equipos tipo/i)).toBeNull();
    expect(screen.getAllByText('Impresora').length).toBeGreaterThan(0);
    expect(screen.getByText('Epson / —')).toBeTruthy();
    expect(screen.queryByText('Hardware')).toBeNull();
    expect(screen.getByLabelText('N° de orden')).toBeTruthy();
    expect(screen.getByLabelText('Funcionamiento')).toBeTruthy();

    await cargarFicha({ costo_estimado: 0, marca: '', modelo: '' }, { equipoId: 12 });
    expect(screen.queryByText(/no aplican para equipos tipo/i)).toBeNull();
    expect(screen.queryByText('Hardware')).toBeNull();
    expect(screen.queryByText('S/ 0')).toBeNull();
  });

  it('oculta la predicción si el modelo responde vacío, falla o no trae factores', async () => {
    await cargarFicha(fichaCpu, { riesgoError: true });
    expect(screen.queryByText('Evaluación predictiva')).toBeNull();

    await cargarFicha(fichaCpu, {
      equipoId: 13,
      riesgo: { nivel_riesgo: 'Bajo', score_riesgo: 12.4, factores: [] },
    });
    expect(screen.getByText('12.4')).toBeTruthy();
    expect(screen.queryByText('modelo v3')).toBeNull();
    expect(screen.queryByText('Factores principales')).toBeNull();

    await cargarFicha(fichaCpu, {
      equipoId: 14,
      riesgo: { nivel_riesgo: 'Medio', score_riesgo: 40, factores: 'no-lista' },
    });
    expect(screen.getByText('Evaluación predictiva')).toBeTruthy();
    expect(screen.queryByText('Factores principales')).toBeNull();
  });

  it('guarda con imágenes, avisa el éxito y lo oculta a los 3 segundos', async () => {
    const realSetTimeout = globalThis.setTimeout.bind(globalThis);
    const later = [];
    const spy = vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn, delay, ...args) => {
      if (delay === 3000) {
        later.push(fn);
        return 0;
      }
      return realSetTimeout(fn, delay, ...args);
    });

    try {
      await cargarFicha();
      fireEvent.change(screen.getByLabelText('Procesador'), { target: { value: 'Ryzen 7' } });
      fireEvent.change(screen.getByLabelText('Memoria RAM (GB)'), { target: { value: '32' } });
      fireEvent.change(screen.getByLabelText('Almacenamiento (GB)'), { target: { value: '1024' } });
      fireEvent.change(document.querySelector('select[name="tipo_disco"]'), { target: { value: 'HDD' } });
      fireEvent.change(screen.getByLabelText('Sistema Operativo'), { target: { value: 'Windows 11' } });
      fireEvent.change(screen.getByLabelText('Licencia SO'), { target: { value: 'OEM' } });
      fireEvent.change(screen.getByLabelText('Software Instalado'), { target: { value: 'Office\nAV' } });
      fireEvent.change(screen.getByLabelText('Dirección MAC'), { target: { value: '11:22:33:44:55:66' } });
      fireEvent.change(screen.getByLabelText('IP Asignada'), { target: { value: '10.1.1.8' } });
      fireEvent.change(screen.getByLabelText('Estado físico'), { target: { value: 'Malo' } });
      fireEvent.change(screen.getByLabelText('N° de orden'), { target: { value: '51' } });
      fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2026-10-13' } });
      fireEvent.change(screen.getByLabelText('Resultado de la evaluación'), { target: { value: 'Requiere reparación' } });
      fireEvent.change(screen.getByLabelText('Diagnóstico'), { target: { value: 'No enciende' } });
      fireEvent.change(screen.getByLabelText('Conclusión y/o Motivo'), { target: { value: 'Reparar' } });

      const img1 = screen.getByLabelText('Imagen del equipo 1');
      const img2 = screen.getByLabelText('Imagen del equipo 2');
      ponerArchivo(img1, []);
      ponerArchivo(img2, undefined);
      const file1 = new File(['a'], 'uno.png', { type: 'image/png' });
      const file2 = new File(['b'], 'dos.jpg', { type: 'image/jpeg' });
      ponerArchivo(img1, [file1]);
      ponerArchivo(img2, [file2]);

      let resolveSave;
      fichaTecnicaService.saveFicha.mockReturnValue(new Promise((resolve) => {
        resolveSave = resolve;
      }));
      fireEvent.click(screen.getByRole('button', { name: 'Guardar Evaluación' }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Guardando...' }).disabled).toBe(true);
      });

      await act(async () => {
        resolveSave({ success: true });
      });

      await waitFor(() => expect(later).toHaveLength(1));
      await waitFor(() => expect(fichaTecnicaService.getFicha).toHaveBeenCalledTimes(2));
      const aviso = screen.getByText('✓ Evaluación guardada correctamente');
      expect(aviso.className).toContain('text-emerald-600');

      const [id, formData, esFormData] = fichaTecnicaService.saveFicha.mock.calls[0];
      expect(id).toBe(9);
      expect(esFormData).toBe(true);
      expect(formData.get('procesador')).toBe('Ryzen 7');
      expect(formData.get('ram_gb')).toBe('32');
      expect(formData.get('almacenamiento_gb')).toBe('1024');
      expect(formData.get('tipo_disco')).toBe('HDD');
      expect(formData.get('sistema_operativo')).toBe('Windows 11');
      expect(formData.get('licencia_so')).toBe('OEM');
      expect(formData.get('software_base')).toBe('Office\nAV');
      expect(formData.get('mac_address')).toBe('11:22:33:44:55:66');
      expect(formData.get('ip_asignada')).toBe('10.1.1.8');
      expect(formData.get('estado_conservacion')).toBe('Malo');
      expect(formData.get('estado_operativo')).toBe('Operativo');
      expect(formData.get('numero_ficha')).toBe('51');
      expect(formData.get('fecha_evaluacion')).toBe('2026-10-13');
      expect(formData.get('resultado_evaluacion')).toBe('Requiere reparación');
      expect(formData.get('diagnostico')).toBe('No enciende');
      expect(formData.get('conclusion_motivo')).toBe('Reparar');
      expect(formData.getAll('imagen_1')).toEqual([file1]);
      expect(formData.getAll('imagen_2')).toEqual([file2]);

      act(() => later[0]());
      expect(aviso.className).toContain('text-transparent');
    } finally {
      spy.mockRestore();
    }
  });

  it('muestra el error al guardar y el de la petición', async () => {
    await cargarFicha();
    fichaTecnicaService.saveFicha.mockResolvedValueOnce({ success: false, message: 'duplicada' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evaluación' }));
    await waitFor(() => expect(screen.getByText('duplicada')).toBeTruthy());

    await cargarFicha(fichaCpu, { equipoId: 15 });
    fichaTecnicaService.saveFicha.mockResolvedValueOnce({ success: false, message: '' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evaluación' }));
    await waitFor(() => expect(screen.getByText('No se pudo guardar la ficha.')).toBeTruthy());

    await cargarFicha(fichaCpu, { equipoId: 16 });
    fichaTecnicaService.saveFicha.mockRejectedValueOnce({ response: { data: { message: 'muy grande' } } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evaluación' }));
    await waitFor(() => expect(screen.getByText('muy grande')).toBeTruthy());

    await cargarFicha(fichaCpu, { equipoId: 17 });
    fichaTecnicaService.saveFicha.mockRejectedValueOnce(new Error('red'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Evaluación' }));
    await waitFor(() => expect(screen.getByText('Error al guardar la ficha.')).toBeTruthy());
  });

  it('descarga el PDF desde el pie y avisa si falla', async () => {
    const onClose = vi.fn();
    await cargarFicha(fichaCpu, { onClose, showHeader: false });
    expect(screen.queryByRole('heading', { name: 'Ficha Técnica' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull();
    expect(document.querySelector('.bg-white.rounded-2xl')).toBeTruthy();

    downloadPdf.mockRejectedValueOnce(new Error('pdf roto'));
    fireEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('pdf roto'));

    downloadPdf.mockRejectedValueOnce({});
    fireEvent.click(screen.getByRole('button', { name: /Descargar PDF/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo generar el PDF.'));
    expect(downloadPdf).toHaveBeenCalledWith('/reportes/equipo/9');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('muestra el historial de cada guardado', async () => {
    fichaTecnicaService.getHistorial.mockResolvedValue({
      success: true,
      data: [{
        id: 4,
        accion: 'Actualización',
        fecha: '2026-11-18 11:40:00',
        usuario: 'Denky Navarro Navarro',
        cambios: [
          { campo: 'resultado_evaluacion', antes: '', despues: 'Puede continuar en servicio' },
        ],
      }],
    });
    await cargarFicha();
    expect(screen.getByRole('heading', { name: 'Historial de cambios' })).toBeTruthy();
    expect(screen.getByText(/Denky Navarro Navarro/)).toBeTruthy();
    expect(screen.getByText(/Resultado de la evaluación:/)).toBeTruthy();
    expect(screen.getByText(/vacío → Puede continuar en servicio/)).toBeTruthy();
  });

  it('oculta cerrar y cancelar cuando no recibe onClose', async () => {
    await cargarFicha(fichaCpu, { showHeader: true });
    expect(screen.queryByRole('button', { name: 'Cerrar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).toBeNull();
    expect(screen.getByRole('button', { name: 'PDF' })).toBeTruthy();
  });
});
