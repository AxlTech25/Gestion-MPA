import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { horaInput, rangoHorasValido } from '../utils/cronogramaUtils';

const filaVacia = (nro) => ({
  nro,
  nombre: nro === 1 ? 'PC 01' : nro === 2 ? 'PC 02' : '',
  hora_inicio: nro === 2 ? '14:00' : '10:00',
  hora_fin: nro === 2 ? '17:00' : '13:00',
});

const aFilas = (personal) => {
  if (personal && personal.length > 0) {
    return personal.map((p, i) => ({
      nro: i + 1,
      nombre: p.nombre || '',
      hora_inicio: horaInput(p.hora_inicio),
      hora_fin: horaInput(p.hora_fin),
    }));
  }
  return [filaVacia(1), filaVacia(2)];
};

export const CronogramaPersonalPanel = ({ personal, puedeEscribir, guardando, onSave }) => {
  const [filas, setFilas] = useState(() => aFilas(personal));
  const [error, setError] = useState('');

  useEffect(() => {
    setFilas(aFilas(personal));
    setError('');
  }, [personal]);

  const setCampo = (index, campo, valor) => {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, [campo]: valor } : f)));
  };

  const agregar = () => {
    setFilas((prev) => [...prev, filaVacia(prev.length + 1)]);
  };

  const quitar = (index) => {
    setFilas((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSave = () => {
    const vacia = filas.find((f) => !String(f.nombre).trim());
    if (vacia) {
      setError('Escriba el nombre de cada persona (puede usar PC 01, PC 02, etc.).');
      return;
    }
    const invalid = filas.find((f) => !rangoHorasValido(f.hora_inicio, f.hora_fin));
    if (invalid) {
      setError('Cada persona necesita hora de inicio anterior a la de fin.');
      return;
    }
    setError('');
    onSave(filas.map((f) => ({
      nombre: f.nombre.trim(),
      hora_inicio: f.hora_inicio,
      hora_fin: f.hora_fin,
    })));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a8cc]/10 text-[#00a8cc]">
          <Users size={18} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Hora programada</p>
          <p className="text-sm font-bold text-slate-800">Equipo de trabajo</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Personas que realizarán el preventivo. Se imprime en pequeño en el PDF.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[420px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="py-2 w-8">N°</th>
              <th className="py-2">Equipo (persona)</th>
              <th className="py-2 w-28">Inicio</th>
              <th className="py-2 w-28">Fin</th>
              {puedeEscribir && <th className="w-8" />}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={`p-${i}`} className="border-b border-slate-50">
                <td className="py-2 text-center text-slate-400 font-bold">{i + 1}</td>
                <td className="py-2 pr-2">
                  <input
                    value={fila.nombre}
                    disabled={!puedeEscribir}
                    onChange={(e) => setCampo(i, 'nombre', e.target.value)}
                    placeholder="Nombre del técnico"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/30"
                  />
                </td>
                <td className="py-2 pr-1">
                  <input
                    type="time"
                    value={fila.hora_inicio}
                    disabled={!puedeEscribir}
                    onChange={(e) => setCampo(i, 'hora_inicio', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/30"
                  />
                </td>
                <td className="py-2">
                  <input
                    type="time"
                    value={fila.hora_fin}
                    disabled={!puedeEscribir}
                    onChange={(e) => setCampo(i, 'hora_fin', e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/30"
                  />
                </td>
                {puedeEscribir && (
                  <td className="py-2 pl-1">
                    <button
                      type="button"
                      onClick={() => quitar(i)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50"
                      aria-label="Quitar persona"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {puedeEscribir && (
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={agregar}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#00a8cc]"
          >
            <Plus size={14} /> Añadir persona
          </button>
          <button
            type="button"
            disabled={guardando}
            onClick={handleSave}
            className="ml-auto px-4 py-2 bg-[#1a1d23] hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            {guardando ? 'Guardando...' : 'Guardar equipo'}
          </button>
        </div>
      )}
    </div>
  );
};
