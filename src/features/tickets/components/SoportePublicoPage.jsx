import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headset, CheckCircle2, Monitor, Search } from 'lucide-react';
import { ticketsService } from '../services/ticketsService';

const estadoInicial = {
  gerencia_id: '',
  area_id: '',
  motivo: '',
  descripcion: '',
  solicitante_nombre: '',
  empresa_web: '',
};

export function SoportePublicoPage() {
  const [catalogo, setCatalogo] = useState({ gerencias: [], areas: [], motivos: [] });
  const [form, setForm] = useState(estadoInicial);
  const [loading, setLoading] = useState(false);
  const [cargandoCat, setCargandoCat] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);
  const [consultaCodigo, setConsultaCodigo] = useState('');
  const [consultaResultado, setConsultaResultado] = useState(null);
  const [consultaError, setConsultaError] = useState('');
  const [consultando, setConsultando] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await ticketsService.getCatalogo();
        if (!activo) return;
        if (res.success) {
          setCatalogo({
            gerencias: res.data?.gerencias || [],
            areas: res.data?.areas || [],
            motivos: res.data?.motivos || [],
          });
        } else {
          setError(res.message || 'No se pudo cargar el catálogo.');
        }
      } catch {
        if (activo) setError('No se pudo conectar con el servidor.');
      } finally {
        if (activo) setCargandoCat(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  const areasFiltradas = useMemo(() => {
    const gid = Number(form.gerencia_id);
    if (!gid) return [];
    return (catalogo.areas || []).filter((a) => Number(a.gerencia_id) === gid);
  }, [catalogo.areas, form.gerencia_id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setError('');
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'gerencia_id') next.area_id = '';
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito(null);
    if (!form.gerencia_id || !form.area_id || !form.motivo) {
      setError('Complete gerencia, área y motivo.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        gerencia_id: Number(form.gerencia_id),
        area_id: Number(form.area_id),
        motivo: form.motivo,
        descripcion: form.descripcion.trim(),
        solicitante_nombre: form.solicitante_nombre.trim(),
        empresa_web: form.empresa_web,
      };
      const res = await ticketsService.crear(payload);
      if (res.success && res.data?.codigo) {
        setExito(res.data);
        setForm(estadoInicial);
      } else {
        setError(res.message || 'No se pudo enviar la solicitud.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const onConsultar = async (e) => {
    e.preventDefault();
    setConsultaError('');
    setConsultaResultado(null);
    const codigo = consultaCodigo.trim().toUpperCase();
    if (!codigo) {
      setConsultaError('Ingrese el código del ticket.');
      return;
    }
    setConsultando(true);
    try {
      const res = await ticketsService.consultar(codigo);
      if (res.success) {
        setConsultaResultado(res.data);
      } else {
        setConsultaError(res.message || 'No encontrado.');
      }
    } catch (err) {
      setConsultaError(err.response?.data?.message || 'No se pudo consultar.');
    } finally {
      setConsultando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg space-y-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-cyan-500/20 border border-cyan-400/30 p-4 rounded-2xl mb-4">
              <Headset className="text-cyan-300" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Solicitar soporte</h1>
            <p className="text-slate-400 text-sm text-center mt-2">
              Sin cuenta. Elija gerencia, área y el motivo. Guarde el código al finalizar.
            </p>
          </div>

          {exito ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
              <p className="text-white font-semibold">Solicitud registrada</p>
              <p className="text-cyan-300 text-3xl font-black tracking-widest">{exito.codigo}</p>
              <p className="text-slate-400 text-sm">Anote este código para consultar el estado.</p>
              <button
                type="button"
                onClick={() => setExito(null)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="gerencia_id" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Gerencia
                </label>
                <select
                  id="gerencia_id"
                  name="gerencia_id"
                  value={form.gerencia_id}
                  onChange={onChange}
                  disabled={cargandoCat}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  required
                >
                  <option value="" className="bg-slate-900">Seleccione gerencia…</option>
                  {catalogo.gerencias.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-900">{g.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="area_id" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Área
                </label>
                <select
                  id="area_id"
                  name="area_id"
                  value={form.area_id}
                  onChange={onChange}
                  disabled={!form.gerencia_id}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm disabled:opacity-40"
                  required
                >
                  <option value="" className="bg-slate-900">
                    {form.gerencia_id ? 'Seleccione área…' : 'Primero elija gerencia'}
                  </option>
                  {areasFiltradas.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900">{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="motivo" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Motivo
                </label>
                <select
                  id="motivo"
                  name="motivo"
                  value={form.motivo}
                  onChange={onChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  required
                >
                  <option value="" className="bg-slate-900">Seleccione motivo…</option>
                  {catalogo.motivos.map((m) => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="solicitante_nombre" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Su nombre <span className="normal-case tracking-normal text-slate-500">(opcional)</span>
                </label>
                <input
                  id="solicitante_nombre"
                  name="solicitante_nombre"
                  value={form.solicitante_nombre}
                  onChange={onChange}
                  maxLength={120}
                  placeholder="Ej. María"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                  Detalle <span className="normal-case tracking-normal text-slate-500">(opcional)</span>
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={form.descripcion}
                  onChange={onChange}
                  maxLength={500}
                  rows={3}
                  placeholder="Breve descripción del problema…"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none"
                />
              </div>

              {/* Honeypot: oculto para usuarios */}
              <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="empresa_web">Empresa web</label>
                <input
                  id="empresa_web"
                  name="empresa_web"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.empresa_web}
                  onChange={onChange}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cargandoCat}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-900 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
              >
                {loading ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-xs mt-6">
            <Link to="/login" className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors">
              <Monitor size={12} /> Acceso personal TI
            </Link>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
          <h2 className="text-white font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
            <Search size={16} className="text-cyan-400" /> Consultar estado
          </h2>
          <form onSubmit={onConsultar} className="flex gap-2">
            <input
              value={consultaCodigo}
              onChange={(e) => setConsultaCodigo(e.target.value)}
              placeholder="TK-2026-0001"
              className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm uppercase"
            />
            <button
              type="submit"
              disabled={consultando}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-xl"
            >
              Ver
            </button>
          </form>
          {consultaError && <p className="text-red-400 text-sm mt-3">{consultaError}</p>}
          {consultaResultado && (
            <div className="mt-3 text-sm text-slate-300 space-y-1 border-t border-white/10 pt-3">
              <p><span className="text-slate-500">Código:</span> {consultaResultado.codigo}</p>
              <p><span className="text-slate-500">Estado:</span> {consultaResultado.estado}</p>
              <p><span className="text-slate-500">Motivo:</span> {consultaResultado.motivo}</p>
              <p><span className="text-slate-500">Área:</span> {consultaResultado.area} · {consultaResultado.gerencia}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
