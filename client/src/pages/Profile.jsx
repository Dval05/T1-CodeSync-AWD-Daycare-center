import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { crudApi } from '../api/crud';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

export default function Profile() {
    const { user, profile, loading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        FirstName: '',
        LastName: '',
        Email: '',
        PhoneNumber: '',
        Address: ''
    });

    // Actualizar formData cuando profile esté disponible
    useEffect(() => {
        if (profile) {
            setFormData({
                FirstName: profile.FirstName || '',
                LastName: profile.LastName || '',
                Email: profile.Email || user?.email || '',
                PhoneNumber: profile.PhoneNumber || '',
                Address: profile.Address || ''
            });
        }
    }, [profile, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await crudApi.update('user', profile.UserID, formData);
            alert('Perfil actualizado exitosamente');
            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Error actualizando perfil:", error);
            alert('Error al actualizar perfil');
        }
    };

    if (loading || !profile) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Cargando perfil...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Editar Perfil
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold">
                                {formData.FirstName?.charAt(0)}{formData.LastName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">
                                    {formData.FirstName} {formData.LastName}
                                </h3>
                                <p className="text-blue-100">{formData.Email}</p>
                                <div className="flex gap-2 mt-2">
                                    {profile?.roles?.map((role, idx) => (
                                        <span key={idx} className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                                            Rol ID: {role.RoleID}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            value={formData.FirstName}
                                            onChange={(e) => setFormData({...formData, FirstName: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                                        <input
                                            type="text"
                                            value={formData.LastName}
                                            onChange={(e) => setFormData({...formData, LastName: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.Email}
                                            onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={formData.PhoneNumber}
                                            onChange={(e) => setFormData({...formData, PhoneNumber: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                    <textarea
                                        value={formData.Address}
                                        onChange={(e) => setFormData({...formData, Address: e.target.value})}
                                        className="w-full border rounded-lg px-4 py-2"
                                        rows="3"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                        Guardar Cambios
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <User className="text-gray-400 mt-1" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Nombre Completo</p>
                                            <p className="font-medium text-gray-800">{formData.FirstName} {formData.LastName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="text-gray-400 mt-1" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{formData.Email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="text-gray-400 mt-1" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Teléfono</p>
                                            <p className="font-medium text-gray-800">{formData.PhoneNumber || 'No especificado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Shield className="text-gray-400 mt-1" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Usuario</p>
                                            <p className="font-medium text-gray-800">{profile?.UserName || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-gray-400 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm text-gray-500">Dirección</p>
                                        <p className="font-medium text-gray-800">{formData.Address || 'No especificada'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}