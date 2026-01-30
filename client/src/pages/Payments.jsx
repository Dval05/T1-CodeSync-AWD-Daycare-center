import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [form, setForm] = useState({
        BaseSalary: '', Bonuses: '', Overtime: '', Deductions: '', TotalAmount: '', PaymentDate: '', PaymentMethod: 'Transfer', Notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [paymentsRes, employeesRes] = await Promise.all([
                    crudApi.getAll('teacher_payment'),
                    crudApi.getAll('employee', { IsActive: 1 })
                ]);
                setPayments(paymentsRes.data || []);
                // Filter locally to accept both English/Spanish position labels
                const teachers = (employeesRes.data || []).filter(e => {
                    const pos = (e.Position || '').toString().toLowerCase();
                    return /teacher|profesor|docente/.test(pos);
                });
                setTeachers(teachers);
            } catch (err) {
                console.error('Error cargando pagos/profesores', err);
            }
        };
        load();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pagos a Profesores</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {payments.map(pay => (
                            <tr key={pay.TeacherPaymentID}>
                                <td className="px-6 py-4 text-sm text-gray-500">#{pay.TeacherPaymentID}</td>
                                <td className="px-6 py-4 font-medium">${pay.Amount}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(pay.PaymentDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pay.Status)}`}>
                                        {pay.Status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Profesor</label>
                    <select value={selectedTeacher || ''} onChange={e => setSelectedTeacher(e.target.value)} className="mt-2 block w-full border-gray-300 rounded-md">
                        <option value="">-- Selecciona --</option>
                        {teachers.map(t => (
                            <option key={t.EmpID} value={t.EmpID}>{`${t.FirstName || ''} ${t.LastName || ''}`.trim() || t.FullName || t.name}</option>
                        ))}
                    </select>

                    
                </div>

                <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
                    <label className="block text-sm font-medium text-gray-700">Formulario de Pago</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <input placeholder="Salario base" value={form.BaseSalary} onChange={e => setForm({...form, BaseSalary: e.target.value})} className="border p-2 rounded" />
                        <input placeholder="Bonificaciones" value={form.Bonuses} onChange={e => setForm({...form, Bonuses: e.target.value})} className="border p-2 rounded" />
                        <input placeholder="Horas extra" value={form.Overtime} onChange={e => setForm({...form, Overtime: e.target.value})} className="border p-2 rounded" />
                        <input placeholder="Deducciones" value={form.Deductions} onChange={e => setForm({...form, Deductions: e.target.value})} className="border p-2 rounded" />
                        <input type="date" placeholder="Fecha de pago" value={form.PaymentDate} onChange={e => setForm({...form, PaymentDate: e.target.value})} className="border p-2 rounded" />
                        <select value={form.PaymentMethod} onChange={e => setForm({...form, PaymentMethod: e.target.value})} className="border p-2 rounded">
                            <option value="Transfer">Transferencia</option>
                            <option value="Cash">Efectivo</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                        <input placeholder="Monto total (opcional)" value={form.TotalAmount} onChange={e => setForm({...form, TotalAmount: e.target.value})} className="border p-2 rounded col-span-2" />
                        <textarea placeholder="Notas" value={form.Notes} onChange={e => setForm({...form, Notes: e.target.value})} className="border p-2 rounded col-span-2" />
                    </div>
                    <div className="mt-3">
                        <button disabled={!selectedTeacher || loading} onClick={async () => {
                            if (!selectedTeacher) return setMessage('Selecciona un profesor');
                            setLoading(true); setMessage(null);
                            try {
                                const payload = {
                                    teacherId: Number(selectedTeacher),
                                    BaseSalary: form.BaseSalary ? Number(form.BaseSalary) : undefined,
                                    Bonuses: form.Bonuses ? Number(form.Bonuses) : undefined,
                                    Overtime: form.Overtime ? Number(form.Overtime) : undefined,
                                    Deductions: form.Deductions ? Number(form.Deductions) : undefined,
                                    TotalAmount: form.TotalAmount ? Number(form.TotalAmount) : undefined,
                                    PaymentDate: form.PaymentDate || undefined,
                                    PaymentMethod: form.PaymentMethod,
                                    Notes: form.Notes || undefined
                                };
                                const res = await businessApi.finance.registerPayment(payload);
                                setMessage(res.data?.message || 'Pago registrado');
                                // refresh payments
                                const list = await crudApi.getAll('teacher_payment');
                                setPayments(list.data || []);
                            } catch (err) {
                                setMessage(err?.response?.data?.error || err.message || 'Error al registrar pago');
                            } finally { setLoading(false); }
                        }} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Registrar Pago</button>
                        {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
                    </div>
                </div>
            </div>
        </Layout>
    );
}