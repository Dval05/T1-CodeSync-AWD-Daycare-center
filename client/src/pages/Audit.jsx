import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

const STORAGE_KEY = 'audit_tables_v1';

export default function Audit() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);

    // pendingUploads: { attendance: [...files], payments: [...files], reports: [...files] }
    const [pendingUploads, setPendingUploads] = useState({ attendance: [], payments: [], reports: [] });
    // confirmed tables stored in localStorage
    const [tables, setTables] = useState({});
    const [viewing, setViewing] = useState(null); // studentId being viewed
    const [editing, setEditing] = useState(null); // studentId being edited

    useEffect(() => {
        loadStudents();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setTables(JSON.parse(saved));
    }, []);

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
        if (!selectedStudent) { toast.error('Selecciona un estudiante primero'); return; }

        const studentId = selectedStudent;
        const student = students.find(s => String(s.StudentID) === String(studentId));
        const studentName = student ? `${student.FirstName} ${student.LastName}` : 'Desconocido';

        const current = tables[studentId] || { studentName, categories: { attendance: [], payments: [], reports: [] }, createdAt: new Date().toISOString() };

        const toAdd = (pendingUploads[category] || []).map(f => ({ id: Date.now() + Math.random(), name: f.name, type: f.type, dataUrl: f.dataUrl, uploadedAt: new Date().toISOString() }));

        current.categories[category] = current.categories[category].concat(toAdd);

        const next = { ...tables, [studentId]: current };
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

    const handleViewTable = (studentId) => {
        setViewing(studentId);
        setEditing(null);
    };

    const handleEditTable = (studentId) => {
        setEditing(studentId);
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
            current.categories = current.categories || { attendance: [], payments: [], reports: [] };
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Estudiante:</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded"
                        >
                            <option value="">-- Seleccionar estudiante --</option>
                            {students.map(s => (
                                <option key={s.StudentID} value={s.StudentID}>
                                    {s.FirstName} {s.LastName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex items-end justify-end space-x-2">
                        <button
                            onClick={() => { /* no-op: uploads handled per-column */ }}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                        >
                            (Sube archivos en cada columna)
                        </button>
                    </div>
                </div>

                {/* TABLE UI: 3 columns */}
                <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <tr>
                                <td className="px-6 py-4 align-top">
                                    <input type="file" accept=".pdf,.xls,.xlsx,.csv" multiple onChange={(e) => handleFilesSelected('attendance', e.target.files)} />
                                    {pendingUploads.attendance.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm font-semibold">Archivos pendientes:</div>
                                            <ul className="list-disc list-inside text-sm">
                                                {pendingUploads.attendance.map((f, i) => <li key={i}>{f.name}</li>)}
                                            </ul>
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
                                            <ul className="list-disc list-inside text-sm">
                                                {pendingUploads.payments.map((f, i) => <li key={i}>{f.name}</li>)}
                                            </ul>
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
                                            <ul className="list-disc list-inside text-sm">
                                                {pendingUploads.reports.map((f, i) => <li key={i}>{f.name}</li>)}
                                            </ul>
                                            <div className="mt-2 flex gap-2">
                                                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleConfirmUpload('reports')}>Confirmar subir</button>
                                                <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => handleCancelPending('reports')}>Cancelar</button>
                                            </div>
                                        </div>
                                    )}
                                </td>
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
                {Object.entries(tables).map(([studentId, tbl]) => (
                    <div key={studentId} className="flex items-center justify-between border-b py-3">
                        <div>Auditoría_{tbl.studentName}</div>
                        <div className="flex gap-2">
                            <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => handleViewTable(studentId)}>Ver tabla</button>
                            <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => handleEditTable(studentId)}>Editar tabla</button>
                        </div>
                    </div>
                ))}

                {/* Viewing area */}
                {viewing && tables[viewing] && (
                    <div className="mt-4">
                        <h5 className="font-semibold">Tabla: Auditoría_{tables[viewing].studentName}</h5>
                        <div className="overflow-x-auto mt-2">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reportes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    <tr>
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
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Editing area: allow appending files to existing table */}
                {editing && tables[editing] && (
                    <div className="mt-4">
                        <h5 className="font-semibold">Editar Tabla: Auditoría_{tables[editing].studentName}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
