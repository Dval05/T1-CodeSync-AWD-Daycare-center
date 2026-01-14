import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ 
    title, 
    data = [], 
    columns = [], 
    onCreate, 
    onEdit, 
    onDelete,
    searchPlaceholder = "Buscar..."
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Lógica de Filtrado Inteligente
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        // Busca en todos los valores de las columnas indicadas
        return columns.some(col => {
            const val = item[col.accessor];
            return val && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
    });

    // Paginación
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header de la Tabla */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Resetear a página 1 al buscar
                            }}
                        />
                    </div>
                    {onCreate && (
                        <button 
                            onClick={onCreate}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">Nuevo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            {columns.map((col, idx) => (
                                <th key={idx} className="p-4 font-semibold">{col.header}</th>
                            ))}
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                                    {columns.map((col, cIdx) => (
                                        <td key={cIdx} className="p-4 text-gray-700">
                                            {col.render ? col.render(item) : item[col.accessor]}
                                        </td>
                                    ))}
                                    <td className="p-4 text-right flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onEdit && (
                                            <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={() => onDelete(item)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-8 text-center text-gray-400">
                                    No se encontraron resultados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer / Paginación */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
                <span className="text-xs text-gray-500">
                    Mostrando {paginatedData.length} de {filteredData.length} registros
                </span>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-600 px-2 py-1">{currentPage}</span>
                    <button 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}