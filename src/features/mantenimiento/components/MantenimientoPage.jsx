import React, { useEffect, useState } from 'react';
import { mantenimientoService } from '../services/mantenimientoService';
import { Wrench, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { MantenimientoForm } from './MantenimientoForm';

export const MantenimientoPage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const res = await mantenimientoService.getAll();
      if (res.success) setRegistros(res.data);
    } catch (error) {
      console.error("Fallo al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Historial de Mantenimiento</h2>
          <p className="text-sm text-slate-500">Cronograma de intervenciones y fallas para Análisis Predictivo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Wrench size={18} /> Registrar Intervención
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-slate-400">Cargando línea de tiempo...</p>
        ) : registros.length === 0 ? (
          <p className="text-center text-slate-400">No hay intervenciones registradas.</p>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {registros.map((item, index) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icono central Timeline */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {item.tipo_mantenimiento === 'Correctivo' ? <AlertTriangle size={18} className="text-rose-500" /> : <CheckCircle size={18} className="text-emerald-600" />}
                </div>
                
                {/* Tarjeta de Contenido */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">Eq. {item.codigo_patrimonial}</span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><Clock size={14}/> {new Date(item.fecha_intervencion).toLocaleDateString()}</span>
                  </div>
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${item.tipo_mantenimiento === 'Correctivo' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.tipo_mantenimiento}
                    </span>
                    {item.categoria_falla && (
                      <span className="ml-2 inline-block px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600 font-medium">
                        Falla: {item.categoria_falla}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.actividades_realizadas || "Sin descripción de actividades."}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && <MantenimientoForm onClose={() => setIsModalOpen(false)} onSuccess={cargarHistorial} />}
    </div>
  );
};
