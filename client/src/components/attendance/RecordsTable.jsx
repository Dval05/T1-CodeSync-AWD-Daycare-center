import React from 'react';

export const RecordsTable = ({ records }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-bold text-gray-800">Detalle de Registros</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Estudiante
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                Retardo
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {records.map((record, index) => (
                            <RecordRow key={index} record={record} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RecordRow = ({ record }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    const getStudentName = () => {
        const { student } = record;
        return `${student?.FirstName || ''} ${student?.LastName || ''}`;
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm">{formatDate(record.Date)}</td>
            <td className="px-6 py-4 text-sm">{getStudentName()}</td>
            <td className="px-6 py-4 text-center">
                <StatusBadge status={record.Status} />
            </td>
            <td className="px-6 py-4 text-center">
                <LateBadge isLate={record.IsLate} />
            </td>
        </tr>
    );
};

const StatusBadge = ({ status }) => {
    const isPresent = status === 'Present';
    
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isPresent
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
        }`}>
            {isPresent ? 'Presente' : 'Ausente'}
        </span>
    );
};

const LateBadge = ({ isLate }) => (
    <span className={isLate ? 'text-yellow-600 font-semibold' : 'text-gray-400'}>
        {isLate ? 'Sí' : 'No'}
    </span>
);
