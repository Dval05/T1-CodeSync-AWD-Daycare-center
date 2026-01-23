import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';

export default function Attendance() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState({}); // { StudentID: 'Present' | 'Absent' }
    const [lateStatus, setLateStatus] = useState({}); // { StudentID: 0 | 1 }
    const [activeTab, setActiveTab] = useState('register'); // 'register' o 'report'
    const [reportData, setReportData] = useState(null);
    const [dateFrom, setDateFrom] = useState(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [loadingReport, setLoadingReport] = useState(false);
    const [filterStudent, setFilterStudent] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [dashboardStats, setDashboardStats] = useState(null);

    useEffect(() => {
        loadList();
        loadGrades();
    }, []);

    const loadList = async () => {
        const { data } = await crudApi.getAll('student', { IsActive: 1 });
        setStudents(data);
        setAllStudents(data);
        // Inicializar todos como Presentes por defecto
        const initialStatus = {};
        const initialLate = {};
        data.forEach(s => {
            initialStatus[s.StudentID] = 'Present';
            initialLate[s.StudentID] = 0;
        });
        setAttendance(initialStatus);
        setLateStatus(initialLate);
    };

    const loadGrades = async () => {
        try {
            const { data } = await crudApi.getAll('grade', { IsActive: 1 });
            setGrades(data);
        } catch (error) {
            console.error('Error cargando cursos:', error);
        }
    };

    const handleToggle = (id) => {
        setAttendance(prev => ({
            ...prev,
            [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleToggleLate = (id) => {
        setLateStatus(prev => ({
            ...prev,
            [id]: prev[id] === 1 ? 0 : 1
        }));
    };

    const handleSave = async () => {
        try {
            const promises = students.map(stu => {
                return crudApi.create('attendance', {
                    StudentID: stu.StudentID,
                    Date: date,
                    Status: attendance[stu.StudentID] || 'Present',
                    IsLate: lateStatus[stu.StudentID] || 0
                });
            });
            await Promise.all(promises);
            toast.success('Asistencia guardada correctamente');
            loadList();
        } catch (error) {
            console.error('Error guardando asistencia:', error);
            toast.error('Error guardando asistencia: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleSearchReport = async () => {
        try {
            setLoadingReport(true);
            setDashboardStats(null);
            
            // Construir parámetros de filtro
            const params = {
                from: dateFrom,
                to: dateTo
            };
            if (filterStudent) params.studentId = filterStudent;
            if (filterGrade) params.gradeId = filterGrade;
            
            // Obtener datos de estadísticas (sin PDF)
            const response = await businessApi.reports.attendance(params);
            setDashboardStats(response.data);
            toast.success('Búsqueda realizada correctamente');
        } catch (error) {
            console.error('Error buscando datos:', error);
            toast.error('Error realizando búsqueda');
        } finally {
            setLoadingReport(false);
        }
    };

    const handleGeneratePDF = async () => {
        try {
            setLoadingReport(true);
            
            // Construir parámetros de filtro
            let params = `from=${dateFrom}&to=${dateTo}`;
            if (filterStudent) params += `&studentId=${filterStudent}`;
            if (filterGrade) params += `&gradeId=${filterGrade}`;
            
            // Descargar PDF
            const response = await businessApi.get(`/reports/attendance?${params}&format=pdf`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte-asistencia-${dateFrom}-${dateTo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Reporte PDF generado y descargado');
        } catch (error) {
            console.error('Error generando reporte:', error);
            toast.error('Error generando reporte PDF');
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            activeTab === 'register'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Registrar Asistencia
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            activeTab === 'report'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Reportes
                    </button>
                </div>
            </div>

            {/* TAB: REGISTRAR ASISTENCIA */}
            {activeTab === 'register' && (
                <>
                    <div className="mb-6 flex justify-between items-center">
                        <label className="text-gray-700 font-semibold">Seleccionar Fecha:</label>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="border p-2 rounded"
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">¿Retardo?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map(stu => (
                                    <tr key={stu.StudentID}>
                                        <td className="px-6 py-4">{stu.FirstName} {stu.LastName}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleToggle(stu.StudentID)}
                                                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                                    attendance[stu.StudentID] === 'Present' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {attendance[stu.StudentID] === 'Present' ? 'Presente' : 'Ausente'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={lateStatus[stu.StudentID] === 1}
                                                    onChange={() => handleToggleLate(stu.StudentID)}
                                                    disabled={attendance[stu.StudentID] !== 'Present'}
                                                    className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                                                />
                                                <span className={`ml-2 text-sm font-medium ${
                                                    lateStatus[stu.StudentID] === 1 ? 'text-yellow-600' : 'text-gray-400'
                                                }`}>
                                                    {lateStatus[stu.StudentID] === 1 ? 'Sí' : 'No'}
                                                </span>
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg font-bold">
                            Guardar Asistencia
                        </button>
                    </div>
                </>
            )}

            {/* TAB: REPORTES */}
            {activeTab === 'report' && (
                <>
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Generar Reporte de Asistencias</h3>
                        
                        {/* FILTROS */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Desde:</label>
                                <input 
                                    type="date" 
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta:</label>
                                <input 
                                    type="date" 
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Curso:</label>
                                <select
                                    value={filterGrade}
                                    onChange={(e) => setFilterGrade(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded"
                                >
                                    <option value="">Todos los cursos</option>
                                    {grades.map(g => (
                                        <option key={g.GradeID} value={g.GradeID}>{g.GradeName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Estudiante:</label>
                                <select
                                    value={filterStudent}
                                    onChange={(e) => setFilterStudent(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded"
                                >
                                    <option value="">Todos los estudiantes</option>
                                    {allStudents.map(s => (
                                        <option key={s.StudentID} value={s.StudentID}>
                                            {s.FirstName} {s.LastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button 
                                    onClick={handleSearchReport}
                                    disabled={loadingReport}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                                >
                                    {loadingReport ? 'Buscando...' : '🔍 Buscar'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DASHBOARD CON ESTADÍSTICAS */}
                    {dashboardStats && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm font-semibold">Total de Registros</p>
                                    <p className="text-3xl font-bold text-blue-600">{dashboardStats.stats.total}</p>
                                </div>
                                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm font-semibold">Presentes</p>
                                    <p className="text-3xl font-bold text-green-600">{dashboardStats.stats.present}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {dashboardStats.stats.total > 0 ? ((dashboardStats.stats.present / dashboardStats.stats.total) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm font-semibold">Ausentes</p>
                                    <p className="text-3xl font-bold text-red-600">{dashboardStats.stats.absent}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {dashboardStats.stats.total > 0 ? ((dashboardStats.stats.absent / dashboardStats.stats.total) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                                    <p className="text-gray-600 text-sm font-semibold">Retardos</p>
                                    <p className="text-3xl font-bold text-yellow-600">{dashboardStats.stats.late}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {dashboardStats.stats.total > 0 ? ((dashboardStats.stats.late / dashboardStats.stats.total) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>

                            {/* TABLA DE REGISTROS */}
                            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                                <div className="px-6 py-4 bg-gray-50 border-b">
                                    <h3 className="text-lg font-bold text-gray-800">Detalle de Registros</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Retardo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {dashboardStats.records.map((record, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm">{new Date(record.Date).toLocaleDateString('es-ES')}</td>
                                                    <td className="px-6 py-4 text-sm">{record.student?.FirstName} {record.student?.LastName}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            record.Status === 'Present' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {record.Status === 'Present' ? 'Presente' : 'Ausente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {record.IsLate ? (
                                                            <span className="text-yellow-600 font-semibold">Sí</span>
                                                        ) : (
                                                            <span className="text-gray-400">No</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* BOTÓN GENERAR PDF */}
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleGeneratePDF}
                                    disabled={loadingReport}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 shadow-lg font-bold disabled:bg-gray-400"
                                >
                                    {loadingReport ? 'Generando...' : '📄 Generar PDF'}
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </Layout>
    );
}