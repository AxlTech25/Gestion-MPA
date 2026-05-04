import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importación de Componentes Globales
import Navbar from './components/Navbar';

// Importación de Módulos (Servicios)
import Login from './modules/Auth/Login';
import Dashboard from './modules/Dashboard/Dashboard';
import TablaInventario from './modules/Inventario/TablaInventario';
import RegistroEquipo from './modules/Inventario/RegistroEquipo';
import FichaMantenimiento from './modules/Mantenimiento/FichaMantenimiento';

// Importación de Módulos V2 (Nueva Arquitectura)
import { DashboardPage } from './features/dashboard/components/DashboardPage';
import { InventarioPage } from './features/inventario/components/InventarioPage';
import { MantenimientoPage } from './features/mantenimiento/components/MantenimientoPage';
import { ConfiguracionPage } from './features/configuracion/components/ConfiguracionPage';

/**
 * Componente para proteger rutas.
 * Redirige al Login si el usuario no ha iniciado sesión.
 */
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

/**
 * Diseño principal que envuelve las páginas con la Navbar superior.
 */
const MainLayout = ({ children }) => (
<div className="min-h-screen bg-[#f8fafc]"> {/* Gris muy suave de fondo */}
        <Navbar />
        <div className="max-w-7xl mx-auto py-10 px-6">
            {children}
        </div>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Ruta pública de acceso */}
                    <Route path="/login" element={<Login />} />

                    {/* Rutas protegidas de Sigemad */}
                    <Route 
                        path="/*" 
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/inventario" element={<TablaInventario />} />
                                        <Route path="/registro-equipo" element={<RegistroEquipo />} />
                                        <Route path="/ficha-mantenimiento" element={<FichaMantenimiento />} />
                                        
                                           {/* Rutas para futuros servicios V1 */}
                                        <Route path="/cronograma" element={<div className="p-10 text-center text-slate-400">Servicio de Cronograma: Próximamente</div>} />
                                        <Route path="/historial" element={<div className="p-10 text-center text-slate-400">Servicio de Historial: Próximamente</div>} />
                                        <Route path="/ficha-tecnica" element={<div className="p-10 text-center text-slate-400">Servicio de Ficha Técnica (MPA): Próximamente</div>} />
                                        
                                        {/* --- RUTAS V2 (NUEVA ARQUITECTURA) --- */}
                                        <Route path="/v2/dashboard" element={<DashboardPage />} />
                                        <Route path="/v2/inventario" element={<InventarioPage />} />
                                        <Route path="/v2/mantenimiento" element={<MantenimientoPage />} />
                                        <Route path="/v2/configuracion" element={<ConfiguracionPage />} />

                                        {/* Redirección en caso de ruta no encontrada */}
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Routes>
                                </MainLayout>
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;