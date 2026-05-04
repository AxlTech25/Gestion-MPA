import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ usuario: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login.php', credentials);
            if (res.data.status === 'success') {
                login(res.data.user);
                navigate('/inventario');
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            alert("Error al conectar con el servidor");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">SISTEMA SIGEMAD</h2>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Usuario</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded"
                        onChange={(e) => setCredentials({...credentials, usuario: e.target.value})}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">Contraseña</label>
                    <input 
                        type="password" 
                        className="w-full p-2 border rounded"
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    />
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
                    Ingresar
                </button>
            </form>
        </div>
    );
};

export default Login;