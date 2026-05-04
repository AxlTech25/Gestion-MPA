import React, { useEffect, useState } from 'react';
import { organizacionService } from '../services/organizacionService';
import { Users, Building2, PlusCircle } from 'lucide-react';
import { AreaForm } from './AreaForm';
import { UsuarioForm } from './UsuarioForm';

export const ConfiguracionPage = () => {
  const [activeTab, setActiveTab] = useState('areas');
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'areas') {
        const res = await organizacionService.getAreas();
        if (res.success) setAreas(res.data);
      } else {
        const resU = await organizacionService.getUsuarios();
        const resA = await organizacionService.getAreas(); // Para el form
        if (resU.success) setUsuarios(resU.data);
        if (resA.success) setAreas(resA.data);
      }
    } catch (e) {
      console.error("Error al cargar configuración", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuración Organizacional</h2>
          <p className="text-sm text-slate-500">Gestione los departamentos y el personal técnico de la institución.</p>
        </div>
        <div>
          <button 
            onClick={() => activeTab === 'areas' ? setIsAreaModalOpen(true) : setIsUsuarioModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <PlusCircle size={18} />
            {activeTab === 'areas' ? 'Nueva Área' : 'Nuevo Personal'}
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('areas')}
          className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'areas' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Building2 size={18} /> Áreas y Departamentos
        </button>
        <button 
          onClick={() => setActiveTab('usuarios')}
          className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'usuarios' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Users size={18} /> Personal Técnico y Responsables
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-slate-400 py-10">Cargando...</p>
        ) : activeTab === 'areas' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {areas.length === 0 ? <p className="col-span-3 text-center text-slate-400">No hay áreas registradas.</p> : 
              areas.map(a => (
                <div key={a.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <h4 className="font-bold text-slate-800 text-lg">{a.nombre}</h4>
                  <p className="text-sm text-slate-600 mt-2 font-medium flex items-center gap-1">
                    <Users size={14} className="text-blue-500"/> {a.jefe_encargado || 'Sin Jefe Asignado'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">{a.descripcion || 'Sin descripción'}</p>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Nombre Completo</th>
                  <th className="px-6 py-4 font-medium">Usuario</th>
                  <th className="px-6 py-4 font-medium">Rol en TI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.length === 0 ? <tr><td colSpan="3" className="text-center py-10">No hay personal de TI registrado.</td></tr> :
                  usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">{u.nombre_completo}</td>
                      <td className="px-6 py-4 text-slate-500">{u.usuario}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${u.rol === 'Administrador' ? 'bg-purple-100 text-purple-700' : u.rol === 'Tecnico' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{u.rol}</span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAreaModalOpen && <AreaForm onClose={() => setIsAreaModalOpen(false)} onSuccess={cargarDatos} />}
      {isUsuarioModalOpen && <UsuarioForm onClose={() => setIsUsuarioModalOpen(false)} onSuccess={cargarDatos} areas={areas} />}
    </div>
  );
};
