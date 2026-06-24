import React, { useEffect, useState } from 'react';
import { downloadPdf } from '../../../lib/api';
import { equiposService } from '../services/equiposService';
import { mlService } from '../../ml/services/mlService';
import { RiesgoBadge } from '../../ml/components/RiesgoBadge';
import { PlusCircle, Search, FileText, Settings, FileSpreadsheet, Pencil } from 'lucide-react';
import { EquipoForm } from './EquipoForm';
import { FichaTecnicaModal } from './FichaTecnicaModal';
import { CargaMasivaModal } from './CargaMasivaModal';

export const InventarioPage = () => {
  const [equipos, setEquipos] = useState([]);
  const [riesgoMap, setRiesgoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [equipoEditId, setEquipoEditId] = useState(null);
  const [isCargaMasivaOpen, setIsCargaMasivaOpen] = useState(false);
  const [fichaEquipoId, setFichaEquipoId] = useState(null);

  // Filtros Sprint 4
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = async () => {
    setLoading(true);
    try {
      const res = await equiposService.getAllEquipos();
      if (res.success) {
        setEquipos(res.data);
      }
      cargarRiesgos();
    } catch (error) {
      console.error("Fallo al cargar la tabla");
    } finally {
      setLoading(false);
    }
  };

  const cargarRiesgos = async () => {
    try {
      const res = await mlService.getRiesgoInventario();
      if (res.success && Array.isArray(res.data)) {
        const map = {};
        res.data.forEach((r) => { map[r.equipo_id] = r; });
        setRiesgoMap(map);
      }
    } catch {
      // ML opcional: sin servicio activo se omiten los badges de riesgo
    }
  };

  const handleDescargarPDF = async (id) => {
    try {
      await downloadPdf(`/reportes/equipo/${id}`);
    } catch {
      console.error('No se pudo descargar el PDF');
    }
  };

  const filteredEquipos = equipos.filter(eq => {
    const matchSearch = eq.codigo_patrimonial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        eq.codigo_identificativo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        eq.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        eq.modelo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo ? eq.tipo_equipo === filterTipo : true;
    const matchEstado = filterEstado ? eq.estado_conservacion === filterEstado : true;
    return matchSearch && matchTipo && matchEstado;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Panel */}
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row md:justify-between items-start md:items-center bg-slate-50 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Inventario V2 (ML-Ready)</h2>
          <p className="text-sm text-slate-500">Gestión de equipos optimizada para inteligencia predictiva</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar código o marca..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-48"
            />
          </div>
          
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los tipos</option>
            <option value="CPU">CPU</option>
            <option value="Laptop">Laptop</option>
            <option value="Monitor">Monitor</option>
            <option value="Impresora">Impresora</option>
          </select>

          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los estados</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Bueno">Bueno</option>
            <option value="Regular">Regular</option>
            <option value="Malo">Malo</option>
          </select>

          <button
            onClick={() => setIsCargaMasivaOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FileSpreadsheet size={18} />
            Carga Excel
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <PlusCircle size={18} />
            Nuevo Equipo
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-medium">Cód. Patrimonial / Ident.</th>
              <th className="px-6 py-4 font-medium">Tipo</th>
              <th className="px-6 py-4 font-medium">Marca/Modelo</th>
              <th className="px-6 py-4 font-medium">RAM/Alm (Numérico)</th>
              <th className="px-6 py-4 font-medium">Área</th>
              <th className="px-6 py-4 font-medium">Responsable</th>
              <th className="px-6 py-4 font-medium">Ubicación</th>
              <th className="px-6 py-4 font-medium text-center">Riesgo ML</th>
              <th className="px-6 py-4 font-medium text-center">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="10" className="text-center py-10 text-slate-400">Cargando inventario...</td></tr>
            ) : filteredEquipos.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-10 text-slate-400">No se encontraron equipos.</td></tr>
            ) : (
              filteredEquipos.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <span className="block">{eq.codigo_patrimonial}</span>
                    <span className="text-xs text-slate-400">{eq.codigo_identificativo || 'S/N Ident.'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{eq.tipo_equipo}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="block">{eq.marca || '-'}</span>
                    <span className="text-xs text-slate-400">{eq.modelo || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {eq.ram_gb ? `${eq.ram_gb} GB` : 'N/A'} / {eq.almacenamiento_gb ? `${eq.almacenamiento_gb} GB` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{eq.area_nombre || `ID: ${eq.area_id}`}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {eq.responsable_nombre || eq.area_jefe || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {eq.ubicacion_fisica || eq.area_nombre || '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RiesgoBadge
                      nivel={riesgoMap[eq.id]?.nivel_riesgo}
                      score={riesgoMap[eq.id]?.score_riesgo}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      eq.estado_conservacion === 'Bueno' || eq.estado_conservacion === 'Nuevo' ? 'bg-emerald-100 text-emerald-700' :
                      eq.estado_conservacion === 'Malo' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {eq.estado_conservacion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end gap-2">
                       <button
                         onClick={() => setEquipoEditId(eq.id)}
                         title="Editar equipo"
                         className="text-slate-400 hover:text-amber-600 p-1.5 rounded-md hover:bg-amber-50 transition-colors">
                         <Pencil size={18} />
                       </button>
                       <button 
                         onClick={() => handleDescargarPDF(eq.id)}
                         title="Descargar Ficha PDF"
                         className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-md hover:bg-emerald-50 transition-colors">
                         <FileText size={18} />
                       </button>
                       <button
                         onClick={() => setFichaEquipoId(eq.id)}
                         title="Ver / Editar Ficha Técnica"
                         className="text-slate-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors">
                         <Settings size={18} />
                       </button>
                     </div>
                   </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <EquipoForm 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={cargarEquipos} 
        />
      )}

      {equipoEditId && (
        <EquipoForm
          equipoId={equipoEditId}
          onClose={() => setEquipoEditId(null)}
          onSuccess={cargarEquipos}
        />
      )}

      {isCargaMasivaOpen && (
        <CargaMasivaModal
          onClose={() => setIsCargaMasivaOpen(false)}
          onSuccess={cargarEquipos}
        />
      )}

      {fichaEquipoId && (
        <FichaTecnicaModal
          equipoId={fichaEquipoId}
          onClose={() => setFichaEquipoId(null)}
        />
      )}
    </div>
  );
};
