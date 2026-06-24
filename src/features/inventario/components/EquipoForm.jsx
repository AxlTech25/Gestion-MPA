import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { equiposService } from '../services/equiposService';
import { organizacionService } from '../../configuracion/services/organizacionService';
import { mapEquipoToForm, buildEquipoPayload } from '../utils/equipoFormUtils';

const INITIAL_FORM = {
  codigo_patrimonial: '',
  codigo_identificativo: '',
  tipo_equipo: 'CPU',
  tipo_equipo_otro: '',
  marca: '',
  modelo: '',
  numero_serie: '',
  ram_gb: '',
  almacenamiento_gb: '',
  tipo_disco: 'SSD',
  procesador: '',
  sistema_operativo: 'Windows 10',
  fecha_adquisicion: '',
  area_id: '',
  horas_uso: '0',
  errores_smart: '0',
  contador_paginas: '',
  salud_bateria: '',
  ultima_temp_cpu: '',
  ultima_temp_disco: '',
};

export const EquipoForm = ({ equipoId = null, onClose, onSuccess }) => {
  const isEdit = Boolean(equipoId);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [areas, setAreas] = useState([]);

  const isTechnical = formData.tipo_equipo === 'CPU' || formData.tipo_equipo === 'Laptop';
  const isLaptop = formData.tipo_equipo === 'Laptop';
  const isImpresora = formData.tipo_equipo === 'Impresora';
  const showTelemetria = isTechnical || isImpresora;
  const areaSeleccionada = areas.find((a) => String(a.id) === String(formData.area_id));

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setLoadError('');
      try {
        const resA = await organizacionService.getAreas();
        if (resA.success) {
          setAreas(resA.data);
        }

        if (isEdit) {
          const resE = await equiposService.getEquipo(equipoId);
          if (resE.success) {
            setFormData(mapEquipoToForm(resE.data));
          } else {
            setLoadError(resE.message || 'No se pudo cargar el equipo.');
          }
        } else if (resA.success && resA.data.length > 0) {
          setFormData((prev) => ({ ...prev, area_id: String(resA.data[0].id) }));
        }
      } catch {
        setLoadError(isEdit ? 'Error al cargar el equipo.' : 'Error cargando áreas.');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [equipoId, isEdit]);

  const NUMERIC_FIELDS = ['codigo_patrimonial', 'codigo_identificativo'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (NUMERIC_FIELDS.includes(name) && !/^\d*$/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = buildEquipoPayload(formData);
      const res = isEdit
        ? await equiposService.updateEquipo(equipoId, payload)
        : await equiposService.createEquipo(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch {
      alert(isEdit ? 'Error al actualizar equipo.' : 'Error al registrar equipo.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-12 text-slate-400">
          Cargando datos del equipo...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md">
          <p className="text-red-600 mb-4">{loadError}</p>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh]">

        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Editar Equipo' : 'Registrar Equipo'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="equipo-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Cód. Patrimonial *</label>
              <input
                required
                name="codigo_patrimonial"
                value={formData.codigo_patrimonial}
                onChange={handleChange}
                maxLength={12}
                minLength={12}
                pattern="[0-9]{12}"
                inputMode="numeric"
                title="Debe contener exactamente 12 dígitos numéricos."
                placeholder="Ej: 740000001111"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm tracking-widest"
              />
              <p className={`text-xs ${formData.codigo_patrimonial.length === 12 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {formData.codigo_patrimonial.length}/12 dígitos
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Cód. Identificativo</label>
              <input
                name="codigo_identificativo"
                value={formData.codigo_identificativo}
                onChange={handleChange}
                maxLength={6}
                pattern="[0-9]{0,6}"
                inputMode="numeric"
                placeholder="Ej: 000121"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm tracking-widest"
              />
              <p className={`text-xs ${formData.codigo_identificativo.length === 6 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {formData.codigo_identificativo.length}/6 dígitos
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Área Asignada *</label>
              <select
                required
                name="area_id"
                value={formData.area_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} (Jefe: {a.jefe_encargado || 'S/N'})
                  </option>
                ))}
              </select>
            </div>

            {areaSeleccionada && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Responsable del Equipo</label>
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700">
                  {areaSeleccionada.jefe_encargado || 'Sin jefe asignado'}
                </div>
              </div>
            )}

            {areaSeleccionada && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Ubicación (Área)</label>
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700">
                  {areaSeleccionada.nombre}
                  {areaSeleccionada.descripcion && (
                    <span className="text-slate-500"> — {areaSeleccionada.descripcion}</span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo de Equipo *</label>
              <select name="tipo_equipo" value={formData.tipo_equipo} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="CPU">CPU (Escritorio)</option>
                <option value="Laptop">Laptop</option>
                <option value="Monitor">Monitor</option>
                <option value="Impresora">Impresora</option>
                <option value="Escaner">Escáner</option>
                <option value="Otro">Otro</option>
              </select>
              {formData.tipo_equipo === 'Otro' && (
                <input
                  required
                  name="tipo_equipo_otro"
                  value={formData.tipo_equipo_otro}
                  onChange={handleChange}
                  placeholder="Especifique el tipo de equipo..."
                  className="w-full mt-2 px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none bg-amber-50 text-sm"
                />
              )}
            </div>

            {formData.tipo_equipo === 'Otro' && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs text-amber-600 font-medium">
                  Nombre en inventario: <strong>{formData.tipo_equipo_otro || '—'}</strong>
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Marca</label>
              <input name="marca" value={formData.marca} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Modelo</label>
              <input name="modelo" value={formData.modelo} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">N° de Serie</label>
              <input name="numero_serie" value={formData.numero_serie} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Fecha Adquisición</label>
              <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {isTechnical && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <h4 className="md:col-span-2 font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Especificaciones Técnicas (ML-Ready)
                </h4>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Procesador</label>
                  <input name="procesador" value={formData.procesador} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Core i7 12th Gen" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Memoria RAM (GB)</label>
                  <input type="number" name="ram_gb" value={formData.ram_gb} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: 16" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Almacenamiento (GB)</label>
                  <div className="flex gap-2">
                    <input type="number" name="almacenamiento_gb" value={formData.almacenamiento_gb} onChange={handleChange}
                      className="w-20 px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="GB" />
                    <select name="tipo_disco" value={formData.tipo_disco} onChange={handleChange}
                      className="flex-1 px-2 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="SSD">SSD</option>
                      <option value="NVMe">NVMe</option>
                      <option value="HDD">HDD</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Sistema Operativo</label>
                  <select name="sistema_operativo" value={formData.sistema_operativo} onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="Windows 7">Windows 7</option>
                    <option value="Windows 8">Windows 8</option>
                    <option value="Windows 8.1">Windows 8.1</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="Windows 11">Windows 11</option>
                  </select>
                </div>
              </div>
            )}

            {showTelemetria && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <h4 className="md:col-span-2 font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-violet-500 rounded-full" />
                  Telemetría inicial (ML Fase 7)
                </h4>

                {(isTechnical || isLaptop) && (
                  <>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Horas de uso</label>
                      <input type="number" min="0" name="horas_uso" value={formData.horas_uso} onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Errores SMART</label>
                      <input type="number" min="0" name="errores_smart" value={formData.errores_smart} onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Temp. CPU (°C)</label>
                      <input type="number" step="0.1" name="ultima_temp_cpu" value={formData.ultima_temp_cpu} onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Opcional" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Temp. disco (°C)</label>
                      <input type="number" step="0.1" name="ultima_temp_disco" value={formData.ultima_temp_disco} onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Opcional" />
                    </div>
                  </>
                )}

                {isLaptop && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Salud batería (%)</label>
                    <input type="number" min="0" max="100" step="0.1" name="salud_bateria" value={formData.salud_bateria} onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" placeholder="0–100" />
                  </div>
                )}

                {isImpresora && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Contador de páginas</label>
                    <input type="number" min="0" name="contador_paginas" value={formData.contador_paginas} onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none" />
                  </div>
                )}
              </div>
            )}

          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">
            Cancelar
          </button>
          <button form="equipo-form" type="submit" disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg shadow-sm">
            {loading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Registrar Equipo')}
          </button>
        </div>
      </div>
    </div>
  );
};
