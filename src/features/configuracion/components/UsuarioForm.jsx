import React, { useState } from 'react';
import { X } from 'lucide-react';
import { organizacionService } from '../services/organizacionService';

export const UsuarioForm = ({ onClose, onSuccess, areas }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    usuario: '',
    password: '',
    rol: 'Practicante',
    area_id: areas.length > 0 ? areas[0].id : ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await organizacionService.createUsuario(formData);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Error al registrar usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Registrar Personal</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          <form id="usuario-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nombre Completo *</label>
              <input required name="nombre_completo" value={formData.nombre_completo} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Usuario de Acceso *</label>
              <input required name="usuario" value={formData.usuario} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: jperez" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Contraseña *</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Rol en el Sistema *</label>
              <select name="rol" value={formData.rol} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Practicante">Practicante</option>
                <option value="Tecnico">Técnico</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
          </form>
        </div>
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
          <button form="usuario-form" type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            {loading ? 'Guardando...' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};
