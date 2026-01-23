import { useState } from 'react';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';

export const useAttendanceReport = () => {
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const searchReport = async (filters) => {
        try {
            setLoading(true);
            setDashboardStats(null);
            
            const params = buildQueryParams(filters);
            const response = await businessApi.reports.attendance(params);
            
            setDashboardStats(response.data);
            toast.success('Búsqueda realizada correctamente');
            return true;
        } catch (error) {
            toast.error('Error realizando búsqueda');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async (filters) => {
        try {
            setLoading(true);
            const queryString = buildQueryString(filters);
            
            const response = await businessApi.get(
                `/reports/attendance?${queryString}&format=pdf`,
                { responseType: 'blob' }
            );
            
            downloadFile(response.data, `reporte-asistencia-${filters.dateFrom}-${filters.dateTo}.pdf`);
            toast.success('Reporte PDF generado y descargado');
            return true;
        } catch (error) {
            toast.error('Error generando reporte PDF');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        dashboardStats,
        loading,
        searchReport,
        generatePDF
    };
};

const buildQueryParams = (filters) => {
    const params = {
        from: filters.dateFrom,
        to: filters.dateTo
    };
    
    if (filters.studentId) params.studentId = filters.studentId;
    if (filters.gradeId) params.gradeId = filters.gradeId;
    
    return params;
};

const buildQueryString = (filters) => {
    let query = `from=${filters.dateFrom}&to=${filters.dateTo}`;
    if (filters.studentId) query += `&studentId=${filters.studentId}`;
    if (filters.gradeId) query += `&gradeId=${filters.gradeId}`;
    return query;
};

const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
