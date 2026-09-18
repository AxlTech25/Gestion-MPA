export const puedeEscribirCronograma = (rol) => rol === 'Administrador' || rol === 'Tecnico';

/** @deprecated Xn ya no es turno; se conserva por el modal de horarios no usado en el flujo de cantidad. */
export const TURNOS = {
  Manana: { codigo: 'X1', label: 'Mañana', horario: '10:00 a. m. — 01:00 p. m.' },
  Tarde: { codigo: 'X2', label: 'Tarde', horario: '02:00 p. m. — 05:00 p. m.' },
};

export const fechaPerteneceAlAnio = (fechaIso, anio) => {
  if (!fechaIso || !anio) return false;
  return Number(String(fechaIso).slice(0, 4)) === Number(anio);
};

export const diasDelMes = (anio, mes) => {
  const y = Number(anio);
  const m = Number(mes);
  if (!y || m < 1 || m > 12) return [];
  const last = new Date(y, m, 0).getDate();
  const dias = [];
  for (let d = 1; d <= last; d += 1) {
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    dias.push(`${y}-${mm}-${dd}`);
  }
  return dias;
};

export const esFinDeSemana = (fechaIso) => {
  const dt = new Date(`${fechaIso}T12:00:00`);
  const n = dt.getDay();
  return n === 0 || n === 6;
};

export const diasLaborablesDelMes = (anio, mes) => (
  diasDelMes(anio, mes).filter((fecha) => !esFinDeSemana(fecha))
);

export const fechaDeHoy = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
};

export const esHoy = (fechaIso) => fechaIso === fechaDeHoy();

/** Inicial del día en español: D L M X J V S */
export const letraDiaSemana = (fechaIso) => {
  const dt = new Date(`${fechaIso}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return '';
  return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][dt.getDay()];
};

export const fechaLarga = (fechaIso) => {
  if (!fechaIso) return '';
  const dt = new Date(`${fechaIso}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return String(fechaIso);
  const s = dt.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const codigoCantidad = (n) => {
  const v = Number(n) || 0;
  return v > 0 ? `X${v}` : '';
};

export const computadorasFila = (fila) => (
  Number(fila?.computadoras ?? (Number(fila?.pc || 0) + Number(fila?.laptop || 0)))
);

export const programadosFila = (fila) => {
  if (fila?.programados != null) return Number(fila.programados) || 0;
  return (fila?.celdas || []).reduce((sum, c) => sum + (Number(c.cantidad) || 0), 0);
};

export const mapaCeldas = (celdas) => {
  const map = {};
  (celdas || []).forEach((c) => {
    map[c.fecha] = c;
  });
  return map;
};

export const maxCantidadDia = (fila, fecha) => {
  const total = computadorasFila(fila);
  const actual = Number(mapaCeldas(fila?.celdas)[fecha]?.cantidad || 0);
  const usados = programadosFila(fila);
  const restantes = Math.max(0, total - usados);
  return Math.min(total, restantes + actual);
};

export const subtotalFila = (fila) => (
  Number(fila?.pc || 0) + Number(fila?.laptop || 0) + Number(fila?.impresora || 0)
);

export const totalesDeFilas = (filas) => {
  const acc = { pc: 0, laptop: 0, impresora: 0 };
  (filas || []).forEach((f) => {
    acc.pc += Number(f.pc || 0);
    acc.laptop += Number(f.laptop || 0);
    acc.impresora += Number(f.impresora || 0);
  });
  const subtotal = acc.pc + acc.laptop + acc.impresora;
  return { ...acc, subtotal, total: subtotal };
};

export const horaInput = (valor) => String(valor || '').slice(0, 5);

export const rangoHorasValido = (inicio, fin) => {
  const a = horaInput(inicio);
  const b = horaInput(fin);
  if (!/^\d{2}:\d{2}$/.test(a) || !/^\d{2}:\d{2}$/.test(b)) return false;
  return a < b;
};

export const claveGerencia = (fila) => {
  const id = fila?.gerencia_id;
  if (id == null || id === '' || Number(id) === 0) return 'ninguna';
  return String(Number(id));
};

export const hayGerenciasAsignadas = (filas) => (
  (filas || []).some((f) => f?.gerencia_id)
);

export const etiquetaGerencia = (fila) => {
  const nombre = String(fila?.gerencia || '').trim();
  return nombre ? nombre.toUpperCase() : 'OTRAS ÁREAS';
};

export const debeMostrarBandaGerencia = (filas, index) => {
  const list = filas || [];
  if (index < 0 || index >= list.length || !hayGerenciasAsignadas(list)) return false;
  if (index === 0) return true;
  return claveGerencia(list[index]) !== claveGerencia(list[index - 1]);
};


export const etiquetaTipo = (tipo) => (tipo === 'CPU' ? 'PC' : tipo || 'Equipo');
