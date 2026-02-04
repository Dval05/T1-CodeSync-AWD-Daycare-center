import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_CRUD_URL || 'http://localhost:3001';

export default function ChangePasswordModal({ user, onSuccess }) {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es requerida';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
        } else if (formData.newPassword === user.IDNumber) {
            newErrors.newPassword = 'La contraseña no puede ser tu cédula';
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu nueva contraseña';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/change-password`, {
                userId: user.UserID,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                toast.success('Contraseña actualizada correctamente');
                onSuccess();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al cambiar contraseña';
            toast.error(errorMsg);
            
            if (errorMsg.includes('actual incorrecta')) {
                setErrors({ currentPassword: 'Contraseña incorrecta' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-100 p-3 rounded-full">
                        <Lock className="text-red-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Cambiar Contraseña</h2>
                        <p className="text-sm text-gray-500">Primer inicio de sesión</p>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-2">
                    <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Debes cambiar tu contraseña</p>
                        <p className="text-xs">Por seguridad, tu contraseña inicial (tu cédula) debe ser cambiada por una más segura.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña Actual (tu cédula)
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Ingresa tu cédula"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.currentPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                        )}
                    </div>

                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showNew ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                        )}
                    </div>

                    {}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Repite la nueva contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Esta ventana se cerrará automáticamente al cambiar tu contraseña
                </p>
            </div>
        </div>
    );
}
