export const COMPUTER_TYPES = ['CPU', 'Laptop', 'PC'];

export const isTipoComputadora = (tipo) => {
  if (!tipo) return false;
  return COMPUTER_TYPES.some((t) => tipo.toLowerCase().includes(t.toLowerCase()));
};

export const isTipoImpresora = (tipo) => {
  if (!tipo) return false;
  return tipo.toLowerCase().includes('impresora');
};

/** Agrupa totales del dashboard: [{ label, total }] → { label: total } */
export const countMapFromItems = (items) => Object.fromEntries(
  (items || []).map((i) => [i.label, Number(i.total)]),
);
