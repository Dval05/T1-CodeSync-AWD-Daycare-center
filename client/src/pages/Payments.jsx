import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [referenceType, setReferenceType] = useState('Teacher');
    const [selectedRef, setSelectedRef] = useState(null);
    const [filters, setFilters] = useState({ status: '', search: '', from: '', to: '' });
    const [form, setForm] = useState({
        BaseSalary: '', Bonuses: '', Overtime: '', Deductions: '', TotalAmount: '', PaymentDate: '', PaymentMethod: 'Transfer', Notes: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const loadLists = async () => {
        const params = { referenceType, status: filters.status || undefined, from: filters.from || undefined, to: filters.to || undefined, search: filters.search || undefined, limit: 200 };
        const res = await businessApi.finance.listPayments(params);
        setPayments(res.data?.data || []);
    };

    useEffect(() => {
        const load = async () => {
            try {
                await loadLists();
                const [employeesRes, studentsRes] = await Promise.all([
                    crudApi.getAll('employee', { IsActive: 1 }),
                    crudApi.getAll('student', { IsActive: 1 })
                ]);
                const teachers = (employeesRes.data || []).filter(e => {
                    const pos = (e.Position || '').toString().toLowerCase();
                    return /teacher|profesor|docente/.test(pos);
                });
                setTeachers(teachers);
                setStudents(studentsRes.data || []);
            } catch (err) {
                console.error('Error cargando listas', err);
            }
        };
        load();
        
    }, [referenceType]);

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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Pagos</h2>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Referencia</label>
                    <select value={referenceType} onChange={e => { setReferenceType(e.target.value); setSelectedRef(null); }} className="mt-1 block w-full border-gray-300 rounded-md">
                        <option value="Teacher">Profesor</option>
                        <option value="Student">Estudiante</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Seleccionar</label>
                    <select value={selectedRef || ''} onChange={e => setSelectedRef(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md">
                        <option value="">-- Selecciona --</option>
                        {(referenceType === 'Teacher' ? teachers : students).map(t => (
                            <option key={referenceType === 'Teacher' ? t.EmpID : t.StudentID} value={referenceType === 'Teacher' ? t.EmpID : t.StudentID}>
                                {referenceType === 'Teacher' ? `${t.FirstName || ''} ${t.LastName || ''}`.trim() || t.FullName || t.name : `${t.FirstName || ''} ${t.LastName || ''}`.trim()}
                            </option>
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
                    <label className="block text-sm font-medium text-gray-700">Desde</label>
                    <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hasta</label>
                    <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md" />
                </div>
            </div>
            <div className="mb-4 flex items-center gap-2">
                <input placeholder="Buscar referencia (factura/txn)" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="border p-2 rounded w-full" />
                <button onClick={loadLists} className="px-3 py-2 rounded bg-gray-700 text-white">Filtrar</button>
                <button onClick={() => { setFilters({ status: '', search: '', from: '', to: '' }); loadLists(); }} className="px-3 py-2 rounded bg-gray-300">Limpiar</button>
                <button onClick={() => { setEditing(null); setShowModal(true); setMessage(null); }} className="ml-auto inline-flex items-center px-3 py-2 rounded bg-green-600 text-white">Nuevo Pago</button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {payments.map(pay => {
                            const id = pay.TeacherPaymentID || pay.StudentPaymentID || pay.PaymentID || pay.id;
                            return (
                                <tr key={id}>
                                    <td className="px-6 py-4 text-sm text-gray-500">#{id}</td>
                                    <td className="px-6 py-4 font-medium">${(pay.TotalAmount ?? 0).toFixed ? (pay.TotalAmount).toFixed(2) : pay.TotalAmount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{pay.TransactionReference || pay.InvoiceNumber || ''}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(pay.PaymentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pay.Status)}`}>
                                            {pay.Status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => { setEditing(pay); setShowModal(true); setMessage(null); }} className="px-3 py-1 text-sm rounded-md text-white bg-orange-500 hover:bg-orange-600">Editar</button>
                                        <button onClick={async () => {
                                            if (!confirm('¿Eliminar este pago?')) return;
                                            try {
                                                setLoading(true); setMessage(null);
                                                await businessApi.finance.deletePayment(id);
                                                setMessage('Pago eliminado');
                                                await loadLists();
                                            } catch (err) {
                                                setMessage(err?.response?.data?.error || err.message || 'Error al eliminar pago');
                                            } finally { setLoading(false); }
                                        }} className="px-3 py-1 text-sm rounded-md text-white bg-red-600 hover:bg-red-700">Eliminar</button>
                                        <button onClick={async () => {
                                            try {
                                                const { data } = await businessApi.finance.getPaymentPdf(id);
                                                const blob = new Blob([data], { type: 'application/pdf' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `recibo-${id}.pdf`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            } catch (err) { setMessage(err?.response?.data?.error || err.message || 'Error al descargar PDF'); }
                                        }} className="px-3 py-1 text-sm rounded-md bg-gray-200">PDF</button>
                                        <button onClick={async () => {
                                            try {
                                                const res = await businessApi.finance.emailPaymentReceipt(id);
                                                setMessage(res.data?.message || 'Recibo enviado');
                                            } catch (err) { setMessage(err?.response?.data?.error || err.message || 'Error al enviar recibo'); }
                                        }} className="px-3 py-1 text-sm rounded-md bg-gray-200">Email</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">{editing ? 'Editar Pago' : 'Registrar Pago'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {referenceType === 'Teacher' ? (
                                <>
                                    <input placeholder="Salario base" value={form.BaseSalary} onChange={e => setForm({...form, BaseSalary: e.target.value})} className="border p-2 rounded" />
                                    <input placeholder="Bonificaciones" value={form.Bonuses} onChange={e => setForm({...form, Bonuses: e.target.value})} className="border p-2 rounded" />
                                    <input placeholder="Horas extra" value={form.Overtime} onChange={e => setForm({...form, Overtime: e.target.value})} className="border p-2 rounded" />
                                    <input placeholder="Deducciones" value={form.Deductions} onChange={e => setForm({...form, Deductions: e.target.value})} className="border p-2 rounded" />
                                </>
                            ) : (
                                <>
                                    <input placeholder="Monto total" value={form.TotalAmount} onChange={e => setForm({...form, TotalAmount: e.target.value})} className="border p-2 rounded col-span-2" />
                                </>
                            )}
                            <input type="date" placeholder="Fecha de pago" value={form.PaymentDate} onChange={e => setForm({...form, PaymentDate: e.target.value})} className="border p-2 rounded" />
                            <select value={form.PaymentMethod} onChange={e => setForm({...form, PaymentMethod: e.target.value})} className="border p-2 rounded">
                                <option value="Transfer">Transferencia</option>
                                <option value="Cash">Efectivo</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                            <textarea placeholder="Notas" value={form.Notes} onChange={e => setForm({...form, Notes: e.target.value})} className="border p-2 rounded col-span-2" />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <button disabled={!selectedRef || loading} onClick={async () => {
                                if (!selectedRef) return setMessage(`Selecciona un ${referenceType === 'Teacher' ? 'profesor' : 'estudiante'}`);
                                setLoading(true); setMessage(null);
                                try {
                                    const payload = referenceType === 'Teacher' ? {
                                        teacherId: Number(selectedRef),
                                        BaseSalary: form.BaseSalary ? Number(form.BaseSalary) : undefined,
                                        Bonuses: form.Bonuses ? Number(form.Bonuses) : undefined,
                                        Overtime: form.Overtime ? Number(form.Overtime) : undefined,
                                        Deductions: form.Deductions ? Number(form.Deductions) : undefined,
                                        TotalAmount: form.TotalAmount ? Number(form.TotalAmount) : undefined,
                                        PaymentDate: form.PaymentDate || undefined,
                                        PaymentMethod: form.PaymentMethod,
                                        Notes: form.Notes || undefined
                                    } : {
                                        studentId: Number(selectedRef),
                                        TotalAmount: form.TotalAmount ? Number(form.TotalAmount) : undefined,
                                        PaymentDate: form.PaymentDate || undefined,
                                        PaymentMethod: form.PaymentMethod,
                                        Notes: form.Notes || undefined,
                                        PaidAmount: form.TotalAmount ? Number(form.TotalAmount) : undefined
                                    };
                                    const res = await businessApi.finance.registerPayment(payload);
                                    setMessage(res.data?.message || 'Pago registrado');
                                    await loadLists();
                                    setShowModal(false);
                                    setForm({ BaseSalary: '', Bonuses: '', Overtime: '', Deductions: '', TotalAmount: '', PaymentDate: '', PaymentMethod: 'Transfer', Notes: '' });
                                } catch (err) {
                                    setMessage(err?.response?.data?.error || err.message || 'Error al registrar pago');
                                } finally { setLoading(false); }
                            }} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">Guardar</button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-md bg-gray-200">Cancelar</button>
                            {message && <div className="ml-auto text-sm text-gray-700">{message}</div>}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}