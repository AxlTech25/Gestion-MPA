import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, CheckCircle, AlertTriangle, Box } from 'lucide-react';
import api from '../../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({ operativo: 0, danado: 0, excedencia: 0, total: 0 });

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await api.get('/equipos/resumen_estados.php');
        setResumen(res.data);
      } catch (err) { 
        console.error("Error al cargar resumen:", err); 
      }
    };
    fetchResumen();
  }, []);

  const handleFilterClick = (estado) => {
    navigate(`/inventario?estado=${estado}`);
  };

  return (
    <div className="min-h-screen">
      <header className="mb-10">
        <h2 className="text-3xl font-black text-slate-800">Panel de Control</h2>
        <p className="text-slate-500">Gestión de activos Municipalidad Provincial de Acobamba</p>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => navigate('/inventario')} className="cursor-pointer transform hover:scale-105 transition-all">
          <StatusCard label="Total Equipos" value={resumen.total} icon={<Monitor className="text-slate-600"/>} color="bg-white border-slate-200" />
        </div>
        <div onClick={() => handleFilterClick('Operativo')} className="cursor-pointer transform hover:scale-105 transition-all">
          <StatusCard label="Operativos" value={resumen.operativo} icon={<CheckCircle className="text-emerald-600"/>} color="bg-emerald-50 border-emerald-100" />
        </div>
        <div onClick={() => handleFilterClick('Dañado')} className="cursor-pointer transform hover:scale-105 transition-all">
          <StatusCard label="Dañados" value={resumen.danado} icon={<AlertTriangle className="text-rose-600"/>} color="bg-rose-50 border-rose-100" />
        </div>
        <div onClick={() => handleFilterClick('Excedencia')} className="cursor-pointer transform hover:scale-105 transition-all">
          <StatusCard label="Excedencia" value={resumen.excedencia} icon={<Box className="text-amber-600"/>} color="bg-amber-50 border-amber-100" />
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ label, value, icon, color }) => (
  <div className={`p-8 rounded-3xl shadow-sm border ${color} flex items-center justify-between`}>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">{label}</p>
      <h4 className="text-4xl font-black text-slate-800">{value}</h4>
    </div>
    <div className="p-4 bg-white rounded-2xl shadow-inner">{icon}</div>
  </div>
);

export default Dashboard;