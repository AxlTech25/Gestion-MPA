import React, { useEffect, useState } from 'react';
import {
  Wrench, Clock, AlertTriangle, CheckCircle, Search, FileText, Eye, History,
} from 'lucide-react';
import { mantenimientoService } from '../services/mantenimientoService';
import { MantenimientoForm } from './MantenimientoForm';
import { MantenimientoDetalleModal } from './MantenimientoDetalleModal';

const fmtFecha = (fecha) => new Date(fecha).toLocaleDateString('es-PE', {
  day: '2-digit', month: 'short', year: 'numeric',
});

const fmtFechaHora = (fecha) => new Date(fecha).toLocaleString('es-PE', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const TimelineCard = ({ item, onVerDetalle }) => {
  const isCorrectivo = item.tipo_mantenimiento === 'Correctivo';

  return (
    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-800">
          {item.codigo_patrimonial ? `Eq. ${item.codigo_patrimonial}` : `Orden ${item.nro_orden}`}
        </span>
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <Clock size={14} /> {fmtFechaHora(item.fecha_intervencion)}
        </span>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${
          isCorrectivo ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {item.tipo_mantenimiento}
        </span>
        {item.categoria_falla && (
          <span className="inline-block px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600 font-medium">
            {item.categoria_falla}
          </span>
        )}
        {item.estado_post_mantenimiento && (
          <span className="inline-block px-2 py-1 text-xs rounded-md bg-emerald-50 text-emerald-700 font-medium">
            → {item.estado_post_mantenimiento}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
        {item.actividades_realizadas || item.sintoma_usuario || 'Sin descripción de actividades.'}
      </p>
      <button
        type="button"
        onClick={() => onVerDetalle(item.id)}
        className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <Eye size={14} /> Ver detalle
      </button>
    </div>
  );
};

const Timeline = ({ registros, onVerDetalle }) => (
  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
    {registros.map((item) => (
      <div
        key={item.id}
        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
          {item.tipo_mantenimiento === 'Correctivo'
            ? <AlertTriangle size={18} className="text-rose-500" />
            : <CheckCircle size={18} className="text-emerald-600" />}
        </div>
        <TimelineCard item={item} onVerDetalle={onVerDetalle} />
      </div>
    ))}
  </div>
);

export const MantenimientoPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detalleId, setDetalleId] = useState(null);

  const [codigo, setCodigo] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const [equipoBuscado, setEquipoBuscado] = useState(null);
  const [historialEquipo, setHistorialEquipo] = useState(null);
  const [exportandoPdf, setExportandoPdf] = useState(false);

  const modoBusqueda = historialEquipo !== null;

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const res = await mantenimientoService.getAll();
      if (res.success) setRegistros(res.data);
    } catch {
      console.error('Fallo al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const limpiarBusqueda = () => {
    setCodigo('');
    setErrorBusqueda('');
    setEquipoBuscado(null);
    setHistorialEquipo(null);
  };

  const buscarPorCodigo = async (term) => {
    setBuscando(true);
    setErrorBusqueda('');
    setEquipoBuscado(null);
    setHistorialEquipo(null);

    try {
      const res = await mantenimientoService.buscarHistorialPorCodigo(term);
      if (res.success) {
        setEquipoBuscado(res.data.equipo);
        setHistorialEquipo(res.data.historial);
      } else {
        setErrorBusqueda(res.message || 'Equipo no encontrado.');
      }
    } catch (err) {
      setErrorBusqueda(err.response?.data?.message || 'No se encontró equipo con ese código.');
    } finally {
      setBuscando(false);
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    const term = codigo.trim();
    if (!term) {
      setErrorBusqueda('Ingrese el código patrimonial del equipo.');
      return;
    }
    await buscarPorCodigo(term);
  };

  const handleExportHistorialPdf = async () => {
    if (!equipoBuscado?.codigo_patrimonial) return;
    setExportandoPdf(true);
    try {
      await mantenimientoService.exportHistorialPdf(equipoBuscado.codigo_patrimonial);
    } catch {
      alert('No se pudo generar el PDF del historial.');
    } finally {
      setExportandoPdf(false);
    }
  };

  const listaMostrada = modoBusqueda ? historialEquipo : registros;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b flex flex-wrap justify-between items-center gap-4 bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Mantenimiento</h2>
            <p className="text-sm text-slate-500">Registro de intervenciones e historial por equipo</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Wrench size={18} /> Registrar Intervención
          </button>
        </div>

        <div className="p-6 border-b bg-white">
          <div className="flex items-center gap-2 mb-4">
            <History size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-slate-700">Buscar historial por código patrimonial</h3>
          </div>
          <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Código patrimonial
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => { setCodigo(e.target.value); setErrorBusqueda(''); }}
                  placeholder="Ej: PAT-2024-001"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={buscando}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {buscando ? 'Buscando...' : 'Buscar Historial'}
            </button>
            {modoBusqueda && (
              <button
                type="button"
                onClick={limpiarBusqueda}
                className="px-4 py-3 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Ver todo
              </button>
            )}
          </form>

          {errorBusqueda && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm">
              {errorBusqueda}
            </div>
          )}

          {equipoBuscado && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Equipo encontrado</p>
                <p className="font-bold text-slate-800 font-mono text-lg">{equipoBuscado.codigo_patrimonial}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {equipoBuscado.tipo_equipo} · {equipoBuscado.marca} {equipoBuscado.modelo}
                  {equipoBuscado.area_nombre && ` · ${equipoBuscado.area_nombre}`}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {historialEquipo.length} intervención{historialEquipo.length !== 1 ? 'es' : ''} registrada{historialEquipo.length !== 1 ? 's' : ''}
                  {equipoBuscado.fecha_ultimo_mantenimiento && (
                    <> · Última: {fmtFecha(equipoBuscado.fecha_ultimo_mantenimiento)}</>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportHistorialPdf}
                disabled={exportandoPdf}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium"
              >
                <FileText size={16} />
                {exportandoPdf ? 'Generando PDF...' : 'Exportar historial PDF'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-600 mb-6 flex items-center gap-2">
            <Clock size={16} />
            {modoBusqueda ? 'Historial del equipo (por fecha)' : 'Todas las intervenciones recientes'}
          </h3>

          {loading && !modoBusqueda ? (
            <p className="text-center text-slate-400">Cargando línea de tiempo...</p>
          ) : listaMostrada.length === 0 ? (
            <p className="text-center text-slate-400">
              {modoBusqueda ? 'Este equipo no tiene intervenciones registradas.' : 'No hay intervenciones registradas.'}
            </p>
          ) : (
            <Timeline registros={listaMostrada} onVerDetalle={setDetalleId} />
          )}
        </div>
      </div>

      {isModalOpen && (
        <MantenimientoForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            cargarHistorial();
            if (modoBusqueda && codigo.trim()) {
              buscarPorCodigo(codigo.trim());
            }
          }}
        />
      )}

      {detalleId && (
        <MantenimientoDetalleModal
          mantenimientoId={detalleId}
          onClose={() => setDetalleId(null)}
        />
      )}
    </div>
  );
};
