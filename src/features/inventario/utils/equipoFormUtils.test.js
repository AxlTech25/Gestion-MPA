import { describe, it, expect } from 'vitest';
import { buildEquipoPayload } from './equipoFormUtils';

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
});