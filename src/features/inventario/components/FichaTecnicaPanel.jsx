import React, { useEffect, useState } from 'react';
import {
  Save, FileText, Cpu, HardDrive, Monitor, Wifi, Key, Package, ClipboardCheck, Brain
} from 'lucide-react';
import { downloadPdf } from '../../../lib/api';
import { fichaTecnicaService } from '../services/fichaTecnicaService';
import { mlService } from '../../ml/services/mlService';
import { RiesgoBadge } from '../../ml/components/RiesgoBadge';

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
      {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white';
const selectCls = `${inputCls} bg-white`;

const TECHNICAL_TYPES = ['CPU', 'Laptop', 'PC'];

const estadoBadge = (tipo, valor) => {
  const map = {
    conservacion: {
      Nuevo: 'bg-emerald-100 text-emerald-700',
      Bueno: 'bg-blue-100 text-blue-700',
      Regular: 'bg-amber-100 text-amber-700',
      Malo: 'bg-red-100 text-red-700',
    },
    operativo: {
      Operativo: 'bg-emerald-100 text-emerald-700',
      'Dañado': 'bg-orange-100 text-orange-700',
      Excedencia: 'bg-slate-200 text-slate-600',
      Baja: 'bg-red-100 text-red-700',
    },
  };
  const cls = map[tipo]?.[valor] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${cls}`}>
      {valor || '—'}
    </span>
  );
};

const buildFormState = (data) => ({
  procesador: data.procesador || '',
  sistema_operativo: data.sistema_operativo || '',
  licencia_so: data.licencia_so || '',
  mac_address: data.mac_address || '',
  ip_asignada: data.ip_asignada || '',
  software_base: data.software_base || '',
  ram_gb: data.ram_gb || '',
  almacenamiento_gb: data.almacenamiento_gb || '',
  tipo_disco: data.tipo_disco || 'SSD',
  estado_conservacion: data.estado_conservacion || 'Bueno',
  estado_operativo: data.estado_operativo || 'Operativo',
  observaciones_evaluacion: data.observaciones_evaluacion || '',
});

export const FichaTecnicaPanel = ({ equipoId, onClose, showHeader = true }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [riesgo, setRiesgo] = useState(null);

  const isTechnical = data
    ? TECHNICAL_TYPES.some((t) => data.tipo_equipo?.toLowerCase().includes(t.toLowerCase()))
    : false;

  const loadRiesgo = async (id) => {
    try {
      const res = await mlService.getRiesgoEquipo(id);
      if (res.success) setRiesgo(res.data);
    } catch {
      setRiesgo(null);
    }
  };

  const loadFicha = async () => {
    setLoading(true);
    setError('');
    setRiesgo(null);
    try {
      const res = await fichaTecnicaService.getFicha(equipoId);
      if (res.success) {
        setData(res.data);
        setForm(buildFormState(res.data));
        loadRiesgo(equipoId);
      } else {
        setError(res.message || 'No se pudo cargar la ficha.');
      }
    } catch {
      setError('Error al cargar la ficha técnica.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipoId) loadFicha();
  }, [equipoId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fichaTecnicaService.saveFicha(equipoId, form);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await loadFicha();
      } else {
        alert(res.message);
      }
    } catch {
      alert('Error al guardar la ficha.');
    } finally {
      setSaving(false);
    }
  };

  const handlePDF = async () => {
    try {
      await downloadPdf(`/reportes/equipo/${equipoId}`);
    } catch {
      alert('No se pudo generar el PDF.');
    }
  };

  if (loading) {
    return <p className="text-center text-slate-400 py-16">Cargando ficha técnica...</p>;
  }

  if (error || !data) {
    return <p className="text-center text-red-500 py-16">{error || 'Equipo no encontrado.'}</p>;
  }

  return (
    <div className={showHeader ? '' : 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'}>
      {showHeader && (
        <div className="px-6 py-4 border-b flex flex-wrap justify-between items-center gap-3 bg-gradient-to-r from-slate-800 to-blue-900 text-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold">Ficha Técnica</h2>
            <p className="text-xs text-blue-200 mt-0.5">
              {data.tipo_equipo} · {data.marca} {data.modelo} ·{' '}
              <span className="font-mono">{data.codigo_patrimonial}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePDF}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
            >
              <FileText size={14} /> PDF
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="text-white/70 hover:text-white text-sm px-2">
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Evaluación del estado — resumen visual */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-blue-500" /> Evaluación del Estado
          </h3>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Conservación</p>
              {estadoBadge('conservacion', form.estado_conservacion)}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Operativo</p>
              {estadoBadge('operativo', form.estado_operativo)}
            </div>
            {data.fecha_evaluacion && (
              <div className="text-xs text-slate-500 ml-auto">
                Última evaluación:{' '}
                {new Date(data.fecha_evaluacion).toLocaleString('es-PE')}
              </div>
            )}
          </div>
        </div>

        {/* Datos generales */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
            <Monitor size={16} className="text-blue-500" /> Información del Equipo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
            {[
              ['Cód. Patrimonial', data.codigo_patrimonial],
              ['Cód. Identificativo', data.codigo_identificativo || '—'],
              ['Tipo', data.tipo_equipo],
              ['Marca / Modelo', `${data.marca || '—'} / ${data.modelo || '—'}`],
              ['N° Serie', data.numero_serie || '—'],
              ['Área', data.area_nombre || '—'],
              ['Responsable', data.responsable_nombre || '—'],
              ['Ubicación', data.ubicacion_fisica || '—'],
              ['Costo estimado', data.costo_estimado ? `S/ ${data.costo_estimado}` : '—'],
              ['Fecha adquisición', data.fecha_adquisicion ? new Date(data.fecha_adquisicion).toLocaleDateString('es-PE') : '—'],
              ['Registrado', data.fecha_registro ? new Date(data.fecha_registro).toLocaleDateString('es-PE') : '—'],
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-400">{k}</p>
                <p className="font-medium text-slate-700 truncate">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {isTechnical ? (
          <>
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                <Cpu size={16} className="text-blue-500" /> Hardware
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Procesador" icon={Cpu}>
                  <input name="procesador" value={form.procesador} onChange={handleChange} className={inputCls} placeholder="Ej: Intel Core i7-12700" />
                </Field>
                <Field label="Memoria RAM (GB)" icon={HardDrive}>
                  <input type="number" name="ram_gb" value={form.ram_gb} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Almacenamiento (GB)" icon={HardDrive}>
                  <div className="flex gap-2">
                    <input type="number" name="almacenamiento_gb" value={form.almacenamiento_gb} onChange={handleChange} className="w-20 px-2 py-2 border border-slate-200 rounded-lg outline-none text-sm" />
                    <select name="tipo_disco" value={form.tipo_disco} onChange={handleChange} className="flex-1 px-2 py-2 border border-slate-200 rounded-lg bg-white text-sm outline-none">
                      <option>SSD</option><option>NVMe</option><option>HDD</option>
                    </select>
                  </div>
                </Field>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                <Monitor size={16} className="text-blue-500" /> Software
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Sistema Operativo" icon={Monitor}>
                  <select name="sistema_operativo" value={form.sistema_operativo} onChange={handleChange} className={selectCls}>
                    <option value="">— Sin SO —</option>
                    <option>Windows 7</option><option>Windows 8</option>
                    <option>Windows 8.1</option><option>Windows 10</option><option>Windows 11</option>
                    <option>Linux</option><option>macOS</option>
                  </select>
                </Field>
                <Field label="Licencia SO" icon={Key}>
                  <input name="licencia_so" value={form.licencia_so} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Software Instalado" icon={Package}>
                  <textarea name="software_base" value={form.software_base} onChange={handleChange} rows={3} className={inputCls} placeholder="Office, Antivirus..." />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                <Wifi size={16} className="text-blue-500" /> Red
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Dirección MAC" icon={Wifi}>
                  <input name="mac_address" value={form.mac_address} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="IP Asignada" icon={Wifi}>
                  <input name="ip_asignada" value={form.ip_asignada} onChange={handleChange} className={inputCls} />
                </Field>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-500">
            Las especificaciones de hardware/software no aplican para equipos tipo{' '}
            <strong className="text-slate-700">{data.tipo_equipo}</strong>.
          </div>
        )}

        {riesgo && (
          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Brain size={16} className="text-violet-600" /> Evaluación predictiva
            </h3>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <RiesgoBadge nivel={riesgo.nivel_riesgo} score={riesgo.score_riesgo} />
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-800">
                  {Number(riesgo.score_riesgo).toFixed(1)}
                </span>
                <span className="text-slate-400"> / 100</span>
                {riesgo.modelo_version && (
                  <span className="ml-2 text-xs text-slate-400">modelo {riesgo.modelo_version}</span>
                )}
              </div>
            </div>
            {Array.isArray(riesgo.factores) && riesgo.factores.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Factores principales
                </p>
                <ul className="space-y-1">
                  {riesgo.factores.slice(0, 5).map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 flex justify-between gap-4">
                      <span>{f.feature || f.nombre || `Factor ${i + 1}`}</span>
                      <span className="font-mono text-slate-500">
                        {f.importancia != null ? Number(f.importancia).toFixed(2) : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3">
              Recomendación: priorice mantenimiento preventivo si el nivel es Alto o Crítico.
            </p>
          </div>
        )}

        {/* Estado editable + observaciones */}
        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-blue-500" /> Registrar Evaluación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Estado de Conservación">
              <select name="estado_conservacion" value={form.estado_conservacion} onChange={handleChange} className={selectCls}>
                <option>Nuevo</option><option>Bueno</option><option>Regular</option><option>Malo</option>
              </select>
            </Field>
            <Field label="Estado Operativo">
              <select name="estado_operativo" value={form.estado_operativo} onChange={handleChange} className={selectCls}>
                <option>Operativo</option><option>Dañado</option><option>Excedencia</option><option>Baja</option>
              </select>
            </Field>
          </div>
          <Field label="Observaciones de la evaluación" icon={ClipboardCheck}>
            <textarea
              name="observaciones_evaluacion"
              value={form.observaciones_evaluacion}
              onChange={handleChange}
              rows={4}
              className={inputCls}
              placeholder="Describa el estado físico, fallas detectadas, recomendaciones de mantenimiento o baja..."
            />
          </Field>
        </div>
      </div>

      <div className="px-6 py-4 border-t bg-slate-50 flex flex-wrap justify-between items-center gap-3 rounded-b-2xl">
        <span className={`text-sm font-medium ${saved ? 'text-emerald-600' : 'text-transparent'}`}>
          ✓ Evaluación guardada correctamente
        </span>
        <div className="flex gap-3">
          {!showHeader && (
            <button type="button" onClick={handlePDF} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-white">
              <FileText size={15} /> Descargar PDF
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg font-medium"
          >
            <Save size={15} />
            {saving ? 'Guardando...' : 'Guardar Evaluación'}
          </button>
        </div>
      </div>
    </div>
  );
};
