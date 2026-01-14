import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { FileText, Plus, Download, DollarSign } from 'lucide-react';

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        studentId: '',
        month: new Date().toISOString().slice(0, 7),
        items: [
            { concept: 'Mensualidad', amount: 1000 }
        ]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [invoicesRes, studentsRes] = await Promise.all([
                crudApi.getAll('invoice'),
                crudApi.getAll('student', { IsActive: 1 })
            ]);
            setInvoices(invoicesRes.data || []);
            setStudents(studentsRes.data || []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        try {
            await businessApi.finance.generateInvoice(newInvoice);
            alert('Factura generada exitosamente');
            setShowGenerateModal(false);
            loadData();
            setNewInvoice({
                studentId: '',
                month: new Date().toISOString().slice(0, 7),
                items: [{ concept: 'Mensualidad', amount: 1000 }]
            });
        } catch (error) {
            console.error("Error generando factura:", error);
            alert('Error al generar factura');
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
                                        <h3 className="font-bold text-lg">Factura #{invoice.InvoiceID}</h3>
                                    </div>
                                    <p className="text-gray-600 mt-1">
                                        Estudiante ID: {invoice.StudentID}
                                    </p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <span className="text-gray-500">
                                            Fecha: {new Date(invoice.InvoiceDate).toLocaleDateString('es-ES')}
                                        </span>
                                        <span className="text-gray-500">
                                            Total: ${invoice.TotalAmount?.toFixed(2)}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${
                                            invoice.Status === 'Paid' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {invoice.Status}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Descargar PDF"
                                >
                                    <Download size={20} />
                                </button>
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
                                    Estudiante
                                </label>
                                <select
                                    value={newInvoice.studentId}
                                    onChange={(e) => setNewInvoice({...newInvoice, studentId: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="">Seleccionar estudiante...</option>
                                    {students.map(student => (
                                        <option key={student.StudentID} value={student.StudentID}>
                                            {student.FirstName} {student.LastName}
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
                                disabled={!newInvoice.studentId}
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
        </Layout>
    );
}