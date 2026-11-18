import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FileText } from 'lucide-react';
import { reportesService } from '../services/reportesService';

const mensajeDe = async (err) => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const cuerpo = JSON.parse(await data.text());
      if (cuerpo?.message) return cuerpo.message;
    } catch {
      /* el cuerpo no era JSON */
    }
  }
  return err?.response?.data?.message || err?.message || 'No se pudo generar el PDF.';
};

const claseCampo = 'w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white';

const TarjetaCodigo = ({ titulo, texto, campoId, onDescargar }) => {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(false);

  const descargar = async (e) => {
    e.preventDefault();
    const term = codigo.trim();
    if (!term) {
      setError('Ingrese el código patrimonial.');
      return;
    }
    setGenerando(true);
    setError('');
    try {
      await onDescargar(term);
    } catch (err) {
      setError(await mensajeDe(err));
    } finally {
      setGenerando(false);
    }
  };

  return (
    <form onSubmit={descargar} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800">{titulo}</h3>
        <p className="text-sm text-slate-500 mt-1">{texto}</p>
      </div>
      <div className="space-y-1">
        <label htmlFor={campoId} className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Código patrimonial
        </label>
        <input
          id={campoId}
          value={codigo}
          onChange={(e) => { setCodigo(e.target.value); setError(''); }}
          className={`${claseCampo} font-mono`}
          placeholder="12 dígitos"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={generando}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl"
      >
        {generando ? 'Generando...' : 'Descargar PDF'}
      </button>
    </form>
  );
};

TarjetaCodigo.propTypes = {
  titulo: PropTypes.string.isRequired,
  texto: PropTypes.string.isRequired,
  campoId: PropTypes.string.isRequired,
  onDescargar: PropTypes.func.isRequired,
};

const TarjetaAnio = ({ titulo, texto, campoId, anios, onDescargar }) => {
  const [anio, setAnio] = useState('');
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(false);

  const descargar = async (e) => {
    e.preventDefault();
    if (!anio) {
      setError('Elija el año.');
      return;
    }
    setGenerando(true);
    setError('');
    try {
      await onDescargar(anio);
    } catch (err) {
      setError(await mensajeDe(err));
    } finally {
      setGenerando(false);
    }
  };

  return (
    <form onSubmit={descargar} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800">{titulo}</h3>
        <p className="text-sm text-slate-500 mt-1">{texto}</p>
      </div>
      <div className="space-y-1">
        <label htmlFor={campoId} className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Año
        </label>
        <select
          id={campoId}
          value={anio}
          onChange={(e) => { setAnio(e.target.value); setError(''); }}
          className={claseCampo}
        >
          <option value="">Seleccione</option>
          {anios.map((valor) => (
            <option key={valor} value={valor}>{valor}</option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={generando}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl"
      >
        {generando ? 'Generando...' : 'Descargar PDF'}
      </button>
    </form>
  );
};

TarjetaAnio.propTypes = {
  titulo: PropTypes.string.isRequired,
  texto: PropTypes.string.isRequired,
  campoId: PropTypes.string.isRequired,
  anios: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onDescargar: PropTypes.func.isRequired,
};

const Bloque = ({ titulo, children }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-black text-slate-800">{titulo}</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{children}</div>
  </section>
);

Bloque.propTypes = {
  titulo: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export const ReportesPage = () => {
  const [aniosTecnicas, setAniosTecnicas] = useState([]);
  const [aniosMantenimiento, setAniosMantenimiento] = useState([]);

  useEffect(() => {
    let activo = true;
    reportesService.anios()
      .then((res) => {
        if (!activo) return;
        const data = res?.data?.data || {};
        setAniosTecnicas(data.tecnicas || []);
        setAniosMantenimiento(data.mantenimientos || []);
      })
      .catch(() => {
        if (!activo) return;
        const actual = new Date().getFullYear();
        setAniosTecnicas([actual]);
        setAniosMantenimiento([actual]);
      });
    return () => { activo = false; };
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-600" size={28} />
          Reportes
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Descargue las fichas de un equipo o todas las de un año, cada una en su bloque.
        </p>
      </header>

      <Bloque titulo="Fichas técnicas">
        <TarjetaCodigo
          titulo="Ficha técnica de un equipo"
          texto="Un solo PDF con cada hoja de revisión técnica que tuvo ese equipo, de la primera a la actual."
          campoId="reporte-ficha-tecnica"
          onDescargar={reportesService.fichaTecnicaEquipo}
        />
        <TarjetaAnio
          titulo="Fichas técnicas por año"
          texto="Un solo PDF con las hojas de revisión técnica de ese año, una detrás de otra."
          campoId="reporte-anio-tecnica"
          anios={aniosTecnicas}
          onDescargar={reportesService.fichasTecnicasAnio}
        />
      </Bloque>

      <Bloque titulo="Fichas de mantenimiento">
        <TarjetaCodigo
          titulo="Fichas de mantenimiento de un equipo"
          texto="Un solo PDF con cada ficha de mantenimiento de ese equipo."
          campoId="reporte-ficha-mantenimiento"
          onDescargar={reportesService.fichasMantenimientoEquipo}
        />
        <TarjetaAnio
          titulo="Fichas de mantenimiento por año"
          texto="Un solo PDF con las fichas de mantenimiento registradas en ese año."
          campoId="reporte-anio-mantenimiento"
          anios={aniosMantenimiento}
          onDescargar={reportesService.fichasMantenimientoAnio}
        />
      </Bloque>
    </div>
  );
};
