import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { crudApi } from '../api/crud';

export default function Guardians() {
    const [guardians, setGuardians] = useState([]);

    useEffect(() => {
        crudApi.getAll('guardian', { IsActive: 1 }).then(res => setGuardians(res.data));
    }, []);

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
                onCreate={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        </Layout>
    );
}