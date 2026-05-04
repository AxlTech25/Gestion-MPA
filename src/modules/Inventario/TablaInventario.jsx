import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Trash2, Monitor, MapPin, User, Search, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ModalFichaTecnica from '../../components/ModalFichaTecnica';

const TablaInventario = () => {
  const [equipos, setEquipos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const { user } = useAuth();

  const fetchEquipos = async () => {
    try {
      const res = await api.get('/equipos/listar.php');
      setEquipos(res.data);
    } catch (err) {
      console.error("Error al cargar inventario", err);
    }
  };

  const eliminarEquipo = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este equipo de Sigemad?")) {
      try {
        await api.post('/equipos/eliminar.php', { id });
        fetchEquipos(); 
      } catch (err) {
        alert("Error al eliminar");
      }
    }
  };

  useEffect(() => { fetchEquipos(); }, []);

  // Filtro dinámico por Denominación o Área
  const equiposFiltrados = equipos.filter(e => 
    (e.area_asignada?.toLowerCase().includes(busqueda.toLowerCase())) ||
    (e.denominacion?.toLowerCase().includes(busqueda.toLowerCase())) ||
    (e.tipo_equipo?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Cabecera de la Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Inventario General</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gestión de activos institucionales</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por área o equipo..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00a8cc] outline-none shadow-sm transition-all"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1a1d23] text-white">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Equipo / Marca</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Identificación</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest">Área y Responsable</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equiposFiltrados.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-[#00a8cc]/10 transition-colors">
                        <Monitor className="text-slate-400 group-hover:text-[#00a8cc]" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">
                          {e.denominacion || e.tipo_equipo}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">
                          {e.marca} - {e.modelo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold text-slate-700">ID: {e.codigo_identificativo}</p>
                    <p className="text-[10px] text-[#00a8cc] font-black uppercase tracking-tighter">
                      Pat: {e.codigo_patrimonial}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={12} className="text-[#00a8cc]" />
                        <span className="text-xs font-bold uppercase truncate">{e.area_asignada}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={12} />
                        <span className="text-[11px] truncate">{e.responsable_asignado}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      {/* Botón: Ver Ficha Técnica e Historial */}
                      <button 
                        onClick={() => setEquipoSeleccionado(e.id)}
                        className="p-2 text-[#00a8cc] hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                        title="Ver Ficha Técnica e Historial"
                      >
                        <FileText size={18} />
                      </button>

                      {/* Botón: Eliminar (Solo Admin) */}
                      {user?.rol === 'Administrador' ? (
                        <button 
                          onClick={() => eliminarEquipo(e.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                          title="Eliminar del Sistema"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <div className="w-9" /> /* Espaciador para mantener alineación */
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renderizado Condicional del Modal */}
      {equipoSeleccionado && (
        <ModalFichaTecnica 
          equipoId={equipoSeleccionado} 
          onClose={() => setEquipoSeleccionado(null)} 
        />
      )}
    </div>
  );
};

export default TablaInventario;