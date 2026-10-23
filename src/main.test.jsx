/** @vitest-environment jsdom */
import { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { createRootMock, renderMock } = vi.hoisted(() => {
  const renderMock = vi.fn();
  const createRootMock = vi.fn(() => ({ render: renderMock }));
  return { createRootMock, renderMock };
});

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

vi.mock('./index.css', () => ({ default: '' }));

vi.mock('./App.jsx', () => ({
  default: () => <div data-testid="app-root">SIGEMAD</div>,
}));

describe('main', () => {
  it('monta App con StrictMode en #root', async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await import('./main.jsx');

    const root = document.getElementById('root');
    expect(createRootMock).toHaveBeenCalledWith(root);
    expect(renderMock).toHaveBeenCalledOnce();

    const tree = renderMock.mock.calls[0][0];
    expect(tree.type).toBe(StrictMode);
    expect(typeof tree.props.children.type).toBe('function');
  });
});
