import React, { useEffect, useState } from 'react';
import { Search, X, Filter, Monitor } from 'lucide-react';
import { countMapFromItems } from '../../../lib/equipoTipo';
import { dashboardService } from '../services/dashboardService';

const countMap = (items) => countMapFromItems(items);

const FilterTag = ({ label, count, active, onClick, activeClass }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
      active
        ? activeClass
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {label}
    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
      active ? 'bg-white/25' : 'bg-slate-100 text-slate-500'
    }`}>
      {count ?? 0}
    </span>
  </button>
);

const estadoOpStyle = {
  Operativo: 'bg-emerald-600 text-white border-emerald-600',
  'Dañado': 'bg-orange-600 text-white border-orange-600',
  'En Reparacion': 'bg-amber-600 text-white border-amber-600',
  Excedencia: 'bg-slate-600 text-white border-slate-600',
  Baja: 'bg-red-600 text-white border-red-600',
};

const estadoConsStyle = {
  Nuevo: 'bg-emerald-600 text-white border-emerald-600',
  Bueno: 'bg-blue-600 text-white border-blue-600',
  Regular: 'bg-amber-600 text-white border-amber-600',
  Malo: 'bg-red-600 text-white border-red-600',
};

const tipoStyle = 'bg-blue-600 text-white border-blue-600';

const badgeOperativo = (estado) => {
  const map = {
    Operativo: 'bg-emerald-100 text-emerald-700',
    'Dañado': 'bg-orange-100 text-orange-700',
    'En Reparacion': 'bg-amber-100 text-amber-700',
    Excedencia: 'bg-slate-200 text-slate-600',
    Baja: 'bg-red-100 text-red-700',
  };
  return map[estado] || 'bg-slate-100 text-slate-600';
};

const badgeConservacion = (estado) => {
  const map = {
    Nuevo: 'bg-emerald-100 text-emerald-700',
    Bueno: 'bg-blue-100 text-blue-700',
    Regular: 'bg-amber-100 text-amber-700',
    Malo: 'bg-red-100 text-red-700',
  };
  return map[estado] || 'bg-slate-100 text-slate-600';
};

export const ConsultaEquiposPanel = ({
  porTipo,
  porEstadoOperativo,
  porEstadoConservacion,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo_equipo: null,
    estado_operativo: null,
    estado_conservacion: null,
  });
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tipoOtroText, setTipoOtroText] = useState('');

  const tipoCounts = countMap(porTipo);
  const opCounts = countMap(porEstadoOperativo);
  const consCounts = countMap(porEstadoConservacion);

  const otroSeleccionado = filtros.tipo_equipo === 'Otro';
  const hayFiltros = Object.values(filtros).some(Boolean);

  const toggleFiltro = (campo, valor) => {
    setFiltros((prev) => {
      const next = { ...prev, [campo]: prev[campo] === valor ? null : valor };
      if (campo === 'tipo_equipo' && prev[campo] === valor) {
        setTipoOtroText('');
      }
      return next;
    });
    if (campo === 'tipo_equipo' && valor !== 'Otro') {
      setTipoOtroText('');
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ tipo_equipo: null, estado_operativo: null, estado_conservacion: null });
    setTipoOtroText('');
    setResultado(null);
    setError('');
  };

  useEffect(() => {
    if (!hayFiltros) {
      setResultado(null);
      setError('');
      return undefined;
    }

    const delay = otroSeleccionado ? 400 : 0;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const payload = { ...filtros };
        if (otroSeleccionado && tipoOtroText.trim()) {
          payload.tipo_otro = tipoOtroText.trim();
        }
        const res = await dashboardService.consultarEquipos(payload);
        if (res.success) {
          setResultado(res.data);
        } else {
          setError(res.message || 'No se pudo consultar.');
          setResultado(null);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al consultar equipos.');
        setResultado(null);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [filtros, hayFiltros, otroSeleccionado, tipoOtroText]);

  const filtrosActivos = [
    filtros.tipo_equipo && {
      label: otroSeleccionado && tipoOtroText.trim()
        ? `Otro: ${tipoOtroText.trim()}`
        : filtros.tipo_equipo,
      campo: 'tipo_equipo',
    },
    filtros.estado_operativo && { label: filtros.estado_operativo, campo: 'estado_operativo' },
    filtros.estado_conservacion && { label: filtros.estado_conservacion, campo: 'estado_conservacion' },
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Search size={16} /> Consulta de equipos
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Seleccione etiquetas para filtrar por tipo, estado operativo o conservación
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Filter size={16} />
          {expanded ? 'Ocultar consulta' : 'Consultar equipos'}
        </button>
      </div>

      {expanded && (
        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tipo de equipo</p>
            <div className="flex flex-wrap items-center gap-2">
              {['Laptop', 'CPU', 'Impresora', 'Monitor', 'Otro'].map((tipo) => (
                <FilterTag
                  key={tipo}
                  label={tipo}
                  count={tipoCounts[tipo] ?? 0}
                  active={filtros.tipo_equipo === tipo}
                  onClick={() => toggleFiltro('tipo_equipo', tipo)}
                  activeClass={tipoStyle}
                />
              ))}
              {otroSeleccionado && (
                <input
                  type="text"
                  value={tipoOtroText}
                  onChange={(e) => setTipoOtroText(e.target.value)}
                  placeholder="Ej: Plotter, detector de billetes..."
                  className="min-w-[220px] flex-1 max-w-sm px-3 py-1.5 border border-amber-300 rounded-full text-sm focus:ring-2 focus:ring-amber-400 outline-none bg-amber-50 placeholder:text-slate-400"
                />
              )}
            </div>
            {otroSeleccionado && (
              <p className="text-xs text-amber-600 mt-2">
                Escriba el tipo específico para refinar la búsqueda, o deje vacío para ver todos los equipos «Otro».
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Estado operativo</p>
            <div className="flex flex-wrap gap-2">
              {['Operativo', 'Dañado', 'En Reparacion', 'Excedencia', 'Baja'].map((estado) => (
                <FilterTag
                  key={estado}
                  label={estado === 'En Reparacion' ? 'En reparación' : estado}
                  count={opCounts[estado] ?? 0}
                  active={filtros.estado_operativo === estado}
                  onClick={() => toggleFiltro('estado_operativo', estado)}
                  activeClass={estadoOpStyle[estado] || tipoStyle}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Estado de conservación</p>
            <div className="flex flex-wrap gap-2">
              {['Nuevo', 'Bueno', 'Regular', 'Malo'].map((estado) => (
                <FilterTag
                  key={estado}
                  label={estado}
                  count={consCounts[estado] ?? 0}
                  active={filtros.estado_conservacion === estado}
                  onClick={() => toggleFiltro('estado_conservacion', estado)}
                  activeClass={estadoConsStyle[estado] || tipoStyle}
                />
              ))}
            </div>
          </div>

          {hayFiltros && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Filtros activos:</span>
              {filtrosActivos.map((f) => (
                <span
                  key={f.campo}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
                >
                  {f.label}
                  <button
                    type="button"
                    onClick={() => {
                    if (f.campo === 'tipo_equipo') {
                      setTipoOtroText('');
                    }
                    toggleFiltro(f.campo, filtros[f.campo]);
                  }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-xs text-red-600 hover:text-red-800 font-medium ml-auto"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {!hayFiltros && (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl py-10 text-center text-sm text-slate-400">
              <Monitor size={28} className="mx-auto mb-2 text-slate-300" />
              Seleccione una o más etiquetas para ver la lista de equipos
            </div>
          )}

          {hayFiltros && (
            <div>
              {loading ? (
                <p className="text-center text-slate-400 py-8 animate-pulse">Consultando equipos...</p>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              ) : resultado ? (
                <>
                  <p className="text-sm text-slate-600 mb-3">
                    <span className="font-bold text-slate-800">{resultado.total}</span>
                    {' '}equipo{resultado.total !== 1 ? 's' : ''} encontrado{resultado.total !== 1 ? 's' : ''}
                  </p>
                  {resultado.equipos.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">
                      No hay equipos que coincidan con los filtros seleccionados.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50 border-b">
                            <th className="px-4 py-3">Cód. patrimonial</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Marca / Modelo</th>
                            <th className="px-4 py-3">Área</th>
                            <th className="px-4 py-3">Operativo</th>
                            <th className="px-4 py-3">Conservación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.equipos.map((eq) => (
                            <tr key={eq.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                                {eq.codigo_patrimonial}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{eq.tipo_equipo}</td>
                              <td className="px-4 py-3 text-slate-600">
                                {[eq.marca, eq.modelo].filter(Boolean).join(' ') || '—'}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{eq.area_nombre || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeOperativo(eq.estado_operativo)}`}>
                                  {eq.estado_operativo}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeConservacion(eq.estado_conservacion)}`}>
                                  {eq.estado_conservacion || '—'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
