import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import { Shield, Trash2, UserPlus, Edit, MapPin, Phone, CheckCircle, XCircle, X } from 'lucide-react';
import Modal from '../components/common/Modal'; 
export default function Users() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [userRoles, setUserRoles] = useState({}); // Roles asignados por usuario
    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'role:<id>'

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, rolesRes, userRolesRes] = await Promise.all([
                crudApi.getAll('user'), 
                crudApi.getAll('role'),
                crudApi.getAll('user_role')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
            
            // Organizar roles por usuario
            const rolesMap = {};
            userRolesRes.data.forEach(ur => {
                if (!rolesMap[ur.UserID]) {
                    rolesMap[ur.UserID] = [];
                }
                rolesMap[ur.UserID].push(ur.RoleID);
            });
            setUserRoles(rolesMap);
        } catch (error) {
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async (userId, roleId) => {
        if (!roleId) return;
        
        // Verificar si el usuario ya tiene este rol
        const currentUserRoles = userRoles[userId] || [];
        if (currentUserRoles.includes(parseInt(roleId))) {
            toast.error('El usuario ya tiene este rol asignado');
            return;
        }
        
        try {
            await crudApi.create('user_role', { UserID: userId, RoleID: parseInt(roleId) });
            toast.success('Rol asignado correctamente');
            loadData(); // Recargar para actualizar los roles
        } catch (error) {
            console.error('Error asignando rol:', error);
            toast.error(error.response?.data?.error || 'Error al asignar rol');
        }
    };

    const handleRemoveRole = async (userId, roleId) => {
        try {
            // Buscar el registro user_role específico para eliminarlo
            const { data: userRoleRecords } = await crudApi.getAll('user_role', { 
                UserID: userId, 
                RoleID: roleId 
            });
            
            if (userRoleRecords && userRoleRecords.length > 0) {
                const recordId = userRoleRecords[0].UserRoleID;
                await crudApi.remove('user_role', recordId);
                toast.success('Rol removido correctamente');
                loadData(); // Recargar para actualizar los roles
            }
        } catch (error) {
            console.error('Error removiendo rol:', error);
            toast.error('Error al remover rol');
        }
    };

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

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        data.IsActive = data.IsActive === 'true' ? 1 : 0;

        try {
            if (editingUser) {
                await crudApi.update('user', editingUser.UserID, data);
                toast.success('Usuario actualizado');
            } else {
                // Al crear, el backend automáticamente usará la cédula como contraseña
                await crudApi.create('user', data);
                toast.success('Usuario creado. Contraseña inicial: su cédula');
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error al guardar usuario');
        }
    };

    const openModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <Layout>
            {}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                    <select
                        className="border border-gray-300 rounded p-2 text-sm"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        aria-label="Filtrar usuarios"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                        {roles.map(r => <option key={r.RoleID} value={`role:${r.RoleID}`}>{r.RoleName}</option>)}
                    </select>
                </div>
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
                            {(() => {
                                const filtered = users.filter(user => {
                                    if (userFilter === 'all') return true;
                                    if (userFilter === 'active') return !!user.IsActive;
                                    if (userFilter === 'inactive') return !user.IsActive;
                                    if (userFilter.startsWith('role:')) {
                                        const roleId = parseInt(userFilter.split(':')[1]);
                                        return (userRoles[user.UserID] || []).includes(roleId);
                                    }
                                    return true;
                                });
                                return filtered.map((user) => (
                                <tr key={user.UserID} className="hover:bg-gray-50 transition-colors">
                                    {}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{user.FirstName} {user.LastName}</div>
                                        <div className="text-xs text-blue-600 font-mono">@{user.UserName}</div>
                                    </td>

                                    {}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.Email}</div>
                                        {user.Phone && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Phone size={12} /> {user.Phone}
                                            </div>
                                        )}
                                    </td>

                                    {}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.Address ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="truncate max-w-[150px]" title={user.Address}>{user.Address}</span>
                                            </div>
                                        ) : <span className="text-gray-300 italic">--</span>}
                                    </td>

                                    {}
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

                                    {}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col gap-2">
                                            {/* Roles actuales */}
                                            {userRoles[user.UserID] && userRoles[user.UserID].length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {userRoles[user.UserID].map(roleId => {
                                                        const role = roles.find(r => r.RoleID === roleId);
                                                        return role ? (
                                                            <span key={roleId} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1 group">
                                                                <Shield size={12} /> 
                                                                {role.RoleName}
                                                                <button
                                                                    onClick={() => handleRemoveRole(user.UserID, roleId)}
                                                                    className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                                                    title={`Remover rol ${role.RoleName}`}
                                                                >
                                                                    <X size={10} className="text-purple-600" />
                                                                </button>
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Sin roles asignados</span>
                                            )}
                                            
                                            {/* Selector para agregar más roles */}
                                            <div className="flex items-center gap-2">
                                                <select 
                                                    className="border border-gray-300 rounded p-1 text-xs focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
                                                    onChange={(e) => {
                                                        handleAssignRole(user.UserID, e.target.value);
                                                        e.target.value = ''; // Reset select
                                                    }}
                                                    value=""
                                                >
                                                    <option value="">+ Agregar rol...</option>
                                                    {roles
                                                        .filter(role => !userRoles[user.UserID]?.includes(role.RoleID))
                                                        .map(role => (
                                                            <option key={role.RoleID} value={role.RoleID}>
                                                                {role.RoleName}
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </td>

                                    {}
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
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>

            {}
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
                            <label className="block text-sm font-medium text-gray-700">Cédula</label>
                            <input 
                                name="IDNumber" 
                                defaultValue={editingUser?.IDNumber} 
                                required={!editingUser}
                                pattern="[0-9]{10}"
                                maxLength={10}
                                placeholder="10 dígitos"
                                disabled={!!editingUser}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            />
                            {!editingUser && <p className="text-xs text-gray-500 mt-1">La contraseña inicial será la cédula</p>}
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