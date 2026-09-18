import React from 'react';
import { CalendarDays, MonitorSmartphone } from 'lucide-react';
import { codigoCantidad, fechaLarga } from '../utils/cronogramaUtils';

export const CronogramaCantidadPopover = ({
  areaNombre,
  fecha,
  ocupada,
  max,
  programados,
  computadoras,
  puedeEscribir,
  busy,
  onPick,
  onLiberar,
  onClose,
}) => {
  const actual = Number(ocupada?.cantidad || 0);
  const opciones = [];
  for (let n = 1; n <= max; n += 1) {
    opciones.push(n);
  }
  const pct = computadoras > 0 ? Math.min(100, Math.round((programados / computadoras) * 100)) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[min(460px,92vw)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1a1d23] text-white px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#00a8cc]">Cantidad del día</p>
          <h3 className="text-lg font-black mt-1 leading-tight">{areaNombre}</h3>
          <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
            <CalendarDays size={14} className="text-[#00a8cc]" /> {fechaLarga(fecha)}
          </p>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Elija cuántos PC o laptop atenderá este día. Un día puede ser X2 y el siguiente X3;
            no hace falta una columna por equipo.
          </p>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <MonitorSmartphone size={15} className="text-[#00a8cc]" /> Cubierto
              </span>
              <span className="font-black text-slate-800">{programados}/{computadoras}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#00a8cc] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {max > 0
                ? `En este día puede marcar hasta ${codigoCantidad(max)}.`
                : 'Ya cubrió el parque de esta área. Reduzca otro día o libere uno.'}
            </p>
          </div>
          {puedeEscribir && opciones.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {opciones.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={busy}
                  onClick={() => onPick(n)}
                  className={`min-w-[48px] h-11 rounded-xl text-sm font-black border transition-all ${
                    actual === n
                      ? 'bg-[#00a8cc] text-white border-[#00a8cc] shadow-md shadow-cyan-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-[#00a8cc]/10 hover:border-[#00a8cc]'
                  } disabled:opacity-50`}
                >
                  {codigoCantidad(n)}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            {ocupada && puedeEscribir && (
              <button
                type="button"
                disabled={busy}
                onClick={onLiberar}
                className="px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Liberar este día
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
