import { describe, it, expect } from 'vitest';
import { buildEquipoPayload, mapEquipoToForm } from './equipoFormUtils';

const base = {
  codigo_patrimonial: '740000001002',
  codigo_identificativo: '',
  tipo_equipo: 'Impresora',
  tipo_equipo_otro: '',
  marca: 'HP',
  modelo: '',
  color: '',
  numero_serie: '',
  ram_gb: '',
  almacenamiento_gb: '',
  tipo_disco: 'SSD',
  procesador: '',
  sistema_operativo: 'Windows 10',
  fecha_adquisicion: '',
  area_id: '1',
  horas_uso: '0',
  errores_smart: '0',
  contador_paginas: '1200',
  salud_bateria: '',
  ultima_temp_cpu: '',
  ultima_temp_disco: '',
};

describe('buildEquipoPayload', () => {
  it('guarda una impresora sin campos de PC ni fecha vacía', () => {
    const payload = buildEquipoPayload(base);
    expect(payload.tipo_equipo).toBe('Impresora');
    expect(payload.fecha_adquisicion).toBeNull();
    expect(payload.ram_gb).toBeNull();
    expect(payload.almacenamiento_gb).toBeNull();
    expect(payload.tipo_disco).toBeNull();
    expect(payload.sistema_operativo).toBeNull();
    expect(payload.contador_paginas).toBe('1200');
    expect(payload.codigo_patrimonial).toBe('740000001002');
  });

  it('conserva RAM y disco solo en laptop', () => {
    const payload = buildEquipoPayload({
      ...base,
      tipo_equipo: 'Laptop',
      ram_gb: '8',
      tipo_disco: 'SSD',
      sistema_operativo: 'Windows 11',
      fecha_adquisicion: '2024-01-15',
    });
    expect(payload.ram_gb).toBe('8');
    expect(payload.tipo_disco).toBe('SSD');
    expect(payload.sistema_operativo).toBe('Windows 11');
    expect(payload.fecha_adquisicion).toBe('2024-01-15');
    expect(payload.contador_paginas).toBeNull();
  });

  it('usa el texto libre en Otro y deja vacíos los campos de PC', () => {
    const otro = buildEquipoPayload({
      ...base,
      tipo_equipo: 'Otro',
      tipo_equipo_otro: '  Plotter  ',
      codigo_identificativo: null,
      modelo: undefined,
      marca: '   ',
      horas_uso: '',
      errores_smart: '',
      tipo_disco: '',
      sistema_operativo: '',
    });
    expect(otro.tipo_equipo).toBe('Plotter');
    expect(otro.marca).toBeNull();
    expect(otro.horas_uso).toBe(0);

    const sinTexto = buildEquipoPayload({
      ...base,
      tipo_equipo: 'Otro',
      tipo_equipo_otro: '   ',
    });
    expect(sinTexto.tipo_equipo).toBe('Otro');

    const cpu = buildEquipoPayload({
      ...base,
      tipo_equipo: 'CPU',
      ram_gb: '16',
      horas_uso: '',
      errores_smart: '',
      tipo_disco: '',
      sistema_operativo: '',
      salud_bateria: '80',
      ultima_temp_cpu: '40',
      ultima_temp_disco: '35',
    });
    expect(cpu.tipo_disco).toBe('SSD');
    expect(cpu.sistema_operativo).toBeNull();
    expect(cpu.horas_uso).toBe(0);
    expect(cpu.errores_smart).toBe(0);
    expect(cpu.salud_bateria).toBeNull();
    expect(cpu.ultima_temp_cpu).toBe('40');
  });
});

describe('mapEquipoToForm', () => {
  it('copia un tipo estándar y rellena vacíos', () => {
    const form = mapEquipoToForm({
      codigo_patrimonial: 'P-1',
      codigo_identificativo: null,
      tipo_equipo: 'Laptop',
      marca: undefined,
      modelo: 'X',
      color: null,
      numero_serie: 'SN',
      ram_gb: 8,
      almacenamiento_gb: null,
      tipo_disco: '',
      procesador: 'i5',
      sistema_operativo: '',
      fecha_adquisicion: '2024-05-01 00:00:00',
      area_id: 3,
      horas_uso: null,
      errores_smart: undefined,
      contador_paginas: 10,
      salud_bateria: 90,
      ultima_temp_cpu: null,
      ultima_temp_disco: 30,
    });
    expect(form.tipo_equipo).toBe('Laptop');
    expect(form.tipo_equipo_otro).toBe('');
    expect(form.codigo_identificativo).toBe('');
    expect(form.tipo_disco).toBe('SSD');
    expect(form.sistema_operativo).toBe('Windows 10');
    expect(form.fecha_adquisicion).toBe('2024-05-01');
    expect(form.area_id).toBe('3');
    expect(form.horas_uso).toBe('0');
    expect(form.errores_smart).toBe('0');
  });

  it('manda un tipo fuera de la lista al campo Otro', () => {
    const form = mapEquipoToForm({
      tipo_equipo: 'Plotter',
      fecha_adquisicion: null,
      area_id: 0,
      horas_uso: 12,
      errores_smart: 1,
    });
    expect(form.tipo_equipo).toBe('Otro');
    expect(form.tipo_equipo_otro).toBe('Plotter');
    expect(form.fecha_adquisicion).toBe('');
    expect(form.area_id).toBe('');
    expect(form.horas_uso).toBe('12');
  });
});