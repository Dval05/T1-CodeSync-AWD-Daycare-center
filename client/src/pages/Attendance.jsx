import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Charts from '../components/attendance/Charts';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';
import { Edit } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Attendance() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [lateStatus, setLateStatus] = useState({});
    const [activeTab, setActiveTab] = useState('register');
    const [reportData, setReportData] = useState(null);
    const [dateFrom, setDateFrom] = useState(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [loadingReport, setLoadingReport] = useState(false);
    const [filterStudent, setFilterStudent] = useState('');
    const [filterGrade, setFilterGrade] = useState('');
    const [dashboardStats, setDashboardStats] = useState(null);
    const [showCharts, setShowCharts] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [lastAttendanceCheck, setLastAttendanceCheck] = useState({});
    const [checkInTime, setCheckInTime] = useState({});
    const [checkOutTime, setCheckOutTime] = useState({});
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [currentEditingTime, setCurrentEditingTime] = useState({ studentId: null, type: null, value: '' });

    useEffect(() => {
        loadList();
        loadGrades();
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            checkLastAttendance();
        }
    }, [students, date]);

    const checkLastAttendance = async () => {
        try {
            const checks = {};
            const initialCheckIn = {};
            
            for (const student of students) {
                const { data } = await crudApi.getAll('attendance', {
                    StudentID: student.StudentID,
                    orderBy: 'CreatedAt',
                    asc: 'false'
                });

                if (data && data.length > 0) {
                    const lastRecord = data[0];
                    const lastRecordTime = new Date(lastRecord.CreatedAt);
                    const now = new Date();
                    const hoursDifference = (now - lastRecordTime) / (1000 * 60 * 60);

                    checks[student.StudentID] = {
                        canRegister: hoursDifference >= 2,
                        hoursSinceLastRecord: hoursDifference,
                        lastRecordDate: lastRecord.Date,
                        lastRecordTime: lastRecord.CreatedAt,
                        minutesRemaining: hoursDifference < 2 ? Math.ceil((2 - hoursDifference) * 60) : 0
                    };

                    // Usar la hora de entrada del último registro
                    // Prioridad: 1) CheckInTime si existe, 2) Hora del CreatedAt, 3) Hora actual
                    if (lastRecord.CheckInTime) {
                        initialCheckIn[student.StudentID] = lastRecord.CheckInTime;
                    } else if (lastRecord.CreatedAt) {
                        // Extraer solo la hora del CreatedAt en zona horaria de Ecuador (UTC-5)
                        const createdAtDate = new Date(lastRecord.CreatedAt);
                        initialCheckIn[student.StudentID] = createdAtDate.toLocaleTimeString('es-EC', { 
                            timeZone: 'America/Guayaquil', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                        });
                    } else {
                        // Hora actual en zona horaria de Ecuador
                        const nowEcuador = new Date().toLocaleTimeString('es-EC', { 
                            timeZone: 'America/Guayaquil', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                        });
                        initialCheckIn[student.StudentID] = nowEcuador;
                    }
                } else {
                    checks[student.StudentID] = {
                        canRegister: true,
                        hoursSinceLastRecord: null,
                        lastRecordDate: null,
                        lastRecordTime: null,
                        minutesRemaining: 0
                    };
                    // Si no hay registros previos, usar hora actual de Ecuador
                    initialCheckIn[student.StudentID] = new Date().toLocaleTimeString('es-EC', { 
                        timeZone: 'America/Guayaquil', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                }
            }

            setLastAttendanceCheck(checks);
            setCheckInTime(initialCheckIn);
        } catch (error) {
            console.error('Error verificando últimas asistencias:', error);
        }
    };

    const loadList = async () => {
        const { data } = await crudApi.getAll('student', { IsActive: 1 });
        setStudents(data);
        setAllStudents(data);
        const initialStatus = {};
        const initialLate = {};
        const initialCheckOut = {};
        
        data.forEach(s => {
            initialStatus[s.StudentID] = 'Present';
            initialLate[s.StudentID] = 0;
            initialCheckOut[s.StudentID] = '';
        });
        setAttendance(initialStatus);
        setLateStatus(initialLate);
        setCheckOutTime(initialCheckOut);
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

    const handleTimeClick = (studentId, type) => {
        const currentValue = type === 'checkIn' ? checkInTime[studentId] : checkOutTime[studentId];
        setCurrentEditingTime({ studentId, type, value: currentValue || '' });
        setShowTimeModal(true);
    };

    const handleTimeSave = () => {
        const { studentId, type, value } = currentEditingTime;
        if (type === 'checkIn') {
            setCheckInTime(prev => ({ ...prev, [studentId]: value }));
        } else {
            setCheckOutTime(prev => ({ ...prev, [studentId]: value }));
        }
        setShowTimeModal(false);
        setCurrentEditingTime({ studentId: null, type: null, value: '' });
    };

    const handleSetCheckOutNow = (studentId) => {
        const now = new Date().toLocaleTimeString('es-EC', { 
            timeZone: 'America/Guayaquil', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        setCheckOutTime(prev => ({ ...prev, [studentId]: now }));
    };

    const formatTimeElapsed = (milliseconds) => {
        const totalMinutes = Math.floor(milliseconds / (1000 * 60));
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;

        const parts = [];
        if (days > 0) parts.push(`${days} día${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);

        return parts.length > 0 ? parts.join(' ') : '0 minutos';
    };

    const handleSave = async () => {
        try {
            const errors = [];
            const successCount = { count: 0 };
            
            for (const stu of students) {
                try {
                    const attendanceData = {
                        StudentID: stu.StudentID,
                        Date: date,
                        Status: attendance[stu.StudentID] || 'Present',
                        IsLate: lateStatus[stu.StudentID] || 0,
                        CheckInTime: checkInTime[stu.StudentID] || null
                    };

                    // Solo incluir CheckOutTime si tiene valor
                    if (checkOutTime[stu.StudentID]) {
                        attendanceData.CheckOutTime = checkOutTime[stu.StudentID];
                    }

                    await crudApi.create('attendance', attendanceData);
                    successCount.count++;
                } catch (error) {
                    const studentName = `${stu.FirstName} ${stu.LastName}`;
                    
                    if (error.response?.data?.code === 'ATTENDANCE_TOO_SOON') {
                        const minutesRemaining = error.response?.data?.minutesRemaining || 0;
                        const timeRemaining = formatTimeElapsed(minutesRemaining * 60 * 1000);
                        errors.push({
                            student: studentName,
                            message: `Faltan ${timeRemaining} para el siguiente registro`
                        });
                    } else {
                        errors.push({
                            student: studentName,
                            message: error.response?.data?.error || error.message
                        });
                    }
                }
            }

            if (successCount.count > 0) {
                toast.success(`${successCount.count} asistencia(s) guardada(s) correctamente`);
            }

            if (errors.length > 0) {
                toast.error(
                    'No se puede registrar asistencia de los estudiantes',
                    { duration: 5000 }
                );
            }

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
            setShowCharts(false);
            
            const params = {
                from: dateFrom,
                to: dateTo
            };
            if (filterStudent) params.studentId = filterStudent;
            if (filterGrade) params.gradeId = filterGrade;
            
            const response = await businessApi.reports.attendance(params);
            setDashboardStats(response.data);
            toast.success('Búsqueda realizada correctamente');
            return true;
        } catch (error) {
            console.error('Error buscando datos:', error);
            toast.error('Error realizando búsqueda');
            return false;
        } finally {
            setLoadingReport(false);
        }
    };

    const handleSearchCharts = async () => {
        const ok = await handleSearchReport();
        if (ok) setShowCharts(true);
    };

    const handleGeneratePDF = async () => {
        try {
            setLoadingReport(true);
            
            let params = `from=${dateFrom}&to=${dateTo}`;
            if (filterStudent) params += `&studentId=${filterStudent}`;
            if (filterGrade) params += `&gradeId=${filterGrade}`;
            
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

    const handleEditRecord = (record) => {

    const editRecord = (record) => {
        setEditingRecord({
            AttendanceID: record.AttendanceID,
            Status: record.Status,
            IsLate: record.IsLate
        });
    };

    const handleSaveEdit = async () => {
        if (!editingRecord) return;
        
        try {
            await crudApi.update('attendance', editingRecord.AttendanceID, {
                Status: editingRecord.Status,
                IsLate: editingRecord.IsLate
            });
            toast.success('Registro actualizado correctamente');
            setEditingRecord(null);
            await handleSearchReport();
        } catch (error) {
            toast.error('Error actualizando registro');
        }
    };

    const handleExportExcel = () => {
        if (!dashboardStats || !dashboardStats.records || dashboardStats.records.length === 0) {
            toast.error('No hay datos para exportar');
            return;
        }

        (async () => {
            try {
                const headers = ['Fecha','Estudiante','Curso','Estado','Retardo'];
                const aoa = [headers];

                dashboardStats.records.forEach(r => {
                    const fecha = r.Date ? new Date(r.Date).toLocaleDateString('es-ES') : '';
                    const student = r.student ? `${r.student.FirstName || ''} ${r.student.LastName || ''}`.trim() : '';
                    const gradeId = r.student?.GradeID || r.GradeID || null;
                    const gradeObj = grades.find(g => String(g.GradeID) === String(gradeId));
                    const course = gradeObj ? gradeObj.GradeName : 'No asignado';
                    const estado = r.Status === 'Present' ? 'Presente' : (r.Status === 'Absent' ? 'Ausente' : r.Status);
                    const retardo = r.IsLate ? 'Sí' : 'No';
                    aoa.push([fecha, student, course, estado, retardo]);
                });

                const ws = XLSX.utils.aoa_to_sheet(aoa);
                const range = ws['!ref'];
                if (range) {
                    const [start, end] = range.split(':');
                    const startCol = XLSX.utils.decode_cell(start).c;
                    const startRow = XLSX.utils.decode_cell(start).r;
                    const endCol = XLSX.utils.decode_cell(end).c;
                    const endRow = XLSX.utils.decode_cell(end).r;

                    const thin = { style: 'thin', color: { rgb: '000000' } };
                    for (let R = startRow; R <= endRow; ++R) {
                        for (let C = startCol; C <= endCol; ++C) {
                            const cellAddress = { c: C, r: R };
                            const cellRef = XLSX.utils.encode_cell(cellAddress);
                            const cell = ws[cellRef] || (ws[cellRef] = { t: 's', v: '' });
                            if (!cell.s) cell.s = {};
                            cell.s.border = {
                                top: thin,
                                bottom: thin,
                                left: thin,
                                right: thin
                            };
                            cell.s.alignment = { vertical: 'center', horizontal: 'left' };
                        }
                    }
                }

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Asistencias');
                const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `asistencias-${dateFrom}-${dateTo}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Excel generado y descargado');
            } catch (err) {
                console.error('Error exportando Excel:', err);
                toast.error('Error generando Excel. Instala la dependencia xlsx con npm install');
            }
        })();
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
                    <button
                        onClick={() => { setActiveTab('charts'); setShowCharts(false); }}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            activeTab === 'charts'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                    >
                        Gráficas
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
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Último Registro</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">¿Retardo?</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hora Retiro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map(stu => {
                                    const check = lastAttendanceCheck[stu.StudentID];
                                    const canRegister = check?.canRegister !== false;
                                    const showWarning = !canRegister;
                                    
                                    return (
                                        <tr key={stu.StudentID} className={showWarning ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {showWarning && (
                                                        <span className="text-yellow-600 font-bold" title="Debe esperar antes de registrar"></span>
                                                    )}
                                                    <span>{stu.FirstName} {stu.LastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                {check?.lastRecordTime ? (
                                                    <div className={showWarning ? 'text-yellow-700 font-semibold' : 'text-gray-600'}>
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            {new Date(check.lastRecordTime).toLocaleDateString('es-ES')}
                                                        </div>
                                                        {showWarning && (
                                                            <div className="text-xs text-red-600 font-bold mt-1">
                                                                Faltan {formatTimeElapsed((2 * 60 * 60 * 1000) - (new Date() - new Date(check.lastRecordTime)))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Sin registros</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleToggle(stu.StudentID)}
                                                    disabled={showWarning}
                                                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                                                        showWarning 
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                            : attendance[stu.StudentID] === 'Present' 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
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
                                                        disabled={attendance[stu.StudentID] !== 'Present' || showWarning}
                                                        className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                                                    />
                                                    <span className={`ml-2 text-sm font-medium ${
                                                        lateStatus[stu.StudentID] === 1 ? 'text-yellow-600' : 'text-gray-400'
                                                    }`}>
                                                        {lateStatus[stu.StudentID] === 1 ? 'Sí' : 'No'}
                                                    </span>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleTimeClick(stu.StudentID, 'checkOut')}
                                                        disabled={attendance[stu.StudentID] !== 'Present'}
                                                        className={`px-3 py-1 text-sm font-semibold rounded ${
                                                            attendance[stu.StudentID] !== 'Present'
                                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                                : checkOutTime[stu.StudentID]
                                                                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {checkOutTime[stu.StudentID] || 'Establecer'}
                                                    </button>
                                                    {attendance[stu.StudentID] === 'Present' && (
                                                        <button
                                                            onClick={() => handleSetCheckOutNow(stu.StudentID)}
                                                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                            title="Establecer hora actual"
                                                        >
                                                            Ahora
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {}
            {activeTab === 'report' && (
                <>
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Generar Reporte de Asistencias</h3>
                        
                        {}
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

                    {}
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

                            {}
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
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
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
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleEditRecord(record)}
                                                            className="text-yellow-600 hover:text-yellow-700 p-2"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {}
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleGeneratePDF}
                                    disabled={loadingReport}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 shadow-lg font-bold disabled:bg-gray-400"
                                >
                                    {loadingReport ? 'Generando...' : '📄 Generar PDF'}
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    disabled={loadingReport}
                                    className="ml-3 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 shadow-lg font-bold disabled:bg-gray-400"
                                >
                                    📥 Exportar Excel
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}

            {}
            {activeTab === 'charts' && (
                <>
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Generar gráficas de asistencia</h3>
                        {}
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
                            <div className="flex items-end space-y-0">
                                <div className="grid gap-2 w-full">
                                    <button 
                                        onClick={handleSearchCharts}
                                        disabled={loadingReport}
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                                    >
                                        {loadingReport ? 'Buscando...' : '🔍 Buscar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

            {editingRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Editar Registro de Asistencia</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    value={editingRecord.Status}
                                    onChange={(e) => setEditingRecord({...editingRecord, Status: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="Present">Presente</option>
                                    <option value="Absent">Ausente</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingRecord.IsLate === 1}
                                        onChange={(e) => setEditingRecord({...editingRecord, IsLate: e.target.checked ? 1 : 0})}
                                        disabled={editingRecord.Status !== 'Present'}
                                        className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">¿Llegó tarde?</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => setEditingRecord(null)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

                    {/* GRÁFICAS */}
                    {showCharts && dashboardStats && (
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h4 className="text-lg font-bold text-gray-800 mb-4">Gráficas de Asistencia</h4>
                            <Charts records={dashboardStats.records} dateFrom={dateFrom} dateTo={dateTo} />
                        </div>
                    )}
                </>
            )}

            {/* Modal para editar hora */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            {currentEditingTime.type === 'checkIn' ? 'Hora de Entrada' : 'Hora de Retiro'}
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccione la hora
                            </label>
                            <input
                                type="time"
                                value={currentEditingTime.value}
                                onChange={(e) => setCurrentEditingTime({...currentEditingTime, value: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-lg"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowTimeModal(false);
                                    setCurrentEditingTime({ studentId: null, type: null, value: '' });
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleTimeSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
}