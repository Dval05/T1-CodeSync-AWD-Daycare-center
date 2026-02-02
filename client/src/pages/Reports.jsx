import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { businessApi } from '../api/business';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getTime() - 30*24*60*60*1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await businessApi.reports.attendance({ from: dateFrom, to: dateTo });
      setAttendanceStats(res.data || null);
    } catch (e) {
      toast.error('No se pudo cargar asistencia');
      setAttendanceStats(null);
    } finally { setLoading(false); }
  };

  const loadPayments = async () => {
    try {
      const res = await businessApi.finance.listPayments({ from: dateFrom, to: dateTo });
      setPayments(res.data?.data || []);
    } catch (e) { setPayments([]); }
  };

  const loadActivities = async () => {
    try {
      const res = await businessApi.activities.myFeed();
      setActivities(res.data || []);
    } catch {
      const { data } = await crudApi.getAll('activity', { IsActive: 1 });
      setActivities(data || []);
    }
  };

  const loadTasks = async () => {
    try {
      const { data } = await crudApi.getAll('employee_task');
      setTasks(data || []);
    } catch { setTasks([]); }
  };

  useEffect(() => { loadAttendance(); loadPayments(); loadActivities(); loadTasks(); }, []);

  const exportCsv = (rows, headers, filename) => {
    const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reportes</h2>
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border p-2 rounded" />
          <button onClick={()=>{loadAttendance(); loadPayments();}} className="px-3 py-2 bg-blue-600 text-white rounded">Actualizar</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['attendance','payments','activities','tasks','comparatives'].map(t=> (
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-2 rounded ${activeTab===t?'bg-blue-600 text-white':'bg-gray-200'}`}>{t}</button>
        ))}
      </div>

      {activeTab==='attendance' && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Asistencias</h3>
            <div className="flex gap-2">
              <button onClick={async ()=>{
                try { const res = await businessApi.get(`/reports/attendance?from=${dateFrom}&to=${dateTo}&format=pdf`, { responseType:'blob' });
                  const url = URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href=url; a.download=`reporte-asistencia-${dateFrom}-${dateTo}.pdf`; a.click(); URL.revokeObjectURL(url); }
                catch { toast.error('No se pudo generar PDF'); }
              }} className="px-3 py-2 bg-red-600 text-white rounded">PDF</button>
            </div>
          </div>
          {attendanceStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded"><div>Total</div><div className="text-2xl font-bold">{attendanceStats.stats.total}</div></div>
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded"><div>Presentes</div><div className="text-2xl font-bold">{attendanceStats.stats.present}</div></div>
              <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded"><div>Ausentes</div><div className="text-2xl font-bold">{attendanceStats.stats.absent}</div></div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded"><div>Retardos</div><div className="text-2xl font-bold">{attendanceStats.stats.late}</div></div>
            </div>
          ) : <p className="text-gray-500">Sin datos</p>}
        </div>
      )}

      {activeTab==='payments' && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Pagos</h3>
            <button onClick={()=>exportCsv(payments, ['PaymentID','ReferenceType','ReferenceID','Total','Status'], `pagos-${dateFrom}-${dateTo}.csv`)} className="px-3 py-2 bg-green-600 text-white rounded">CSV</button>
          </div>
          <div className="grid gap-2">
            {payments.map(p=> (
              <div key={p.PaymentID} className="border rounded p-3 flex justify-between"><div>
                <div className="font-medium">{p.ReferenceType} #{p.ReferenceID}</div>
                <div className="text-sm text-gray-600">{p.Status}</div>
              </div><div className="text-sm">${Number(p.TotalAmount||p.FinalAmount||0).toFixed(2)}</div></div>
            ))}
          </div>
        </div>
      )}

      {activeTab==='activities' && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-3">Actividades</h3>
          <div className="grid gap-2">
            {activities.map(a=> (
              <div key={a.ActivityID||a.id} className="border rounded p-3 flex justify-between">
                <div>
                  <div className="font-medium">{a.Name}</div>
                  <div className="text-sm text-gray-600">{a.ScheduledDate} {a.StartTime?`• ${a.StartTime}-${a.EndTime||''}`:''}</div>
                </div>
                <div className="text-sm text-gray-600">{a.grade?.GradeName||a.GradeID}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==='tasks' && (
        <div className="bg-white rounded shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Tareas</h3>
            <button onClick={()=>exportCsv(tasks, ['TaskID','EmpID','TaskName','DueDate','Status'], `tareas-${dateFrom}-${dateTo}.csv`)} className="px-3 py-2 bg-green-600 text-white rounded">CSV</button>
          </div>
          <div className="grid gap-2">
            {tasks.map(t=> (
              <div key={t.TaskID} className="border rounded p-3">
                <div className="font-medium">{t.TaskName}</div>
                <div className="text-sm text-gray-600">{t.DueDate||'Sin fecha'} • {t.Status||'Pending'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==='comparatives' && (
        <div className="bg-white rounded shadow p-4">
          <h3 className="text-lg font-bold mb-3">Comparativos</h3>
          <p className="text-gray-600">Conteos generales del período seleccionado:</p>
          <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
            <li>Registros de asistencia: {attendanceStats?.stats?.total ?? 0}</li>
            <li>Pagos realizados: {payments.length}</li>
            <li>Actividades: {activities.length}</li>
            <li>Tareas: {tasks.length}</li>
          </ul>
        </div>
      )}
    </Layout>
  );
}
