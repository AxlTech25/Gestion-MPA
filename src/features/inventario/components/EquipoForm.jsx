import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { equiposService } from '../services/equiposService';
import { organizacionService } from '../../configuracion/services/organizacionService';

export const EquipoForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    codigo_patrimonial: '',
    codigo_identificativo: '',
    tipo_equipo: 'CPU',
    tipo_equipo_otro: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    ram_gb: '',
    almacenamiento_gb: '',
    tipo_disco: 'SSD',
    procesador: '',
    sistema_operativo: 'Windows 10',
    fecha_adquisicion: '',
    area_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState([]);

  const isTechnical = formData.tipo_equipo === 'CPU' || formData.tipo_equipo === 'Laptop';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resA = await organizacionService.getAreas();
        if (resA.success) setAreas(resA.data);
        
        if (resA.success && resA.data.length > 0) {
          setFormData(prev => ({ ...prev, area_id: resA.data[0].id }));
        }
      } catch (e) {
        console.error("Error cargando áreas", e);
      }
    };
    fetchData();
  }, []);

  const NUMERIC_FIELDS = ['codigo_patrimonial', 'codigo_identificativo'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Bloquear caracteres no numéricos en campos de código
    if (NUMERIC_FIELDS.includes(name) && !/^\d*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Si el tipo es "Otro", enviamos el nombre personalizado como tipo_equipo
      const payload = {
        ...formData,
        tipo_equipo: formData.tipo_equipo === 'Otro'
          ? (formData.tipo_equipo_otro.trim() || 'Otro')
          : formData.tipo_equipo,
      };
      const res = await equiposService.createEquipo(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch (error) {
      alert("Error al registrar equipo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Registrar Equipo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="equipo-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Campos Comunes */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Cód. Patrimonial *</label>
              <input
                required
                name="codigo_patrimonial"
                value={formData.codigo_patrimonial}
                onChange={handleChange}
                maxLength={12}
                minLength={12}
                pattern="[0-9]{12}"
                inputMode="numeric"
                title="Debe contener exactamente 12 dígitos numéricos."
                placeholder="Ej: 740000001111"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm tracking-widest" />
              <p className={`text-xs ${formData.codigo_patrimonial.length === 12 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {formData.codigo_patrimonial.length}/12 dígitos
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Cód. Identificativo</label>
              <input
                name="codigo_identificativo"
                value={formData.codigo_identificativo}
                onChange={handleChange}
                maxLength={6}
                pattern="[0-9]{0,6}"
                inputMode="numeric"
                title="Solo dígitos numéricos. Máximo 6."
                placeholder="Ej: 000121"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm tracking-widest" />
              <p className={`text-xs ${formData.codigo_identificativo.length === 6 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {formData.codigo_identificativo.length}/6 dígitos
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Área Asignada *</label>
              <select required name="area_id" value={formData.area_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                {areas.map(a => <option key={a.id} value={a.id}>{a.nombre} (Jefe: {a.jefe_encargado || 'S/N'})</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo de Equipo *</label>
              <select name="tipo_equipo" value={formData.tipo_equipo} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="CPU">CPU (Escritorio)</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Impresora">Impresora</option>
                <option value="Escaner">Escáner</option>
                <option value="Otro">Otro</option>
              </select>
              {formData.tipo_equipo === 'Otro' && (
                <input
                  required
                  name="tipo_equipo_otro"
                  value={formData.tipo_equipo_otro}
                  onChange={handleChange}
                  placeholder="Especifique el tipo de equipo..."
                  className="w-full mt-2 px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none bg-amber-50 text-sm"
                />
              )}
            </div>

            {formData.tipo_equipo === 'Otro' && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-amber-600 font-medium">✏️ Nombre que aparecerá en el inventario: <strong>{formData.tipo_equipo_otro || '—'}</strong></p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Marca</label>
              <input name="marca" value={formData.marca} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Modelo</label>
              <input name="modelo" value={formData.modelo} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">N° de Serie</label>
              <input name="numero_serie" value={formData.numero_serie} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Fecha Adquisición</label>
              <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* Campos Técnicos Condicionales */}
            {isTechnical && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <h4 className="md:col-span-2 font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Especificaciones Técnicas (ML-Ready)
                </h4>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Procesador</label>
                  <input name="procesador" value={formData.procesador} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Core i7 12th Gen" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Memoria RAM (GB)</label>
                  <input type="number" name="ram_gb" value={formData.ram_gb} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 16" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Almacenamiento (GB)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="almacenamiento_gb"
                      value={formData.almacenamiento_gb}
                      onChange={handleChange}
                      min="1" max="100000"
                      className="w-20 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="GB" />
                    <select name="tipo_disco" value={formData.tipo_disco} onChange={handleChange}
                      className="flex-1 px-2 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="SSD">SSD</option>
                      <option value="NVMe">NVMe</option>
                      <option value="HDD">HDD</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Sistema Operativo</label>
                  <select name="sistema_operativo" value={formData.sistema_operativo} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="Windows 7">Windows 7</option>
                    <option value="Windows 8">Windows 8</option>
                    <option value="Windows 8.1">Windows 8.1</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="Windows 11">Windows 11</option>
                  </select>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            Cancelar
          </button>
          <button form="equipo-form" type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
            {loading ? 'Guardando...' : 'Registrar Equipo'}
          </button>
        </div>
      </div>
    </div>
  );
};
