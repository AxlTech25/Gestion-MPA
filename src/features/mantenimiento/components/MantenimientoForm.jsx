import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { mantenimientoService } from '../services/mantenimientoService';
import { mlService } from '../../ml/services/mlService';
import { fichaTecnicaService } from '../../inventario/services/fichaTecnicaService';
import { isTipoComputadora, isTipoImpresora } from '../../../lib/equipoTipo';

const COMPONENTES = [
  'Disco', 'Batería', 'Ventilador', 'Fuente de Poder', 'RAM', 'Placa Madre',
  'Fuser', 'Tóner', 'Red', 'Pantalla', 'Teclado', 'Otro',
];

export const MantenimientoForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    equipo_id: '',
    tecnico_id: '1',
    fecha_intervencion: new Date().toISOString().slice(0, 16),
    tipo_mantenimiento: 'Preventivo',
    categoria_falla_id: '1',
    sintoma_usuario: '',
    causa_raiz: '',
    componente_principal: '',
    nivel_polvo: '',
    temperatura_cpu: '',
    temperatura_disco: '',
    horas_uso_acumuladas: '',
    salud_bateria_pct: '',
    contador_paginas_lectura: '',
    tiempo_inactividad_min: '0',
    diagnostico_texto: '',
    piezas_reemplazadas: '',
    costo_reparacion: '',
    actividades_realizadas: '',
    estado_post_mantenimiento: 'Operativo',
  });
  const [loading, setLoading] = useState(false);
  const [sugerencia, setSugerencia] = useState(null);
  const [codigoPatrimonial, setCodigoPatrimonial] = useState('');
  const [equipoInfo, setEquipoInfo] = useState(null);
  const [equipoError, setEquipoError] = useState('');
  const [buscandoEquipo, setBuscandoEquipo] = useState(false);

  const isCorrectivo = formData.tipo_mantenimiento === 'Correctivo';
  const isPreventivo = ['Preventivo', 'Predictivo', 'Evaluacion'].includes(formData.tipo_mantenimiento);
  const isComputadora = equipoInfo ? isTipoComputadora(equipoInfo.tipo_equipo) : false;
  const isImpresora = equipoInfo ? isTipoImpresora(equipoInfo.tipo_equipo) : false;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    const term = codigoPatrimonial.trim();
    if (!term) {
      setEquipoInfo(null);
      setEquipoError('');
      setFormData((prev) => ({ ...prev, equipo_id: '' }));
      return undefined;
    }

    const timer = setTimeout(async () => {
      setBuscandoEquipo(true);
      setEquipoError('');
      try {
        const res = await fichaTecnicaService.buscarPorCodigo(term);
        if (res.success) {
          setEquipoInfo(res.data);
          setFormData((prev) => ({ ...prev, equipo_id: String(res.data.id) }));
        } else {
          setEquipoInfo(null);
          setEquipoError(res.message || 'Equipo no encontrado.');
          setFormData((prev) => ({ ...prev, equipo_id: '' }));
        }
      } catch {
        setEquipoInfo(null);
        setEquipoError('No se encontró equipo con ese código patrimonial.');
        setFormData((prev) => ({ ...prev, equipo_id: '' }));
      } finally {
        setBuscandoEquipo(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [codigoPatrimonial]);

  useEffect(() => {
    const fetchSugerencia = async () => {
      const id = parseInt(formData.equipo_id, 10);
      if (!id || !isCorrectivo) {
        setSugerencia(null);
        return;
      }
      try {
        const res = await mlService.predictCategoria(id);
        if (res.success && res.data?.sugerencias?.length) {
          const top = res.data.sugerencias[0];
          setSugerencia(top);
          setFormData((prev) => ({
            ...prev,
            categoria_falla_id: String(top.categoria_falla_id),
          }));
        }
      } catch {
        setSugerencia(null);
      }
    };
    fetchSugerencia();
  }, [formData.equipo_id, formData.tipo_mantenimiento, isCorrectivo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipo_id) {
      alert('Ingrese un código patrimonial válido.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!isComputadora) {
        payload.nivel_polvo = '';
        payload.temperatura_cpu = '';
        payload.temperatura_disco = '';
        payload.horas_uso_acumuladas = '';
        payload.salud_bateria_pct = '';
        payload.tiempo_inactividad_min = '0';
      }
      if (!isImpresora) {
        payload.contador_paginas_lectura = '';
      }
      const res = await mantenimientoService.create(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.message);
      }
    } catch {
      alert('Error al registrar mantenimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Registrar Mantenimiento (ML Fase 7)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="mant-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Código patrimonial *</label>
              <input
                required
                type="text"
                value={codigoPatrimonial}
                onChange={(e) => {
                  setCodigoPatrimonial(e.target.value);
                  setEquipoError('');
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder="Ej: PAT-2024-001"
              />
              {buscandoEquipo && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Loader2 size={12} className="animate-spin" /> Validando equipo...
                </p>
              )}
              {equipoInfo && !buscandoEquipo && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-emerald-800">Equipo identificado</p>
                    <p className="text-slate-700 mt-0.5">
                      <span className="font-medium">{equipoInfo.tipo_equipo}</span>
                      {' · '}
                      <span>{equipoInfo.modelo || 'Sin modelo'}</span>
                      {equipoInfo.marca && (
                        <span className="text-slate-500"> ({equipoInfo.marca})</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
              {equipoError && !buscandoEquipo && (
                <p className="text-xs text-red-600 mt-1">{equipoError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Fecha y Hora *</label>
              <input required type="datetime-local" name="fecha_intervencion" value={formData.fecha_intervencion} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tipo *</label>
              <select name="tipo_mantenimiento" value={formData.tipo_mantenimiento} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Predictivo">Predictivo</option>
                <option value="Evaluacion">Evaluación</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                <Sparkles size={14} /> Categoría Falla *
              </label>
              {sugerencia && isCorrectivo && (
                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Sugerencia IA: {sugerencia.nombre} ({Math.round(sugerencia.probabilidad * 100)}%)
                </p>
              )}
              <select name="categoria_falla_id" value={formData.categoria_falla_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg">
                <option value="1">Limpieza / Rutina</option>
                <option value="2">Actualización Software</option>
                <option value="4">Problema de Red</option>
                <option value="6">Sobrecalentamiento</option>
                <option value="8">Fallo Disco / Corrupción</option>
                <option value="9">Fallo Fuente de Poder</option>
              </select>
            </div>

            {isCorrectivo && (
              <>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Síntoma reportado</label>
                  <input name="sintoma_usuario" value={formData.sintoma_usuario} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: No enciende, pantalla azul..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Componente principal *</label>
                  <select required name="componente_principal" value={formData.componente_principal} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="">Seleccionar...</option>
                    {COMPONENTES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Causa raíz</label>
                  <input name="causa_raiz" value={formData.causa_raiz} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Sobrecalentamiento por polvo" />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-orange-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3">
                    Reparación y cambio de piezas
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Diagnóstico técnico</label>
                      <textarea name="diagnostico_texto" value={formData.diagnostico_texto} onChange={handleChange} rows="2"
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none bg-orange-50/30"
                        placeholder="Ej: Disco con sectores defectuosos, SMART en estado de alerta..." />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700">Piezas reemplazadas</label>
                      <textarea name="piezas_reemplazadas" value={formData.piezas_reemplazadas} onChange={handleChange} rows="2"
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none bg-orange-50/30"
                        placeholder="Ej: SSD 512GB Kingston, pasta térmica, ventilador CPU..." />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Costo de reparación (S/)</label>
                      <input type="number" min="0" step="0.01" name="costo_reparacion" value={formData.costo_reparacion} onChange={handleChange}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none bg-orange-50/30"
                        placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {isPreventivo && isComputadora && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nivel de polvo</label>
                  <select name="nivel_polvo" value={formData.nivel_polvo} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="">—</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                    <option value="Critico">Crítico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Temp. CPU (°C)</label>
                  <input type="number" step="0.1" name="temperatura_cpu" value={formData.temperatura_cpu} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Temp. disco (°C)</label>
                  <input type="number" step="0.1" name="temperatura_disco" value={formData.temperatura_disco} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}

            {isComputadora && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Horas de uso (lectura)</label>
                  <input type="number" min="0" name="horas_uso_acumuladas" value={formData.horas_uso_acumuladas} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Salud batería (%)</label>
                  <input type="number" min="0" max="100" step="0.1" name="salud_bateria_pct" value={formData.salud_bateria_pct} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Inactividad (minutos)</label>
                  <input type="number" min="0" name="tiempo_inactividad_min" value={formData.tiempo_inactividad_min} onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}

            {isImpresora && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Contador páginas (impresora)</label>
                <input type="number" min="0" name="contador_paginas_lectura" value={formData.contador_paginas_lectura} onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Actividades realizadas</label>
              <textarea name="actividades_realizadas" value={formData.actividades_realizadas} onChange={handleChange} rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describe lo realizado..." />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Estado posterior *</label>
              <select name="estado_post_mantenimiento" value={formData.estado_post_mantenimiento} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white">
                <option value="Operativo">Operativo (resuelto)</option>
                <option value="Dañado">Aún dañado</option>
                <option value="Baja">Para baja</option>
              </select>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
          <button form="mant-form" type="submit" disabled={loading || buscandoEquipo || !formData.equipo_id}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            {loading ? 'Guardando...' : 'Guardar Ficha'}
          </button>
        </div>
      </div>
    </div>
  );
};
