/** @vitest-environment jsdom */
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MantenimientoDetalleModal } from './MantenimientoDetalleModal';
import { mantenimientoService } from '../services/mantenimientoService';

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
  downloadPdf: vi.fn(),
}));

vi.mock('../services/mantenimientoService', () => ({
  mantenimientoService: {
    getById: vi.fn(),
    exportFichaPdf: vi.fn(),
  },
}));

const correctivo = {
  nro_orden: 'OT-5',
  codigo_patrimonial: 'PAT-5',
  tipo_mantenimiento: 'Correctivo',
  fecha_intervencion: '2024-03-10T15:30:00',
  categoria_falla: 'Disco',
  tipo_equipo: 'Laptop',
  marca: 'Dell',
  modelo: 'Latitude',
  area_nombre: 'Sistemas',
  numero_serie: 'SN1',
  tecnico: 'Ana',
  estado_post_mantenimiento: 'Operativo',
  tiempo_inactividad_min: 30,
  sintoma_usuario: 'No enciende',
  componente_principal: 'Disco duro',
  causa_raiz: 'Desgaste',
  diagnostico_texto: 'SMART en alerta',
  piezas_reemplazadas: 'SSD 512',
  costo_reparacion: 12.5,
  nivel_polvo: 'Alto',
  temperatura_cpu: 70.5,
  temperatura_disco: 40,
  horas_uso_acumuladas: 1000,
  salud_bateria_pct: 88.2,
  contador_paginas_lectura: 500,
  actividades_realizadas: 'Se cambió el disco',
};

