import { describe, it, expect } from 'vitest';
import {
  puedeEscribirCronograma,
  fechaPerteneceAlAnio,
  diasDelMes,
  esFinDeSemana,
  diasLaborablesDelMes,
  codigoCantidad,
  mapaCeldas,
  maxCantidadDia,
  totalesDeFilas,
  rangoHorasValido,
  fechaLarga,
  letraDiaSemana,
  debeMostrarBandaGerencia,
  etiquetaGerencia,
} from './cronogramaUtils';

describe('puedeEscribirCronograma', () => {
  it('permite Administrador y Tecnico', () => {
    expect(puedeEscribirCronograma('Administrador')).toBe(true);
    expect(puedeEscribirCronograma('Tecnico')).toBe(true);
    expect(puedeEscribirCronograma('Practicante')).toBe(false);
  });
});

describe('fechaPerteneceAlAnio', () => {
  it('acepta fechas del año del documento', () => {
    expect(fechaPerteneceAlAnio('2026-09-16', 2026)).toBe(true);
    expect(fechaPerteneceAlAnio('2025-12-31', 2026)).toBe(false);
  });
});

describe('diasDelMes', () => {
  it('febrero 2024 tiene 29 días', () => {
    const dias = diasDelMes(2024, 2);
    expect(dias).toHaveLength(29);
    expect(dias[0]).toBe('2024-02-01');
    expect(dias[28]).toBe('2024-02-29');
  });
});

describe('esFinDeSemana', () => {
  it('marca sábado y domingo', () => {
    expect(esFinDeSemana('2024-09-21')).toBe(true);
    expect(esFinDeSemana('2024-09-16')).toBe(false);
  });
});

describe('diasLaborablesDelMes', () => {
  it('omite sábados y domingos del año del documento', () => {
    const dias = diasLaborablesDelMes(2028, 1);
    expect(dias[0]).toBe('2028-01-03');
    expect(dias).not.toContain('2028-01-01');
    expect(dias).not.toContain('2028-01-02');
    expect(dias.every((d) => d.startsWith('2028-01-'))).toBe(true);
  });
});

describe('fechaLarga', () => {
  it('escribe el día en español', () => {
    expect(fechaLarga('2026-09-16')).toMatch(/setiembre|septiembre/i);
    expect(fechaLarga('2026-09-16')).toMatch(/16/);
    expect(fechaLarga('2026-09-16')).toMatch(/^[A-ZÁÉÍÓÚÑ]/);
  });
});

describe('letraDiaSemana', () => {
  it('usa iniciales D L M X J V S', () => {
    expect(letraDiaSemana('2026-09-16')).toBe('X');
    expect(letraDiaSemana('2026-09-20')).toBe('D');
  });
});

describe('codigoCantidad', () => {
  it('pinta Xn según cuántos PC/laptop se atienden ese día', () => {
    expect(codigoCantidad(1)).toBe('X1');
    expect(codigoCantidad(3)).toBe('X3');
    expect(codigoCantidad(10)).toBe('X10');
    expect(codigoCantidad(0)).toBe('');
  });
});

describe('mapaCeldas', () => {
  it('indexa una celda por fecha', () => {
    const map = mapaCeldas([
      { id: 1, fecha: '2026-09-16', cantidad: 2 },
    ]);
    expect(map['2026-09-16'].cantidad).toBe(2);
  });
});

describe('maxCantidadDia', () => {
  it('deja elegir 2 un día y 3 otro si el área tiene 10 equipos', () => {
    const fila = {
      pc: 6,
      laptop: 4,
      celdas: [{ fecha: '2026-09-10', cantidad: 2 }],
    };
    expect(maxCantidadDia(fila, '2026-09-11')).toBe(8);
    expect(maxCantidadDia(fila, '2026-09-10')).toBe(10);
  });
});

describe('totalesDeFilas', () => {
  it('suma PC, laptop, impresora y el total', () => {
    const t = totalesDeFilas([
      { pc: 1, laptop: 0, impresora: 0 },
      { pc: 6, laptop: 8, impresora: 9 },
    ]);
    expect(t.pc).toBe(7);
    expect(t.laptop).toBe(8);
    expect(t.impresora).toBe(9);
    expect(t.subtotal).toBe(24);
    expect(t.total).toBe(24);
  });
});

describe('rangoHorasValido', () => {
  it('exige inicio anterior al fin', () => {
    expect(rangoHorasValido('10:00', '10:30')).toBe(true);
    expect(rangoHorasValido('13:00', '10:00')).toBe(false);
  });
});

describe('debeMostrarBandaGerencia', () => {
  it('no inserta bandas si ninguna área tiene gerencia', () => {
    const filas = [{ area: 'RH', gerencia_id: null }, { area: 'Logística', gerencia_id: null }];
    expect(debeMostrarBandaGerencia(filas, 0)).toBe(false);
  });

  it('abre banda al cambiar de gerencia y usa OTRAS ÁREAS al final', () => {
    const filas = [
      { area: 'Tesorería', gerencia_id: 1, gerencia: 'Gerencia de Administración' },
      { area: 'Caja', gerencia_id: 1, gerencia: 'Gerencia de Administración' },
      { area: 'Servidor SIGA', gerencia_id: null },
    ];
    expect(debeMostrarBandaGerencia(filas, 0)).toBe(true);
    expect(debeMostrarBandaGerencia(filas, 1)).toBe(false);
    expect(debeMostrarBandaGerencia(filas, 2)).toBe(true);
    expect(etiquetaGerencia(filas[0])).toBe('GERENCIA DE ADMINISTRACIÓN');
    expect(etiquetaGerencia(filas[2])).toBe('OTRAS ÁREAS');
  });
});
