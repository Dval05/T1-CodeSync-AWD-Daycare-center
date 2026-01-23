import React from 'react';

export const ReportFilters = ({ 
    filters, 
    onFilterChange, 
    grades, 
    students, 
    onSearch, 
    loading 
}) => {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Generar Reporte de Asistencias
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <DateFilter
                    label="Desde:"
                    value={filters.dateFrom}
                    onChange={(value) => onFilterChange('dateFrom', value)}
                />
                
                <DateFilter
                    label="Hasta:"
                    value={filters.dateTo}
                    onChange={(value) => onFilterChange('dateTo', value)}
                />
                
                <SelectFilter
                    label="Curso:"
                    value={filters.gradeId}
                    onChange={(value) => onFilterChange('gradeId', value)}
                    options={grades}
                    placeholder="Todos los cursos"
                    optionKey="GradeID"
                    optionLabel="GradeName"
                />
                
                <SelectFilter
                    label="Estudiante:"
                    value={filters.studentId}
                    onChange={(value) => onFilterChange('studentId', value)}
                    options={students}
                    placeholder="Todos los estudiantes"
                    optionKey="StudentID"
                    optionLabel={(s) => `${s.FirstName} ${s.LastName}`}
                />
                
                <div className="flex items-end">
                    <button
                        onClick={onSearch}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                    >
                        {loading ? 'Buscando...' : '🔍 Buscar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DateFilter = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
        </label>
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
        />
    </div>
);

const SelectFilter = ({ label, value, onChange, options, placeholder, optionKey, optionLabel }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
        </label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option[optionKey]} value={option[optionKey]}>
                    {typeof optionLabel === 'function' ? optionLabel(option) : option[optionLabel]}
                </option>
            ))}
        </select>
    </div>
);
