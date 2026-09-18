import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, AlertTriangle, Building2, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { cronogramaService } from '../services/cronogramaService';
import { CronogramaPersonalPanel } from './CronogramaPersonalPanel';
import { CronogramaCantidadPopover } from './CronogramaCantidadPopover';
import {
  puedeEscribirCronograma,
  diasLaborablesDelMes,
  esHoy,
  letraDiaSemana,
  mapaCeldas,
  maxCantidadDia,
  codigoCantidad,
  computadorasFila,
  programadosFila,
  subtotalFila,
  totalesDeFilas,
  debeMostrarBandaGerencia,
  etiquetaGerencia,
} from '../utils/cronogramaUtils';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const CronogramaMatrizPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const puedeEscribir = puedeEscribirCronograma(user?.rol);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mes, setMes] = useState(null);
  const [busyKey, setBusyKey] = useState('');
  const [exportando, setExportando] = useState(false);
  const [picker, setPicker] = useState(null);
  const [guardandoPersonal, setGuardandoPersonal] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await cronogramaService.getMatriz(id);
      if (res.success) {
        setData(res.data);
        return res.data;
      }
      setError(res.message || 'No se encontró el cronograma.');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar la matriz.');
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    setMes(null);
    cargar();
  }, [id]);

  useEffect(() => {
    if (mes !== null || !data?.cronograma) return;
    const anioDoc = Number(data.cronograma.anio);
    const now = new Date();
    setMes(anioDoc === now.getFullYear() ? now.getMonth() + 1 : 1);
  }, [data, mes]);

  const anio = Number(data?.cronograma?.anio) || new Date().getFullYear();
  const dias = useMemo(() => (mes ? diasLaborablesDelMes(anio, mes) : []), [anio, mes]);
  const totales = data?.totales || totalesDeFilas(data?.filas || []);

  const guardarCantidad = async (fila, fecha, cantidad) => {
    const key = `${fila.area_id}|${fecha}`;
    setBusyKey(key);
    try {
      await cronogramaService.marcarCelda(id, {
        area_id: fila.area_id,
        fecha,
        cantidad,
      });
      setPicker(null);
      await cargar();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo programar.');
    } finally {
      setBusyKey('');
    }
  };

  const handleCelda = (fila, fecha, ocupada) => {
    if (busyKey) return;
    const max = maxCantidadDia(fila, fecha);
    if (!ocupada && !puedeEscribir) return;
    if (!ocupada && max === 0) {
      alert('Ya programó todos los PC/laptop de esta área. Reduzca la cantidad en otro día o libere uno.');
      return;
    }
    if (!ocupada && max === 1 && puedeEscribir) {
      guardarCantidad(fila, fecha, 1);
      return;
    }
    setPicker({ fila, fecha, ocupada, max });
  };

  const handlePick = (n) => {
    if (!picker) return;
    guardarCantidad(picker.fila, picker.fecha, n);
  };

  const handleLiberar = async () => {
    if (!picker) return;
    if (!window.confirm('¿Liberar este día?')) return;
    if (picker.ocupada?.id) {
      setBusyKey(`${picker.fila.area_id}|${picker.fecha}`);
      try {
        await cronogramaService.liberarCelda(id, picker.ocupada.id);
        setPicker(null);
        await cargar();
      } catch (err) {
        alert(err.response?.data?.message || 'No se pudo liberar.');
      } finally {
        setBusyKey('');
      }
      return;
    }
    guardarCantidad(picker.fila, picker.fecha, 0);
  };

  const handleGuardarPersonal = async (personal) => {
    setGuardandoPersonal(true);
    try {
      await cronogramaService.guardarPersonal(id, personal);
      await cargar();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo guardar el equipo de trabajo.');
    } finally {
      setGuardandoPersonal(false);
    }
  };

  const handlePdf = async () => {
    setExportando(true);
    try {
      await cronogramaService.exportarPdf(id);
    } catch (err) {
      alert(err.message || 'No se pudo generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <p className="text-red-600 text-sm font-medium">{error}</p>
        <Link to="/v2/cronograma" className="text-sm font-bold text-[#00a8cc] mt-4 inline-block">Volver al historial</Link>
      </div>
    );
  }

  const cobertura = data?.cobertura || [];
  const filas = data.filas || [];
  const areasConParque = filas.filter((f) => computadorasFila(f) > 0).length;
  const areasCubiertas = Math.max(0, areasConParque - cobertura.length);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-[#1a1d23] text-white px-6 py-5 shadow-lg">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#00a8cc]/15" />
        <div className="relative flex flex-wrap justify-between gap-4">
          <div>
            <Link to="/v2/cronograma" className="text-[11px] font-black uppercase tracking-widest text-[#00a8cc] hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft size={14} /> Historial
            </Link>
            <h2 className="text-2xl font-black tracking-tight">{data.cronograma.nombre}</h2>
            <p className="text-sm text-slate-300 mt-1">
              Año {data.cronograma.anio} · Xn = PCs/laptops de ese día
              {puedeEscribir ? ' · Clic en un día para elegir X1, X2, X3…' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setMes((m) => Math.max(1, (m || 1) - 1))}
                  className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft size={18} className="mx-auto" />
                </button>
                <span className="min-w-[92px] text-center text-sm font-black">{mes ? `${MESES[mes - 1]} ${anio}` : '…'}</span>
                <button
                  type="button"
                  onClick={() => setMes((m) => Math.min(12, (m || 1) + 1))}
                  className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10 hover:text-white"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight size={18} className="mx-auto" />
                </button>
              </div>
              {anio === new Date().getFullYear() && mes !== new Date().getMonth() + 1 && (
                <button
                  type="button"
                  onClick={() => setMes(new Date().getMonth() + 1)}
                  className="h-8 px-3 rounded-full text-[11px] font-bold bg-[#00a8cc]/20 text-[#7ee7ff] hover:bg-[#00a8cc]/30"
                >
                  Hoy
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handlePdf}
              disabled={exportando}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-[#00a8cc] hover:bg-[#008fb0] text-white shadow-lg shadow-cyan-900/30"
            >
              <FileText size={16} /> {exportando ? 'Generando...' : 'Imprimir PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Áreas con parque</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{areasConParque}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
            <Building2 size={20} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cubiertas</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{areasCubiertas}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pendientes</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{cobertura.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {cobertura.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <p className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} /> {cobertura.length === 1 ? '1 área con PC/laptop aún no cubierto' : `${cobertura.length} áreas con PC/laptop aún no cubiertos`}
          </p>
          <div className="flex flex-wrap gap-2">
            {cobertura.map((c) => (
              <span key={c.area_id} className="rounded-full bg-white border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
                {c.area} · {c.programados}/{c.computadoras}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-6 rounded bg-[#00a8cc]" /> Día marcado (Xn)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-6 rounded bg-slate-100 ring-1 ring-inset ring-[#00a8cc]/40" /> Hoy
          </span>
          <span className="text-slate-400">Lunes a viernes · {data.cronograma.anio}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse min-w-max">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-20 bg-slate-50 border-b border-r border-slate-200 px-3 py-2.5 text-left min-w-[200px] text-[10px] font-black uppercase tracking-wider text-slate-500">Área</th>
                <th className="sticky left-[200px] z-20 bg-slate-50 border-b border-r border-slate-200 px-2 py-2.5 w-11 text-[10px] font-black uppercase text-slate-500">PC</th>
                <th className="sticky left-[244px] z-20 bg-slate-50 border-b border-r border-slate-200 px-2 py-2.5 w-11 text-[10px] font-black uppercase text-slate-500">Lap</th>
                <th className="sticky left-[288px] z-20 bg-slate-50 border-b border-r border-slate-200 px-2 py-2.5 w-11 text-[10px] font-black uppercase text-slate-500">Imp</th>
                <th className="sticky left-[332px] z-20 bg-slate-50 border-b border-r border-slate-200 px-2 py-2.5 w-12 text-[10px] font-black uppercase text-slate-500">Tot</th>
                {dias.map((dia) => {
                  const today = esHoy(dia);
                  return (
                    <th
                      key={dia}
                      className={`border-b border-l border-slate-100 px-0 py-1.5 text-center min-w-[28px] ${
                        today ? 'bg-[#00a8cc]/10 text-[#007a94]' : 'text-slate-500'
                      }`}
                    >
                      <span className="block text-[9px] font-bold uppercase tracking-wide opacity-70">{letraDiaSemana(dia)}</span>
                      <span className="block text-xs font-black leading-none mt-0.5">{Number(dia.slice(-2))}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, index) => {
                const map = mapaCeldas(fila.celdas);
                const sub = fila.subtotal ?? subtotalFila(fila);
                const comps = computadorasFila(fila);
                const prog = programadosFila(fila);
                const pct = comps > 0 ? Math.min(100, (prog / comps) * 100) : 0;
                const cubierto = comps > 0 && prog >= comps;
                const colSpan = 5 + dias.length;
                return (
                  <React.Fragment key={fila.area_id}>
                    {debeMostrarBandaGerencia(filas, index) && (
                      <tr>
                        <td
                          colSpan={colSpan}
                          className="sticky left-0 z-10 bg-slate-200 border-b border-slate-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700"
                        >
                          {etiquetaGerencia(fila)}
                        </td>
                      </tr>
                    )}
                    <tr className="group">
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-100 px-3 py-2 font-medium text-slate-700 whitespace-nowrap">
                      <div>{fila.area}</div>
                      {comps > 0 && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full rounded-full ${cubierto ? 'bg-emerald-500' : 'bg-[#00a8cc]'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-[9px] font-bold ${cubierto ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {prog}/{comps}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="sticky left-[200px] z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-100 px-2 py-2 text-center text-slate-600">{fila.pc}</td>
                    <td className="sticky left-[244px] z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-100 px-2 py-2 text-center text-slate-600">{fila.laptop}</td>
                    <td className="sticky left-[288px] z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-100 px-2 py-2 text-center text-slate-600">{fila.impresora}</td>
                    <td className="sticky left-[332px] z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-100 px-2 py-2 text-center font-bold text-slate-800">{sub}</td>
                    {dias.map((dia) => {
                      const ocupada = map[dia];
                      const today = esHoy(dia);
                      const marca = ocupada ? codigoCantidad(ocupada.cantidad) : '';
                      const busy = busyKey === `${fila.area_id}|${dia}`;
                      return (
                        <td
                          key={`${fila.area_id}-${dia}`}
                          className={`border-b border-l border-slate-100 p-[2px] ${
                            today ? 'bg-[#00a8cc]/5' : 'bg-white group-hover:bg-slate-50/80'
                          }`}
                        >
                          <button
                            type="button"
                            disabled={!puedeEscribir && !ocupada}
                            title={`${fila.area} · ${dia}${marca ? ` · ${marca}` : ''}`}
                            aria-label={`${fila.area}, ${dia}${marca ? `, ${marca}` : ', libre'}`}
                            onClick={() => handleCelda(fila, dia, ocupada)}
                            className={`w-[28px] h-8 rounded-lg text-[10px] font-black transition-all ${
                              ocupada
                                ? 'bg-[#00a8cc] text-white shadow-sm hover:bg-[#008fb0]'
                                : puedeEscribir
                                  ? 'text-slate-200 hover:bg-[#00a8cc]/15 hover:text-[#00a8cc]'
                                  : 'cursor-default text-slate-200'
                            } ${busy ? 'opacity-50' : ''}`}
                          >
                            {ocupada ? marca : '·'}
                          </button>
                        </td>
                      );
                    })}
                      </tr>
                    </React.Fragment>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td className="sticky left-0 z-10 bg-slate-50 border-t border-r border-slate-200 px-3 py-2.5 text-slate-600">Subtotal</td>
                <td className="sticky left-[200px] z-10 bg-slate-50 border-t border-r border-slate-200 px-2 py-2.5 text-center">{totales.pc}</td>
                <td className="sticky left-[244px] z-10 bg-slate-50 border-t border-r border-slate-200 px-2 py-2.5 text-center">{totales.laptop}</td>
                <td className="sticky left-[288px] z-10 bg-slate-50 border-t border-r border-slate-200 px-2 py-2.5 text-center">{totales.impresora}</td>
                <td className="sticky left-[332px] z-10 bg-slate-50 border-t border-r border-slate-200 px-2 py-2.5 text-center">{totales.subtotal}</td>
                <td className="border-t border-slate-200" colSpan={dias.length} />
              </tr>
              <tr className="bg-[#1a1d23] text-white font-bold">
                <td className="sticky left-0 z-10 bg-[#1a1d23] border-t border-r border-slate-800 px-3 py-2.5">Total equipos</td>
                <td className="sticky left-[200px] z-10 bg-[#1a1d23] border-t border-r border-slate-800 px-2 py-2.5 text-center text-slate-400">—</td>
                <td className="sticky left-[244px] z-10 bg-[#1a1d23] border-t border-r border-slate-800 px-2 py-2.5 text-center text-slate-400">—</td>
                <td className="sticky left-[288px] z-10 bg-[#1a1d23] border-t border-r border-slate-800 px-2 py-2.5 text-center text-slate-400">—</td>
                <td className="sticky left-[332px] z-10 bg-[#1a1d23] border-t border-r border-slate-800 px-2 py-2.5 text-center text-[#00a8cc]">{totales.total}</td>
                <td className="border-t border-slate-800" colSpan={dias.length} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <CronogramaPersonalPanel
        personal={data.personal || []}
        puedeEscribir={puedeEscribir}
        guardando={guardandoPersonal}
        onSave={handleGuardarPersonal}
      />

      {picker && (
        <CronogramaCantidadPopover
          areaNombre={picker.fila.area}
          fecha={picker.fecha}
          ocupada={picker.ocupada}
          max={picker.max}
          programados={programadosFila(picker.fila)}
          computadoras={computadorasFila(picker.fila)}
          puedeEscribir={puedeEscribir}
          busy={Boolean(busyKey)}
          onPick={handlePick}
          onLiberar={handleLiberar}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
};
