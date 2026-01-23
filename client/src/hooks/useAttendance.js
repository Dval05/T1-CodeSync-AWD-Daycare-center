import { useState, useEffect } from 'react';
import { crudApi } from '../api/crud';
import { toast } from 'react-hot-toast';

export const useAttendance = () => {
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [lateStatus, setLateStatus] = useState({});

    const loadStudents = async () => {
        const { data } = await crudApi.getAll('student', { IsActive: 1 });
        setStudents(data);
        
        const initialStatus = {};
        const initialLate = {};
        data.forEach(s => {
            initialStatus[s.StudentID] = 'Present';
            initialLate[s.StudentID] = 0;
        });
        
        setAttendance(initialStatus);
        setLateStatus(initialLate);
    };

    const toggleAttendance = (id) => {
        setAttendance(prev => ({
            ...prev,
            [id]: prev[id] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const toggleLateStatus = (id) => {
        setLateStatus(prev => ({
            ...prev,
            [id]: prev[id] === 1 ? 0 : 1
        }));
    };

    const saveAttendance = async (date) => {
        try {
            const promises = students.map(stu => 
                crudApi.create('attendance', {
                    StudentID: stu.StudentID,
                    Date: date,
                    Status: attendance[stu.StudentID] || 'Present',
                    IsLate: lateStatus[stu.StudentID] || 0
                })
            );
            
            await Promise.all(promises);
            toast.success('Asistencia guardada correctamente');
            return true;
        } catch (error) {
            toast.error('Error guardando asistencia: ' + (error.response?.data?.error || error.message));
            return false;
        }
    };

    return {
        students,
        attendance,
        lateStatus,
        loadStudents,
        toggleAttendance,
        toggleLateStatus,
        saveAttendance
    };
};
