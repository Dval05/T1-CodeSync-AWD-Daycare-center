import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { StudentModal } from '../components/modals/StudentModal';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';
import { User, DollarSign, X, TrendingUp } from 'lucide-react';
import { ActionButton } from '../components/permissions/ActionButton';

export default function Students() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

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

    const handleCreate = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleSave = async (payload) => {
        try {
            if (editingStudent) {
                await crudApi.update('student', editingStudent.StudentID, payload.student);
                toast.success('Estudiante actualizado correctamente');
            } else {
                await businessApi.students.intake(payload);
                toast.success('Estudiante creado correctamente');
            }
            setIsModalOpen(false);
            loadStudents();
        } catch (error) {
            toast.error('Error guardando estudiante');
            console.error(error);
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
                <ActionButton
                    resource="student"
                    action="create"
                    onClick={handleCreate}
                    label="Nuevo Estudiante"
                    variant="primary"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(stu => (
                    <div key={stu.StudentID} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <User size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{stu.FirstName} {stu.LastName}</h3>
                                <p className="text-sm text-gray-500">ID: {stu.StudentID}</p>
                                {stu.DocumentNumber && (
                                    <p className="text-sm text-gray-500">CI: {stu.DocumentNumber}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                            <ActionButton
                                resource="student"
                                action="update"
                                onClick={() => handleEdit(stu)}
                                label="Editar"
                                variant="secondary"
                                className="flex-1 text-sm"
                            />
                            <button 
                                onClick={() => handleViewDetails(stu)}
                                className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 text-sm font-semibold flex items-center justify-center gap-1"
                            >
                                <DollarSign size={16} /> Balance
                            </button>
                            <ActionButton
                                resource="student"
                                action="delete"
                                onClick={() => handleDelete(stu.StudentID)}
                                label=""
                                variant="danger"
                                className="p-2"
                                icon={X}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                student={editingStudent}
            />

            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                {selectedStudent.FirstName} {selectedStudent.LastName}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingDetails ? (
                                <p className="text-center text-gray-500">Cargando...</p>
                            ) : studentDetails ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Balance Total</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${studentDetails.balance.total_balance?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600">Pagado</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                ${studentDetails.balance.paid?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                            <TrendingUp size={18} /> Estadísticas
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 bg-gray-50 rounded">
                                                <p className="text-gray-600">Asistencia</p>
                                                <p className="font-semibold">
                                                    {studentDetails.calculations?.attendance?.percentage || 0}%
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded">
                                                <p className="text-gray-600">Total Registros</p>
                                                <p className="font-semibold">
                                                    {studentDetails.calculations?.attendance?.total || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">No se pudieron cargar los detalles</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}