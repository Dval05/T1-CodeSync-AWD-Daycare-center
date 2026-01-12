import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export default function Attendance() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { StudentID: 'Present' | 'Absent' }

    useEffect(() => {
        loadList();
    }, []);

    const loadList = async () => {
        const { data } = await crudApi.getAll('student', { IsActive: 1 });
        setStudents(data);
        // Inicializar todos como Presentes por defecto
        const initialStatus = {};
        data.forEach(s => initialStatus[s.StudentID] = 'Present');
        setAttendance(initialStatus);
    };

    const handleToggle = (id) => {
        setAttendance(prev => ({
            ...prev,
            [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSave = async () => {
        try {
            const promises = students.map(stu => {
                return crudApi.create('attendance', {
                    StudentID: stu.StudentID,
                    Date: date,
                    Status: attendance[stu.StudentID],
                    Remarks: 'Registro diario'
                });
            });
            await Promise.all(promises);
            toast.success('Asistencia guardada correctamente');
        } catch (error) {
            toast.error('Error guardando asistencia');
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
                <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="border p-2 rounded"
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {students.map(stu => (
                            <tr key={stu.StudentID}>
                                <td className="px-6 py-4">{stu.FirstName} {stu.LastName}</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleToggle(stu.StudentID)}
                                        className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                            attendance[stu.StudentID] === 'Present' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {attendance[stu.StudentID] === 'Present' ? 'Presente' : 'Ausente'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg font-bold">
                    Guardar Asistencia
                </button>
            </div>
        </Layout>
    );
}