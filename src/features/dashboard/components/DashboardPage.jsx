import React, { useEffect, useState } from 'react';
import {
  Monitor, Wrench, Building2, AlertTriangle,
  BarChart3, Activity, Clock, Brain
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { mlService } from '../../ml/services/mlService';
import { RiesgoBadge } from '../../ml/components/RiesgoBadge';
import { ConsultaEquiposPanel } from './ConsultaEquiposPanel';

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-start justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-3xl font-black text-slate-800 mt-2">{value ?? 0}</p>
    </div>
    <div className={`p-3 rounded-xl ${accent}`}>
      <Icon size={22} />
    </div>
  </div>
);

const BarList = ({ title, items, color = 'bg-blue-500' }) => {
  const max = Math.max(...(items?.map((i) => Number(i.total)) || [1]), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
        <BarChart3 size={16} /> {title}
      </h3>
      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-900">{item.total}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${(Number(item.total) / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">Sin datos registrados.</p>
      )}
    </div>
  );
};

const severidadColor = {
  Baja: 'text-emerald-600 bg-emerald-50',
  Media: 'text-amber-600 bg-amber-50',
  Alta: 'text-orange-600 bg-orange-50',
  Critica: 'text-red-600 bg-red-50',
};

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [res, alertasRes] = await Promise.all([
          dashboardService.getResumen(),
          mlService.getAlertas().catch((err) => {
            console.warn('ML alertas:', err?.response?.data?.message || err.message);
            return null;
          }),
        ]);
        if (res.success) setData(res.data);
        else setError(res.message || 'No se pudo cargar el resumen.');

        if (alertasRes?.success && Array.isArray(alertasRes.data)) {
          setAlertas(alertasRes.data);
        }
      } catch {
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 animate-pulse font-medium">Cargando métricas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600">
        {error}
      </div>
    );
  }

  const { totales, por_estado_operativo, por_estado_conservacion, por_tipo_equipo, por_area, fallas_por_categoria, mantenimientos_recientes } = data;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Resumen operativo del parque tecnológico</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Equipos registrados" value={totales.equipos} icon={Monitor} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Mantenimientos" value={totales.mantenimientos} icon={Wrench} accent="bg-cyan-50 text-cyan-600" />
        <StatCard label="Áreas activas" value={totales.areas} icon={Building2} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Equipos dañados" value={totales.danados} icon={AlertTriangle} accent="bg-red-50 text-red-600" />
      </div>

      <ConsultaEquiposPanel
        porTipo={por_tipo_equipo}
        porEstadoOperativo={por_estado_operativo}
        porEstadoConservacion={por_estado_conservacion}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarList title="Estado operativo" items={por_estado_operativo} color="bg-emerald-500" />
        <BarList title="Tipo de equipo" items={por_tipo_equipo} color="bg-blue-500" />
        <BarList title="Equipos por área" items={por_area} color="bg-violet-500" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
            <Activity size={16} /> Fallas por categoría
          </h3>
          {fallas_por_categoria?.length ? (
            <ul className="space-y-3">
              {fallas_por_categoria.map((f) => (
                <li key={f.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700 flex-1">{f.label}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${severidadColor[f.severidad] || 'text-slate-600 bg-slate-100'}`}>
                    {f.severidad}
                  </span>
                  <span className="text-sm font-black text-slate-900 w-6 text-right">{f.total}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Aún no hay mantenimientos registrados.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Brain size={16} /> Alertas predictivas
        </h3>
        {alertas.length ? (
          <>
            <p className="text-xs text-slate-400 mb-3">
              Top {alertas.length} equipos con mayor score de riesgo (0–100).
            </p>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b">
                  <th className="pb-3 pr-4">Equipo</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Área</th>
                  <th className="pb-3 pr-4 text-center">Riesgo</th>
                  <th className="pb-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {alertas.slice(0, 10).map((a) => (
                  <tr key={a.equipo_id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-slate-800">{a.codigo_patrimonial}</td>
                    <td className="py-3 pr-4 text-slate-600">{a.tipo_equipo || '—'}</td>
                    <td className="py-3 pr-4 text-slate-600">{a.area_nombre || '—'}</td>
                    <td className="py-3 pr-4 text-center">
                      <RiesgoBadge nivel={a.nivel_riesgo} compact />
                    </td>
                    <td className="py-3 text-right font-mono text-slate-700">
                      {Number(a.score_riesgo).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <p className="text-sm text-slate-400">Sin predicciones disponibles.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Clock size={16} /> Mantenimientos recientes
        </h3>
        {mantenimientos_recientes?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b">
                  <th className="pb-3 pr-4">Orden</th>
                  <th className="pb-3 pr-4">Equipo</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Categoría</th>
                  <th className="pb-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientos_recientes.map((m) => (
                  <tr key={m.nro_orden} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{m.nro_orden}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">{m.codigo_patrimonial}</td>
                    <td className="py-3 pr-4 text-slate-600">{m.tipo_mantenimiento}</td>
                    <td className="py-3 pr-4 text-slate-600">{m.categoria_falla || '—'}</td>
                    <td className="py-3 text-slate-500">{new Date(m.fecha_intervencion).toLocaleDateString('es-PE')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No hay intervenciones recientes.</p>
        )}
      </div>
    </div>
  );
};
