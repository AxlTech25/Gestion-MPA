/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AreaForm } from './AreaForm';
import { organizacionService } from '../services/organizacionService';

vi.mock('../services/organizacionService', () => ({
  organizacionService: {
    createGerencia: vi.fn(),
    createArea: vi.fn(),
    updateArea: vi.fn(),
  },
}));

function renderForm(props = {}) {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const view = render(
    <AreaForm onClose={onClose} onSuccess={onSuccess} gerencias={[]} {...props} />,
  );
  return { onClose, onSuccess, ...view };
}

describe('AreaForm', () => {
  beforeEach(() => {
    organizacionService.createGerencia.mockReset();
    organizacionService.createArea.mockReset();
    organizacionService.updateArea.mockReset();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('registra un área nueva, cierra y cancela', async () => {
    const { onClose, onSuccess } = renderForm();
    expect(screen.getByRole('heading', { name: 'Registrar nueva área' })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Sin gerencia/ })).toBeTruthy();

    screen.getByRole('heading', { name: 'Registrar nueva área' }).parentElement.querySelector('button').click();
    screen.getByRole('button', { name: 'Cancelar' }).click();
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.change(screen.getByLabelText(/Nombre del área/), { target: { name: 'nombre', value: 'Archivo' } });
    fireEvent.change(screen.getByLabelText(/Jefe a cargo/), { target: { name: 'jefe_encargado', value: 'Luis' } });
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { name: 'descripcion', value: 'Documentos' } });

    let resolveCreate;
    organizacionService.createArea.mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    fireEvent.submit(document.getElementById('area-form'));
    expect(await screen.findByRole('button', { name: 'Guardando...' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Guardando...' }).disabled).toBe(true);

    resolveCreate({ success: true });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(onClose).toHaveBeenCalledTimes(3);
    expect(organizacionService.createArea).toHaveBeenCalledWith({
      nombre: 'Archivo',
      jefe_encargado: 'Luis',
      descripcion: 'Documentos',
      gerencia_id: null,
    });
    expect(await screen.findByRole('button', { name: 'Guardar área' })).toBeTruthy();
  });

  it('edita un área y envía la gerencia numérica', async () => {
    const { rerender, onClose, onSuccess } = renderForm({
      gerencias: [{ id: 2, nombre: 'Zona' }],
      area: { nombre: 'Borrador', gerencia_id: 0, jefe_encargado: '', descripcion: '' },
    });
    expect(screen.getByLabelText(/Nombre del área/).value).toBe('Borrador');
    expect(screen.getByLabelText('Gerencia').value).toBe('');

    rerender(
      <AreaForm
        onClose={onClose}
        onSuccess={onSuccess}
        gerencias={[{ id: 1, nombre: 'Alfa' }, { id: 2, nombre: 'Zona' }]}
        area={{ id: 9, nombre: 'Contabilidad', jefe_encargado: 'María', descripcion: 'Pagos', gerencia_id: 2 }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Editar área' })).toBeTruthy();
    expect(screen.getByLabelText(/Nombre del área/).value).toBe('Contabilidad');
    expect(screen.getByRole('option', { name: 'Alfa' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Gerencia'), { target: { name: 'gerencia_id', value: '1' } });
    organizacionService.updateArea.mockResolvedValue({ success: true });
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(organizacionService.updateArea).toHaveBeenCalledWith(9, {
      nombre: 'Contabilidad',
      jefe_encargado: 'María',
      descripcion: 'Pagos',
      gerencia_id: 1,
    }));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('avisa si guardar el área falla o el servidor no responde', async () => {
    renderForm({ area: { id: 3, nombre: 'Sistemas', jefe_encargado: 'Ada', descripcion: 'TI', gerencia_id: 4 } });

    organizacionService.updateArea.mockResolvedValueOnce({ success: false, message: 'Duplicada' });
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Duplicada'));

    organizacionService.updateArea.mockResolvedValueOnce({ success: false });
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(undefined));

    organizacionService.updateArea.mockRejectedValueOnce({ response: { data: { message: 'En uso' } } });
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('En uso'));

    organizacionService.updateArea.mockRejectedValueOnce(new Error('offline'));
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al guardar el área.'));

    organizacionService.updateArea.mockRejectedValueOnce({ response: {} });
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al guardar el área.'));

    organizacionService.updateArea.mockRejectedValueOnce({ response: { data: {} } });
    fireEvent.submit(document.getElementById('area-form'));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Error al guardar el área.'));
  });

  it('crea una gerencia rápida, la ordena y selecciona', async () => {
    renderForm({ gerencias: [{ id: 2, nombre: 'Zona' }, { id: 1, nombre: 'Alfa' }] });
    const input = screen.getByLabelText('Nueva gerencia');

    fireEvent.change(input, { target: { value: '   ' } });
    screen.getByRole('button', { name: 'Añadir' }).click();
    expect(organizacionService.createGerencia).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '  Beta  ' } });
    organizacionService.createGerencia.mockResolvedValue({
      success: true,
      data: { id: 5, nombre: 'Beta' },
    });
    screen.getByRole('button', { name: 'Añadir' }).click();

    await waitFor(() => expect(organizacionService.createGerencia).toHaveBeenCalledWith({ nombre: 'Beta' }));
    await waitFor(() => expect(screen.getByLabelText('Gerencia').value).toBe('5'));
    const names = screen.getAllByRole('option').map((option) => option.textContent);
    expect(names).toEqual(['Sin gerencia (Alcaldía, servidores…)', 'Alfa', 'Beta', 'Zona']);
    expect(input.value).toBe('');
  });

  it('avisa si la gerencia rápida no se crea', async () => {
    renderForm({ gerencias: [] });
    const input = screen.getByLabelText('Nueva gerencia');

    fireEvent.change(input, { target: { value: 'Nueva' } });
    organizacionService.createGerencia.mockResolvedValueOnce({ success: true });
    screen.getByRole('button', { name: 'Añadir' }).click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));

    organizacionService.createGerencia.mockResolvedValueOnce({ success: false, message: 'Ya existe' });
    screen.getByRole('button', { name: 'Añadir' }).click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Ya existe'));

    organizacionService.createGerencia.mockResolvedValueOnce({ success: false, message: '' });
    screen.getByRole('button', { name: 'Añadir' }).click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));

    organizacionService.createGerencia.mockRejectedValueOnce({ response: { data: { message: 'Prohibido' } } });
    screen.getByRole('button', { name: 'Añadir' }).click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Prohibido'));

    organizacionService.createGerencia.mockRejectedValueOnce(new Error('offline'));
    screen.getByRole('button', { name: 'Añadir' }).click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));

    organizacionService.createGerencia.mockRejectedValueOnce({ response: { data: {} } });
    screen.getByRole('button', { name: 'Añadir' }).click();
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('No se pudo crear la gerencia.'));
  });
});
