/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CronogramaCantidadPopover } from './CronogramaCantidadPopover';

function renderPopover(overrides = {}) {
  const props = {
    areaNombre: 'Soporte',
    fecha: '2026-10-19',
    ocupada: { cantidad: 2 },
    max: 3,
    programados: 5,
    computadoras: 10,
    puedeEscribir: true,
    busy: false,
    onPick: vi.fn(),
    onLiberar: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<CronogramaCantidadPopover {...props} />);
  return props;
}

describe('CronogramaCantidadPopover', () => {
  it('ofrece cantidades, marca la actual y avisa al elegir, liberar o cerrar', () => {
    const props = renderPopover();
    expect(screen.getByRole('heading', { name: 'Soporte' })).toBeTruthy();
    expect(document.body.textContent).toContain('5/10');
    expect(document.body.textContent).toContain('En este día puede marcar hasta X3.');
    expect(document.querySelector('[style*="width: 50%"]')).toBeTruthy();
    expect(document.body.textContent).toMatch(/2026/);

    const actual = screen.getByRole('button', { name: 'X2' });
    const otra = screen.getByRole('button', { name: 'X1' });
    expect(actual.className).toContain('bg-[#00a8cc]');
    expect(otra.className).toContain('bg-white');
    expect(actual.disabled).toBe(false);

    otra.click();
    expect(props.onPick).toHaveBeenCalledWith(1);

    screen.getByRole('button', { name: 'Liberar este día' }).click();
    expect(props.onLiberar).toHaveBeenCalledOnce();

    screen.getAllByRole('button', { name: 'Cerrar' }).forEach((button) => button.click());
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it('tope el porcentaje, deshabilita acciones y no ofrece cantidades si el máximo es cero', () => {
    renderPopover({
      ocupada: { cantidad: 1 },
      max: 0,
      programados: 40,
      computadoras: 10,
      puedeEscribir: true,
      busy: true,
      fecha: '',
    });
    expect(document.body.textContent).toContain('Ya cubrió el parque de esta área.');
    expect(document.querySelector('[style*="width: 100%"]')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'X1' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Liberar este día' }).disabled).toBe(true);
  });

  it('oculta la edición cuando no se puede escribir o el día está libre', () => {
    renderPopover({
      puedeEscribir: false,
      max: 4,
      ocupada: { cantidad: 2 },
      computadoras: 0,
      programados: 3,
    });
    expect(screen.queryByRole('button', { name: 'X1' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Liberar este día' })).toBeNull();
    expect(document.querySelector('[style*="width: 0%"]')).toBeTruthy();
    expect(document.body.textContent).toContain('3/0');
    cleanup();

    renderPopover({
      puedeEscribir: true,
      max: 2,
      ocupada: null,
      programados: 0,
      computadoras: 4,
    });
    expect(screen.getByRole('button', { name: 'X1' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'X2' }).className).toContain('bg-white');
    expect(screen.queryByRole('button', { name: 'Liberar este día' })).toBeNull();
    expect(document.body.textContent).toContain('En este día puede marcar hasta X2.');
  });

  it('trata cantidad vacía como cero y deshabilita la elección mientras guarda', () => {
    renderPopover({
      ocupada: {},
      max: 1,
      busy: true,
      puedeEscribir: true,
      programados: 1,
      computadoras: 1,
    });
    const opcion = screen.getByRole('button', { name: 'X1' });
    expect(opcion.className).toContain('bg-white');
    expect(opcion.disabled).toBe(true);
    cleanup();

    renderPopover({
      ocupada: { cantidad: 0 },
      max: 1,
      puedeEscribir: false,
    });
    expect(screen.queryByRole('button', { name: 'Liberar este día' })).toBeNull();
  });
});
