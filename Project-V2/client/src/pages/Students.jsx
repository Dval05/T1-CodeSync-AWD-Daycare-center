import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import { User, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Students() {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const { data } = await crudApi.getAll('student', { IsActive: 1 });
            setStudents(data);
        } catch (error) {
            toast.error('Error cargando estudiantes');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar estudiante?')) return;
        try {
            await crudApi.remove('student', id);
            toast.success('Estudiante eliminado');
            loadStudents();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Estudiantes</h2>
                <Link to="/intake" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + Nuevo Estudiante
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(stu => (
                    <div key={stu.StudentID} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{stu.FirstName} {stu.LastName}</h3>
                                <p className="text-sm text-gray-500">Nacimiento: {new Date(stu.BirthDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end pt-4 border-t">
                            <button onClick={() => handleDelete(stu.StudentID)} className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700">
                                <Trash2 size={16} /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}