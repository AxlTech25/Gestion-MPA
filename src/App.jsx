import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Componentes globales
import Navbar from './components/Navbar';

// Módulos V2
import { DashboardPage }    from './features/dashboard/components/DashboardPage';
import { InventarioPage }   from './features/inventario/components/InventarioPage';
import { MantenimientoPage } from './features/mantenimiento/components/MantenimientoPage';
import { ConfiguracionPage } from './features/configuracion/components/ConfiguracionPage';
import { FichaTecnicaPage } from './features/inventario/components/FichaTecnicaPage';
import { CronogramaListPage } from './features/cronograma/components/CronogramaListPage';
import { CronogramaMatrizPage } from './features/cronograma/components/CronogramaMatrizPage';

// Login
import Login from './features/auth/Login';

/**
 * Protege las rutas: redirige al login si no hay sesión activa.
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const redirectToLogin = () => logout();
        window.addEventListener('auth:logout', redirectToLogin);
        return () => window.removeEventListener('auth:logout', redirectToLogin);
    }, [logout]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

const RoleRoute = ({ children, roles }) => {
    const { user } = useAuth();
    if (!roles.includes(user?.rol)) {
        return <Navigate to="/v2/dashboard" replace />;
    }
    return children;
};

/**
 * Layout principal con Navbar.
 */
const MainLayout = ({ children }) => {
    const location = useLocation();
    const wide = /^\/v2\/cronograma\/\d+/.test(location.pathname);
    return (
    <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <div className={`${wide ? 'max-w-[1800px]' : 'max-w-7xl'} mx-auto py-10 px-6`}>
            {children}
        </div>
    </div>
    );
};

function App() {
    const basename = (import.meta.env.VITE_BASE_PATH || '/').replace(/\/$/, '') || undefined;

    return (
        <AuthProvider>
            <Router basename={basename}>
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
                                        <Route path="/v2/ficha-tecnica" element={<FichaTecnicaPage />} />
                                        <Route path="/v2/mantenimiento" element={<MantenimientoPage />} />
                                        <Route path="/v2/cronograma/:id" element={<CronogramaMatrizPage />} />
                                        <Route path="/v2/cronograma" element={<CronogramaListPage />} />
                                        <Route
                                            path="/v2/configuracion"
                                            element={
                                                <RoleRoute roles={['Administrador']}>
                                                    <ConfiguracionPage />
                                                </RoleRoute>
                                            }
                                        />
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