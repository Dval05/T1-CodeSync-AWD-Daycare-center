import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';
import DataTable from '../components/common/DataTable';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ 
        employeeId: '', 
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
        try {
            const [taskRes, empRes] = await Promise.all([
                crudApi.getAll('employee_task'),
                crudApi.getAll('employee', { IsActive: 1 })
            ]);
            
            const enrichedTasks = (taskRes.data || []).map(t => {
                const emp = (empRes.data || []).find(e => e.EmpID === t.EmpID);
                return { 
                    ...t, 
                    EmployeeName: emp ? `${emp.FirstName} ${emp.LastName}` : 'Desconocido',
                    Position: emp?.Position || ''
                };
            });

            setTasks(enrichedTasks);
            setEmployees(empRes.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar tareas');
            setTasks([]);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        if (!newTask.employeeId || !newTask.title) {
            toast.error('Complete los campos requeridos');
            return;
        }

        try {
            const response = await businessApi.employees.assignTask({
                employeeId: parseInt(newTask.employeeId),
                title: newTask.title,
                description: newTask.description,
                dueDate: newTask.dueDate,
                priority: newTask.priority
            });
            
            if (response.data.success) {
                toast.success('✅ Tarea asignada exitosamente');
                setIsModalOpen(false);
                setNewTask({ 
                    employeeId: '', 
                    title: '',
                    description: '', 
                    dueDate: '', 
                    priority: 'Media' 
                });
                loadData();
            } else {
                toast.error(response.data.message || 'Error al asignar');
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || 'Error al asignar tarea';
            toast.error(errorMsg);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Completed': return <CheckCircle className="text-green-600" size={18} />;
            case 'In Progress': return <Clock className="text-blue-600" size={18} />;
            default: return <AlertCircle className="text-yellow-600" size={18} />;
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'High':
            case 'Urgent': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { 
            header: 'Responsable', 
            accessor: 'EmployeeName',
            render: (task) => (
                <div>
                    <p className="font-medium text-gray-900">{task.EmployeeName}</p>
                    <p className="text-xs text-gray-500">{task.Position}</p>
                </div>
            )
        },
        { 
            header: 'Tarea', 
            accessor: 'TaskName',
            render: (task) => (
                <div>
                    <p className="font-medium text-gray-900">{task.TaskName}</p>
                    {task.Description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{task.Description}</p>
                    )}
                </div>
            )
        },
        { 
            header: 'Vencimiento', 
            accessor: 'DueDate', 
            render: (task) => task.DueDate ? new Date(task.DueDate).toLocaleDateString('es-ES') : 'Sin fecha'
        },
        { 
            header: 'Prioridad', 
            accessor: 'Priority',
            render: (task) => (
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.Priority)}`}>
                    {task.Priority || 'Medium'}
                </span>
            )
        },
        { 
            header: 'Estado', 
            accessor: 'Status',
            render: (task) => (
                <div className="flex items-center gap-2">
                    {getStatusIcon(task.Status)}
                    <span className="text-sm">{task.Status || 'Pending'}</span>
                    <div className="ml-auto flex gap-1">
                        <button onClick={async () => {
                            try { await businessApi.employees.updateTaskStatus(task.TaskID, { status: 'In Progress' }); toast.success('Tarea en progreso'); loadData(); } catch (e) { toast.error('No se pudo actualizar'); }
                        }} className="text-xs px-2 py-1 bg-gray-100 rounded">En progreso</button>
                        <button onClick={async () => {
                            try { await businessApi.employees.updateTaskStatus(task.TaskID, { status: 'Completed', completedDate: new Date().toISOString().split('T')[0] }); toast.success('Tarea completada'); loadData(); } catch (e) { toast.error('No se pudo completar'); }
                        }} className="text-xs px-2 py-1 bg-green-100 rounded">Completar</button>
                    </div>
                </div>
            )
        }
    ];

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-gray-600">Cargando tareas...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <DataTable 
                title="Asignación de Tareas"
                data={tasks}
                columns={columns}
                searchPlaceholder="Buscar tarea o responsable..."
                onCreate={() => setIsModalOpen(true)}
            />

            {}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nueva Tarea</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Empleado *
                                </label>
                                <select 
                                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={newTask.employeeId}
                                    onChange={e => setNewTask({...newTask, employeeId: e.target.value})}
                                    required
                                >
                                    <option value="">Seleccionar Empleado...</option>
                                    {employees.map(e => (
                                        <option key={e.EmpID} value={e.EmpID}>
                                            {e.FirstName} {e.LastName} - {e.Position}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título de la Tarea *
                                </label>
                                <input
                                    placeholder="Ej: Preparar material didáctico"
                                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={newTask.title}
                                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea 
                                    placeholder="Detalles de la tarea..."
                                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                    value={newTask.description}
                                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha Límite
                                    </label>
                                    <input 
                                        type="date"
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridad
                                    </label>
                                    <select 
                                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({...newTask, priority: e.target.value})}
                                    >
                                        <option>Baja</option>
                                        <option>Media</option>
                                        <option>Alta</option>
                                        <option>Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setNewTask({ 
                                            employeeId: '', 
                                            title: '',
                                            description: '', 
                                            dueDate: '', 
                                            priority: 'Media' 
                                        });
                                    }} 
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                >
                                    Asignar Tarea
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}