import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Headset, RefreshCw, Filter } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ticketsService } from '../services/ticketsService';

const ESTADOS = ['Abierto', 'En atencion', 'Resuelto', 'Cerrado'];

const claseEstado = (estado) => {
  if (estado === 'Abierto') return 'bg-amber-100 text-amber-800';
  if (estado === 'En atencion') return 'bg-sky-100 text-sky-800';
  if (estado === 'Resuelto') return 'bg-emerald-100 text-emerald-800';
  return 'bg-slate-100 text-slate-600';
};

const fmtFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const TicketRow = ({ ticket, puedeGestionar, onCambiarEstado, actualizandoId }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50/80">
    <td className="px-4 py-3 font-mono text-sm font-bold text-slate-800">{ticket.codigo}</td>
    <td className="px-4 py-3 text-sm text-slate-700">
      <div className="font-medium">{ticket.area}</div>
      <div className="text-xs text-slate-500">{ticket.gerencia}</div>
    </td>
    <td className="px-4 py-3 text-sm text-slate-700">
      <div>{ticket.motivo}</div>
      {ticket.solicitante_nombre && (
        <div className="text-xs text-slate-500">Solicita: {ticket.solicitante_nombre}</div>
      )}
      {ticket.descripcion && (
        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">{ticket.descripcion}</div>
      )}
    </td>
    <td className="px-4 py-3">
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${claseEstado(ticket.estado)}`}>
        {ticket.estado}
      </span>
      {ticket.asignado_nombre && (
        <div className="text-xs text-slate-500 mt-1">{ticket.asignado_nombre}</div>
      )}
    </td>
    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmtFecha(ticket.creado_en)}</td>
    <td className="px-4 py-3">
      {puedeGestionar ? (
        <select
          value={ticket.estado}
          disabled={actualizandoId === ticket.id}
          onChange={(e) => onCambiarEstado(ticket.id, e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label={`Cambiar estado de ${ticket.codigo}`}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      ) : (
        <span className="text-xs text-slate-400">Solo lectura</span>
      )}
    </td>
  </tr>
);

TicketRow.propTypes = {
  ticket: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    codigo: PropTypes.string,
    area: PropTypes.string,
    gerencia: PropTypes.string,
    motivo: PropTypes.string,
    solicitante_nombre: PropTypes.string,
    descripcion: PropTypes.string,
    estado: PropTypes.string,
    asignado_nombre: PropTypes.string,
    creado_en: PropTypes.string,
  }).isRequired,
  puedeGestionar: PropTypes.bool,
  onCambiarEstado: PropTypes.func,
  actualizandoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export function TicketsPage() {
  const { user } = useAuth();
  const puedeGestionar = user?.rol === 'Administrador' || user?.rol === 'Tecnico';
  const [tickets, setTickets] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actualizandoId, setActualizandoId] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ticketsService.listar(filtro);
      if (res.success) {
        setTickets(res.data || []);
      } else {
        setError(res.message || 'No se pudieron cargar los tickets.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tickets.');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onCambiarEstado = async (id, estado) => {
    setActualizandoId(id);
    setError('');
    try {
      const res = await ticketsService.actualizar(id, { estado });
      if (res.success) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...res.data } : t)));
      } else {
        setError(res.message || 'No se pudo actualizar.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar el ticket.');
    } finally {
      setActualizandoId(null);
    }
  };

  const abiertos = tickets.filter((t) => t.estado === 'Abierto').length;
  const enAtencion = tickets.filter((t) => t.estado === 'En atencion').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Headset className="text-[#00a8cc]" size={28} /> Tickets de soporte
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Solicitudes enviadas desde el formulario público.
            {!filtro && (
              <span className="ml-2 text-slate-600">
                {abiertos} abiertos · {enAtencion} en atención
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={cargar}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700"
          >
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Código</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Ubicación</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Motivo</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Creado</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">Cargando…</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    No hay tickets{filtro ? ` en estado «${filtro}»` : ''}.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    puedeGestionar={puedeGestionar}
                    onCambiarEstado={onCambiarEstado}
                    actualizandoId={actualizandoId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
