import React, { useEffect, useState } from 'react';
import { businessApi } from '../api/business';
import { crudApi } from '../api/crud';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';

export default function Activities() {
    const [activities, setActivities] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ Name: '', ResponsibleID: '' });

    useEffect(() => {
        businessApi.activities.myFeed()
            .then(res => setActivities(res.data))
            .catch(console.error);
        // load employees for responsible selector
        crudApi.getAll('employee', { IsActive: 1 })
            .then(r => setEmployees(r.data || []))
            .catch(() => setEmployees([]));
    }, []);

    const openEdit = (act) => {
        setEditing(act);
        setForm({ Name: act.Name || '', ResponsibleID: act.ResponsibleID || act.EmpID || '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editing) return;
        try {
            const payload = { Name: form.Name, ResponsibleID: form.ResponsibleID };
            await crudApi.update('activity', editing.ActivityID, payload);
            toast.success('Actividad actualizada');
            // refresh list
            const res = await businessApi.activities.myFeed();
            setActivities(res.data || []);
            setIsModalOpen(false);
            setEditing(null);
        } catch (err) {
            console.error('Error actualizando actividad', err);
            toast.error('Error actualizando actividad');
        }
    };

    const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
            </div>
            
                <div className="grid gap-4">
                {activities.length === 0 && <p className="text-gray-500">No hay actividades para mostrar.</p>}
                
                {activities.map(act => (
                    <div key={act.ActivityID} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-bold text-lg">{act.Name}</h3>
                                <p className="text-gray-600 mt-1">{act.Description}</p>
                                <div className="mt-2 text-sm text-blue-600 font-semibold">{act.grade?.GradeName}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{act.ScheduledDate}</span>
                                <button className="bg-yellow-400 text-white px-3 py-1 rounded text-sm" onClick={() => openEdit(act)}>Editar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Actividad">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input value={form.Name} onChange={e => handleFormChange('Name', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Responsable</label>
                            <select value={form.ResponsibleID} onChange={e => handleFormChange('ResponsibleID', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                                <option value="">-- Sin responsable --</option>
                                {employees.map(emp => (<option key={emp.EmpID} value={emp.EmpID}>{emp.FirstName || emp.Name} {emp.LastName || ''}</option>))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                        </div>
                    </form>
                </Modal>
        </Layout>
    );
}