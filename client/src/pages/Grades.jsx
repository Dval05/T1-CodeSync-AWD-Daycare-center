import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { GradeModal } from '../components/modals/GradeModal';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronRight, User } from 'lucide-react';

export default function Grades() {
    const [grades, setGrades] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [expandedGradeId, setExpandedGradeId] = useState(null);
    const [gradeStudents, setGradeStudents] = useState({});
    const [loadingStudents, setLoadingStudents] = useState({});

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data } = await crudApi.getAll('grade');
            setGrades(data);
        } catch (e) { 
            toast.error('Error cargando cursos'); 
        }
    };

    const loadStudentsForGrade = async (gradeId) => {
        if (gradeStudents[gradeId]) return;
        
        setLoadingStudents(prev => ({ ...prev, [gradeId]: true }));
        try {
            const { data } = await crudApi.getAll('student', { GradeID: gradeId, IsActive: 1 });
            setGradeStudents(prev => ({ ...prev, [gradeId]: data }));
        } catch (error) {
            toast.error('Error cargando estudiantes del curso');
        } finally {
            setLoadingStudents(prev => ({ ...prev, [gradeId]: false }));
        }
    };

    const toggleExpandGrade = (gradeId) => {
        if (expandedGradeId === gradeId) {
            setExpandedGradeId(null);
        } else {
            setExpandedGradeId(gradeId);
            loadStudentsForGrade(gradeId);
        }
    };

    const handleCreate = () => {
        setSelectedGrade(null);
        setIsModalOpen(true);
    };

    const handleEdit = (grade) => {
        setSelectedGrade(grade);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        try {
            if (selectedGrade) {
                await crudApi.update('grade', selectedGrade.GradeID, data);
                toast.success('Curso actualizado correctamente');
            } else {
                await crudApi.create('grade', data);
                toast.success('Curso creado correctamente');
            }
            setIsModalOpen(false);
            setGradeStudents({});
            setExpandedGradeId(null);
            loadData();
        } catch (error) {
            toast.error('Error guardando curso');
            console.error(error);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`¿Eliminar el curso "${item.GradeName}"?`)) return;
        try {
            await crudApi.remove('grade', item.GradeID);
            toast.success('Curso eliminado');
            setGradeStudents(prev => {
                const newMap = { ...prev };
                delete newMap[item.GradeID];
                return newMap;
            });
            loadData();
        } catch (e) { 
            toast.error('Error al eliminar'); 
        }
    };

    const columns = [
        { header: 'ID', accessor: 'GradeID' },
        { header: 'Nombre del Curso', accessor: 'GradeName' },
        { header: 'Descripción', accessor: 'Description' },
        { 
            header: 'Estado', 
            accessor: 'IsActive',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    item.IsActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    {item.IsActive ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    return (
        <Layout>
            <div className="space-y-4">
                {/* Encabezado y botón nuevo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Cursos Académicos</h2>
                        <button 
                            onClick={handleCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            + Nuevo
                        </button>
                    </div>
                </div>

                {/* Lista de cursos expandible */}
                <div className="space-y-2">
                    {grades.map(grade => (
                        <div key={grade.GradeID} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            {/* Fila del curso */}
                            <div 
                                onClick={() => toggleExpandGrade(grade.GradeID)}
                                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors group"
                            >
                                {/* Ícono expandible */}
                                <div className="flex items-center gap-3 flex-1">
                                    {expandedGradeId === grade.GradeID ? (
                                        <ChevronDown size={20} className="text-blue-600" />
                                    ) : (
                                        <ChevronRight size={20} className="text-gray-400" />
                                    )}
                                    
                                    {/* Info del curso */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800">{grade.GradeName}</h3>
                                        <p className="text-sm text-gray-600">{grade.Description || 'No hay descripción'}</p>
                                    </div>

                                    {/* Estado */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        grade.IsActive 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {grade.IsActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleEdit(grade)}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(grade)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Lista desplegable de estudiantes */}
                            {expandedGradeId === grade.GradeID && (
                                <div className="bg-gray-50 border-t border-gray-200 p-4">
                                    {loadingStudents[grade.GradeID] ? (
                                        <div className="text-center py-6 text-gray-500">
                                            Cargando estudiantes...
                                        </div>
                                    ) : gradeStudents[grade.GradeID]?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {gradeStudents[grade.GradeID].map(student => (
                                                <div 
                                                    key={student.StudentID}
                                                    className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <User size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-800 text-sm">
                                                                {student.FirstName} {student.LastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">ID: {student.StudentID}</p>
                                                            {student.DocumentNumber && (
                                                                <p className="text-xs text-gray-500">CI: {student.DocumentNumber}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400">
                                            No hay estudiantes en este curso
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <GradeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                grade={selectedGrade}
            />
        </Layout>
    );
}