import supabase from '../config/supabase.js';

export const getSchedules = async (req, res) => {
    try {
        
        const mockSchedules = [
            {
                id: 1,
                name: 'Turno Mañana',
                schedule: '08:00 - 14:00',
                days: 'Lunes a Viernes'
            },
            {
                id: 2,
                name: 'Turno Tarde',
                schedule: '14:00 - 18:00',
                days: 'Lunes a Viernes'
            }
        ];
        
        res.json(mockSchedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


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
