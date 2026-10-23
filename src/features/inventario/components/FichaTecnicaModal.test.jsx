/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FichaTecnicaModal } from './FichaTecnicaModal';

vi.mock('./FichaTecnicaPanel', () => ({
  FichaTecnicaPanel: ({ equipoId, onClose, showHeader }) => (
    <button type="button" onClick={onClose}>
      {`ficha-${equipoId}-${String(showHeader)}`}
    </button>
  ),
}));

describe('FichaTecnicaModal', () => {
  it('muestra el panel y avisa al cerrar', () => {
    const onClose = vi.fn();
    render(<FichaTecnicaModal equipoId={5} onClose={onClose} />);
    screen.getByText('ficha-5-true').click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
