import React, { useEffect, useState } from 'react';
import { organizacionService } from '../services/organizacionService';
import { Users, Building2, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { AreaForm } from './AreaForm';
import { UsuarioForm } from './UsuarioForm';
import { useAuth } from '../../../context/AuthContext';

export const ConfiguracionPage = () => {
  const [activeTab, setActiveTab] = useState('areas');
  const [areas, setAreas] = useState([]);
  const [gerencias, setGerencias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaGerencia, setNuevaGerencia] = useState('');

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [isUsuarioModalOpen, setIsUsuarioModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const { user: authUser } = useAuth();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'areas') {
        try {
          const resA = await organizacionService.getAreas();
          if (resA.success) setAreas(resA.data || []);
        } catch (e) {
          console.error('Error al cargar áreas', e);
        }
        try {
          const resG = await organizacionService.getGerencias();
          if (resG.success) setGerencias(resG.data || []);
        } catch (e) {
          console.error('Error al cargar gerencias', e);
        }
      } else {
        const resU = await organizacionService.getUsuarios();
        const resA = await organizacionService.getAreas();
        if (resU.success) setUsuarios(resU.data);
        if (resA.success) setAreas(resA.data);
      }
    } catch (e) {
      console.error('Error al cargar configuración', e);
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteUsuario = (user) => {
    if (authUser && authUser.id === user.id) {
      alert('No puedes eliminar tu propia cuenta mientras estés autenticado.');
      return;
    }
    if (user.rol === 'Administrador') {
      const adminCount = usuarios.filter((u) => u.rol === 'Administrador').length;
      if (adminCount <= 1) {
        alert('No se puede eliminar al último usuario con rol Administrador.');
        return;
      }
    }
    setConfirmTarget({ tipo: 'usuario', id: user.id, nombre: user.nombre_completo });
    setConfirmModalOpen(true);
  };

  const requestDeleteArea = (area) => {
    setConfirmTarget({
      tipo: 'area',
      id: area.id,
      nombre: area.nombre,
      extra: 'Se quitarán las marcas de cronograma de esta área. No se puede borrar si tiene equipos asignados.',
    });
    setConfirmModalOpen(true);
  };

  const requestDeleteGerencia = (gerencia) => {
    setConfirmTarget({
      tipo: 'gerencia',
      id: gerencia.id,
      nombre: gerencia.nombre,
      extra: 'Las áreas de esta gerencia quedan sin agrupar.',
    });
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      let res;
      if (confirmTarget.tipo === 'usuario') {
        res = await organizacionService.deleteUsuario(confirmTarget.id);
      } else if (confirmTarget.tipo === 'area') {
        res = await organizacionService.deleteArea(confirmTarget.id);
      } else {
        res = await organizacionService.deleteGerencia(confirmTarget.id);
      }
      if (res.success) {
        await cargarDatos();
      } else {
        alert(res.message || 'No se pudo eliminar.');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error al eliminar.');
    } finally {
      setConfirmTarget(null);
      setConfirmModalOpen(false);
    }
  };

  const altaGerencia = async () => {
    const nombre = nuevaGerencia.trim();
    if (!nombre) return;
    try {
      const res = await organizacionService.createGerencia({ nombre });
      if (res.success) {
        setNuevaGerencia('');
        await cargarDatos();
      } else {
        alert(res.message || 'No se pudo crear la gerencia.');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'No se pudo crear la gerencia.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
      <div className="px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuración organizacional</h2>
          <p className="text-sm text-slate-500">Gerencias, áreas y personal técnico de la institución.</p>
        </div>
        <div>
          <button
            onClick={() => {
              if (activeTab === 'areas') {
                setSelectedArea(null);
                setIsAreaModalOpen(true);
              } else {
                setIsUsuarioModalOpen(true);
              }
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <PlusCircle size={18} />
            {activeTab === 'areas' ? 'Nueva área' : 'Nuevo personal'}
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('areas')}
          className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'areas' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Building2 size={18} /> Áreas y departamentos
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex-1 py-3 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === 'usuarios' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Users size={18} /> Personal técnico y responsables
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-slate-400 py-10">Cargando...</p>
        ) : activeTab === 'areas' ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Gerencias</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {gerencias.length === 0 && (
                  <p className="text-sm text-slate-400">Aún no hay gerencias. Créelas aquí o al registrar un área.</p>
                )}
                {gerencias.map((g) => (
                  <span key={g.id} className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                    {g.nombre}
                    <button
                      type="button"
                      onClick={() => requestDeleteGerencia(g)}
                      className="text-slate-400 hover:text-red-600"
                      aria-label={`Eliminar gerencia ${g.nombre}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  value={nuevaGerencia}
                  onChange={(e) => setNuevaGerencia(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); altaGerencia(); } }}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none"
                  placeholder="Nombre de gerencia, p. ej. Gerencia de Administración"
                />
                <button type="button" onClick={altaGerencia} className="px-3 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700">
                  Añadir
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {areas.length === 0 ? (
                <p className="col-span-3 text-center text-slate-400">No hay áreas registradas.</p>
              ) : areas.map((a) => (
                <div key={a.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  {a.gerencia && (
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 mb-1">{a.gerencia}</p>
                  )}
                  <h4 className="font-bold text-slate-800 text-lg pr-16">{a.nombre}</h4>
                  <p className="text-sm text-slate-600 mt-2 font-medium flex items-center gap-1">
                    <Users size={14} className="text-blue-500" /> {a.jefe_encargado || 'Sin jefe asignado'}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">{a.descripcion || 'Sin descripción'}</p>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedArea(a); setIsAreaModalOpen(true); }}
                      className="p-1.5 rounded-lg bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                      aria-label={`Editar ${a.nombre}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteArea(a)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                      aria-label={`Eliminar ${a.nombre}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Nombre completo</th>
                  <th className="px-6 py-4 font-medium">Usuario</th>
                  <th className="px-6 py-4 font-medium">Rol en TI</th>
                  {authUser?.rol === 'Administrador' && <th className="px-6 py-4 font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.length === 0 ? (
                  <tr><td colSpan={authUser?.rol === 'Administrador' ? 4 : 3} className="text-center py-10">No hay personal de TI registrado.</td></tr>
                ) : usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{u.nombre_completo}</td>
                    <td className="px-6 py-4 text-slate-500">{u.usuario}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${u.rol === 'Administrador' ? 'bg-purple-100 text-purple-700' : u.rol === 'Tecnico' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{u.rol}</span>
                    </td>
                    {authUser?.rol === 'Administrador' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedUsuario(u); setIsUsuarioModalOpen(true); }} className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded">Editar</button>
                          <button onClick={() => requestDeleteUsuario(u)} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded">Eliminar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAreaModalOpen && (
        <AreaForm
          onClose={() => { setIsAreaModalOpen(false); setSelectedArea(null); }}
          onSuccess={cargarDatos}
          area={selectedArea}
          gerencias={gerencias}
        />
      )}

      {isUsuarioModalOpen && (
        <UsuarioForm
          onClose={() => { setIsUsuarioModalOpen(false); setSelectedUsuario(null); }}
          onSuccess={cargarDatos}
          areas={areas}
          user={selectedUsuario}
        />
      )}

      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold">Confirmar eliminación</h3>
              <p className="text-sm text-slate-600 mt-2">
                ¿Eliminar <strong className="text-slate-800">{confirmTarget?.nombre}</strong>? Esta acción no se puede deshacer.
              </p>
              {confirmTarget?.extra && <p className="text-xs text-slate-500 mt-2">{confirmTarget.extra}</p>}
            </div>
            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => { setConfirmTarget(null); setConfirmModalOpen(false); }} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
              <button onClick={confirmDelete} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
