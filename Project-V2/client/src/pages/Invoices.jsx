import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { FileText, Plus, Download, Mail, Edit2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [newInvoice, setNewInvoice] = useState({
        teacherId: '',
        month: new Date().toISOString().slice(0, 7),
        items: [
            { concept: 'Mensualidad', amount: 1000 }
        ]
    });
    const [editItems, setEditItems] = useState([]);

    const formatInvoiceNumber = (num, id) => {
        const printed = num ? String(num) : `#${id}`;
        return printed.startsWith('INV-') ? `FAC-${printed.slice(4)}` : printed;
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [invoicesRes, teachersRes] = await Promise.all([
                crudApi.getAll('invoice'),
                crudApi.getAll('teacher', { IsActive: 1 })
            ]);
            setInvoices(invoicesRes.data || []);
            setTeachers(teachersRes.data || []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        try {
            // Validación rápida en frontend
            if (!newInvoice.studentId) {
                alert('Selecciona un estudiante');
                return;
            }
            if (!Array.isArray(newInvoice.items) || newInvoice.items.length === 0) {
                alert('Agrega al menos un concepto');
                return;
            }
            const invalid = newInvoice.items.some(it => !it.concept || Number(it.amount) <= 0);
            if (invalid) {
                alert('Verifica conceptos: deben tener nombre y monto > 0');
                return;
            }

            await businessApi.finance.generateInvoice(newInvoice);
            toast.success('Factura guardada', { position: 'bottom-left' });
            setShowGenerateModal(false);
            loadData();
            setNewInvoice({
                teacherId: '',
                month: new Date().toISOString().slice(0, 7),
                items: [{ concept: 'Mensualidad', amount: 1000 }]
            });
        } catch (error) {
            console.error("Error generando factura:", error);
            const msg = error?.response?.data?.error || 'Error al generar factura';
            alert(msg);
        }
    };

    const addItem = () => {
        setNewInvoice({
            ...newInvoice,
            items: [...newInvoice.items, { concept: '', amount: 0 }]
        });
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = field === 'amount' ? parseFloat(value) : value;
        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const removeItem = (index) => {
        setNewInvoice({
            ...newInvoice,
            items: newInvoice.items.filter((_, i) => i !== index)
        });
    };

    const totalAmount = newInvoice.items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const parseItems = (invoice) => {
        try {
            const json = invoice.Description ? JSON.parse(invoice.Description) : {};
            return Array.isArray(json.items) ? json.items : [];
        } catch {
            return [];
        }
    };

    const openEdit = (invoice) => {
        setEditingInvoice(invoice);
        setEditItems(parseItems(invoice));
        setShowEditModal(true);
    };

    const addEditItem = () => setEditItems((prev) => [...prev, { concept: '', amount: 0 }]);
    const updateEditItem = (index, field, value) => {
        const next = [...editItems];
        next[index][field] = field === 'amount' ? parseFloat(value) : value;
        setEditItems(next);
    };
    const removeEditItem = (index) => setEditItems((prev) => prev.filter((_, i) => i !== index));

    const saveEdit = async () => {
        try {
            await businessApi.finance.updateInvoice(editingInvoice.InvoiceID, { items: editItems });
            setShowEditModal(false);
            setEditingInvoice(null);
            setEditItems([]);
            loadData();
            alert('Factura actualizada');
        } catch (e) {
            console.error(e);
            alert('Error al actualizar factura');
        }
    };

    const cancelInvoice = async (invoice) => {
        if (!confirm('¿Anular esta factura?')) return;
        const reason = prompt('Motivo de anulación (opcional):', '') || '';
        try {
            await businessApi.finance.cancelInvoice(invoice.InvoiceID, { reason });
            loadData();
            alert('Factura anulada');
        } catch (e) {
            console.error(e);
            alert('No se pudo anular la factura');
        }
    };

    const downloadPdf = async (invoice) => {
        try {
            const { data } = await businessApi.finance.getInvoicePdf(invoice.InvoiceID);
            const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            const num = formatInvoiceNumber(invoice.InvoiceNumber, invoice.InvoiceID);
            link.download = `invoice-${num}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('Error al generar PDF');
        }
    };

    const sendEmail = async (invoice) => {
        try {
            await businessApi.finance.sendInvoiceEmail(invoice.InvoiceID);
            alert('Factura enviada por email');
        } catch (e) {
            console.error(e);
            alert('No se pudo enviar el email');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Cargando facturas...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Facturas</h2>
                <button 
                    onClick={() => setShowGenerateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Generar Factura
                </button>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No hay facturas generadas</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {invoices.map(invoice => (
                        <div key={invoice.InvoiceID} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <FileText className="text-green-600" size={20} />
                                        <h3 className="font-bold text-lg">Factura {formatInvoiceNumber(invoice.InvoiceNumber, invoice.InvoiceID)}</h3>
                                    </div>
                                    <p className="text-gray-600 mt-1">Referencia: {invoice.ReferenceID ?? invoice.TeacherID ?? '-'}</p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <span className="text-gray-500">
                                            Fecha: {invoice.IssueDate ? new Date(invoice.IssueDate).toLocaleDateString('es-ES') : '-'}
                                        </span>
                                        <span className="text-gray-500">
                                            Total: ${invoice.TotalAmount?.toFixed(2)}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${
                                            invoice.Status === 'Paid' ? 'bg-green-100 text-green-800'
                                            : invoice.Status === 'Canceled' ? 'bg-red-100 text-red-800'
                                            : invoice.Status === 'Overdue' ? 'bg-orange-100 text-orange-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {invoice.Status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Descargar PDF"
                                        onClick={() => downloadPdf(invoice)}
                                    >
                                        <Download size={20} />
                                    </button>
                                    <button
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Enviar por email"
                                        onClick={() => sendEmail(invoice)}
                                    >
                                        <Mail size={20} />
                                    </button>
                                    <button
                                        className="text-amber-600 hover:text-amber-700 disabled:text-gray-400"
                                        title="Editar"
                                        disabled={invoice.Status === 'Paid' || invoice.Status === 'Canceled'}
                                        onClick={() => openEdit(invoice)}
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-700 disabled:text-gray-400"
                                        title="Anular"
                                        disabled={invoice.Status === 'Paid' || invoice.Status === 'Canceled'}
                                        onClick={() => cancelInvoice(invoice)}
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para Generar Factura */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
                        <h3 className="text-xl font-bold mb-4">Generar Nueva Factura</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Profesor
                                </label>
                                <select
                                    value={newInvoice.teacherId}
                                    onChange={(e) => setNewInvoice({...newInvoice, teacherId: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">Seleccionar profesor...</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.TeacherID} value={teacher.TeacherID}>
                                            {teacher.FirstName} {teacher.LastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mes
                                </label>
                                <input
                                    type="month"
                                    value={newInvoice.month}
                                    onChange={(e) => setNewInvoice({...newInvoice, month: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Conceptos
                                    </label>
                                    <button
                                        onClick={addItem}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        + Agregar concepto
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {newInvoice.items.map((item, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item.concept}
                                                onChange={(e) => updateItem(index, 'concept', e.target.value)}
                                                placeholder="Concepto"
                                                className="flex-1 border rounded-lg px-3 py-2"
                                            />
                                            <input
                                                type="number"
                                                value={item.amount}
                                                onChange={(e) => updateItem(index, 'amount', e.target.value)}
                                                placeholder="Monto"
                                                className="w-32 border rounded-lg px-3 py-2"
                                            />
                                            {newInvoice.items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-700 px-2"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">Total:</span>
                                    <span className="font-bold text-2xl text-green-600">
                                        ${totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleGenerateInvoice}
                                disabled={!newInvoice.teacherId}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                Generar Factura
                            </button>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Editar Factura */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
                        <h3 className="text-xl font-bold mb-4">Editar Factura {formatInvoiceNumber(editingInvoice?.InvoiceNumber, editingInvoice?.InvoiceID)}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Conceptos</label>
                                <button onClick={addEditItem} className="text-blue-600 hover:text-blue-700 text-sm">+ Agregar concepto</button>
                            </div>
                            <div className="space-y-2">
                                {editItems.map((item, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={item.concept}
                                            onChange={(e) => updateEditItem(index, 'concept', e.target.value)}
                                            placeholder="Concepto"
                                            className="flex-1 border rounded-lg px-3 py-2"
                                        />
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateEditItem(index, 'amount', e.target.value)}
                                            placeholder="Monto"
                                            className="w-32 border rounded-lg px-3 py-2"
                                        />
                                        {editItems.length > 1 && (
                                            <button onClick={() => removeEditItem(index)} className="text-red-600 hover:text-red-700 px-2">✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Guardar Cambios</button>
                            <button onClick={() => { setShowEditModal(false); setEditingInvoice(null); }} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}