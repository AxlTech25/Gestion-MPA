import React, { useEffect, useState } from 'react';
import { X, Save, FileText, Cpu, HardDrive, Monitor, Wifi, Key, Package } from 'lucide-react';
import { fichaTecnicaService } from '../services/fichaTecnicaService';

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
      {Icon && <Icon size={12} />} {label}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white";
const selectCls = `${inputCls} bg-white`;

export const FichaTecnicaModal = ({ equipoId, onClose }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fichaTecnicaService.getFicha(equipoId);
        if (res.success) {
          setData(res.data);
          setForm({
            procesador:        res.data.procesador        || '',
            sistema_operativo: res.data.sistema_operativo || '',
            licencia_so:       res.data.licencia_so       || '',
            mac_address:       res.data.mac_address       || '',
            ip_asignada:       res.data.ip_asignada       || '',
            software_base:     res.data.software_base     || '',
            ram_gb:            res.data.ram_gb            || '',
            almacenamiento_gb: res.data.almacenamiento_gb || '',
            tipo_disco:        res.data.tipo_disco        || 'SSD',
            estado_conservacion: res.data.estado_conservacion || 'Bueno',
            estado_operativo:    res.data.estado_operativo    || 'Operativo',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [equipoId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fichaTecnicaService.saveFicha(equipoId, form);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Error al guardar la ficha.");
    } finally {
      setSaving(false);
    }
  };

  const handlePDF = () => {
    window.open(`/backend/api/v2/reportes/equipo/${equipoId}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-slate-800 to-blue-900 text-white">
          <div>
            <h2 className="text-lg font-bold">Ficha Técnica</h2>
            {data && (
              <p className="text-xs text-blue-200 mt-0.5">
                {data.tipo_equipo} · {data.marca} {data.modelo} · <span className="font-mono">{data.codigo_patrimonial}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePDF} title="Descargar PDF"
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors">
              <FileText size={14} /> PDF
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white ml-2">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <p className="text-center text-slate-400 py-10">Cargando ficha técnica...</p>
          ) : !data ? (
            <p className="text-center text-red-400 py-10">No se pudo cargar el equipo.</p>
          ) : (
            <>
              {/* Sección 1: Datos generales (solo lectura) */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Monitor size={16} className="text-blue-500" /> Información General
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {[
                    ['Área',          data.area_nombre || '—'],
                    ['Jefe a Cargo',  data.jefe_encargado || '—'],
                    ['Fecha Ingreso', data.fecha_adquisicion ? new Date(data.fecha_adquisicion).toLocaleDateString('es-PE') : '—'],
                    ['N° de Serie',   data.numero_serie || '—'],
                    ['Cód. Ident.',   data.codigo_identificativo || '—'],
                    ['Registrado',    data.fecha_registro ? new Date(data.fecha_registro).toLocaleDateString('es-PE') : '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-400">{k}</p>
                      <p className="font-medium text-slate-700 truncate">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 2: Hardware */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Cpu size={16} className="text-blue-500" /> Hardware
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Procesador" icon={Cpu}>
                    <input name="procesador" value={form.procesador} onChange={handleChange}
                      className={inputCls} placeholder="Ej: Intel Core i7-12700" />
                  </Field>
                  <Field label="Memoria RAM (GB)" icon={HardDrive}>
                    <input type="number" name="ram_gb" value={form.ram_gb} onChange={handleChange}
                      className={inputCls} placeholder="Ej: 16" />
                  </Field>
                  <Field label="Almacenamiento (GB)" icon={HardDrive}>
                    <div className="flex gap-2">
                      <input type="number" name="almacenamiento_gb" value={form.almacenamiento_gb}
                        onChange={handleChange} className="w-20 px-2 py-2 border border-slate-200 rounded-lg outline-none text-sm" placeholder="GB" />
                      <select name="tipo_disco" value={form.tipo_disco} onChange={handleChange}
                        className="flex-1 px-2 py-2 border border-slate-200 rounded-lg bg-white text-sm outline-none">
                        <option>SSD</option><option>NVMe</option><option>HDD</option>
                      </select>
                    </div>
                  </Field>
                </div>
              </div>

              {/* Sección 3: Software */}
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
                    </select>
                  </Field>
                  <Field label="Licencia SO" icon={Key}>
                    <input name="licencia_so" value={form.licencia_so} onChange={handleChange}
                      className={inputCls} placeholder="Clave de producto..." />
                  </Field>
                  <Field label="Software Instalado" icon={Package}>
                    <textarea name="software_base" value={form.software_base} onChange={handleChange} rows={3}
                      className={inputCls} placeholder="Ej: Office 2021, Antivirus..." />
                  </Field>
                </div>
              </div>

              {/* Sección 4: Red */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Wifi size={16} className="text-blue-500" /> Red y Conectividad
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Dirección MAC" icon={Wifi}>
                    <input name="mac_address" value={form.mac_address} onChange={handleChange}
                      className={inputCls} placeholder="Ej: AA:BB:CC:DD:EE:FF" />
                  </Field>
                  <Field label="IP Asignada" icon={Wifi}>
                    <input name="ip_asignada" value={form.ip_asignada} onChange={handleChange}
                      className={inputCls} placeholder="Ej: 192.168.1.100 o DHCP" />
                  </Field>
                </div>
              </div>

              {/* Sección 5: Estado */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 pb-1 border-b border-slate-100">Estado del Equipo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && data && (
          <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
            <span className={`text-sm font-medium transition-all ${saved ? 'text-emerald-600' : 'text-transparent'}`}>
              ✓ Cambios guardados correctamente
            </span>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                Cerrar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg font-medium transition-colors">
                <Save size={15} />
                {saving ? 'Guardando...' : 'Guardar Ficha'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
