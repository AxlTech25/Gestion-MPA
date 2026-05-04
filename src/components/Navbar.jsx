import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Monitor } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-[#1a1d23] text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <Monitor className="text-[#00a8cc]" size={28} />
          <Link to="/" className="text-xl font-black tracking-widest uppercase">
            Sigemad <span className="text-[#00a8cc]">MPA</span>
          </Link>
        </div>

        {/* ENLACES - Ahora con colores que contrastan */}
        <div className="hidden md:flex items-center space-x-8">
          <MenuLink to="/v2/dashboard" label="Dashboard" active={location.pathname === '/v2/dashboard'} />
          <MenuLink to="/v2/inventario" label="Inventario" active={location.pathname === '/v2/inventario'} />
          <MenuLink to="/v2/mantenimiento" label="Mantenimiento" active={location.pathname === '/v2/mantenimiento'} />
          <MenuLink to="/v2/configuracion" label="Configuración" active={location.pathname === '/v2/configuracion'} />
        </div>

        {/* PERFIL Y SALIR */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:block text-right pr-4 border-r border-slate-700">
            <p className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Sesión activa</p>
            <p className="text-sm font-semibold text-white">{user?.nombre || 'Administrador'}</p>
          </div>
          
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-[#00a8cc] hover:bg-[#008fb0] text-white px-6 py-2.5 rounded-full text-xs font-black uppercase transition-all shadow-lg flex items-center gap-2"
          >
            Salir <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const MenuLink = ({ to, label, active }) => (
  <Link 
    to={to} 
    className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-[#00a8cc] ${
      active ? 'text-[#00a8cc]' : 'text-slate-300'
    }`}
  >
    {label}
  </Link>
);

export default Navbar;