import React, { useState } from 'react';
import { Search, ClipboardList } from 'lucide-react';
import { fichaTecnicaService } from '../services/fichaTecnicaService';
import { FichaTecnicaPanel } from './FichaTecnicaPanel';

export const FichaTecnicaPage = () => {
  const [codigo, setCodigo] = useState('');
  const [equipoId, setEquipoId] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [equipoInfo, setEquipoInfo] = useState(null);

  const handleBuscar = async (e) => {
    e.preventDefault();
    const term = codigo.trim();
    if (!term) {
      setError('Ingrese el código patrimonial del equipo.');
      return;
    }

    setBuscando(true);
    setError('');
    setEquipoId(null);
    setEquipoInfo(null);

    try {
      const res = await fichaTecnicaService.buscarPorCodigo(term);
      if (res.success) {
        setEquipoId(res.data.id);
        setEquipoInfo(res.data);
      } else {
        setError(res.message || 'Equipo no encontrado.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No se encontró equipo con ese código.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <ClipboardList className="text-blue-600" size={28} />
          Ficha Técnica
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Busque un equipo por código patrimonial para consultar sus datos y evaluar su estado.
        </p>
      </header>

      <form
        onSubmit={handleBuscar}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-end"
      >
        <div className="flex-1 space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Código patrimonial
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={codigo}
              onChange={(e) => { setCodigo(e.target.value); setError(''); }}
              placeholder="Ej: PAT-2024-001"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={buscando}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-colors"
        >
          {buscando ? 'Buscando...' : 'Buscar Equipo'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {!equipoId && !error && !buscando && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm">
          Ingrese el código patrimonial y presione <strong className="text-slate-600">Buscar Equipo</strong>.
        </div>
      )}

      {equipoId && equipoInfo && (
        <FichaTecnicaPanel equipoId={equipoId} showHeader={false} />
      )}
    </div>
  );
};
