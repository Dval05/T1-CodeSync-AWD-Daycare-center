import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { GuardianModal } from '../components/modals/GuardianModal';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export default function Guardians() {
    const [guardians, setGuardians] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuardian, setSelectedGuardian] = useState(null);

    useEffect(() => {
        loadGuardians();
    }, []);

    const loadGuardians = async () => {
        try {
            const { data } = await crudApi.getAll('guardian', { IsActive: 1 });
            setGuardians(data);
        } catch (error) {
            toast.error('Error cargando responsables');
        }
    };

    const handleCreate = () => {
        setSelectedGuardian(null);
        setIsModalOpen(true);
    };

    const handleEdit = (guardian) => {
        setSelectedGuardian(guardian);
        setIsModalOpen(true);
    };

    const handleSave = async (data) => {
        try {
            if (selectedGuardian) {
                await crudApi.update('guardian', selectedGuardian.GuardianID, data);
                toast.success('Responsable actualizado correctamente');
            } else {
                await crudApi.create('guardian', data);
                toast.success('Responsable creado correctamente');
            }
            setIsModalOpen(false);
            loadGuardians();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error guardando responsable');
        }
    };

    const handleDelete = async (guardian) => {
        if (!confirm(`¿Desactivar a ${guardian.FirstName} ${guardian.LastName}?`)) return;
        
        try {
            await crudApi.remove('guardian', guardian.GuardianID);
            toast.success('Responsable desactivado correctamente');
            loadGuardians();
        } catch (error) {
            toast.error('Error al desactivar');
        }
    };

    const columns = [
        { header: 'Nombre', accessor: 'FirstName' },
        { header: 'Apellido', accessor: 'LastName' },
        { header: 'Email', accessor: 'Email' },
        { header: 'Teléfono', accessor: 'Phone' },
        { header: 'Cédula', accessor: 'DocumentNumber' }
    ];

    return (
        <Layout>
            <DataTable 
                title="Gestión de Responsables"
                data={guardians}
                columns={columns}
                searchPlaceholder="Buscar por nombre, cédula o email..."
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            
            <GuardianModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                guardian={selectedGuardian}
            />
        </Layout>
    );
}