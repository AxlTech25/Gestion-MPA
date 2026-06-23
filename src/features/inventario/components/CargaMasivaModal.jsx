import React, { useRef, useState } from 'react';
import { X, Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { equiposService } from '../services/equiposService';

export const CargaMasivaModal = ({ onClose, onSuccess }) => {
  const inputRef = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const handleArchivo = (e) => {
    const file = e.target.files?.[0];
    setArchivo(file || null);
    setResultado(null);
    setError('');
  };

  const handlePlantilla = async () => {
    try {
      await equiposService.descargarPlantilla();
    } catch {
      setError('No se pudo descargar la plantilla.');
    }
  };

  const handleSubir = async () => {
    if (!archivo) {
      setError('Seleccione un archivo Excel (.xlsx).');
      return;
    }
    setLoading(true);
    setError('');
    setResultado(null);
    try {
      const res = await equiposService.cargaMasiva(archivo);
      if (res.success) {
        setResultado(res.data);
        if (res.data.importados > 0) {
          onSuccess();
        }
      } else {
        setError(res.message || 'Error en la carga.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el archivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-emerald-600" />
            Carga masiva por Excel
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-2">
            <p className="font-semibold">Instrucciones</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Descargue la plantilla Excel</li>
              <li>Complete una fila por equipo (sin modificar los encabezados)</li>
              <li>Suba el archivo .xlsx</li>
            </ol>
            <p className="text-xs text-blue-600 pt-1">
              Obligatorios: código patrimonial (12 dígitos), tipo de equipo y área (nombre exacto).
            </p>
          </div>

          <button
            type="button"
            onClick={handlePlantilla}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
          >
            <Download size={18} />
            Descargar plantilla Excel
          </button>

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
          >
            <Upload className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-medium text-slate-700">
              {archivo ? archivo.name : 'Seleccionar archivo .xlsx'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Clic para elegir archivo</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleArchivo}
              className="hidden"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {resultado && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm font-medium">
                <CheckCircle2 size={18} />
                {resultado.importados} equipo(s) importado(s) de {resultado.total_filas} fila(s)
              </div>
              {resultado.errores?.length > 0 && (
                <div className="max-h-40 overflow-y-auto bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
                  <p className="font-bold text-amber-800 mb-2">Errores ({resultado.errores.length}):</p>
                  {resultado.errores.map((err, i) => (
                    <p key={i} className="text-amber-900">
                      Fila {err.fila}{err.codigo ? ` (${err.codigo})` : ''}: {err.mensaje}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm text-slate-600">
            Cerrar
          </button>
          <button
            onClick={handleSubir}
            disabled={loading || !archivo}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium rounded-lg"
          >
            <Upload size={16} />
            {loading ? 'Procesando...' : 'Importar equipos'}
          </button>
        </div>
      </div>
    </div>
  );
};
