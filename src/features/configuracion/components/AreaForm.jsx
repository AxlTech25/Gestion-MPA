import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { organizacionService } from '../services/organizacionService';

export const AreaForm = ({ onClose, onSuccess, area, gerencias = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    jefe_encargado: '',
    descripcion: '',
    gerencia_id: '',
  });
  const [listaGerencias, setListaGerencias] = useState(gerencias);
  const [nuevaGerencia, setNuevaGerencia] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      nombre: area?.nombre || '',
      jefe_encargado: area?.jefe_encargado || '',
      descripcion: area?.descripcion || '',
      gerencia_id: area?.gerencia_id ? String(area.gerencia_id) : '',
    });
  }, [area]);

  useEffect(() => {
    setListaGerencias(gerencias);
  }, [gerencias]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const crearGerenciaRapida = async () => {
    const nombre = nuevaGerencia.trim();
    if (!nombre) return;
    try {
      const res = await organizacionService.createGerencia({ nombre });
      if (res.success && res.data) {
        const creada = res.data;
        setListaGerencias((prev) => [...prev, creada].sort((a, b) => String(a.nombre).localeCompare(b.nombre)));
        setFormData((prev) => ({ ...prev, gerencia_id: String(creada.id) }));
        setNuevaGerencia('');
      } else {
        alert(res.message || 'No se pudo crear la gerencia.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo crear la gerencia.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...formData,
      gerencia_id: formData.gerencia_id === '' ? null : Number(formData.gerencia_id),
    };
    try {
      const res = area?.id
        ? await organizacionService.updateArea(area.id, payload)
        : await organizacionService.createArea(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar el área.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{area?.id ? 'Editar área' : 'Registrar nueva área'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          <form id="area-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Nombre del área *</label>
              <input required name="nombre" value={formData.nombre} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Recursos Humanos" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Gerencia</label>
              <select name="gerencia_id" value={formData.gerencia_id} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
                <option value="">Sin gerencia (Alcaldía, servidores…)</option>
                {listaGerencias.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <input
                  value={nuevaGerencia}
                  onChange={(e) => setNuevaGerencia(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none"
                  placeholder="Nueva gerencia…"
                />
                <button type="button" onClick={crearGerenciaRapida}
                  className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                  Añadir
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Jefe a cargo (responsable) *</label>
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
            {loading ? 'Guardando...' : 'Guardar área'}
          </button>
        </div>
      </div>
    </div>
  );
};
