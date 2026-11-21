import React, {
  Children, cloneElement, isValidElement, useEffect, useId, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Save, FileText, Cpu, HardDrive, Monitor, Wifi, Key, Package, ClipboardCheck, Brain,
  ImagePlus, Replace, X, History,
} from 'lucide-react';
import { downloadPdf } from '../../../lib/api';
import { API_BASE_URL } from '../../../constants/config';
import { fichaTecnicaService } from '../services/fichaTecnicaService';
import { mlService } from '../../ml/services/mlService';
import { RiesgoBadge } from '../../ml/components/RiesgoBadge';

const FICHAS_UPLOADS_URL = API_BASE_URL.replace(/\/api\/v2\/?$/, '/uploads/fichas_tecnicas');

function urlImagenFicha(fileName) {
  if (!fileName) return null;
  return `${FICHAS_UPLOADS_URL}/${encodeURIComponent(fileName)}`;
}

function withFieldId(node, id) {
  if (!isValidElement(node)) return node;
  if (node.type === 'input' || node.type === 'select' || node.type === 'textarea') {
    return node.props.id ? node : cloneElement(node, { id });
  }
  const child = node.props?.children;
  if (child == null) return node;
  let tagged = false;
  const next = Children.map(child, (item) => {
    if (tagged) return item;
    const updated = withFieldId(item, id);
    if (updated !== item) tagged = true;
    return updated;
  });
  return tagged ? cloneElement(node, {}, next) : node;
}

const Field = ({ label, icon: Icon, children }) => {
  const fieldId = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon size={12} />} {label}
      </label>
      {Children.map(children, (child) => withFieldId(child, fieldId))}
    </div>
  );
};

Field.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.elementType,
  children: PropTypes.node,
};

