import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import { Shield, Trash2, UserPlus, Edit, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../components/common/Modal'; // Asegúrate de importar tu Modal

export default function Users() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para el Modal y Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null = Crear, Objeto = Editar

    // Cargar Usuarios y Roles
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, rolesRes] = await Promise.all([
                crudApi.getAll('user'), 
                crudApi.getAll('role')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (error) {
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    // --- MANEJADORES DE ACCIONES ---

    // 1. Asignar Rol Rápido (Desde la tabla)
    const handleAssignRole = async (userId, roleId) => {
        if (!roleId) return;
        try {
            await crudApi.create('user_role', { UserID: userId, RoleID: roleId });
            toast.success('Rol asignado correctamente');
            // Opcional: recargar si quieres ver cambios reflejados inmediatamente en alguna columna
        } catch (error) {
            toast.error('Error al asignar rol');
        }
    };

    // 2. Eliminar Usuario
    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await crudApi.remove('user', id);
            toast.success('Usuario eliminado');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    // 3. Guardar Usuario (Crear o Editar)
    const handleSaveUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Convertir IsActive a número
        data.IsActive = data.IsActive === 'true' ? 1 : 0;

        try {
            if (editingUser) {
                // UPDATE
                await crudApi.update('user', editingUser.UserID, data);
                toast.success('Usuario actualizado');
            } else {
                // CREATE (Asegurar campos mínimos)
                await crudApi.create('user', data);
                toast.success('Usuario creado');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar usuario');
        }
    };

    // 4. Abrir Modal
    const openModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            {/* Header con Botón de Crear */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                <button 
                    onClick={() => openModal(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <UserPlus size={20} /> Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol Rápido</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Controles</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.UserID} className="hover:bg-gray-50 transition-colors">
                                    {/* Nombre y Username */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{user.FirstName} {user.LastName}</div>
                                        <div className="text-xs text-blue-600 font-mono">@{user.UserName}</div>
                                    </td>

                                    {/* Email y Teléfono */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.Email}</div>
                                        {user.Phone && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Phone size={12} /> {user.Phone}
                                            </div>
                                        )}
                                    </td>

                                    {/* Dirección */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.Address ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="truncate max-w-[150px]" title={user.Address}>{user.Address}</span>
                                            </div>
                                        ) : <span className="text-gray-300 italic">--</span>}
                                    </td>

                                    {/* Estado */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.IsActive ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 items-center gap-1">
                                                <CheckCircle size={12} /> Activo
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 items-center gap-1">
                                                <XCircle size={12} /> Inactivo
                                            </span>
                                        )}
                                    </td>

                                    {/* Asignación Rápida de Rol */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-purple-500" />
                                            <select 
                                                className="border border-gray-300 rounded p-1 text-xs focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                onChange={(e) => handleAssignRole(user.UserID, e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Asignar Rol...</option>
                                                {roles.map(role => (
                                                    <option key={role.RoleID} value={role.RoleID}>{role.RoleName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>

                                    {/* Botones de Acción */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openModal(user)} 
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition"
                                                title="Editar Usuario"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.UserID)} 
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition"
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL PARA CREAR / EDITAR */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            >
                <form onSubmit={handleSaveUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Usuario (Nick)</label>
                            <input 
                                name="UserName" 
                                defaultValue={editingUser?.UserName} 
                                required 
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input 
                                name="Email" 
                                type="email" 
                                defaultValue={editingUser?.Email} 
                                required 
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input 
                                name="FirstName" 
                                defaultValue={editingUser?.FirstName} 
                                required 
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input 
                                name="LastName" 
                                defaultValue={editingUser?.LastName} 
                                required 
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input 
                                name="Phone" 
                                defaultValue={editingUser?.Phone} 
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select 
                                name="IsActive" 
                                defaultValue={editingUser?.IsActive ? 'true' : 'true'} 
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input 
                            name="Address" 
                            defaultValue={editingUser?.Address} 
                            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="mr-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-medium"
                        >
                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}