const preventivo = {
  nro_orden: 'OT-6',
  codigo_patrimonial: 'PAT-6',
  tipo_mantenimiento: 'Preventivo',
  fecha_intervencion: null,
  categoria_falla: '',
  tipo_equipo: '',
  marca: null,
  modelo: null,
  area_nombre: null,
  numero_serie: '',
  tecnico: null,
  estado_post_mantenimiento: '',
  tiempo_inactividad_min: 0,
  temperatura_cpu: 0,
  temperatura_disco: null,
  salud_bateria_pct: 0,
  horas_uso_acumuladas: null,
  nivel_polvo: null,
  contador_paginas_lectura: null,
  actividades_realizadas: '',
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

function clickEquis() {
  const equis = screen.getAllByRole('button').find((boton) => boton.textContent.trim() === '');
  fireEvent.click(equis);
}

describe('MantenimientoDetalleModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('carga el correctivo completo y exporta el PDF', async () => {
    const carga = defer();
    const pdf = defer();
    mantenimientoService.getById.mockReturnValue(carga.promise);
    mantenimientoService.exportFichaPdf.mockReturnValue(pdf.promise);

    render(<MantenimientoDetalleModal mantenimientoId={5} onClose={onClose} />);
    expect(screen.getByText('Cargando detalle...')).toBeTruthy();
    expect(screen.queryByText(/OT-5/)).toBeNull();
    expect(screen.getByRole('button', { name: /PDF/ }).disabled).toBe(true);

    await act(async () => {
      carga.resolve({ success: true, data: correctivo });
    });

    expect(await screen.findByText('OT-5 · PAT-5')).toBeTruthy();
    expect(mantenimientoService.getById).toHaveBeenCalledWith(5);
    expect(screen.getByText('Correctivo').className).toContain('bg-rose-100');
    expect(screen.getByText('Disco')).toBeTruthy();
    expect(screen.getByText('Dell / Latitude')).toBeTruthy();
    expect(screen.getByText('Sistemas')).toBeTruthy();
    expect(screen.getByText('SN1')).toBeTruthy();
    expect(screen.getByText('Ana').parentElement.className).not.toContain('md:col-span-2');
    expect(screen.getByText('No enciende').parentElement.className).toContain('md:col-span-2');
    expect(screen.getByText('Diagnóstico y reparación')).toBeTruthy();
    expect(screen.getByText('Disco duro')).toBeTruthy();
    expect(screen.getByText('Desgaste')).toBeTruthy();
    expect(screen.getByText('SMART en alerta')).toBeTruthy();
    expect(screen.getByText('SSD 512')).toBeTruthy();
    expect(screen.getByText('S/ 12.50')).toBeTruthy();
    expect(screen.getByText('Alto')).toBeTruthy();
    expect(screen.getByText('70.5 °C')).toBeTruthy();
    expect(screen.getByText('40 °C')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
    expect(screen.getByText('88.2 %')).toBeTruthy();
    expect(screen.getByText('500')).toBeTruthy();
    expect(screen.getByText('Se cambió el disco')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();

    const fecha = new Date('2024-03-10T15:30:00').toLocaleString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    expect(document.body.textContent).toContain(fecha);

    fireEvent.click(screen.getByRole('button', { name: 'PDF' }));
    expect(await screen.findByRole('button', { name: /Generando/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Generando/ }).disabled).toBe(true);
    await act(async () => {
      pdf.resolve();
    });
    expect(await screen.findByRole('button', { name: 'PDF' })).toBeTruthy();
    expect(mantenimientoService.exportFichaPdf).toHaveBeenCalledWith(5);

    mantenimientoService.exportFichaPdf.mockRejectedValue(new Error('pdf'));
    fireEvent.click(screen.getByRole('button', { name: 'PDF' }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo generar el PDF.'));
    expect(screen.getByRole('button', { name: 'PDF' }).disabled).toBe(false);

    clickEquis();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('muestra un preventivo incompleto, con ceros y sin diagnóstico', async () => {
    mantenimientoService.getById.mockResolvedValue({ success: true, data: preventivo });
    render(<MantenimientoDetalleModal mantenimientoId={6} onClose={onClose} />);

    expect(await screen.findByText('OT-6 · PAT-6')).toBeTruthy();
    expect(screen.getByText('Preventivo').className).toContain('bg-blue-100');
    expect(screen.queryByText('Diagnóstico y reparación')).toBeNull();
    expect(screen.queryByText('Disco')).toBeNull();
    expect(screen.getByText('— / —')).toBeTruthy();
    expect(screen.queryByText('N° Serie')).toBeNull();
    expect(screen.queryByText('Técnico')).toBeNull();
    expect(screen.queryByText('Área')).toBeNull();
    expect(screen.queryByText('Tipo')).toBeNull();
    expect(screen.queryByText('Estado posterior')).toBeNull();
    expect(screen.queryByText('Nivel polvo')).toBeNull();
    expect(screen.queryByText('Temp. disco')).toBeNull();
    expect(screen.queryByText('Horas de uso')).toBeNull();
    expect(screen.queryByText('Contador páginas')).toBeNull();
    expect(screen.getByText('0 °C')).toBeTruthy();
    expect(screen.getByText('0 %')).toBeTruthy();
    expect(screen.getByText('Inactividad (min)').parentElement.textContent).toContain('0');
    expect(screen.getByText('Sin descripción registrada.')).toBeTruthy();
    expect(document.body.textContent).toContain('—');
  });

  it.each([
    [null, '—'],
    [undefined, '—'],
    ['', '—'],
    [0, 'S/ 0.00'],
  ])('formatea el costo %s', async (costo, esperado) => {
    mantenimientoService.getById.mockResolvedValue({
      success: true,
      data: {
        ...correctivo,
        nro_orden: 'OT-C',
        costo_reparacion: costo,
        actividades_realizadas: 'Hecho',
      },
    });
    render(<MantenimientoDetalleModal mantenimientoId={8} onClose={onClose} />);
    expect(await screen.findByText('Costo reparación')).toBeTruthy();
    expect(screen.getByText('Costo reparación').parentElement.textContent).toContain(esperado);
  });

  it('avisa si la intervención no tiene éxito', async () => {
    mantenimientoService.getById.mockResolvedValue({ success: false });
    render(<MantenimientoDetalleModal mantenimientoId={1} onClose={onClose} />);
    expect(await screen.findByText('No se pudo cargar la intervención.')).toBeTruthy();
    expect(screen.getByRole('button', { name: /PDF/ }).disabled).toBe(true);
  });

  it('avisa si la consulta de la intervención falla', async () => {
    mantenimientoService.getById.mockRejectedValue(new Error('red'));
    render(<MantenimientoDetalleModal mantenimientoId={2} onClose={onClose} />);
    expect(await screen.findByText('No se pudo cargar la intervención.')).toBeTruthy();
  });

  it('no consulta cuando el id es falso y vuelve a cargar si cambia', async () => {
    render(<MantenimientoDetalleModal mantenimientoId={0} onClose={onClose} />);
    expect(screen.getByText('Cargando detalle...')).toBeTruthy();
    expect(mantenimientoService.getById).not.toHaveBeenCalled();

    mantenimientoService.getById.mockImplementation(async (id) => ({
      success: true,
      data: {
        nro_orden: `OT-${id}`,
        codigo_patrimonial: `C-${id}`,
        tipo_mantenimiento: 'Evaluacion',
        actividades_realizadas: 'Revisión',
      },
    }));
    const vista = render(<MantenimientoDetalleModal mantenimientoId={1} onClose={onClose} />);
    expect(await screen.findByText('OT-1 · C-1')).toBeTruthy();
    expect(screen.getByText('Evaluacion').className).toContain('bg-blue-100');

    vista.rerender(<MantenimientoDetalleModal mantenimientoId={2} onClose={onClose} />);
    expect(await screen.findByText('OT-2 · C-2')).toBeTruthy();
    expect(mantenimientoService.getById).toHaveBeenCalledWith(2);
  });
});
