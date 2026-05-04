import React, { useState } from 'react';
import { X } from 'lucide-react';
import { organizacionService } from '../services/organizacionService';

export const AreaForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ nombre: '', jefe_encargado: '', descripcion: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await organizacionService.createArea(formData);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Error al registrar área.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Registrar Nueva Área</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          <form id="area-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nombre del Área *</label>
              <input required name="nombre" value={formData.nombre} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej: Recursos Humanos" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Jefe a Cargo (Responsable) *</label>
              <input required name="jefe_encargado" value={formData.jefe_encargado} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Ej: Ing. María Gómez" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Descripción</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Funciones principales del área..." />
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
          <button form="area-form" type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            {loading ? 'Guardando...' : 'Guardar Área'}
          </button>
        </div>
      </div>
    </div>
  );
};
