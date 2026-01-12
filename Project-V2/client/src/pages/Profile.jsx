import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, profile } = useAuth();

    return (
        <Layout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>
            <div className="bg-white p-8 rounded-lg shadow max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                    <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {profile?.FirstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{profile?.FirstName} {profile?.LastName}</h3>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario de Sistema</label>
                        <p className="mt-1 text-gray-900">{profile?.UserName || 'No configurado'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID de Usuario</label>
                        <p className="mt-1 text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">{user?.UserName}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rol Asignado</label>
                        <div className="mt-2 flex gap-2">
                            {profile?.roles?.length > 0 ? profile.roles.map((r, i) => (
                                <span key={i} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">
                                    Rol ID: {r.RoleID}
                                </span>
                            )) : <span className="text-gray-400 italic">Sin roles asignados</span>}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}