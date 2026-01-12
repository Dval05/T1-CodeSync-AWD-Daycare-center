import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/common/DataTable';
import { crudApi } from '../api/crud';

export default function Staff() {
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        crudApi.getAll('employee', { IsActive: 1 }).then(res => setStaff(res.data));
    }, []);

    const columns = [
        { header: 'Nombre', accessor: 'FirstName' },
        { header: 'Apellido', accessor: 'LastName' },
        { header: 'Cargo', accessor: 'Position' }, // Asegúrate que tu BD tenga este campo o similar
        { header: 'Email', accessor: 'Email' },
        { 
            header: 'Contratado', 
            accessor: 'HireDate',
            render: (item) => new Date(item.HireDate).toLocaleDateString()
        }
    ];

    return (
        <Layout>
            <DataTable 
                title="Directorio de Personal"
                data={staff}
                columns={columns}
                searchPlaceholder="Buscar personal..."
                onCreate={() => {}}
                onEdit={() => {}}
            />
        </Layout>
    );
}