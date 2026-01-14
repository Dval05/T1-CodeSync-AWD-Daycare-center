import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import DataTable from '../components/common/DataTable';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    
    // Estados para modal simple
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ EmployeeID: '', Description: '', DueDate: '', Status: 'Pending' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [taskRes, empRes] = await Promise.all([
            crudApi.getAll('employee_task'),
            crudApi.getAll('employee')
        ]);
        
        // Enriquecer tareas con nombres de empleados (Join manual en frontend)
        const enrichedTasks = taskRes.data.map(t => {
            const emp = empRes.data.find(e => e.EmpID === t.EmployeeID);
            return { ...t, EmployeeName: emp ? `${emp.FirstName} ${emp.LastName}` : 'Desconocido' };
        });

        setTasks(enrichedTasks);
        setEmployees(empRes.data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await crudApi.create('employee_task', newTask);
            toast.success('Tarea asignada');
            setIsModalOpen(false);
            loadData();
        } catch (e) { toast.error('Error al asignar'); }
    };

    const columns = [
        { header: 'Responsable', accessor: 'EmployeeName' },
        { header: 'Descripción', accessor: 'Description' },
        { header: 'Vencimiento', accessor: 'DueDate', render: i => new Date(i.DueDate).toLocaleDateString() },
        { 
            header: 'Estado', 
            accessor: 'Status',
            render: i => (
                <span className={`px-2 py-1 text-xs rounded-full ${i.Status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {i.Status}
                </span>
            )
        }
    ];

    return (
        <Layout>
            <DataTable 
                title="Asignación de Tareas"
                data={tasks}
                columns={columns}
                searchPlaceholder="Buscar tarea o responsable..."
                onCreate={() => setIsModalOpen(true)}
            />

            {/* Modal Simple */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Nueva Tarea</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <select 
                                className="w-full border p-2 rounded"
                                onChange={e => setNewTask({...newTask, EmployeeID: e.target.value})}
                                required
                            >
                                <option value="">Seleccionar Empleado...</option>
                                {employees.map(e => (
                                    <option key={e.EmpID} value={e.EmpID}>{e.FirstName} {e.LastName}</option>
                                ))}
                            </select>
                            <textarea 
                                placeholder="Descripción de la tarea"
                                className="w-full border p-2 rounded"
                                onChange={e => setNewTask({...newTask, Description: e.target.value})}
                                required
                            />
                            <input 
                                type="date"
                                className="w-full border p-2 rounded"
                                onChange={e => setNewTask({...newTask, DueDate: e.target.value})}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 px-3 py-1 rounded">Cancelar</button>
                                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Asignar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}