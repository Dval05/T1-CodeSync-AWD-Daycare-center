import React from 'react';

export const AttendanceTable = ({ students, attendance, lateStatus, onToggleAttendance, onToggleLate }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Estudiante
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            ¿Retardo?
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {students.map(student => (
                        <AttendanceRow
                            key={student.StudentID}
                            student={student}
                            status={attendance[student.StudentID]}
                            isLate={lateStatus[student.StudentID]}
                            onToggleAttendance={onToggleAttendance}
                            onToggleLate={onToggleLate}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AttendanceRow = ({ student, status, isLate, onToggleAttendance, onToggleLate }) => {
    const isPresent = status === 'Present';
    
    return (
        <tr>
            <td className="px-6 py-4">
                {student.FirstName} {student.LastName}
            </td>
            <td className="px-6 py-4 text-center">
                <button
                    onClick={() => onToggleAttendance(student.StudentID)}
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        isPresent
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {isPresent ? 'Presente' : 'Ausente'}
                </button>
            </td>
            <td className="px-6 py-4 text-center">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isLate === 1}
                        onChange={() => onToggleLate(student.StudentID)}
                        disabled={!isPresent}
                        className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 disabled:opacity-50"
                    />
                    <span className={`ml-2 text-sm font-medium ${
                        isLate === 1 ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                        {isLate === 1 ? 'Sí' : 'No'}
                    </span>
                </label>
            </td>
        </tr>
    );
};
