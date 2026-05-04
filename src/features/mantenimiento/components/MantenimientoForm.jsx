import React, { useState } from 'react';
import { X } from 'lucide-react';
import { mantenimientoService } from '../services/mantenimientoService';

export const MantenimientoForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    equipo_id: '',
    tecnico_id: '1', // Default técnico (simulado)
    fecha_intervencion: new Date().toISOString().slice(0,16), // Formato YYYY-MM-DDTHH:mm
    tipo_mantenimiento: 'Preventivo',
    categoria_falla_id: '1', // Mantenimiento Preventivo / Limpieza
    diagnostico_texto: '',
    actividades_realizadas: '',
    estado_post_mantenimiento: 'Operativo'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await mantenimientoService.create(formData);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Error al registrar mantenimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Registrar Mantenimiento (ML Data)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="mant-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">ID del Equipo *</label>
              <input required type="number" name="equipo_id" value={formData.equipo_id} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ID Interno BD" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Fecha y Hora *</label>
              <input required type="datetime-local" name="fecha_intervencion" value={formData.fecha_intervencion} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo *</label>
              <select name="tipo_mantenimiento" value={formData.tipo_mantenimiento} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Evaluacion">Evaluación</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-blue-700">Categoría Falla (IA Target) *</label>
              <select name="categoria_falla_id" value={formData.categoria_falla_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg">
                <option value="1">Limpieza / Rutina</option>
                <option value="2">Actualización Software</option>
                <option value="4">Problema de Red</option>
                <option value="6">Sobrecalentamiento</option>
                <option value="8">Fallo Disco / Corrupción</option>
                <option value="9">Fallo Fuente de Poder</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Actividades Realizadas</label>
              <textarea name="actividades_realizadas" value={formData.actividades_realizadas} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe lo que hiciste..." />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Estado Posterior *</label>
              <select name="estado_post_mantenimiento" value={formData.estado_post_mantenimiento} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Operativo">Operativo (Resuelto)</option>
                <option value="Dañado">Aún Dañado</option>
                <option value="Baja">Para Baja</option>
              </select>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
          <button form="mant-form" type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            {loading ? 'Guardando...' : 'Guardar Ficha'}
          </button>
        </div>
      </div>
    </div>
  );
};
