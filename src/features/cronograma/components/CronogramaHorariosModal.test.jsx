/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CronogramaHorariosModal } from './CronogramaHorariosModal';

const equipos = [
  { id: 1, codigo_patrimonial: 'PAT-1', tipo_equipo: 'CPU', marca: 'HP', modelo: 'Pro' },
  { id: 2, codigo_patrimonial: 'PAT-2', tipo_equipo: 'Laptop', marca: 'Dell', modelo: 'X' },
  { id: 3, codigo_patrimonial: 'PAT-3', tipo_equipo: '', marca: '', modelo: '' },
];

function renderModal(props = {}) {
  const onClose = props.onClose || vi.fn();
  const onSave = props.onSave || vi.fn();
  const onLiberar = props.onLiberar || vi.fn();
  const view = render(
    <CronogramaHorariosModal
      celda={props.celda === undefined ? { fecha: '2026-10-19', turno: 'Manana' } : props.celda}
      areaNombre={props.areaNombre || 'Sistemas'}
      equiposArea={props.equiposArea === undefined ? equipos : props.equiposArea}
      puedeEscribir={props.puedeEscribir ?? true}
      guardando={props.guardando ?? false}
      onClose={onClose}
      onSave={onSave}
      onLiberar={onLiberar}
    />,
  );
  return { ...view, onClose, onSave, onLiberar };
}

