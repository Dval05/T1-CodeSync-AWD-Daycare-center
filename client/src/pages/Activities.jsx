import React, { useEffect, useMemo, useState } from 'react';
import { businessApi } from '../api/business';
import { crudApi } from '../api/crud';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { supabase } from '../config/supabase';

export default function Activities() {
    const [activities, setActivities] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [grades, setGrades] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ Name: '', Description: '', ResponsibleID: '', GradeID: '', ScheduledDate: '', StartTime: '', EndTime: '', Location: '', Category: '' });
    const [file, setFile] = useState(null);
    const [calendarView, setCalendarView] = useState(false);

    const loadAll = async () => {
        try {
            const [emps, grs] = await Promise.all([
                crudApi.getAll('employee', { IsActive: 1 }),
                crudApi.getAll('grade', { IsActive: 1 })
            ]);
            setEmployees(emps.data || []);
            setGrades(grs.data || []);

            
            try {
                const feed = await businessApi.activities.myFeed();
                setActivities(feed.data || []);
            } catch (errFeed) {
                const { data } = await crudApi.getAll('activity', { IsActive: 1 });
                setActivities(data || []);
            }
        } catch (e) {
            console.error('Error cargando datos de actividades', e);
            setEmployees([]);
            setGrades([]);
            try {
                const { data } = await crudApi.getAll('activity', { IsActive: 1 });
                setActivities(data || []);
            } catch (e2) {
                setActivities([]);
            }
        }
    };
    useEffect(() => { loadAll(); }, []);

    const openEdit = (act) => {
        setEditing(act);
        setForm({ 
            Name: act.Name || '',
            Description: act.Description || '',
            ResponsibleID: act.EmpID || '',
            GradeID: act.GradeID || '',
            ScheduledDate: act.ScheduledDate || '',
            StartTime: act.StartTime || '',
            EndTime: act.EndTime || '',
            Location: act.Location || '',
            Category: act.Category || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const payload = {
                    Name: form.Name,
                    Description: form.Description || null,
                    EmpID: form.ResponsibleID || null,
                    GradeID: form.GradeID || null,
                    ScheduledDate: form.ScheduledDate || null,
                    StartTime: form.StartTime || null,
                    EndTime: form.EndTime || null,
                    Location: form.Location || null,
                    Category: form.Category || null,
                };
                await crudApi.update('activity', editing.ActivityID, payload);
                
                if (file) await uploadMedia(editing.ActivityID, file);
                toast.success('Actividad actualizada');
            } else {
                if (!form.Name) return toast.error('Nombre es requerido');
                const payload = {
                    Name: form.Name,
                    Description: form.Description || null,
                    EmpID: form.ResponsibleID || null,
                    GradeID: form.GradeID || null,
                    ScheduledDate: form.ScheduledDate || null,
                    StartTime: form.StartTime || null,
                    EndTime: form.EndTime || null,
                    Location: form.Location || null,
                    Category: form.Category || null,
                    IsActive: 1
                };
                const res = await crudApi.create('activity', payload);
                const created = res.data;
                if (file && created?.ActivityID) await uploadMedia(created.ActivityID, file);
                toast.success('Actividad creada');
            }
            await loadAll();
            setIsModalOpen(false);
            setEditing(null);
            setForm({ Name: '', Description: '', ResponsibleID: '', GradeID: '', ScheduledDate: '', StartTime: '', EndTime: '', Location: '', Category: '' });
            setFile(null);
        } catch (err) {
            console.error('Error guardando actividad', err);
            toast.error('Error guardando actividad');
        }
    };

    const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const uploadMedia = async (activityId, file) => {
        try {
            const ext = file.name.split('.').pop();
            const path = `activities/${activityId}/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('activity-media')
                .upload(path, file, { cacheControl: '3600', upsert: true });
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage.from('activity-media').getPublicUrl(path);
            const publicUrl = publicUrlData?.publicUrl || null;
            await crudApi.create('activity_media', {
                ActivityID: activityId,
                MediaType: 'Image',
                FilePath: publicUrl || path,
                FileSize: file.size,
                Caption: file.name
            });
        } catch (e) {
            console.warn('Error subiendo multimedia:', e.message);
        }
    };

    const handleDelete = async (act) => {
        if (!confirm('¿Eliminar esta actividad? (soft delete)')) return;
        try {
            await crudApi.update('activity', act.ActivityID, { IsActive: 0 });
            toast.success('Actividad eliminada');
            await loadAll();
        } catch (e) {
            toast.error('No se pudo eliminar');
        }
    };

    const groupedByDate = useMemo(() => {
        const map = {};
        (activities || []).forEach(a => {
            const key = a.ScheduledDate || 'Sin fecha';
            map[key] = map[key] || [];
            map[key].push(a);
        });
        return map;
    }, [activities]);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="px-3 py-2 bg-green-600 text-white rounded">Nueva actividad</button>
                    <button onClick={() => setCalendarView(v => !v)} className="px-3 py-2 bg-gray-200 rounded">{calendarView ? 'Lista' : 'Calendario'}</button>
                </div>
            </div>
            
                <div className="grid gap-4">
                {!calendarView && activities.length === 0 && <p className="text-gray-500">No hay actividades para mostrar.</p>}
                {!calendarView && activities.map(act => (
                    <div key={act.ActivityID} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="font-bold text-lg">{act.Name}</h3>
                                <p className="text-gray-600 mt-1">{act.Description}</p>
                                <div className="mt-2 text-sm text-blue-600 font-semibold">{act.grade?.GradeName}</div>
                                <div className="text-xs text-gray-500">{act.Location} • {act.Category}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{act.ScheduledDate} {act.StartTime ? `• ${act.StartTime}-${act.EndTime || ''}` : ''}</span>
                                <div className="flex gap-2">
                                    <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm" onClick={() => openEdit(act)}>Editar</button>
                                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm" onClick={() => handleDelete(act)}>Eliminar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {calendarView && (
                    <div className="grid gap-4">
                        {Object.keys(groupedByDate).sort().map(dateKey => (
                            <div key={dateKey} className="bg-white rounded-lg shadow">
                                <div className="px-4 py-2 bg-gray-50 border-b text-sm font-semibold">{dateKey}</div>
                                <div className="p-4 grid md:grid-cols-2 gap-3">
                                    {groupedByDate[dateKey].map(act => (
                                        <div key={act.ActivityID} className="border rounded p-3">
                                            <div className="font-medium">{act.Name}</div>
                                            <div className="text-sm text-gray-600">{act.StartTime ? `${act.StartTime}-${act.EndTime || ''}` : 'Horario no definido'}</div>
                                            <div className="text-xs text-gray-500">{act.grade?.GradeName}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Editar Actividad' : 'Nueva Actividad'}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                <input value={form.Name} onChange={e => handleFormChange('Name', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Responsable</label>
                                <select value={form.ResponsibleID} onChange={e => handleFormChange('ResponsibleID', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                                    <option value="">-- Sin responsable --</option>
                                    {employees.map(emp => (<option key={emp.EmpID} value={emp.EmpID}>{emp.FirstName || emp.Name} {emp.LastName || ''}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Grado</label>
                                <select value={form.GradeID} onChange={e => handleFormChange('GradeID', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2">
                                    <option value="">-- Sin grado --</option>
                                    {grades.map(g => (<option key={g.GradeID} value={g.GradeID}>{g.GradeName}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                <input type="date" value={form.ScheduledDate} onChange={e => handleFormChange('ScheduledDate', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Inicio</label>
                                <input type="time" value={form.StartTime} onChange={e => handleFormChange('StartTime', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fin</label>
                                <input type="time" value={form.EndTime} onChange={e => handleFormChange('EndTime', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción</label>
                            <textarea value={form.Description} onChange={e => handleFormChange('Description', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lugar</label>
                                <input value={form.Location} onChange={e => handleFormChange('Location', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                <input value={form.Category} onChange={e => handleFormChange('Category', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-md p-2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Multimedia</label>
                            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="mt-1 w-full" accept="image/*,video/*" />
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