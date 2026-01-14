import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import { Shield, CheckSquare, Square, Plus, Trash2, Tag } from 'lucide-react';

export default function Roles() {
    // Estado de datos
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado del formulario
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPerms, setSelectedPerms] = useState(new Set()); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar Roles y Permisos existentes
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                crudApi.getAll('role'), // Traemos todos los roles
                crudApi.getAll('permission')
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (error) {
            toast.error('Error cargando datos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Manejar selección de checkbox (Toggle)
    const togglePermission = (id) => {
        const newSet = new Set(selectedPerms);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedPerms(newSet);
    };

    // Crear Rol + Asignar Permisos
    const handleCreateRole = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) return toast.error('El nombre del rol es obligatorio');
        if (selectedPerms.size === 0) return toast.error('Debes seleccionar al menos un permiso');

        setIsSubmitting(true);
        try {
            // 1. Crear el Rol
            const rolePayload = {
                RoleName: roleName,
                Description: description,
                IsActive: 1
            };
            const roleResponse = await crudApi.create('role', rolePayload);
            
            // Supabase a veces devuelve un array, aseguramos obtener el objeto
            const createdRole = Array.isArray(roleResponse.data) ? roleResponse.data[0] : roleResponse.data;
            const newRoleId = createdRole.RoleID;

            // 2. Crear las relaciones en 'role_permission'
            const permissionPromises = Array.from(selectedPerms).map(permId => {
                return crudApi.create('role_permission', {
                    RoleID: newRoleId,
                    PermissionID: permId
                });
            });

            await Promise.all(permissionPromises);

            toast.success('Rol creado exitosamente');
            
            // Limpiar y recargar
            setRoleName('');
            setDescription('');
            setSelectedPerms(new Set());
            loadData();

        } catch (error) {
            console.error(error);
            toast.error('Error al guardar el rol');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRole = async (id) => {
        if (!confirm('¿Estás seguro de desactivar este rol?')) return;
        try {
            await crudApi.remove('role', id);
            toast.success('Rol eliminado');
            loadData();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
                
                {/* COLUMNA IZQUIERDA: Formulario de Creación */}
                <div className="lg:w-2/3 bg-white rounded-lg shadow-lg flex flex-col">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Plus className="text-blue-600" /> Nuevo Rol
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Crea un rol y asigna sus permisos.</p>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <form id="roleForm" onSubmit={handleCreateRole} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
                                    <input 
                                        type="text" 
                                        value={roleName}
                                        onChange={e => setRoleName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ej: Editor de Notas"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <input 
                                        type="text" 
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Permite editar calificaciones..."
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Selector de Permisos */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex justify-between">
                                    <span>Seleccionar Permisos</span>
                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                                        {selectedPerms.size} seleccionados
                                    </span>
                                </label>
                                
                                <div className="max-h-[400px] overflow-y-auto p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {permissions.map(perm => {
                                        const isSelected = selectedPerms.has(perm.PermissionID);
                                        return (
                                            <div 
                                                key={perm.PermissionID}
                                                onClick={() => !isSubmitting && togglePermission(perm.PermissionID)}
                                                className={`cursor-pointer p-3 rounded-lg border flex items-start gap-3 transition-all ${
                                                    isSelected 
                                                    ? 'bg-blue-50 border-blue-500 shadow-sm' 
                                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="mt-0.5">
                                                    {isSelected 
                                                        ? <CheckSquare size={18} className="text-blue-600" /> 
                                                        : <Square size={18} className="text-gray-400" />
                                                    }
                                                </div>
                                                <div className="flex-1">
                                                    {/* CORRECCIÓN AQUÍ: Usamos los nombres reales de la BD */}
                                                    <h4 className={`text-sm font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                                                        {perm.PermissionName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">{perm.Description}</p>
                                                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider text-gray-400 bg-gray-100 px-1.5 rounded">
                                                        {perm.Module}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                        <button 
                            type="submit" 
                            form="roleForm"
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar Nuevo Rol'}
                        </button>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Lista de Roles */}
                <div className="lg:w-1/3 bg-white rounded-lg shadow-lg flex flex-col">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="text-purple-600" /> Roles Activos
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-3">
                            {loading && <p className="text-center text-gray-400 py-4">Cargando roles...</p>}
                            
                            {!loading && roles.map(role => (
                                <div key={role.RoleID} className="group flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all shadow-sm">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{role.RoleName}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{role.Description}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteRole(role.RoleID)}
                                        className="text-gray-300 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                                        title="Eliminar Rol"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}