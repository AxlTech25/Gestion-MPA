import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { generarFichaPDF } from '../../utils/GenerarFichaPDF'; 
// Solo una línea para todos los iconos, sin repetir 'Save'
import { Save, FileCheck, Search, Printer, Monitor, CheckSquare } from 'lucide-react';

const FichaMantenimiento = () => {
  const { user } = useAuth();
  const [nroOrden, setNroOrden] = useState('N° 000');
  const [equipo, setEquipo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado para todas las secciones del formulario
  const [formData, setFormData] = useState({
    area: '',
    encargado: '',
    usuario_responsable: '',
    tipo_mantenimiento: 'Preventivo',
    perifericos: { monitor: false, teclado: false, mouse: false, impresora: false, escaner: false, otros: '' },
    software: { windows: '', office: '', wps: false, antivirus: '', otros: '' },
    diagnostico_entrada: '',
    actividades: '',
    diagnostico_salida: '',
    conclusion: ''
  });

  // Cargar Correlativo Automático N° 001
  useEffect(() => {
    api.get('/mantenimiento/preparar_ficha.php?accion=get_correlativo')
      .then(res => setNroOrden(res.data.nro_orden))
      .catch(err => console.error("Error al obtener correlativo", err));
  }, []);

  // SECCIÓN 2: Autocompletado por Código Patrimonial
  const buscarEquipo = async (codigo) => {
    if (!codigo) return;
    try {
      const res = await api.get(`/mantenimiento/preparar_ficha.php?accion=buscar_equipo&codigo=${codigo}`);
      
      if (res.data) {
        // Guardamos el objeto completo que contiene: id, marca, modelo, procesador, ram, etc.
        setEquipo(res.data); 
        
        // Llenamos automáticamente los campos de la Sección 1
        setFormData(prev => ({
          ...prev,
          area: res.data.area_asignada,
          usuario_responsable: res.data.responsable_asignado
        }));
      } else {
        alert("El Código Patrimonial no existe.");
        setEquipo(null);
      }
    } catch (err) {
      alert("Error al conectar con el servidor.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const manejarImpresion = () => {
    if (!equipo) {
      alert("Primero debe buscar un equipo por Código Patrimonial.");
      return;
    }
    
    const dataCompleta = {
      ...formData,
      ...equipo, // Datos técnicos: marca, modelo, procesador, ram, disco_duro
      nro_orden: nroOrden
    };

    generarFichaPDF(dataCompleta);
  };

  const guardarEnBD = async () => {
    // Verificamos que 'equipo' tenga datos antes de proceder
    if (!equipo || !equipo.id) {
      alert("Error: Primero ingrese un Código Patrimonial válido y presione Enter.");
      return;
    }

    // Preparamos los datos para enviar a PHP
    const datosAGuardar = {
      nro_orden: nroOrden,
      equipo_id: equipo.id, // El ID que recuperamos en la búsqueda
      area: formData.area,
      encargado: formData.encargado,
      usuario_responsable: formData.usuario_responsable,
      diagnostico_entrada: formData.diagnostico_entrada,
      actividades: formData.actividades,
      conclusion: formData.conclusion,
      estado: 'Finalizado'
    };

    try {
      const res = await api.post('/mantenimiento/guardar_ficha.php', datosAGuardar);
      
      if (res.data.status === 'success') {
        alert(`¡Éxito! Ficha ${nroOrden} registrada para el equipo ${equipo.codigo_patrimonial}`);
        // Opcional: limpiar formulario o refrescar correlativo
      } else {
        alert("Error del servidor: " + res.data.message);
      }
    } catch (err) {
      alert("Error de red: No se pudo guardar la ficha.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mb-10 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
{/* ENCABEZADO CON BOTONES INDEPENDIENTES */}
<div className="bg-[#1a1d23] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
  <div className="flex items-center gap-4">
    <div className="p-3 bg-[#00a8cc] rounded-2xl shadow-lg">
      <FileCheck size={32} />
    </div>
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter">Ficha de Mantenimiento</h1>
      <p className="text-[#00a8cc] font-bold tracking-widest">{nroOrden}</p>
    </div>
  </div>

        <div className="flex gap-3">
          {/* BOTÓN IMPRIMIR: Genera el documento A4 oficial */}
          <button 
            type="button"
            onClick={() => {
              if (!equipo) return alert("Debe buscar un equipo por Código Patrimonial primero");
              generarFichaPDF({ ...formData, ...equipo, nro_orden: nroOrden });
            }}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-500"
          >
            <Printer size={16} /> Imprimir Ficha
          </button>

          {/* BOTÓN GUARDAR: Registra la intervención en la base de datos */}
          <button 
            type="button"
            onClick={guardarEnBD}
            className="bg-[#00a8cc] hover:bg-[#008fb0] px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
          >
            <Save size={16} /> Guardar Registro
          </button>
        </div>
      </div>

        <form className="p-8 space-y-12">
          
          {/* SECCIÓN 1: DATOS GENERALES */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-6">SECCIÓN 1 – Datos Generales</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Input label="Fecha" type="date"/>
              <Input label="Área" name="area" placeholder="Ej. Tesorería" onChange={handleInputChange} />
              <Input label="Encargado" name="encargado" placeholder="Técnico responsable" onChange={handleInputChange} />
              <Input label="Usuario Responsable" name="usuario_responsable" placeholder="Usuario final" onChange={handleInputChange} />
            </div>
          </section>

          {/* SECCIÓN 2: DATOS DEL EQUIPO (AUTOCOMPLETADO) */}
          <section className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-xs font-black text-[#00a8cc] uppercase tracking-widest">SECCIÓN 2 – Datos del Equipo</h3>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#00a8cc] rounded-xl outline-none font-bold text-slate-700 shadow-sm"
                  placeholder="Ingrese Cód. Patrimonial y Enter..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), buscarEquipo(e.target.value))}
                />
              </div>
            </div>
            
                        {equipo && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <DataBox label="Marca" value={equipo.marca} />
                <DataBox label="Modelo" value={equipo.modelo} />
                <DataBox label="Procesador" value={equipo.procesador} />
                <DataBox label="RAM" value={equipo.ram} />
                {/* Nota que aquí cambiamos 'disco' por 'disco_duro' */}
                <DataBox label="Disco" value={equipo.disco_duro} /> 
                <DataBox label="S. Operativo" value={equipo.sistema_operativo} />
            </div>
            )} 
          </section>

          {/* SECCIÓN 3 Y 4: PERIFÉRICOS Y SOFTWARE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">SECCIÓN 3 – Periféricos</h3>
              <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl">
                {['Monitor', 'Teclado', 'Mouse', 'Impresora', 'Escáner'].map(item => (
                  <label key={item} className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer hover:text-[#00a8cc] transition-colors">
                    <input type="checkbox" className="w-5 h-5 accent-[#00a8cc] rounded-md" /> {item}
                  </label>
                ))}
                <input type="text" className="col-span-2 p-2 text-xs border-b border-slate-200 outline-none focus:border-[#00a8cc]" placeholder="Otros periféricos..." />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">SECCIÓN 4 – Software Instalado</h3>
              <div className="space-y-4">
                <Input label="Windows (Versión/Licencia)" placeholder="Ej. Win 11 Pro - Original" />
                <div className="flex gap-4">
                  <Input label="Office (Versión)" placeholder="Ej. Office 2021" className="flex-1" />
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase mt-6 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#00a8cc]" /> WPS
                  </label>
                </div>
                <Input label="Antivirus" placeholder="Nombre de la protección" />
              </div>
            </section>
          </div>

          {/* SECCIÓN 5: DIAGNÓSTICO */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-4">SECCIÓN 5 – Diagnóstico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextArea label="Diagnóstico de Entrada" placeholder="Describa el estado inicial del equipo..." />
              <TextArea label="Actividades Realizadas" placeholder="Detalle las acciones técnicas ejecutadas..." />
              <TextArea label="Diagnóstico de Salida" placeholder="Estado final tras la intervención..." />
              <TextArea label="Conclusión" placeholder="Recomendaciones técnicas adicionales..." />
            </div>
          </section>

          {/* SECCIÓN 6: FIRMAS */}
          <section className="pt-10 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 text-center">SECCIÓN 6 – Validación y Firmas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <SignatureSpace label="Técnico de Informática" />
              <SignatureSpace label="Encargado del Área" />
              <SignatureSpace label="Jefe de Informática (OTI)" />
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

// Subcomponentes para limpieza de código
const Input = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</label>
    <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#00a8cc] outline-none transition-all" {...props} />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</label>
    <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 min-h-120px focus:ring-2 focus:ring-[#00a8cc] outline-none transition-all" {...props}></textarea>
  </div>
);

const DataBox = ({ label, value, canEdit }) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
    <p className="text-[9px] font-black text-[#00a8cc] uppercase tracking-tighter">{label}</p>
    <input 
      type="text" 
      defaultValue={value || '---'} 
      readOnly={!canEdit}
      className={`text-sm font-bold text-slate-800 outline-none bg-transparent ${canEdit ? 'border-b border-blue-200 focus:border-blue-500' : ''}`}
    />
  </div>
);

const SignatureSpace = ({ label }) => (
  <div className="flex flex-col items-center">
    <div className="w-full border-t-2 border-slate-200 mt-8 mb-3"></div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

export default FichaMantenimiento;