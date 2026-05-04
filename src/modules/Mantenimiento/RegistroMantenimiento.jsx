import React, { useState } from 'react';
import api from '../../api/axios';
import { Camera, Save, AlertCircle } from 'lucide-react';

const RegistroMantenimiento = () => {
  const [data, setData] = useState({
    codigo_patrimonial: '',
    diagnostico: '',
    trabajo_realizado: '',
    estado_final: 'Operativo'
  });
  
  const [fotos, setFotos] = useState({ antes: null, despues: null });
  const [previews, setPreviews] = useState({ antes: '', despues: '' });

  const handleFile = (e, tipo) => {
    const file = e.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) { // Validar 2MB
      setFotos({ ...fotos, [tipo]: file });
      setPreviews({ ...previews, [tipo]: URL.createObjectURL(file) });
    } else {
      alert("La imagen debe ser menor a 2MB");
    }
  };

  const enviarMantenimiento = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // Adjuntar datos de texto
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    // Adjuntar imágenes
    if (fotos.antes) formData.append('foto_antes', fotos.antes);
    if (fotos.despues) formData.append('foto_despues', fotos.despues);

    try {
      const res = await api.post('/mantenimiento/registrar.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Error al registrar mantenimiento", err);
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm max-w-4xl mx-auto border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <Camera className="text-blue-600" /> Registro de Intervención Técnica
      </h2>

      <form onSubmit={enviarMantenimiento} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input 
            type="text" 
            placeholder="Código Patrimonial (Ej: 740855555)" 
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setData({...data, codigo_patrimonial: e.target.value})}
            required
          />
          <select 
            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setData({...data, estado_final: e.target.value})}
          >
            <option value="Operativo">Mantenimiento Exitoso (Operativo)</option>
            <option value="Dañado">Sigue con Fallas (Dañado)</option>
            <option value="Excedencia">Pasar a Stock (Excedencia)</option>
          </select>
        </div>

        <textarea 
          placeholder="Diagnóstico inicial del problema..."
          className="w-full p-4 border rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setData({...data, diagnostico: e.target.value})}
          required
        ></textarea>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Subida Foto ANTES */}
          <div className="border-2 border-dashed border-slate-200 p-4 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-500 mb-2">FOTO INICIAL (ANTES)</p>
            {previews.antes && <img src={previews.antes} className="h-40 mx-auto rounded-lg mb-2 object-cover" />}
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, 'antes')} className="text-xs" />
          </div>

          {/* Subida Foto DESPUÉS */}
          <div className="border-2 border-dashed border-slate-200 p-4 rounded-2xl text-center">
            <p className="text-xs font-bold text-slate-500 mb-2">FOTO FINAL (DESPUÉS)</p>
            {previews.despues && <img src={previews.despues} className="h-40 mx-auto rounded-lg mb-2 object-cover" />}
            <input type="file" accept="image/*" onChange={(e) => handleFile(e, 'despues')} className="text-xs" />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 flex items-center justify-center gap-2 transition-all">
          <Save size={20} /> GUARDAR MANTENIMIENTO Y ACTUALIZAR EQUIPO
        </button>
      </form>
    </div>
  );
};

export default RegistroMantenimiento;