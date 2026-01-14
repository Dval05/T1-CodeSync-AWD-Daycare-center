import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';
import { User, Trash2, DollarSign, TrendingUp, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    const handleViewDetails = async (student) => {
        setSelectedStudent(student);
        setLoadingDetails(true);
        try {
            const [balanceRes, calculationsRes] = await Promise.all([
                businessApi.students.balance(student.StudentID),
                businessApi.students.calculations(student.StudentID)
            ]);
            setStudentDetails({
                balance: balanceRes.data,
                calculations: calculationsRes.data
            });
        } catch (error) {
            console.error("Error cargando detalles:", error);
            toast.error('Error cargando detalles del estudiante');
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedStudent(null);
        setStudentDetails(null);
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
                        <div className="mt-4 flex justify-between pt-4 border-t">
                            <button 
                                onClick={() => handleViewDetails(stu)}
                                className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700"
                            >
                                <TrendingUp size={16} /> Ver Detalles
                            </button>
                            <button 
                                onClick={() => handleDelete(stu.StudentID)} 
                                className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700"
                            >
                                <Trash2 size={16} /> Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Detalles */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {selectedStudent.FirstName} {selectedStudent.LastName}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {loadingDetails ? (
                                <div className="text-center py-8 text-gray-500">
                                    Cargando detalles...
                                </div>
                            ) : studentDetails ? (
                                <>
                                    {/* Balance Financiero */}
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <DollarSign className="text-green-600" size={20} />
                                            <h4 className="font-bold text-green-900">Balance Financiero</h4>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Pagado</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    ${studentDetails.balance?.totalPaid || 0}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Pendiente</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    ${studentDetails.balance?.totalPending || 0}
                                                </p>
                                            </div>
                                        </div>
                                        {studentDetails.balance?.lastPayment && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Último pago: {new Date(studentDetails.balance.lastPayment).toLocaleDateString('es-ES')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Métricas y Cálculos */}
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <TrendingUp className="text-blue-600" size={20} />
                                            <h4 className="font-bold text-blue-900">Métricas Académicas</h4>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Asistencia</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {studentDetails.calculations?.attendanceRate || 0}%
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Promedio</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {studentDetails.calculations?.averageGrade || 0}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600">Días Activo</p>
                                                <p className="text-2xl font-bold text-indigo-600">
                                                    {studentDetails.calculations?.daysEnrolled || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Información General */}
                                    <div className="border-t pt-4">
                                        <h4 className="font-bold text-gray-800 mb-3">Información General</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">ID Estudiante</p>
                                                <p className="font-medium">{selectedStudent.StudentID}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Fecha de Nacimiento</p>
                                                <p className="font-medium">
                                                    {new Date(selectedStudent.BirthDate).toLocaleDateString('es-ES')}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Grado</p>
                                                <p className="font-medium">Grado ID: {selectedStudent.GradeID}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Estado</p>
                                                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                    Activo
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Error cargando detalles
                                </div>
                            )}
                        </div>

                        <div className="border-t p-4">
                            <button
                                onClick={closeModal}
                                className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}