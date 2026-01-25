import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'audit_tables_v1';

export default function Audit() {
    const [students, setStudents] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('students'); // 'students' | 'teachers'

    // pendingUploads: supports both student and teacher categories
    const [pendingUploads, setPendingUploads] = useState({ attendance: [], payments: [], reports: [], activities: [] });
    // confirmed tables stored in localStorage
    const [tables, setTables] = useState({});
    const [viewing, setViewing] = useState(null); // studentId being viewed
    const [editing, setEditing] = useState(null); // studentId being edited

    useEffect(() => {
        loadStudents();
        loadEmployees();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) || {};
                const normalized = normalizeTables(parsed);
                setTables(normalized);
            } catch (err) {
                console.error('Error parsing stored audit tables:', err);
                setTables({});
            }
        }
    }, []);

    const normalizeTables = (obj) => {
        const out = {};
        Object.entries(obj).forEach(([key, tbl]) => {
            const t = { ...tbl };
            // default to students if mode not set
            if (!t.mode) t.mode = 'students';
            // ensure displayName
            if (!t.displayName && t.studentName) t.displayName = t.studentName;
            if (!t.categories) t.categories = {};
            if (t.mode === 'students') {
                t.categories.attendance = t.categories.attendance || [];
                t.categories.payments = t.categories.payments || [];
                t.categories.reports = t.categories.reports || [];
            } else {
                t.categories.activities = t.categories.activities || [];
                t.categories.payments = t.categories.payments || [];
            }
            out[key] = t;
        });
        return out;
    };

    // clear selections/view when switching modes
    useEffect(() => {
        setSelectedStudent('');
        setSelectedEmployee('');
        setViewing(null);
        setEditing(null);
    }, [mode]);

    const loadEmployees = async () => {
        try {
            const { data } = await crudApi.getAll('employee', { IsActive: 1 });
            setEmployees(data || []);
        } catch (err) {
            console.error('Error cargando empleados (audit):', err);
        }
    };

    const persistTables = (next) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setTables(next);
    };

    const loadStudents = async () => {
        try {
            const { data } = await crudApi.getAll('student', { IsActive: 1 });
            setStudents(data || []);
        } catch (err) {
            console.error('Error cargando estudiantes (audit):', err);
            toast.error('Error cargando estudiantes');
        }
    };

    const handleFilesSelected = (category, fileList) => {
        const files = Array.from(fileList);
        // read files as data URLs
        const readers = files.map(f => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: f.name, type: f.type, dataUrl: e.target.result });
            reader.readAsDataURL(f);
        }));

        Promise.all(readers).then(results => {
            setPendingUploads(prev => ({ ...prev, [category]: (prev[category] || []).concat(results) }));
        });
    };

    const handleCancelPending = (category) => {
        setPendingUploads(prev => ({ ...prev, [category]: [] }));
    };

    const handleConfirmUpload = (category) => {
        // determine id and name based on mode
        const id = mode === 'students' ? selectedStudent : selectedEmployee;
        if (!id) { toast.error(mode === 'students' ? 'Selecciona un estudiante primero' : 'Selecciona un empleado primero'); return; }

        const nameObj = mode === 'students' ? students.find(s => String(s.StudentID) === String(id)) : employees.find(e => String(e.EmpID) === String(id));
        const displayName = nameObj ? ((nameObj.FirstName || nameObj.Name || '') + ' ' + (nameObj.LastName || '')).trim() : 'Desconocido';

        const key = `${mode}:${id}`;

        // default categories per mode
        const defaultCategories = mode === 'students'
            ? { attendance: [], payments: [], reports: [] }
            : { activities: [], payments: [] };

        const current = tables[key] || { displayName, mode, categories: defaultCategories, createdAt: new Date().toISOString() };

        const toAdd = (pendingUploads[category] || []).map(f => ({ id: Date.now() + Math.random(), name: f.name, type: f.type, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString() }));

        current.categories[category] = (current.categories[category] || []).concat(toAdd);

        const next = { ...tables, [key]: current };
        persistTables(next);

        setPendingUploads(prev => ({ ...prev, [category]: [] }));
        toast.success('Archivo(s) subido(s) correctamente');
    };

    const handleCompletarTabla = () => {
        // reload section: clear selection and show list (tables state already updated)
        setSelectedStudent('');
        setViewing(null);
        setEditing(null);
        toast.success('Tabla completada');
    };

    const handleViewTable = (key) => {
        setViewing(key);
        setEditing(null);
    };

    const handleEditTable = (key) => {
        setEditing(key);
        setViewing(null);
    };

    const handleDownloadFile = (file) => {
        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleAppendFilesWhileEditing = (category, fileList) => {
        if (!editing) { toast.error('No hay tabla en edición'); return; }
        const files = Array.from(fileList);
        const readers = files.map(f => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: f.name, type: f.type, dataUrl: e.target.result });
            reader.readAsDataURL(f);
        }));
        Promise.all(readers).then(results => {
            const toAdd = results.map(f => ({ id: Date.now() + Math.random(), name: f.name, type: f.type, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString() }));
            const current = { ...(tables[editing] || {}) };
            current.categories = current.categories || {};
            current.categories[category] = (current.categories[category] || []).concat(toAdd);
            const next = { ...tables, [editing]: current };
            persistTables(next);
            toast.success('Archivo(s) añadidos a la tabla');
        });
    };

    return (
        <Layout>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Auditoría</h3>

                <div className="flex gap-2 mb-4">
                    <button className={`px-3 py-2 rounded ${mode==='students' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setMode('students')}>Estudiantes</button>
                    <button className={`px-3 py-2 rounded ${mode==='teachers' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setMode('teachers')}>Maestros</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{mode==='students' ? 'Seleccionar Estudiante:' : 'Seleccionar Empleado:'}</label>
                        {mode==='students' ? (
                            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="w-full border border-gray-300 p-2 rounded">
                                <option value="">-- Seleccionar estudiante --</option>
                                {students.map(s => (<option key={s.StudentID} value={s.StudentID}>{s.FirstName} {s.LastName}</option>))}
                            </select>
                        ) : (
                            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full border border-gray-300 p-2 rounded">
                                <option value="">-- Seleccionar empleado --</option>
                                {employees.map(e => (<option key={e.EmpID} value={e.EmpID}>{e.FirstName || e.Name} {e.LastName || ''}</option>))}
                            </select>
                        )}
                    </div>

                    <div className="md:col-span-2 flex items-end justify-end space-x-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold">(Sube archivos en cada columna)</button>
                    </div>
                </div>

                {/* TABLE UI: 3 columns */}
                <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {mode === 'students' ? (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportes</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actividades</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <tr>
                                {mode === 'students' ? (
                                    <>
                                        <td className="px-6 py-4 align-top">
                                            <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleFilesSelected('attendance', e.target.files)} />
                                            {pendingUploads.attendance.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold">Archivos pendientes:</div>
                                                    <ul className="list-disc list-inside text-sm">{pendingUploads.attendance.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
                                                    <div className="mt-2 flex gap-2">
                                                        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleConfirmUpload('attendance')}>Confirmar subir</button>
                                                        <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => handleCancelPending('attendance')}>Cancelar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleFilesSelected('payments', e.target.files)} />
                                            {pendingUploads.payments.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold">Archivos pendientes:</div>
                                                    <ul className="list-disc list-inside text-sm">{pendingUploads.payments.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
                                                    <div className="mt-2 flex gap-2">
                                                        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleConfirmUpload('payments')}>Confirmar subir</button>
                                                        <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => handleCancelPending('payments')}>Cancelar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleFilesSelected('reports', e.target.files)} />
                                            {pendingUploads.reports.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold">Archivos pendientes:</div>
                                                    <ul className="list-disc list-inside text-sm">{pendingUploads.reports.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
                                                    <div className="mt-2 flex gap-2">
                                                        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleConfirmUpload('reports')}>Confirmar subir</button>
                                                        <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => handleCancelPending('reports')}>Cancelar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 align-top">
                                            <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleFilesSelected('activities', e.target.files)} />
                                            {pendingUploads.activities.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold">Archivos pendientes:</div>
                                                    <ul className="list-disc list-inside text-sm">{pendingUploads.activities.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
                                                    <div className="mt-2 flex gap-2">
                                                        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleConfirmUpload('activities')}>Confirmar subir</button>
                                                        <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => handleCancelPending('activities')}>Cancelar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleFilesSelected('payments', e.target.files)} />
                                            {pendingUploads.payments.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold">Archivos pendientes:</div>
                                                    <ul className="list-disc list-inside text-sm">{pendingUploads.payments.map((f, i) => <li key={i}>{f.name}</li>)}</ul>
                                                    <div className="mt-2 flex gap-2">
                                                        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleConfirmUpload('payments')}>Confirmar subir</button>
                                                        <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => handleCancelPending('payments')}>Cancelar</button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </>
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleCompletarTabla} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">Completar Tabla</button>
                </div>
            </div>

            {/* List existing audit tables */}
            <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-bold mb-4">Tablas de Auditoría</h4>
                {Object.keys(tables).length === 0 && <p className="text-sm text-gray-500">No hay tablas creadas aún.</p>}
                {Object.entries(tables)
                    .filter(([_, tbl]) => tbl && tbl.mode === mode)
                    .map(([key, tbl]) => (
                        <div key={key} className="flex items-center justify-between border-b py-3">
                            <div>Auditoría_{tbl.displayName || tbl.studentName || key}</div>
                            <div className="flex gap-2">
                                <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => handleViewTable(key)}>Ver tabla</button>
                                <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => handleEditTable(key)}>Editar tabla</button>
                            </div>
                        </div>
                    ))}

                {/* Viewing area */}
                {viewing && tables[viewing] && (
                    <div className="mt-4">
                        <h5 className="font-semibold">Tabla: Auditoría_{tables[viewing].displayName || tables[viewing].studentName}</h5>
                        <div className="overflow-x-auto mt-2">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {tables[viewing].mode === 'students' ? (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportes</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actividades</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    <tr>
                                        {tables[viewing].mode === 'students' ? (
                                            <>
                                                <td className="px-6 py-4 align-top">
                                                    {(tables[viewing].categories.attendance || []).map(f => (
                                                        <div key={f.id} className="flex items-center justify-between">
                                                            <span className="text-sm">{f.name}</span>
                                                            <button className="text-blue-600 text-sm" onClick={() => handleDownloadFile(f)}>Descargar</button>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {(tables[viewing].categories.payments || []).map(f => (
                                                        <div key={f.id} className="flex items-center justify-between">
                                                            <span className="text-sm">{f.name}</span>
                                                            <button className="text-blue-600 text-sm" onClick={() => handleDownloadFile(f)}>Descargar</button>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {(tables[viewing].categories.reports || []).map(f => (
                                                        <div key={f.id} className="flex items-center justify-between">
                                                            <span className="text-sm">{f.name}</span>
                                                            <button className="text-blue-600 text-sm" onClick={() => handleDownloadFile(f)}>Descargar</button>
                                                        </div>
                                                    ))}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 align-top">
                                                    {(tables[viewing].categories.activities || []).map(f => (
                                                        <div key={f.id} className="flex items-center justify-between">
                                                            <span className="text-sm">{f.name}</span>
                                                            <button className="text-blue-600 text-sm" onClick={() => handleDownloadFile(f)}>Descargar</button>
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-6 py-4 align-top">
                                                    {(tables[viewing].categories.payments || []).map(f => (
                                                        <div key={f.id} className="flex items-center justify-between">
                                                            <span className="text-sm">{f.name}</span>
                                                            <button className="text-blue-600 text-sm" onClick={() => handleDownloadFile(f)}>Descargar</button>
                                                        </div>
                                                    ))}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Editing area: allow appending files to existing table */}
                {editing && tables[editing] && (
                    <div className="mt-4">
                        <h5 className="font-semibold">Editar Tabla: Auditoría_{tables[editing].displayName || tables[editing].studentName}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            {tables[editing].mode === 'students' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium">Asistencia: añadir</label>
                                        <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleAppendFilesWhileEditing('attendance', e.target.files)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Pagos: añadir</label>
                                        <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleAppendFilesWhileEditing('payments', e.target.files)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Reportes: añadir</label>
                                        <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleAppendFilesWhileEditing('reports', e.target.files)} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium">Actividades: añadir</label>
                                        <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleAppendFilesWhileEditing('activities', e.target.files)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Pagos: añadir</label>
                                        <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleAppendFilesWhileEditing('payments', e.target.files)} />
                                    </div>
                                    <div />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
