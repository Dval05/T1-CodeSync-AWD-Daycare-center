import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export default function Grades() {
    const [grades, setGrades] = useState([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const { data } = await crudApi.getAll('grade');
            setGrades(data);
        } catch (e) { toast.error('Error cargando grados'); }
    };

    const handleDelete = async (item) => {
        if(!confirm(`¿Borrar ${item.GradeName}?`)) return;
        try {
            await crudApi.remove('grade', item.GradeID);
            toast.success('Grado eliminado');
            loadData();
        } catch (e) { toast.error('Error al eliminar'); }
    };

    // Definimos las columnas para nuestra Tabla Inteligente
    const columns = [
        { header: 'ID', accessor: 'GradeID' },
        { header: 'Nombre del Grado', accessor: 'GradeName' },
        { header: 'Descripción', accessor: 'Description' },
        { 
            header: 'Estado', 
            accessor: 'IsActive',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.IsActive ? 'Activo' : 'Inactivo'}
                </span>
            )
        }
    ];

    return (
        <Layout>
            <DataTable 
                title="Grados Académicos"
                data={grades}
                columns={columns}
                searchPlaceholder="Buscar grado..."
                onCreate={() => toast('Aquí abrirías un Modal de Crear')}
                onEdit={(item) => toast(`Editar ${item.GradeName}`)}
                onDelete={handleDelete}
            />
        </Layout>
    );
}