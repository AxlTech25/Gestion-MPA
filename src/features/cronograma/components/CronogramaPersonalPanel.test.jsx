/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CronogramaPersonalPanel } from './CronogramaPersonalPanel';

function renderPanel(props = {}) {
  const onSave = props.onSave || vi.fn();
  const view = render(
    <CronogramaPersonalPanel
      personal={props.personal}
      puedeEscribir={props.puedeEscribir ?? true}
      guardando={props.guardando ?? false}
      onSave={onSave}
    />,
  );
  return { ...view, onSave };
}

describe('CronogramaPersonalPanel', () => {
  it('parte de PC 01 y PC 02 y guarda nombres repetidos', () => {
    const { onSave } = renderPanel({ personal: [] });

    expect(screen.getByText('Equipo de trabajo')).toBeTruthy();
    expect(screen.getByDisplayValue('PC 01')).toBeTruthy();
    expect(screen.getByDisplayValue('PC 02')).toBeTruthy();
    expect(screen.getByDisplayValue('10:00')).toBeTruthy();
    expect(screen.getByDisplayValue('13:00')).toBeTruthy();
    expect(screen.getByDisplayValue('14:00')).toBeTruthy();
    expect(screen.getByDisplayValue('17:00')).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue('PC 01'), { target: { value: '  Ana  ' } });
    fireEvent.change(screen.getByDisplayValue('PC 02'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar equipo' }));

    expect(onSave).toHaveBeenCalledWith([
      { nombre: 'Ana', hora_inicio: '10:00', hora_fin: '13:00' },
      { nombre: 'Ana', hora_inicio: '14:00', hora_fin: '17:00' },
    ]);
    expect(screen.queryByText(/Escriba el nombre/)).toBeNull();
  });

  it('exige nombre y un rango de horas válido antes de guardar', () => {
    const { onSave } = renderPanel();

    const nombres = screen.getAllByPlaceholderText('Nombre del técnico');
    fireEvent.change(nombres[0], { target: { value: ' ' } });
    fireEvent.change(screen.getByDisplayValue('10:00'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByDisplayValue('13:00'), { target: { value: '09:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar equipo' }));

    expect(screen.getByText('Escriba el nombre de cada persona (puede usar PC 01, PC 02, etc.).')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(nombres[0], { target: { value: 'PC 01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    expect(screen.getByText('Cada persona necesita hora de inicio anterior a la de fin.')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue('09:00'), { target: { value: '13:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    expect(onSave).toHaveBeenCalledWith([
      { nombre: 'PC 01', hora_inicio: '11:00', hora_fin: '13:00' },
      { nombre: 'PC 02', hora_inicio: '14:00', hora_fin: '17:00' },
    ]);
    expect(screen.queryByText(/hora de inicio/)).toBeNull();
  });

  it('agrega una persona, quita filas y conserva al menos una', () => {
    renderPanel({ personal: undefined });

    fireEvent.click(screen.getByRole('button', { name: 'Añadir persona' }));
    let nombres = screen.getAllByPlaceholderText('Nombre del técnico');
    expect(nombres).toHaveLength(3);
    expect(nombres[2].value).toBe('');
    expect(screen.getAllByDisplayValue('10:00')).toHaveLength(2);
    expect(screen.getAllByDisplayValue('13:00')).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar persona' })[2]);
    expect(screen.getAllByPlaceholderText('Nombre del técnico')).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Quitar persona' })[0]);
    nombres = screen.getAllByPlaceholderText('Nombre del técnico');
    expect(nombres).toHaveLength(1);
    expect(nombres[0].value).toBe('PC 02');

    fireEvent.click(screen.getByRole('button', { name: 'Quitar persona' }));
    expect(screen.getAllByPlaceholderText('Nombre del técnico')).toHaveLength(1);
    expect(screen.getByDisplayValue('PC 02')).toBeTruthy();
  });

  it('al recibir otro equipo descarta la edición y el error', () => {
    const onSave = vi.fn();
    const { rerender, container } = renderPanel({ personal: [], onSave });

    fireEvent.change(screen.getByDisplayValue('PC 01'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    expect(screen.getByText(/Escriba el nombre/)).toBeTruthy();

    rerender(
      <CronogramaPersonalPanel
        personal={[
          { nombre: 'Luis', hora_inicio: null, hora_fin: '12:00:00' },
          { hora_inicio: '14:00', hora_fin: '17:00' },
        ]}
        puedeEscribir
        guardando={false}
        onSave={onSave}
      />,
    );

    expect(screen.queryByText(/Escriba el nombre/)).toBeNull();
    expect(screen.getByDisplayValue('Luis')).toBeTruthy();
    expect(screen.getAllByPlaceholderText('Nombre del técnico')[1].value).toBe('');
    const horas = container.querySelectorAll('input[type="time"]');
    expect(horas[0].value).toBe('');
    expect(horas[1].value).toBe('12:00');
    expect(horas[2].value).toBe('14:00');
    expect(horas[3].value).toBe('17:00');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('en solo lectura no deja editar ni guardar', () => {
    renderPanel({
      personal: [{ nombre: 'Ana', hora_inicio: '08:00:00', hora_fin: '12:30:00' }],
      puedeEscribir: false,
    });

    expect(screen.getByDisplayValue('Ana').disabled).toBe(true);
    expect(screen.getByDisplayValue('08:00').disabled).toBe(true);
    expect(screen.getByDisplayValue('12:30').disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Quitar persona' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Añadir persona' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Guardar equipo' })).toBeNull();
  });

  it('deshabilita el guardado mientras la petición está en curso', () => {
    const { onSave } = renderPanel({ guardando: true });
    const boton = screen.getByRole('button', { name: 'Guardando...' });
    expect(boton.disabled).toBe(true);
    fireEvent.click(boton);
    expect(onSave).not.toHaveBeenCalled();
  });
});
