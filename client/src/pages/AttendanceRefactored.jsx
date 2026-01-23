import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { AttendanceTable } from '../components/attendance/AttendanceTable';
import { ReportFilters } from '../components/attendance/ReportFilters';
import { StatsDashboard } from '../components/attendance/StatsDashboard';
import { RecordsTable } from '../components/attendance/RecordsTable';
import { useAttendance } from '../hooks/useAttendance';
import { useAttendanceReport } from '../hooks/useAttendanceReport';
import { useGrades } from '../hooks/useGrades';
import { crudApi } from '../api/crud';

export default function Attendance() {
    const [activeTab, setActiveTab] = useState('register');
    const [date, setDate] = useState(getCurrentDate());
    const [allStudents, setAllStudents] = useState([]);
    const [filters, setFilters] = useState(getDefaultFilters());

    const attendance = useAttendance();
    const report = useAttendanceReport();
    const { grades } = useGrades();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await attendance.loadStudents();
        const { data } = await crudApi.getAll('student', { IsActive: 1 });
        setAllStudents(data);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = async () => {
        await report.searchReport(filters);
    };

    const handleGeneratePDF = async () => {
        await report.generatePDF(filters);
    };

    const handleSaveAttendance = async () => {
        const success = await attendance.saveAttendance(date);
        if (success) {
            await loadData();
        }
    };

    return (
        <Layout>
            <Header activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'register' && (
                <RegisterTab
                    date={date}
                    onDateChange={setDate}
                    students={attendance.students}
                    attendance={attendance.attendance}
                    lateStatus={attendance.lateStatus}
                    onToggleAttendance={attendance.toggleAttendance}
                    onToggleLate={attendance.toggleLateStatus}
                    onSave={handleSaveAttendance}
                />
            )}

            {activeTab === 'report' && (
                <ReportTab
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    grades={grades}
                    students={allStudents}
                    onSearch={handleSearch}
                    loading={report.loading}
                    dashboardStats={report.dashboardStats}
                    onGeneratePDF={handleGeneratePDF}
                />
            )}
        </Layout>
    );
}

const Header = ({ activeTab, onTabChange }) => (
    <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
        <div className="flex gap-2">
            <TabButton
                active={activeTab === 'register'}
                onClick={() => onTabChange('register')}
                label="Registrar Asistencia"
            />
            <TabButton
                active={activeTab === 'report'}
                onClick={() => onTabChange('report')}
                label="Reportes"
            />
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            active
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
    >
        {label}
    </button>
);

const RegisterTab = ({
    date,
    onDateChange,
    students,
    attendance,
    lateStatus,
    onToggleAttendance,
    onToggleLate,
    onSave
}) => (
    <>
        <div className="mb-6 flex justify-between items-center">
            <label className="text-gray-700 font-semibold">Seleccionar Fecha:</label>
            <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="border p-2 rounded"
            />
        </div>

        <AttendanceTable
            students={students}
            attendance={attendance}
            lateStatus={lateStatus}
            onToggleAttendance={onToggleAttendance}
            onToggleLate={onToggleLate}
        />

        <div className="mt-6 flex justify-end">
            <button
                onClick={onSave}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg font-bold"
            >
                Guardar Asistencia
            </button>
        </div>
    </>
);

const ReportTab = ({
    filters,
    onFilterChange,
    grades,
    students,
    onSearch,
    loading,
    dashboardStats,
    onGeneratePDF
}) => (
    <>
        <ReportFilters
            filters={filters}
            onFilterChange={onFilterChange}
            grades={grades}
            students={students}
            onSearch={onSearch}
            loading={loading}
        />

        {dashboardStats && (
            <>
                <StatsDashboard stats={dashboardStats.stats} />
                <RecordsTable records={dashboardStats.records} />
                
                <div className="flex justify-end">
                    <button
                        onClick={onGeneratePDF}
                        disabled={loading}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 shadow-lg font-bold disabled:bg-gray-400"
                    >
                        {loading ? 'Generando...' : '📄 Generar PDF'}
                    </button>
                </div>
            </>
        )}
    </>
);

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const getDefaultFilters = () => ({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: getCurrentDate(),
    studentId: '',
    gradeId: ''
});
