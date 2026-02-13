import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import { crudApi } from '../../api/crud';

export const StudentModal = ({ isOpen, onClose, onSave, student = null }) => {
    const [grades, setGrades] = useState([]);
    const [includeGuardian, setIncludeGuardian] = useState(false);
    
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        defaultValues: student ? {
            FirstName: student.FirstName,
            LastName: student.LastName,
            BirthDate: student.BirthDate?.split('T')[0],
            DocumentNumber: student.DocumentNumber,
            GradeID: student.GradeID,
            IsActive: student.IsActive
        } : {
            FirstName: '',
            LastName: '',
            BirthDate: '',
            DocumentNumber: '',
            GradeID: '',
            IsActive: 1
        }
    });

    useEffect(() => {
        if (isOpen && student) {
            reset({
                FirstName: student.FirstName || '',
                LastName: student.LastName || '',
                BirthDate: student.BirthDate?.split('T')[0] || '',
                DocumentNumber: student.DocumentNumber || '',
                GradeID: student.GradeID ? student.GradeID.toString() : '',
                IsActive: !!student.IsActive
            });
        } else if (isOpen && !student) {
            reset({
                FirstName: '',
                LastName: '',
                BirthDate: '',
                DocumentNumber: '',
                GradeID: '',
                IsActive: true
            });
        }
    }, [isOpen, student, reset]);

    useEffect(() => {
        loadGrades();
    }, []);

    const loadGrades = async () => {
        try {
            const { data } = await crudApi.getAll('grade', { IsActive: 1 });
            setGrades(data);
        } catch (error) {
            console.error('Error cargando cursos');
        }
    };

    const onSubmit = async (data) => {
        const payload = {
            student: {
                FirstName: data.FirstName?.trim(),
                LastName: data.LastName?.trim(),
                BirthDate: data.BirthDate,
                DocumentNumber: data.DocumentNumber?.trim() || null,
                GradeID: data.GradeID ? parseInt(data.GradeID, 10) : null,
                IsActive: data.IsActive ? 1 : 0
            },
            guardian: includeGuardian ? {
                FirstName: data.GuardianFirstName,
                LastName: data.GuardianLastName,
                DocumentNumber: data.GuardianDocumentNumber,
                Email: data.GuardianEmail,
                relationship: data.relationship
            } : null
        };

        await onSave(payload);
        reset();
        setIncludeGuardian(false);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-700 mb-3">Datos del Estudiante</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                {...register('FirstName', { required: 'Nombre requerido' })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre"
                            />
                            {errors.FirstName && (
                                <p className="text-red-500 text-xs mt-1">{errors.FirstName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                {...register('LastName', { required: 'Apellido requerido' })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Apellido"
                            />
                            {errors.LastName && (
                                <p className="text-red-500 text-xs mt-1">{errors.LastName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cédula
                            </label>
                            <input
                                type="text"
                                {...register('DocumentNumber')}
                                disabled={!!student}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                {...register('BirthDate')}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Curso *
                            </label>
                            <select
                                {...register('GradeID', { required: 'Curso requerido' })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar curso</option>
                                {grades.map(grade => (
                                    <option key={grade.GradeID} value={grade.GradeID.toString()}>
                                        {grade.GradeName}
                                    </option>
                                ))}
                            </select>
                            {errors.GradeID && (
                                <p className="text-red-500 text-xs mt-1">{errors.GradeID.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <input
                            type="checkbox"
                            {...register('IsActive')}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Estudiante Activo
                        </label>
                    </div>
                </div>

                {!student && (
                    <>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={includeGuardian}
                                onChange={(e) => setIncludeGuardian(e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded"
                            />
                            <label className="text-sm font-semibold text-purple-700">
                                Incluir Responsable/Tutor
                            </label>
                        </div>

                        {includeGuardian && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <h4 className="font-semibold text-purple-700 mb-3">Datos del Responsable</h4>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('GuardianFirstName', { 
                                                required: includeGuardian ? 'Nombre requerido' : false 
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="Nombre"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('GuardianLastName', { 
                                                required: includeGuardian ? 'Apellido requerido' : false 
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="Apellido"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cédula *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('GuardianDocumentNumber', { 
                                                required: includeGuardian ? 'Cédula requerida' : false 
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="0123456789"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            {...register('GuardianEmail')}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Relación *
                                        </label>
                                        <select
                                            {...register('relationship', { 
                                                required: includeGuardian ? 'Relación requerida' : false 
                                            })}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="Padre">Padre</option>
                                            <option value="Madre">Madre</option>
                                            <option value="Tutor">Tutor Legal</option>
                                            <option value="Abuelo/a">Abuelo/a</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        {student ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
