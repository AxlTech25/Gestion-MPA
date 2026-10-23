/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RiesgoBadge } from './RiesgoBadge';

describe('RiesgoBadge', () => {
  it('muestra N/D sin nivel', () => {
    render(<RiesgoBadge />);
    expect(screen.getByText('N/D')).toBeTruthy();
  });

  it('muestra la etiqueta compacta y un nivel desconocido', () => {
    const { rerender } = render(<RiesgoBadge nivel="Medio" compact />);
    expect(screen.getByText('Medio')).toBeTruthy();

    rerender(<RiesgoBadge nivel="Raro" compact />);
    expect(screen.getByText('Raro')).toBeTruthy();
  });

  it('muestra los puntos solo cuando hay score', () => {
    const { rerender } = render(<RiesgoBadge nivel="Critico" score={81.4} />);
    expect(screen.getByText('Crítico')).toBeTruthy();
    expect(screen.getByText('81 pts')).toBeTruthy();

    rerender(<RiesgoBadge nivel="Bajo" />);
    expect(screen.getByText('Bajo')).toBeTruthy();
    expect(screen.queryByText(/pts/)).toBeNull();

    rerender(<RiesgoBadge nivel="Alto" score={0} />);
    expect(screen.getByText('0 pts')).toBeTruthy();
  });
});
