import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';

export const GradeModal = ({ isOpen, onClose, onSave, grade = null }) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: grade || {
            GradeName: '',
            Description: '',
            IsActive: 1
        }
    });

    const onSubmit = async (data) => {
        await onSave(data);
        reset();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={grade ? 'Editar Curso' : 'Nuevo Curso'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre del Curso *
                    </label>
                    <input
                        type="text"
                        {...register('GradeName', { required: 'El nombre es requerido' })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Prekinder, Kinder, Primer Grado"
                    />
                    {errors.GradeName && (
                        <p className="text-red-500 text-xs mt-1">{errors.GradeName.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Descripción
                    </label>
                    <textarea
                        {...register('Description')}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe el curso..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        {...register('IsActive')}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                        Curso Activo
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                        {grade ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
