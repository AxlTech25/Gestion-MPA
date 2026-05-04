import React, { useState, useEffect } from 'react';
import { FileText, History, Calendar, CheckCircle2, X } from 'lucide-react';
import api from '../api/axios';

const ModalFichaTecnica = ({ equipoId, onClose }) => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDetalles = async () => {
      try {
        const res = await api.get(`/mantenimientos/historial.php?id=${equipoId}`);
        setDatos(res.data);
      } catch (err) {
        console.error("Error al obtener historial:", err);
      } finally {
        setLoading(false);
      }
    };
    if (equipoId) cargarDetalles();
  }, [equipoId]);

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-100 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Encabezado Estilo Sigemad */}
        <div className="bg-[#1a1d23] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="text-[#00a8cc]" size={24} />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter leading-none">Ficha Técnica</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Historial de Activo Fijo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Información del Equipo */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-[#00a8cc] uppercase tracking-widest border-b border-slate-100 pb-2">Especificaciones</h3>
            <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
              <InfoItem label="Denominación" value={datos?.equipo?.denominacion} />
              <InfoItem label="Cód. Patrimonial" value={datos?.equipo?.codigo_patrimonial} />
              <InfoItem label="Marca / Modelo" value={`${datos?.equipo?.marca} ${datos?.equipo?.modelo}`} />
              <InfoItem label="N° de Serie" value={datos?.equipo?.serie} />
              <InfoItem label="Área Asignada" value={datos?.equipo?.area_asignada} />
              <InfoItem label="Responsable" value={datos?.equipo?.responsable_asignado} />
            </div>
          </div>

          {/* Columna Derecha: Línea de Tiempo de Mantenimientos */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-[#00a8cc] uppercase tracking-widest border-b border-slate-100 pb-2">Historial de Mantenimientos</h3>
            
            {!datos?.historial || datos.historial.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <History className="text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold text-sm uppercase">No hay registros de mantenimiento</p>
              </div>
            ) : (
              <div className="space-y-4 pr-2">
                {datos.historial.map((m) => (
                  <div key={m.id} className="group border border-slate-100 rounded-2xl p-5 hover:border-[#00a8cc] hover:shadow-md transition-all bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-[#00a8cc]/10">
                          <Calendar size={14} className="text-[#00a8cc]" />
                        </div>
                        <span className="text-sm font-black text-slate-700">{m.fecha_mantenimiento}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        m.tipo === 'Preventivo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {m.tipo}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Diagnóstico Técnico</p>
                        <p className="text-sm text-slate-600 italic">"{m.diagnostico}"</p>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700 uppercase">Trabajo: {m.trabajo_realizado}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div className="border-b border-slate-200/50 last:border-0 pb-2 last:pb-0">
    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800 break-words">{value || 'NO REGISTRA'}</p>
  </div>
);

export default ModalFichaTecnica;