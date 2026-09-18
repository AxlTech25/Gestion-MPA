import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TURNOS, horaInput, rangoHorasValido, etiquetaTipo } from '../utils/cronogramaUtils';

const toRows = (celda, equiposArea) => {
  const horarios = celda?.horarios || [];
  if (horarios.length > 0) {
    return horarios.map((h) => ({
      equipo_id: Number(h.equipo_id),
      codigo_patrimonial: h.codigo_patrimonial,
      tipo_equipo: h.tipo_equipo,
      marca: h.marca,
      modelo: h.modelo,
      hora_inicio: horaInput(h.hora_inicio),
      hora_fin: horaInput(h.hora_fin),
    }));
  }
  return (equiposArea || []).map((eq) => ({
    equipo_id: Number(eq.id),
    codigo_patrimonial: eq.codigo_patrimonial,
    tipo_equipo: eq.tipo_equipo,
    marca: eq.marca,
    modelo: eq.modelo,
    hora_inicio: celda?.turno === 'Tarde' ? '14:00' : '10:00',
    hora_fin: celda?.turno === 'Tarde' ? '17:00' : '13:00',
  }));
};

export const CronogramaHorariosModal = ({
  celda,
  areaNombre,
  equiposArea,
  puedeEscribir,
  guardando,
  onClose,
  onSave,
  onLiberar,
}) => {
  const meta = TURNOS[celda?.turno] || TURNOS.Manana;
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setRows(toRows(celda, equiposArea));
    setError('');
  }, [celda, equiposArea]);

  const setHora = (index, campo, valor) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [campo]: valor } : row)));
  };

  const handleSave = () => {
    const invalid = rows.find((r) => !rangoHorasValido(r.hora_inicio, r.hora_fin));
    if (invalid) {
      setError('Cada equipo necesita hora de inicio anterior a la de fin.');
      return;
    }
    onSave(rows.map((r) => ({
      equipo_id: r.equipo_id,
      hora_inicio: r.hora_inicio,
      hora_fin: r.hora_fin,
    })));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-start gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Horario por equipo</h3>
            <p className="text-sm text-slate-500">
              {areaNombre} · {celda?.fecha} · {meta.codigo} {meta.label} ({meta.horario})
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">Esta área no tiene PC, laptop ni impresora vigentes. El turno queda marcado igual.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b">
                  <th className="py-2">Equipo</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Código</th>
                  <th className="py-2 w-28">Inicio</th>
                  <th className="py-2 w-28">Fin</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.equipo_id} className="border-b border-slate-100">
                    <td className="py-2 font-medium">Equipo {i + 1}</td>
                    <td className="py-2">{etiquetaTipo(row.tipo_equipo)}</td>
                    <td className="py-2 font-mono text-xs">{row.codigo_patrimonial}</td>
                    <td className="py-2">
                      <input
                        type="time"
                        value={row.hora_inicio}
                        disabled={!puedeEscribir}
                        onChange={(e) => setHora(i, 'hora_inicio', e.target.value)}
                        className="border rounded-lg px-2 py-1 w-full"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="time"
                        value={row.hora_fin}
                        disabled={!puedeEscribir}
                        onChange={(e) => setHora(i, 'hora_fin', e.target.value)}
                        className="border rounded-lg px-2 py-1 w-full"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t flex flex-wrap justify-between gap-3">
          {puedeEscribir ? (
            <button
              type="button"
              onClick={onLiberar}
              className="px-4 py-2 text-sm text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50"
            >
              Liberar turno
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600">
              Cerrar
            </button>
            {puedeEscribir && rows.length > 0 && (
              <button
                type="button"
                disabled={guardando}
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                {guardando ? 'Guardando...' : 'Guardar horas'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
