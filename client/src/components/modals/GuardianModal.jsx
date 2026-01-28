import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';

export const GuardianModal = ({ isOpen, onClose, onSave, guardian }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (guardian) {
            reset(guardian);
        } else {
            reset({
                FirstName: '',
                LastName: '',
                DocumentNumber: '',
                Email: '',
                PhoneNumber: '',
                WorkPhone: '',
                Address: '',
                Occupation: '',
                Relationship: '',
                IsEmergencyContact: 1,
                IsAuthorizedPickup: 1,
                IsActive: 1
            });
        }
    }, [guardian, reset]);

    const onSubmit = (data) => {
        data.IsEmergencyContact = data.IsEmergencyContact ? 1 : 0;
        data.IsAuthorizedPickup = data.IsAuthorizedPickup ? 1 : 0;
        data.IsActive = data.IsActive ? 1 : 0;
        onSave(data);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={guardian ? 'Editar Responsable' : 'Nuevo Responsable'}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                        <input
                            {...register('FirstName', { required: 'Nombre requerido' })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.FirstName && <p className="text-red-500 text-xs mt-1">{errors.FirstName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                        <input
                            {...register('LastName', { required: 'Apellido requerido' })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.LastName && <p className="text-red-500 text-xs mt-1">{errors.LastName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula *</label>
                        <input
                            {...register('DocumentNumber', { 
                                required: 'Cédula requerida',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Debe ser 10 dígitos'
                                }
                            })}
                            maxLength={10}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.DocumentNumber && <p className="text-red-500 text-xs mt-1">{errors.DocumentNumber.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                            type="email"
                            {...register('Email', { required: 'Email requerido' })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
                        <input
                            {...register('PhoneNumber', { 
                                required: 'Teléfono requerido',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Debe ser 10 dígitos'
                                }
                            })}
                            maxLength={10}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.PhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.PhoneNumber.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono Trabajo</label>
                        <input
                            {...register('WorkPhone')}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Relación</label>
                        <select
                            {...register('Relationship')}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Mother">Madre</option>
                            <option value="Father">Padre</option>
                            <option value="Grandmother">Abuela</option>
                            <option value="Grandfather">Abuelo</option>
                            <option value="Uncle">Tío/a</option>
                            <option value="Other">Otro</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ocupación</label>
                        <input
                            {...register('Occupation')}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                    <textarea
                        {...register('Address')}
                        rows={2}
                        className="mt-1 w-full border border-gray-300 rounded-md p-2"
                    />
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...register('IsEmergencyContact')}
                            className="rounded"
                        />
                        <span className="text-sm">Contacto de Emergencia</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...register('IsAuthorizedPickup')}
                            className="rounded"
                        />
                        <span className="text-sm">Autorizado para Recoger</span>
                    </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {guardian ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
