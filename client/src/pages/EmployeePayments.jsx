import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';

export default function EmployeePayments() {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [filters, setFilters] = useState({ status: '', from: '', to: '', month: '' });
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const loadTeachers = async () => {
            try {
                const { data } = await crudApi.getAll('employee', { IsActive: 1 });
                const list = (data || []).filter(e => {
                    const pos = (e.Position || '').toString().toLowerCase();
                    return /teacher|profesor|docente/.test(pos);
                });
                setTeachers(list);
            } catch (err) {
                console.error('Error cargando profesores', err);
            }
        };
        loadTeachers();
    }, []);

    const loadPayments = async () => {
        if (!selectedTeacher) return;
        setLoading(true); setMessage(null);
        try {
            const params = {
                referenceType: 'Teacher',
                referenceId: selectedTeacher,
                status: filters.status || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                month: filters.month || undefined,
                limit: 200
            };
            const res = await businessApi.finance.listPayments(params);
            setPayments(res.data?.data || []);
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message || 'Error al cargar pagos');
        } finally { setLoading(false); }
    };

    const exportCsv = async () => {
        if (!selectedTeacher) return;
        try {
            const { data } = await businessApi.finance.teacherPaymentsCsv(selectedTeacher, {
                status: filters.status || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                month: filters.month || undefined
            });
            const blob = new Blob([data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teacher-payments-${selectedTeacher}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message || 'Error al exportar CSV');
        }
    };

    const exportPayrollPdf = async () => {
        if (!selectedTeacher) return;
        try {
            const { data } = await businessApi.finance.teacherPayrollPdf(selectedTeacher, {
                month: filters.month || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined
            });
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nomina-profesor-${selectedTeacher}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setMessage(err?.response?.data?.error || err.message || 'Error al exportar PDF');
        }
    };

    useEffect(() => {
        if (selectedTeacher) loadPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTeacher]);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Partial': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pagos de Empleados</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Profesor</label>
                    <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md">
                        <option value="">-- Selecciona --</option>
                        {teachers.map(t => (
                            <option key={t.EmpID} value={t.EmpID}>{`${t.FirstName || ''} ${t.LastName || ''}`.trim() || t.FullName || t.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md">
                        <option value="">Todos</option>
                        <option value="Pending">Pendiente</option>
                        <option value="Partial">Parcial</option>
                        <option value="Paid">Pagado</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mes (YYYY-MM)</label>
                    <input type="text" placeholder="2026-02" value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Desde</label>
                    <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hasta</label>
                    <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md" />
                </div>
            </div>
            <div className="mb-4 flex items-center gap-2">
                <button onClick={loadPayments} className="px-3 py-2 rounded bg-gray-700 text-white">Filtrar</button>
                <button onClick={() => { setFilters({ status: '', from: '', to: '', month: '' }); loadPayments(); }} className="px-3 py-2 rounded bg-gray-300">Limpiar</button>
                <button onClick={exportCsv} className="ml-auto px-3 py-2 rounded bg-indigo-600 text-white">Exportar CSV</button>
                <button onClick={exportPayrollPdf} className="px-3 py-2 rounded bg-green-600 text-white">Nómina PDF</button>
                {message && <div className="ml-2 text-sm text-gray-700">{message}</div>}
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {payments.map(p => (
                            <tr key={p.TeacherPaymentID}>
                                <td className="px-6 py-4 text-sm text-gray-500">#{p.TeacherPaymentID}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{p.PaymentPeriod || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.PaymentDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{buildConcept(p)}</td>
                                <td className="px-6 py-4 font-medium">${Number(p.TotalAmount || 0).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(p.Status)}`}>
                                        {p.Status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}

function buildConcept(p) {
    const parts = [];
    const add = (label, val) => { const n = Number(val || 0); if (n) parts.push(`${label}: $${n.toFixed(2)}`); };
    add('Base', p.BaseSalary);
    add('Bonos', p.Bonuses);
    add('Extra', p.Overtime);
    add('Deducciones', -Number(p.Deductions || 0));
    return parts.length ? parts.join(' | ') : 'Pago';
}
