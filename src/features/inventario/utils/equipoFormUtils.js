const STANDARD_TIPOS = new Set(['CPU', 'Laptop', 'Monitor', 'Impresora', 'Otro']);

const empty = (v) => (v === null || v === undefined ? '' : String(v));

export const mapEquipoToForm = (eq) => {
  const isStandard = STANDARD_TIPOS.has(eq.tipo_equipo);
  return {
    codigo_patrimonial: empty(eq.codigo_patrimonial),
    codigo_identificativo: empty(eq.codigo_identificativo),
    tipo_equipo: isStandard ? eq.tipo_equipo : 'Otro',
    tipo_equipo_otro: isStandard ? '' : empty(eq.tipo_equipo),
    marca: empty(eq.marca),
    modelo: empty(eq.modelo),
    numero_serie: empty(eq.numero_serie),
    ram_gb: empty(eq.ram_gb),
    almacenamiento_gb: empty(eq.almacenamiento_gb),
    tipo_disco: eq.tipo_disco || 'SSD',
    procesador: empty(eq.procesador),
    sistema_operativo: eq.sistema_operativo || 'Windows 10',
    fecha_adquisicion: eq.fecha_adquisicion ? String(eq.fecha_adquisicion).slice(0, 10) : '',
    area_id: eq.area_id ? String(eq.area_id) : '',
    horas_uso: empty(eq.horas_uso ?? '0'),
    errores_smart: empty(eq.errores_smart ?? '0'),
    contador_paginas: empty(eq.contador_paginas),
    salud_bateria: empty(eq.salud_bateria),
    ultima_temp_cpu: empty(eq.ultima_temp_cpu),
    ultima_temp_disco: empty(eq.ultima_temp_disco),
  };
};

export const buildEquipoPayload = (formData) => ({
  ...formData,
  tipo_equipo: formData.tipo_equipo === 'Otro'
    ? (formData.tipo_equipo_otro.trim() || 'Otro')
    : formData.tipo_equipo,
});