describe('CronogramaHorariosModal', () => {
  it('abre los equipos de la mañana, guarda las horas, libera y cierra', () => {
    const { onClose, onSave, onLiberar } = renderModal();

    expect(screen.getByRole('heading', { name: 'Horario por equipo' })).toBeTruthy();
    expect(screen.getByText(/Sistemas · 2026-10-19 · X1 Mañana/)).toBeTruthy();
    expect(screen.getByText(/10:00 a\. m\./)).toBeTruthy();
    expect(screen.getByText('PC')).toBeTruthy();
    expect(screen.getByText('Laptop')).toBeTruthy();
    expect(screen.getByText((_, node) => node?.tagName === 'TD' && node.textContent === 'Equipo')).toBeTruthy();
    expect(screen.getByText('PAT-1')).toBeTruthy();
    expect(screen.getByText('Equipo 1')).toBeTruthy();
    expect(screen.getByText('Equipo 3')).toBeTruthy();

    const inicios = screen.getAllByDisplayValue('10:00');
    const fines = screen.getAllByDisplayValue('13:00');
    fireEvent.change(inicios[0], { target: { value: '15:00' } });
    fireEvent.change(fines[0], { target: { value: '18:00' } });
    expect(inicios[0].value).toBe('15:00');
    expect(fines[1].value).toBe('13:00');

    fireEvent.click(screen.getByRole('button', { name: 'Guardar horas' }));
    expect(onSave).toHaveBeenCalledWith([
      { equipo_id: 1, hora_inicio: '15:00', hora_fin: '18:00' },
      { equipo_id: 2, hora_inicio: '10:00', hora_fin: '13:00' },
      { equipo_id: 3, hora_inicio: '10:00', hora_fin: '13:00' },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'Liberar turno' }));
    expect(onLiberar).toHaveBeenCalledOnce();

    const cerrar = screen.getAllByRole('button', { name: 'Cerrar' });
    expect(cerrar).toHaveLength(2);
    fireEvent.click(cerrar[0]);
    fireEvent.click(cerrar[1]);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('usa los horarios ya guardados y el turno de tarde', () => {
    const { onSave } = renderModal({
      celda: {
        fecha: '2026-10-20',
        turno: 'Tarde',
        horarios: [
          {
            equipo_id: '15',
            codigo_patrimonial: 'PAT-15',
            tipo_equipo: 'CPU',
            marca: 'HP',
            modelo: 'Elite',
            hora_inicio: '09:05:00',
            hora_fin: '11:45:00',
          },
        ],
      },
      equiposArea: [{ id: 1, codigo_patrimonial: 'OTRO', tipo_equipo: 'Laptop' }],
    });

    expect(screen.getByText(/Sistemas · 2026-10-20 · X2 Tarde/)).toBeTruthy();
    expect(screen.getByText(/02:00 p\. m\./)).toBeTruthy();
    expect(screen.getByText('PAT-15')).toBeTruthy();
    expect(screen.queryByText('OTRO')).toBeNull();
    expect(screen.getByDisplayValue('09:05')).toBeTruthy();
    expect(screen.getByDisplayValue('11:45')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar horas' }));
    expect(onSave).toHaveBeenCalledWith([
      { equipo_id: 15, hora_inicio: '09:05', hora_fin: '11:45' },
    ]);
  });

  it('un turno desconocido vuelve al horario de mañana', () => {
    renderModal({
      celda: { fecha: '2026-10-21', turno: 'Noche' },
      equiposArea: [{ id: 3, codigo_patrimonial: 'PAT-3', tipo_equipo: 'Laptop' }],
    });

    expect(screen.getByText(/X1 Mañana/)).toBeTruthy();
    expect(screen.queryByText(/Noche/)).toBeNull();
    expect(screen.getByDisplayValue('10:00')).toBeTruthy();
    expect(screen.getByDisplayValue('13:00')).toBeTruthy();
    expect(screen.getByText('Laptop')).toBeTruthy();
  });

  it('rechaza horas inválidas y limpia el error al cambiar de celda', () => {
    const onSave = vi.fn();
    const { rerender, onClose, onLiberar } = renderModal({
      onSave,
      equiposArea: [{ id: 1, codigo_patrimonial: 'PAT-1', tipo_equipo: 'CPU' }],
    });

    fireEvent.change(screen.getByDisplayValue('10:00'), { target: { value: '15:00' } });
    fireEvent.change(screen.getByDisplayValue('13:00'), { target: { value: '11:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar horas' }));
    expect(screen.getByText('Cada equipo necesita hora de inicio anterior a la de fin.')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();

    rerender(
      <CronogramaHorariosModal
        celda={{ fecha: '2026-11-02', turno: 'Tarde' }}
        areaNombre="Archivo"
        equiposArea={[{ id: 8, codigo_patrimonial: 'PAT-8', tipo_equipo: 'Laptop' }]}
        puedeEscribir
        guardando={false}
        onClose={onClose}
        onSave={onSave}
        onLiberar={onLiberar}
      />,
    );

    expect(screen.queryByText(/hora de inicio/)).toBeNull();
    expect(screen.getByText(/Archivo · 2026-11-02 · X2 Tarde/)).toBeTruthy();
    expect(screen.getByText('PAT-8')).toBeTruthy();
    expect(screen.getByDisplayValue('14:00')).toBeTruthy();
    expect(screen.getByDisplayValue('17:00')).toBeTruthy();
  });

  it('explica cuando el área no tiene equipos y permite liberar', () => {
    const { onSave, onLiberar } = renderModal({
      celda: { fecha: '2026-10-19', turno: 'Manana', horarios: [] },
      equiposArea: [],
    });

    expect(screen.getByText(/no tiene PC, laptop ni impresora vigentes/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Guardar horas' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Liberar turno' }));
    expect(onLiberar).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('con una celda nula también cae en la mañana y no ofrece guardado', () => {
    const { onClose } = renderModal({ celda: null, equiposArea: null });

    expect(screen.getByText(/Sistemas ·/)).toBeTruthy();
    expect(screen.getByText(/X1 Mañana/)).toBeTruthy();
    expect(screen.getByText(/no tiene PC, laptop ni impresora vigentes/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Guardar horas' })).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('en solo lectura no deja cambiar, guardar ni liberar', () => {
    const { onClose } = renderModal({ puedeEscribir: false });

    expect(screen.getAllByDisplayValue('10:00')[0].disabled).toBe(true);
    expect(screen.getAllByDisplayValue('13:00')[0].disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Guardar horas' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Liberar turno' })).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar' })[1]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('muestra Guardando mientras envía las horas', () => {
    const { onSave } = renderModal({ guardando: true });
    const boton = screen.getByRole('button', { name: 'Guardando...' });
    expect(boton.disabled).toBe(true);
    fireEvent.click(boton);
    expect(onSave).not.toHaveBeenCalled();
  });
});
