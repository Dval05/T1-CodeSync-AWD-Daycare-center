import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { StaffModal } from '../components/modals/StaffModal';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';
import { User, Calendar, CheckSquare, Plus, X, Edit, Trash2 } from 'lucide-react';

export default function Staff() {
    const [staff, setStaff] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Media'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [staffRes, schedulesRes] = await Promise.all([
                crudApi.getAll('employee', { IsActive: 1 }),
                businessApi.employees.schedules().catch(() => ({ data: [] }))
            ]);
            
            setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
            
            if (schedulesRes.data && Array.isArray(schedulesRes.data)) {
                setSchedules(schedulesRes.data);
            } else {
                setSchedules([]); 
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            setError("Error al cargar los datos del personal");
            setStaff([]);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = () => {
        setEditingEmployee(null);
        setIsStaffModalOpen(true);
    };

    const handleEditStaff = (employee) => {
        setEditingEmployee(employee);
        setIsStaffModalOpen(true);
    };

    const handleSaveStaff = async (data) => {
        try {
            if (editingEmployee) {
                await crudApi.update('employee', editingEmployee.EmpID, data);
                toast.success('Personal actualizado correctamente');
            } else {
                await crudApi.create('employee', data);
                toast.success('Personal creado correctamente');
            }
            setIsStaffModalOpen(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error guardando personal');
        }
    };

    const handleDeleteStaff = async (employee) => {
        if (!confirm(`¿Desactivar a ${employee.FirstName} ${employee.LastName}?`)) return;
        
        try {
            await crudApi.remove('employee', employee.EmpID);
            toast.success('Personal desactivado correctamente');
            loadData();
        } catch (error) {
            toast.error('Error al desactivar');
        }
    };

    const handleAssignTask = async () => {
        if (!selectedEmployee || !newTask.title) return;
        
        try {
            const response = await businessApi.employees.assignTask({
                employeeId: selectedEmployee.EmpID,
                title: newTask.title,
                description: newTask.description,
                dueDate: newTask.dueDate,
                priority: newTask.priority
            });
            
            if (response.data.success) {
                toast.success(`Tarea asignada a ${selectedEmployee.FirstName} ${selectedEmployee.LastName}`);
                setShowTaskModal(false);
                setNewTask({ title: '', description: '', dueDate: '', priority: 'Media' });
                setSelectedEmployee(null);
            } else {
                throw new Error(response.data.message || 'Error desconocido');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || 'Error al asignar tarea');
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Personal</h2>
                </div>

                {}
                {loading && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Cargando personal...</p>
                    </div>
                )}

                {}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                        <button 
                            onClick={loadData}
                            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}

                {}
                {!loading && !error && (
                    <>
                        {}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-blue-600" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">Horarios</h3>
                            </div>
                            {schedules.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No hay horarios configurados</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {schedules.map((schedule, idx) => (
                                        <div key={idx} className="border rounded-lg p-4">
                                            <p className="font-bold text-gray-800">{schedule.name}</p>
                                            <p className="text-sm text-gray-600">{schedule.schedule}</p>
                                            <p className="text-xs text-gray-500 mt-1">{schedule.days}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                    <button
                        onClick={handleCreateStaff}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={20} /> Nuevo Personal
                    </button>
                        </div>

                        {/* Lista de Personal */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Directorio</h3>
                            {staff.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No hay personal registrado</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {staff.map(employee => (
                                        <div key={employee.EmpID} className="border rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">
                                                            {employee.FirstName} {employee.LastName}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">{employee.Position || 'Empleado'}</p>
                                                        <p className="text-xs text-gray-500">{employee.Email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t">
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setShowTaskModal(true);
                                                    }}
                                                    className="w-full bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm flex items-center justify-center gap-1"
                                                >
                                                    <CheckSquare size={16} />
                                                    Asignar Tarea
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal Asignar Tarea */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="border-b p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Asignar Tarea</h3>
                            <button onClick={() => setShowTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Empleado:</p>
                                <p className="font-bold text-gray-800">
                                    {selectedEmployee?.FirstName} {selectedEmployee?.LastName}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Ej: Preparar material didáctico"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows="3"
                                    placeholder="Detalles de la tarea..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Límite</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option>Baja</option>
                                        <option>Media</option>
                                        <option>Alta</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-4 flex gap-2">
                            <button
                                onClick={handleAssignTask}
                                disabled={!newTask.title}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                Asignar Tarea
                            </button>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >

            <StaffModal
                isOpen={isStaffModalOpen}
                onClose={() => setIsStaffModalOpen(false)}
                onSave={handleSaveStaff}
                staff={editingEmployee}
            />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}