const ImageUploadField = ({ name, label, currentName, file, onFileChange, onClear }) => {
  const fieldId = useId();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => {
          if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
        };
      }
      setPreview(null);
      return undefined;
    }
    setPreview(urlImagenFicha(currentName));
    return undefined;
  }, [file, currentName]);

  const displayName = file?.name || currentName || '';
  const hasImage = Boolean(preview);

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        <ImagePlus size={12} /> {label}
      </label>
      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        name={name}
        accept="image/jpeg,image/png"
        onChange={onFileChange}
        className="sr-only"
      />
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          hasImage
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
        }`}
      >
        {hasImage ? (
          <div className="relative aspect-[4/3] bg-slate-100">
            <img
              src={preview}
              alt={displayName || label}
              className="absolute inset-0 h-full w-full object-contain p-2"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-slate-900/70 to-transparent p-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-white"
              >
                <Replace size={14} /> Cambiar
              </button>
              {file && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-white"
                >
                  <X size={14} /> Quitar
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <ImagePlus size={22} />
            </span>
            <span className="text-sm font-medium text-slate-700">Agregar imagen</span>
            <span className="text-xs text-slate-400">JPG o PNG · clic para seleccionar</span>
          </button>
        )}
      </div>
      {displayName && (
        <p className="truncate text-xs text-slate-500" title={displayName}>
          {file ? `Nueva: ${file.name}` : `Imagen actual: ${currentName}`}
        </p>
      )}
    </div>
  );
};

ImageUploadField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  currentName: PropTypes.string,
  file: PropTypes.object,
  onFileChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white';
const selectCls = `${inputCls} bg-white`;

const TECHNICAL_TYPES = ['CPU', 'Laptop', 'PC'];
const CAMPOS_COMPUTO = [
  'procesador', 'sistema_operativo', 'licencia_so', 'mac_address', 'ip_asignada',
  'software_base', 'ram_gb', 'almacenamiento_gb', 'tipo_disco',
];
const RESULTADOS_EVALUACION = [
  'Puede continuar en servicio',
  'Requiere mantenimiento',
  'Requiere reparación',
  'Técnicamente no resulta ser utilizado',
  'Se recomienda retirar del servicio',
];

const fechaParaInput = (valor) => (valor ? String(valor).slice(0, 10) : '');

const ETIQUETAS_HISTORIAL = {
  numero_ficha: 'N° de orden',
  fecha_evaluacion: 'Fecha',
  procesador: 'Procesador',
  sistema_operativo: 'Sistema operativo',
  licencia_so: 'Licencia SO',
  mac_address: 'Dirección MAC',
  ip_asignada: 'IP asignada',
  software_base: 'Software instalado',
  diagnostico: 'Diagnóstico',
  conclusion_motivo: 'Conclusión',
  funcionamiento: 'Funcionamiento',
  obsolescencia_tecnologica: 'Obsolescencia tecnológica',
  repuestos_disponibles: 'Repuestos disponibles',
  resultado_evaluacion: 'Resultado de la evaluación',
  imagen_1: 'Imagen 1',
  imagen_2: 'Imagen 2',
  ram_gb: 'Memoria RAM (GB)',
  almacenamiento_gb: 'Almacenamiento (GB)',
  tipo_disco: 'Tipo de disco',
  estado_conservacion: 'Estado físico',
  estado_operativo: 'Estado operativo',
};

const textoCambio = (valor) => (valor ? valor : 'vacío');

const fechaHistoria = (valor) => {
  if (!valor) return '';
  const fecha = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
};

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
      'ESTADO DE EXCEDENCIA': 'bg-slate-200 text-slate-600',
      'ESTADO DE CHATARRA': 'bg-red-100 text-red-700',
      'MANTENIMIENTO O REPARACION': 'bg-blue-100 text-blue-700',
      ONEROSA: 'bg-amber-100 text-amber-700',
      'OBSOLESCENCIA TECNICA': 'bg-rose-100 text-rose-700',
      RAEE: 'bg-slate-300 text-slate-700',
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
  tipo_disco: data.tipo_disco || '',
  estado_conservacion: data.estado_conservacion || 'Bueno',
  estado_operativo: data.estado_operativo || '',
  diagnostico: data.diagnostico || data.observaciones_evaluacion || '',
  conclusion_motivo: data.conclusion_motivo || '',
  numero_ficha: data.numero_ficha || '',
  fecha_evaluacion: fechaParaInput(data.fecha_evaluacion),
  funcionamiento: data.funcionamiento || '',
  obsolescencia_tecnologica: data.obsolescencia_tecnologica || '',
  repuestos_disponibles: data.repuestos_disponibles || '',
  resultado_evaluacion: data.resultado_evaluacion || '',
  imagen_1: data.imagen_1 || '',
  imagen_2: data.imagen_2 || '',
});

export const FichaTecnicaPanel = ({ equipoId, onClose, showHeader = true }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({ imagen_1: null, imagen_2: null });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [riesgo, setRiesgo] = useState(null);
  const [historial, setHistorial] = useState([]);

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
        try {
          const hist = await fichaTecnicaService.getHistorial(equipoId);
          setHistorial(hist.success && Array.isArray(hist.data) ? hist.data : []);
        } catch {
          setHistorial([]);
        }
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

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const nextFile = fileList?.[0] ?? null;
    setFiles((prev) => ({ ...prev, [name]: nextFile }));
    if (nextFile) {
      setForm((prev) => ({ ...prev, [name]: nextFile.name }));
    }
    e.target.value = '';
  };

  const handleClearImage = (name) => {
    setFiles((prev) => ({ ...prev, [name]: null }));
    setForm((prev) => ({
      ...prev,
      [name]: data?.[name] || '',
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (['imagen_1', 'imagen_2'].includes(key)) {
        return;
      }
      if (!isTechnical && CAMPOS_COMPUTO.includes(key)) {
        return;
      }
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    if (files.imagen_1) formData.append('imagen_1', files.imagen_1);
    if (files.imagen_2) formData.append('imagen_2', files.imagen_2);

    try {
      const res = await fichaTecnicaService.saveFicha(equipoId, formData, true);
      if (res.success) {
        setSaved(true);
        setFiles({ imagen_1: null, imagen_2: null });
        setTimeout(() => setSaved(false), 3000);
        await loadFicha();
      } else {
        setError(res.message || 'No se pudo guardar la ficha.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la ficha.');
    } finally {
      setSaving(false);
    }
  };

  const handlePDF = async () => {
    try {
      await downloadPdf(`/reportes/equipo/${equipoId}`);
    } catch (err) {
      alert(err.message || 'No se pudo generar el PDF.');
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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        )}
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
            {form.resultado_evaluacion && (
              <div className="text-xs text-slate-500 ml-auto">
                Resultado: {form.resultado_evaluacion}
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
                      <option value="">Seleccione</option>
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
        ) : null}

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
            <Field label="N° de orden">
              <input
                name="numero_ficha"
                value={form.numero_ficha}
                onChange={handleChange}
                className={inputCls}
                placeholder="Ej: 51 o N° 51"
              />
            </Field>
            <Field label="Fecha">
              <input
                type="date"
                name="fecha_evaluacion"
                value={form.fecha_evaluacion}
                onChange={handleChange}
                className={inputCls}
              />
            </Field>
            <Field label="Estado físico">
              <select name="estado_conservacion" value={form.estado_conservacion} onChange={handleChange} className={selectCls}>
                <option>Nuevo</option><option>Bueno</option><option>Regular</option><option>Malo</option>
              </select>
            </Field>
            <Field label="Funcionamiento">
              <select name="funcionamiento" value={form.funcionamiento} onChange={handleChange} className={selectCls}>
                <option value="">Seleccione</option>
                <option>Sin fallas</option>
                <option>Con fallas</option>
              </select>
            </Field>
            <Field label="Obsolescencia tecnológica">
              <select name="obsolescencia_tecnologica" value={form.obsolescencia_tecnologica} onChange={handleChange} className={selectCls}>
                <option value="">Seleccione</option>
                <option>Si</option>
                <option>No</option>
              </select>
            </Field>
            <Field label="Repuestos disponibles">
              <select name="repuestos_disponibles" value={form.repuestos_disponibles} onChange={handleChange} className={selectCls}>
                <option value="">Seleccione</option>
                <option>Si</option>
                <option>No</option>
              </select>
            </Field>
            <Field label="Resultado de la evaluación">
              <select name="resultado_evaluacion" value={form.resultado_evaluacion} onChange={handleChange} className={selectCls}>
                <option value="">Seleccione</option>
                {RESULTADOS_EVALUACION.map((opcion) => (
                  <option key={opcion}>{opcion}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Diagnóstico" icon={ClipboardCheck}>
            <textarea
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              rows={4}
              className={inputCls}
              placeholder="Describa el diagnóstico del equipo, fallas detectadas y observaciones técnicas."
            />
          </Field>
          <Field label="Conclusión y/o Motivo">
            <textarea
              name="conclusion_motivo"
              value={form.conclusion_motivo}
              onChange={handleChange}
              rows={3}
              className={inputCls}
              placeholder="Registre la conclusión o motivo de la evaluación."
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUploadField
              name="imagen_1"
              label="Imagen del equipo 1"
              currentName={files.imagen_1 ? '' : (form.imagen_1 || data.imagen_1 || '')}
              file={files.imagen_1}
              onFileChange={handleFileChange}
              onClear={() => handleClearImage('imagen_1')}
            />
            <ImageUploadField
              name="imagen_2"
              label="Imagen del equipo 2"
              currentName={files.imagen_2 ? '' : (form.imagen_2 || data.imagen_2 || '')}
              file={files.imagen_2}
              onFileChange={handleFileChange}
              onClear={() => handleClearImage('imagen_2')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
          <History size={16} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Historial de cambios</h3>
        </div>
        <div className="p-6">
          {historial.length === 0 ? (
            <p className="text-sm text-slate-400">Aún no hay cambios. El historial empieza cuando se guarda esta ficha.</p>
          ) : (
            <ol className="space-y-4">
              {historial.map((entrada) => (
                <li key={entrada.id} className="border-l-2 border-slate-200 pl-4">
                  <p className="text-sm font-medium text-slate-800">
                    {entrada.accion}
                    <span className="font-normal text-slate-500">
                      {' · '}{fechaHistoria(entrada.fecha)}
                      {entrada.usuario ? ` · ${entrada.usuario}` : ''}
                    </span>
                  </p>
                  <ul className="mt-1 space-y-1">
                    {(entrada.cambios || []).map((cambio) => (
                      <li key={`${entrada.id}-${cambio.campo}`} className="text-sm text-slate-600 break-words">
                        <span className="font-medium text-slate-700">{ETIQUETAS_HISTORIAL[cambio.campo] || cambio.campo}:</span>
                        {' '}{textoCambio(cambio.antes)} → {textoCambio(cambio.despues)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
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

FichaTecnicaPanel.propTypes = {
  equipoId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onClose: PropTypes.func,
  showHeader: PropTypes.bool,
};
