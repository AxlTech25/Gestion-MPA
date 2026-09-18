import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, Plus, ChevronRight, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { cronogramaService } from '../services/cronogramaService';
import { puedeEscribirCronograma } from '../utils/cronogramaUtils';

const fmtFecha = (fecha) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const CronogramaListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const puedeEscribir = puedeEscribirCronograma(user?.rol);
  const anioActual = new Date().getFullYear();

  const [items, setItems] = useState([]);
  const [anioFiltro, setAnioFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ anio: String(anioActual), nombre: '', notas: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = async (anio) => {
    setLoading(true);
    setError('');
    try {
      const res = await cronogramaService.listar(anio || undefined);
      if (res.success) setItems(res.data || []);
      else setError(res.message || 'No se pudo cargar el historial.');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(anioFiltro);
  }, [anioFiltro]);

  const handleEliminar = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar «${item.nombre}» (${item.anio})? Se borrarán las visitas programadas. Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const res = await cronogramaService.eliminar(item.id);
      if (res.success) {
        cargar(anioFiltro);
      } else {
        alert(res.message || 'No se pudo eliminar.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el cronograma.');
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const res = await cronogramaService.crear({
        anio: Number(form.anio),
        nombre: form.nombre.trim(),
        notas: form.notas.trim() || null,
      });
      if (res.success) {
        setModal(false);
        setForm({ anio: String(anioActual), nombre: '', notas: '' });
        navigate(`/v2/cronograma/${res.data.id}`);
      } else {
        alert(res.message || 'No se pudo crear.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo crear el cronograma.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-[#1a1d23] text-white px-6 py-7 shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#00a8cc]/20" />
        <div className="absolute right-24 -bottom-16 h-32 w-32 rounded-full bg-[#00a8cc]/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#00a8cc]">Preventivo anual</p>
            <h2 className="text-2xl font-black tracking-tight mt-1">Cronograma</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Historial de planes por año. Abra un documento para marcar días como en el papel municipal.
            </p>
          </div>
          {puedeEscribir && (
            <button
              type="button"
              onClick={() => setModal(true)}
              className="flex items-center gap-2 bg-[#00a8cc] hover:bg-[#008fb0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-cyan-900/30"
            >
              <Plus size={18} /> Nuevo cronograma
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrar por año</label>
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="number"
                min="2000"
                max="2100"
                value={anioFiltro}
                onChange={(e) => setAnioFiltro(e.target.value)}
                placeholder="Todos"
                className="pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-40 focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/40"
              />
            </div>
          </div>
          {anioFiltro && (
            <button
              type="button"
              onClick={() => setAnioFiltro('')}
              className="text-sm font-medium text-[#00a8cc] hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <CalendarRange size={32} />
              </div>
              <p className="font-bold text-slate-700">Aún no hay planes registrados</p>
              <p className="text-sm text-slate-400 mt-1">Cree el primer cronograma del año para empezar a marcar visitas.</p>
              {puedeEscribir && (
                <button
                  type="button"
                  onClick={() => setModal(true)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#00a8cc]"
                >
                  <Sparkles size={16} /> Crear cronograma
                </button>
              )}
            </div>
          ) : (
            <ul className="grid gap-3">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-[#00a8cc]/30 hover:shadow-md px-5 py-4 flex flex-wrap items-center justify-between gap-3 transition-all">
                    <button
                      type="button"
                      onClick={() => navigate(`/v2/cronograma/${item.id}`)}
                      className="flex items-center gap-4 min-w-0 text-left flex-1"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a1d23] text-[#00a8cc]">
                        <CalendarRange size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{item.nombre}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {item.creado_por_nombre || 'Sin autor'} · {fmtFecha(item.creado_en)}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                        {item.anio}
                      </span>
                      <span className="rounded-full bg-[#00a8cc]/10 text-[#007a94] px-3 py-1 text-xs font-bold">
                        {item.celdas} {Number(item.celdas) === 1 ? 'visita' : 'visitas'}
                      </span>
                      {puedeEscribir && (
                        <button
                          type="button"
                          aria-label={`Eliminar ${item.nombre}`}
                          title="Eliminar"
                          onClick={(e) => handleEliminar(e, item)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={`Abrir ${item.nombre}`}
                        onClick={() => navigate(`/v2/cronograma/${item.id}`)}
                      >
                        <ChevronRight className="text-slate-300 group-hover:text-[#00a8cc] transition-colors" size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 bg-[#1a1d23] text-white">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00a8cc]">Nuevo plan</p>
              <h3 className="text-lg font-black mt-1">Registrar cronograma</h3>
            </div>
            <form onSubmit={handleCrear} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Año *</label>
                <input
                  required
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Nombre *</label>
                <input
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Preventivo 1 — set–dic"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Notas</label>
                <textarea
                  rows="3"
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/40"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="px-6 py-2.5 bg-[#00a8cc] hover:bg-[#008fb0] text-white rounded-xl text-sm font-bold">
                  {guardando ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
