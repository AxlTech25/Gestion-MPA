import { describe, it, expect } from 'vitest';
import {
  isTipoComputadora,
  isTipoImpresora,
  countMapFromItems,
} from './equipoTipo';

describe('isTipoComputadora', () => {
  it('identifica Laptop, CPU y PC', () => {
    expect(isTipoComputadora('Laptop')).toBe(true);
    expect(isTipoComputadora('CPU')).toBe(true);
    expect(isTipoComputadora('PC')).toBe(true);
    expect(isTipoComputadora('laptop')).toBe(true);
  });

  it('rechaza tipos no computadora', () => {
    expect(isTipoComputadora('Impresora')).toBe(false);
    expect(isTipoComputadora('Monitor')).toBe(false);
    expect(isTipoComputadora('Plotter')).toBe(false);
    expect(isTipoComputadora(null)).toBe(false);
    expect(isTipoComputadora('')).toBe(false);
  });
});

describe('isTipoImpresora', () => {
  it('identifica impresoras sin importar mayúsculas', () => {
    expect(isTipoImpresora('Impresora')).toBe(true);
    expect(isTipoImpresora('impresora')).toBe(true);
  });

  it('rechaza otros tipos', () => {
    expect(isTipoImpresora('Laptop')).toBe(false);
    expect(isTipoImpresora(undefined)).toBe(false);
  });
});

describe('countMapFromItems', () => {
  it('convierte lista de totales a mapa', () => {
    const items = [
      { label: 'Laptop', total: '10' },
      { label: 'CPU', total: 5 },
    ];
    expect(countMapFromItems(items)).toEqual({ Laptop: 10, CPU: 5 });
  });

  it('devuelve objeto vacío si no hay datos', () => {
    expect(countMapFromItems(null)).toEqual({});
    expect(countMapFromItems([])).toEqual({});
  });
});
