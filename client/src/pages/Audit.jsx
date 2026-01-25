import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export default function Audit() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const { data } = await crudApi.getAll('student', { IsActive: 1 });
            setStudents(data || []);
        } catch (err) {
            console.error('Error cargando estudiantes (audit):', err);
            toast.error('Error cargando estudiantes');
        }
    };

    const handleCreateTable = () => {
        // Funcionalidad a implementar posteriormente
        toast.success('Crear tabla (pendiente de implementación)');
        console.log('Crear tabla para student', selectedStudent);
    };

    return (
        <Layout>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Auditoría</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Estudiante:</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded"
                        >
                            <option value="">-- Seleccionar estudiante --</option>
                            {students.map(s => (
                                <option key={s.StudentID} value={s.StudentID}>
                                    {s.FirstName} {s.LastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex items-end justify-end">
                        <button
                            onClick={handleCreateTable}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            Crear Tabla
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-500">Aquí podrás generar tablas de auditoría por estudiante. Funcionalidad del botón por configurar.</p>
            </div>
        </Layout>
    );
}
