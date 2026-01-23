import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { GradeModal } from '../components/modals/GradeModal';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export default function Grades() {
    const [grades, setGrades] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data } = await crudApi.getAll('grade');
            setGrades(data);
        } catch (e) { 
            toast.error('Error cargando cursos'); 
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
            <DataTable 
                title="Cursos Académicos"
                data={grades}
                columns={columns}
                searchPlaceholder="Buscar curso..."
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <GradeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                grade={selectedGrade}
            />
        </Layout>
    );
}