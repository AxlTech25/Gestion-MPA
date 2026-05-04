import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Monitor, Save, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegistroEquipo = () => {
  const initialState = {
    tipo_equipo: 'CPU',
    otro_tipo: '',
    codigo_identificativo: '',
    codigo_patrimonial: '',
    area_id: '', // Ahora usamos IDs
    responsable_id: '', // Ahora usamos IDs
    marca: '',
    modelo: '',
    serie: '',
    color: '',
    procesador: '',
    ram: '',
    disco_duro: '',
    sistema_operativo: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');
  
  // Nuevo estado para guardar las opciones de la BD
  const [listas, setListas] = useState({ areas: [], personal: [] });

  // Cargar áreas y personal al montar el componente
  useEffect(() => {
    const fetchListas = async () => {
      try {
        const res = await api.get('/equipos/obtener_listas.php');
        if (res.data) setListas(res.data);
      } catch (err) {
        console.error("Error cargando listas de áreas/personal:", err);
      }
    };
    fetchListas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación de solo números para códigos, RAM y Disco
    if (['codigo_identificativo', 'codigo_patrimonial', 'ram', 'disco_duro'].includes(name)) {
      const soloNumeros = value.replace(/[^0-9.]/g, ''); // Permite números y un punto decimal para la RAM
      setFormData({ ...formData, [name]: soloNumeros });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errores[name]) {
      const nuevosErrores = { ...errores };
      delete nuevosErrores[name];
      setErrores(nuevosErrores);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const requiereHardware = formData.tipo_equipo === 'CPU' || formData.tipo_equipo === 'Laptop';

    // Campos obligatorios actualizados con los IDs
    const camposBasicos = [
      'tipo_equipo', 'codigo_identificativo', 'codigo_patrimonial', 
      'area_id', 'responsable_id', 'marca', 'modelo', 'serie', 'color'
    ];
    const camposHardware = ['procesador', 'ram', 'disco_duro', 'sistema_operativo'];

    camposBasicos.forEach(key => {
      if (!formData[key] || formData[key].toString().trim() === '') {
        nuevosErrores[key] = 'Obligatorio';
      }
    });

    if (formData.tipo_equipo === 'Otros' && !formData.otro_tipo.trim()) {
      nuevosErrores.otro_tipo = 'Especifique el equipo';
    }

    if (requiereHardware) {
      camposHardware.forEach(key => {
        if (!formData[key] || formData[key].toString().trim() === '') {
          nuevosErrores[key] = 'Obligatorio';
        }
      });
    }

    if (formData.codigo_patrimonial && formData.codigo_patrimonial.length !== 12) {
      nuevosErrores.codigo_patrimonial = 'Deben ser 12 dígitos';
    }
    if (formData.codigo_identificativo && formData.codigo_identificativo.length !== 6) {
      nuevosErrores.codigo_identificativo = 'Deben ser 6 dígitos';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensajeExito('');
    setErrores({});

    if (!validarFormulario()) return;

    const datosParaEnviar = {
      ...formData,
      tipo_equipo: formData.tipo_equipo === 'Otros' ? formData.otro_tipo : formData.tipo_equipo,
      // Adaptamos los nombres para el backend (opcional, el backend ya hace intval)
      area_asignada: formData.area_id, 
      responsable_asignado: formData.responsable_id
    };

    try {
      const res = await api.post('/equipos/registrar.php', datosParaEnviar);
      
      if (res.data && res.data.status === 'success') {
        setMensajeExito("¡Equipo registrado correctamente en el inventario!");
        setFormData(initialState);
        setTimeout(() => setMensajeExito(''), 5000);
      } else {
        setErrores({ global: res.data.message || "Error al registrar en la BD." });
      }
    } catch (err) {
      setErrores({ global: "Error de conexión con el servidor." });
    }
  };

  const requiereHardware = formData.tipo_equipo === 'CPU' || formData.tipo_equipo === 'Laptop';

  // Filtramos el personal para que solo muestre los de el área seleccionada (Opcional pero recomendado)
  const personalFiltrado = formData.area_id 
    ? listas.personal.filter(p => p.area_id === formData.area_id || p.area_id === null)
    : listas.personal;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
      <div className="bg-[#1a1d23] p-6 text-white flex items-center gap-3">
        <div className="p-2 bg-[#00a8cc] rounded-lg"><Monitor size={20} /></div>
        <h2 className="text-lg font-black uppercase tracking-tighter">Registro de Activos - Sigemad</h2>
      </div>

      <form onSubmit={handleGuardar} className="p-10 space-y-6">
        {mensajeExito && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 size={18} /> {mensajeExito}
          </div>
        )}
        {errores.global && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
            <AlertCircle size={18} /> {errores.global}
          </div>
        )}

        {/* FILA 1: TIPO DE EQUIPO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Tipo de Equipo" name="tipo_equipo" type="select" value={formData.tipo_equipo} onChange={handleChange} error={errores.tipo_equipo}>
            <option value="CPU">CPU (PC)</option>
            <option value="Laptop">Laptop</option>
            <option value="Monitor">Monitor</option>
            <option value="Impresora">Impresora</option>
            <option value="Escáner">Escáner</option>
            <option value="Otros">Otros (Especificar)</option>
          </Input>

          {formData.tipo_equipo === 'Otros' ? (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <Input label="Especifique el Equipo" name="otro_tipo" value={formData.otro_tipo} onChange={handleChange} error={errores.otro_tipo} placeholder="Ej: Proyector" />
            </div>
          ) : <div className="hidden md:block"></div>}
        </div>

        {/* FILA 2: CÓDIGOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Cód. Identificativo (6 Dígitos)" name="codigo_identificativo" value={formData.codigo_identificativo} onChange={handleChange} error={errores.codigo_identificativo} maxLength={6} placeholder="Ej: 001234" />
          <Input label="Cód. Patrimonial (12 Dígitos)" name="codigo_patrimonial" value={formData.codigo_patrimonial} onChange={handleChange} error={errores.codigo_patrimonial} maxLength={12} placeholder="Ej: 740800112233" />
        </div>

        {/* FILA 3: ÁREA Y RESPONSABLE (NUEVOS DESPLEGABLES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Área / Oficina" name="area_id" type="select" value={formData.area_id} onChange={handleChange} error={errores.area_id}>
            <option value="">Seleccione un Área...</option>
            {listas.areas.map(area => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </Input>
          
          <Input label="Responsable Asignado" name="responsable_id" type="select" value={formData.responsable_id} onChange={handleChange} error={errores.responsable_id}>
            <option value="">Seleccione Personal...</option>
            {personalFiltrado.map(persona => (
              <option key={persona.id} value={persona.id}>{persona.nombre}</option>
            ))}
          </Input>
        </div>

        {/* FILA 4: MARCA Y MODELO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Marca" name="marca" value={formData.marca} onChange={handleChange} error={errores.marca} placeholder="Ej: Dell" />
          <Input label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} error={errores.modelo} placeholder="Ej: Optiplex" />
        </div>

        {/* FILA 5: SERIE Y COLOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-8">
          <Input label="Nº de Serie" name="serie" value={formData.serie} onChange={handleChange} error={errores.serie} placeholder="Serial" />
          <Input label="Color" name="color" value={formData.color} onChange={handleChange} error={errores.color} placeholder="Color" />
        </div>

        {/* HARDWARE (ADAPTADO A NUMEROS PARA RAM Y DISCO) */}
        {requiereHardware && (
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <Input label="Procesador" name="procesador" value={formData.procesador} onChange={handleChange} error={errores.procesador} placeholder="Ej: Intel Core i7" />
            <Input label="Memoria RAM (Solo GB)" name="ram" value={formData.ram} onChange={handleChange} error={errores.ram} placeholder="Ej: 16" />
            <Input label="Disco Duro (Solo GB)" name="disco_duro" value={formData.disco_duro} onChange={handleChange} error={errores.disco_duro} placeholder="Ej: 512" />
            <Input label="Sistema Operativo" name="sistema_operativo" type="select" value={formData.sistema_operativo} onChange={handleChange} error={errores.sistema_operativo}>
              <option value="">Seleccione S.O.</option>
              <option value="Windows 11">Windows 11</option>
              <option value="Windows 10">Windows 10</option>
              <option value="Windows 8">Windows 8</option>
              <option value="Windows 7">Windows 7</option>
            </Input>
          </div>
        )}

        <button type="submit" className="w-full bg-[#1a1d23] hover:bg-[#00a8cc] text-white p-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
          <Save size={18} /> Registrar Equipo
        </button>
      </form>
    </div>
  );
};

// Subcomponente Input (Sin cambios, solo para que no falte en tu archivo)
const Input = ({ label, name, value, onChange, error, type = "text", children, ...props }) => {
  const inputId = `field-${name}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">{label}</label>
      {type === "select" ? (
        <select id={inputId} name={name} value={value} onChange={onChange} className={`p-4 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-100'} rounded-2xl text-sm font-bold outline-none`}>
          {children}
        </select>
      ) : (
        <input id={inputId} name={name} value={value} onChange={onChange} className={`p-4 bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-100'} rounded-2xl text-sm font-bold outline-none focus:bg-white`} {...props} />
      )}
      {error && <span className="text-[9px] text-red-500 font-bold uppercase">{error}</span>}
    </div>
  );
};

export default RegistroEquipo;