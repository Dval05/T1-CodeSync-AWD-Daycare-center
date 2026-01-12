import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Login() {
    const { loginWithPassword, loginWithGoogle } = useAuth();
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            const { error } = await loginWithPassword(data.email, data.password);
            if (error) throw error;
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Error de autenticación');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 overflow-hidden relative">
            {/* Animación de Fondo (Tus Blobs) */}
            <div className="absolute w-full max-w-md m-4">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                
                {/* Tarjeta de Login */}
                <div className="relative bg-white bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-200">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center">
                            <i className="fas fa-child fa-3x text-blue-500 mr-2"></i>
                            <h1 className="text-4xl font-bold text-gray-800">NiceKids</h1>
                        </div>
                        <p className="text-gray-500 mt-2">Gestión Educativa Simplificada</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <input 
                                {...register("email")} 
                                type="email" 
                                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="admin@nicekids.com"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input 
                                {...register("password")} 
                                type="password" 
                                className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 focus:border-blue-500 focus:ring-blue-500"
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-3 text-center transition-transform transform hover:scale-105"
                        >
                            Ingresar
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 mb-4">o ingresa con</p>
                        <button 
                            onClick={loginWithGoogle} 
                            className="w-full flex justify-center items-center gap-2 border border-gray-300 bg-white text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                            <span>Google</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}