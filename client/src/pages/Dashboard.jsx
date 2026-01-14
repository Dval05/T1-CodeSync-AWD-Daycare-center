import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { Users, UserCheck, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({ 
        students: 0, 
        attendance: 0, 
        payments: 0 
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKPIs = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                // Hacemos las 3 consultas en paralelo para velocidad
                const [studentsRes, attendanceRes, paymentsRes] = await Promise.all([
                    crudApi.getAll('student', { IsActive: 1 }), // Estudiantes Activos
                    crudApi.getAll('attendance', { Date: today, Status: 'Present' }), // Asistencia Hoy
                    crudApi.getAll('student_payment', { Status: 'Pending' }) // Pagos Pendientes
                ]);

                setStats({
                    students: studentsRes.data?.length || 0,
                    attendance: attendanceRes.data?.length || 0,
                    payments: paymentsRes.data?.length || 0
                });
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        loadKPIs();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">
                        {loading ? '...' : value}
                    </h3>
                </div>
                <div className={`p-3 rounded-full bg-opacity-20`} style={{ backgroundColor: `${color}33` }}>
                    <Icon size={24} style={{ color: color }} />
                </div>
            </div>
        </div>
    );

    return (
        <Layout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Panel de Control</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    title="Estudiantes Activos" 
                    value={stats.students} 
                    icon={Users} 
                    color="#3B82F6" // Blue
                />
                <StatCard 
                    title="Asistencia Hoy" 
                    value={stats.attendance} 
                    icon={UserCheck} 
                    color="#10B981" // Green
                />
                <StatCard 
                    title="Pagos Pendientes" 
                    value={stats.payments} 
                    icon={DollarSign} 
                    color="#F59E0B" // Amber
                />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Actividad Reciente
                </h3>
                <p className="text-gray-500">
                    Bienvenido al sistema de gestión NiceKids. Selecciona una opción del menú lateral para comenzar.
                </p>
            </div>
        </Layout>
    );
}