import React, { useEffect, useState } from 'react';
import { X, FileText, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react';
import { mantenimientoService } from '../services/mantenimientoService';

const fmtFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const fmtMoneda = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return `S/ ${Number(value).toFixed(2)}`;
};

const DetailRow = ({ label, value, full = false }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{value}</p>
    </div>
  );
};

const tipoBadge = (tipo) => {
  const isCorrectivo = tipo === 'Correctivo';
  return (
    <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${
      isCorrectivo ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {tipo}
    </span>
  );
};

export const MantenimientoDetalleModal = ({ mantenimientoId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await mantenimientoService.getById(mantenimientoId);
        if (res.success) setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (mantenimientoId) load();
  }, [mantenimientoId]);

  const handlePdf = async () => {
    setExporting(true);
    try {
      await mantenimientoService.exportFichaPdf(mantenimientoId);
    } catch {
      alert('No se pudo generar el PDF.');
    } finally {
      setExporting(false);
    }
  };

  const isCorrectivo = data?.tipo_mantenimiento === 'Correctivo';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-slate-800 to-blue-900 text-white">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Wrench size={20} /> Detalle de intervención
            </h3>
            {data && (
              <p className="text-xs text-blue-200 mt-0.5 font-mono">
                {data.nro_orden} · {data.codigo_patrimonial}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePdf}
              disabled={!data || exporting}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
            >
              <FileText size={14} /> {exporting ? 'Generando...' : 'PDF'}
            </button>
            <button type="button" onClick={onClose} className="text-white/70 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <p className="text-center text-slate-400 py-12">Cargando detalle...</p>
          ) : !data ? (
            <p className="text-center text-red-500 py-12">No se pudo cargar la intervención.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {tipoBadge(data.tipo_mantenimiento)}
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock size={14} /> {fmtFecha(data.fecha_intervencion)}
                </span>
                {data.categoria_falla && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {data.categoria_falla}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Equipo</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <DetailRow label="Código patrimonial" value={data.codigo_patrimonial} />
                  <DetailRow label="Tipo" value={data.tipo_equipo} />
                  <DetailRow label="Marca / Modelo" value={`${data.marca || '—'} / ${data.modelo || '—'}`} />
                  <DetailRow label="Área" value={data.area_nombre} />
                  <DetailRow label="N° Serie" value={data.numero_serie} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <DetailRow label="Técnico" value={data.tecnico} />
                <DetailRow label="Estado posterior" value={data.estado_post_mantenimiento} />
                <DetailRow label="Inactividad (min)" value={data.tiempo_inactividad_min} />
              </div>

              {isCorrectivo && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} /> Diagnóstico y reparación
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Síntoma reportado" value={data.sintoma_usuario} full />
                    <DetailRow label="Componente principal" value={data.componente_principal} />
                    <DetailRow label="Causa raíz" value={data.causa_raiz} />
                    <DetailRow label="Diagnóstico técnico" value={data.diagnostico_texto} full />
                    <DetailRow label="Piezas reemplazadas" value={data.piezas_reemplazadas} full />
                    <DetailRow label="Costo reparación" value={fmtMoneda(data.costo_reparacion)} />
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">Telemetría registrada</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <DetailRow label="Nivel polvo" value={data.nivel_polvo} />
                  <DetailRow label="Temp. CPU" value={data.temperatura_cpu != null ? `${data.temperatura_cpu} °C` : null} />
                  <DetailRow label="Temp. disco" value={data.temperatura_disco != null ? `${data.temperatura_disco} °C` : null} />
                  <DetailRow label="Horas de uso" value={data.horas_uso_acumuladas} />
                  <DetailRow label="Salud batería" value={data.salud_bateria_pct != null ? `${data.salud_bateria_pct} %` : null} />
                  <DetailRow label="Contador páginas" value={data.contador_paginas_lectura} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" /> Actividades realizadas
                </h4>
                <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-4 whitespace-pre-wrap">
                  {data.actividades_realizadas || 'Sin descripción registrada.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
