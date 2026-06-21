import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componentes globales
import Navbar from './components/Navbar';

// Módulos V2
import { DashboardPage }    from './features/dashboard/components/DashboardPage';
import { InventarioPage }   from './features/inventario/components/InventarioPage';
import { MantenimientoPage } from './features/mantenimiento/components/MantenimientoPage';
import { ConfiguracionPage } from './features/configuracion/components/ConfiguracionPage';

// Login
import Login from './features/auth/Login';

/**
 * Protege las rutas: redirige al login si no hay sesión activa.
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Layout principal con Navbar.
 */
const MainLayout = ({ children }) => (
    <div className="min-h-screen bg-[#f8fafc]">
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
                    {/* Ruta pública */}
                    <Route path="/login" element={<Login />} />

                    {/* Rutas privadas V2 */}
                    <Route
                        path="/*"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <Routes>
                                        <Route path="/"               element={<Navigate to="/v2/dashboard" />} />
                                        <Route path="/v2/dashboard"   element={<DashboardPage />} />
                                        <Route path="/v2/inventario"  element={<InventarioPage />} />
                                        <Route path="/v2/mantenimiento" element={<MantenimientoPage />} />
                                        <Route path="/v2/configuracion" element={<ConfiguracionPage />} />
                                        {/* Cualquier ruta no encontrada → dashboard */}
                                        <Route path="*" element={<Navigate to="/v2/dashboard" />} />
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