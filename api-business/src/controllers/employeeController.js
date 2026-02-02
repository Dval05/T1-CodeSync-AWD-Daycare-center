import supabase from '../config/supabase.js';

export const getSchedules = async (req, res) => {
    try {
        // Prefer real schedules table if present; fallback to mock
        try {
            const { data } = await supabase
                .from('employee_schedule')
                .select('*')
                .order('StartTime', { ascending: true });
            if (Array.isArray(data)) return res.json(data);
        } catch (_) {}

        const mockSchedules = [
            { id: 1, EmpID: null, Name: 'Turno Mañana', StartTime: '08:00', EndTime: '14:00', Days: ['Mon','Tue','Wed','Thu','Fri'] },
            { id: 2, EmpID: null, Name: 'Turno Tarde', StartTime: '14:00', EndTime: '18:00', Days: ['Mon','Tue','Wed','Thu','Fri'] }
        ];
        res.json(mockSchedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const { EmpID, Name, StartTime, EndTime, Days, DateFrom, DateTo } = req.body || {};
        if (!Name || !StartTime || !EndTime) return res.status(400).json({ error: 'Name, StartTime y EndTime son requeridos' });
        // Detect conflicts (same EmpID overlapping time windows on same days)
        const conflicts = await detectConflicts(EmpID, StartTime, EndTime, Days, DateFrom, DateTo);
        if (conflicts.length > 0) {
            return res.status(409).json({ error: 'Conflicto de horario', conflicts });
        }
        const payload = { EmpID: EmpID || null, Name, StartTime, EndTime, Days: Array.isArray(Days) ? Days : null, DateFrom: DateFrom || null, DateTo: DateTo || null, IsActive: 1 };
        const { data, error } = await supabase.from('employee_schedule').insert(payload).select().single();
        if (error) throw error;
        res.json({ ok: true, schedule: data });
    } catch (error) {
        // If table missing, return graceful info
        if ((error?.message || '').toLowerCase().includes('relation') && (error?.message || '').toLowerCase().includes('does not exist')) {
            return res.status(501).json({ error: 'Tabla employee_schedule no existe. Cree la tabla para habilitar CRUD.' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};
        if (updates.StartTime && updates.EndTime) {
            const conflicts = await detectConflicts(updates.EmpID, updates.StartTime, updates.EndTime, updates.Days, updates.DateFrom, updates.DateTo, id);
            if (conflicts.length > 0) {
                return res.status(409).json({ error: 'Conflicto de horario', conflicts });
            }
        }
        const { data, error } = await supabase.from('employee_schedule').update(updates).eq('ScheduleID', id).select().single();
        if (error) throw error;
        res.json({ ok: true, schedule: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        // Soft delete by IsActive if column exists
        let { data, error } = await supabase.from('employee_schedule').update({ IsActive: 0 }).eq('ScheduleID', id).select().single();
        if (error && (error?.message || '').toLowerCase().includes('column "isactive"')) {
            // Fallback hard delete
            const resp = await supabase.from('employee_schedule').delete().eq('ScheduleID', id).select().single();
            data = resp.data; error = resp.error;
        }
        if (error) throw error;
        res.json({ ok: true, schedule: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const assignShiftDays = async (req, res) => {
    try {
        const { EmpID, Name, StartTime, EndTime, Days, DateFrom, DateTo } = req.body || {};
        if (!EmpID || !Array.isArray(Days) || Days.length === 0) return res.status(400).json({ error: 'EmpID y Days son requeridos' });
        const conflicts = await detectConflicts(EmpID, StartTime, EndTime, Days, DateFrom, DateTo);
        if (conflicts.length > 0) return res.status(409).json({ error: 'Conflicto de horario', conflicts });
        const payload = { EmpID, Name: Name || 'Turno', StartTime, EndTime, Days, DateFrom: DateFrom || null, DateTo: DateTo || null, IsActive: 1 };
        const { data, error } = await supabase.from('employee_schedule').insert(payload).select().single();
        if (error) throw error;
        res.json({ ok: true, schedule: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCalendarView = async (req, res) => {
    try {
        const { from, to } = req.query;
        const { data, error } = await supabase
            .from('employee_schedule')
            .select('*')
            .order('StartTime', { ascending: true });
        if (error) throw error;
        const items = Array.isArray(data) ? data : [];
        const calendar = buildCalendar(items, from, to);
        res.json({ ok: true, calendar });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const exportSchedulesCsv = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('employee_schedule')
            .select('*')
            .order('EmpID', { ascending: true })
            .order('StartTime', { ascending: true });
        if (error) throw error;
        const items = Array.isArray(data) ? data : [];
        const header = ['ScheduleID','EmpID','Name','StartTime','EndTime','Days','DateFrom','DateTo','IsActive'];
        const rows = items.map(i => [i.ScheduleID, i.EmpID, quote(i.Name), i.StartTime, i.EndTime, quote(JSON.stringify(i.Days || [])), i.DateFrom || '', i.DateTo || '', i.IsActive ?? 1].join(','));
        const csv = [header.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="employee-schedules.csv"');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function quote(s) { return '"' + String(s || '').replace(/"/g, '""') + '"'; }

async function detectConflicts(EmpID, StartTime, EndTime, Days, DateFrom, DateTo, excludeId = null) {
    try {
        let q = supabase.from('employee_schedule').select('*');
        if (EmpID) q = q.eq('EmpID', EmpID);
        const { data } = await q;
        const items = Array.isArray(data) ? data : [];
        const st = toMinutes(StartTime), et = toMinutes(EndTime);
        return items.filter(i => {
            if (excludeId && (i.ScheduleID === Number(excludeId))) return false;
            const ist = toMinutes(i.StartTime), iet = toMinutes(i.EndTime);
            const overlap = st < iet && et > ist; // simple time overlap
            // days intersection
            const daysA = new Set((Array.isArray(Days) ? Days : []).map(d => String(d).slice(0,3).toLowerCase()));
            const daysB = new Set((Array.isArray(i.Days) ? i.Days : []).map(d => String(d).slice(0,3).toLowerCase()));
            const dayIntersect = daysA.size === 0 || [...daysA].some(d => daysB.has(d));
            return overlap && dayIntersect && (EmpID ? i.EmpID === EmpID : true);
        });
    } catch (_) { return []; }
}

function toMinutes(t) {
    if (!t) return 0; const [h,m] = String(t).split(':').map(Number); return h*60 + (m||0);
}

function buildCalendar(items, from, to) {
    // Map schedules across provided range (if any) by day-of-week only
    const map = {};
    items.forEach(i => {
        const days = Array.isArray(i.Days) ? i.Days : [];
        days.forEach(d => {
            const key = String(d).slice(0,3).toLowerCase();
            map[key] = map[key] || [];
            map[key].push({ EmpID: i.EmpID, Name: i.Name, StartTime: i.StartTime, EndTime: i.EndTime });
        });
    });
    return map; // { mon: [{...}], tue: [...] }
}


export const assignTask = async (req, res) => {
    const { employeeId, title, description, dueDate, priority } = req.body;
    
    if (!employeeId || !title) {
        return res.status(400).json({ 
            error: 'employeeId y title son requeridos' 
        });
    }

    try {
        const { data: employee, error: empError } = await supabase
            .from('employee')
            .select('EmpID, FirstName, LastName')
            .eq('EmpID', employeeId)
            .eq('IsActive', 1)
            .single();

        if (empError || !employee) {
            return res.status(404).json({ 
                error: 'Empleado no encontrado o inactivo' 
            });
        }

        const priorityMap = {
            'Baja': 'Low',
            'Media': 'Medium',
            'Alta': 'High',
            'Urgente': 'Urgent'
        };
        const mappedPriority = priorityMap[priority] || priority || 'Medium';

        const taskData = {
            EmpID: employeeId,
            TaskName: title,
            Description: description || null,
            DueDate: dueDate || null,
            Priority: mappedPriority,
            Status: 'Pending',
            CreatedBy: req.user?.userId || null
        };

        const { data: newTask, error: taskError } = await supabase
            .from('employee_task')
            .insert(taskData)
            .select()
            .single();

        if (taskError) {
            throw new Error(`Error al crear tarea: ${taskError.message}`);
        }

        // Try automatic notification to employee's user
        try {
            const { NotificationService } = await import('../services/NotificationService.js');
            const ns = new NotificationService();
            const receiverId = employee.UserID || null;
            if (receiverId) {
                await ns.sendNotification(receiverId, {
                    Type: 'Reminder',
                    Priority: mappedPriority === 'Urgent' ? 'Critical' : (mappedPriority === 'High' ? 'High' : 'Normal'),
                    Subject: `Nueva tarea asignada: ${title}`,
                    Message: `Se te asignó: ${title}. Vence: ${dueDate || 'Sin fecha'}.`,
                    RelatedModule: 'Personal',
                    RelatedID: newTask.TaskID
                }, req.user?.userId || null);
            }
        } catch (e) {
            console.warn('Notificación no enviada:', e.message);
        }

        res.json({ 
            success: true, 
            message: 'Tarea asignada exitosamente',
            task: newTask,
            employee: {
                name: `${employee.FirstName} ${employee.LastName}`,
                id: employee.EmpID
            }
        });
    } catch (error) {
        console.error('Error asignando tarea:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getEmployeeTasks = async (req, res) => {
    const { id } = req.params;
    const { status } = req.query; 

    try {
        let query = supabase
            .from('employee_task')
            .select('*')
            .eq('EmpID', id)
            .order('DueDate', { ascending: true });

        if (status) {
            query = query.eq('Status', status);
        }

        const { data: tasks, error } = await query;

        if (error) {
            throw error;
        }

        res.json({ 
            employeeId: id,
            tasks: tasks || [],
            total: tasks?.length || 0
        });
    } catch (error) {
        console.error('Error obteniendo tareas:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { status, completedDate } = req.body;

    try {
        const updateData = { Status: status };
        
        if (status === 'Completed' && completedDate) {
            updateData.CompletedDate = completedDate;
        }

        const { data, error } = await supabase
            .from('employee_task')
            .update(updateData)
            .eq('TaskID', taskId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({ 
            success: true, 
            message: 'Tarea actualizada',
            task: data
        });
    } catch (error) {
        console.error('Error actualizando tarea:', error);
        res.status(500).json({ error: error.message });
    }
};
