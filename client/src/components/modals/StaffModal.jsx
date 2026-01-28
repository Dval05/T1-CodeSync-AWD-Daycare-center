import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';

export const StaffModal = ({ isOpen, onClose, onSave, employee }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        if (employee) {
            reset(employee);
        } else {
            reset({
                FirstName: '',
                LastName: '',
                DocumentNumber: '',
                Email: '',
                Phone: '',
                Position: '',
                Address: '',
                Salary: '',
                BankAccount: '',
                EmergencyContact: '',
                EmergencyPhone: '',
                HireDate: '',
                IsActive: 1
            });
        }
    }, [employee, reset]);

    const onSubmit = (data) => {
        data.Salary = data.Salary ? parseFloat(data.Salary) : null;
        data.IsActive = data.IsActive ? 1 : 0;
        onSave(data);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={employee ? 'Editar Personal' : 'Nuevo Personal'}
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
                            {...register('Phone', { 
                                required: 'Teléfono requerido',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Debe ser 10 dígitos'
                                }
                            })}
                            maxLength={10}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.Phone && <p className="text-red-500 text-xs mt-1">{errors.Phone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Posición *</label>
                        <select
                            {...register('Position', { required: 'Posición requerida' })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Teacher">Profesor/a</option>
                            <option value="Assistant">Asistente</option>
                            <option value="Nurse">Enfermero/a</option>
                            <option value="Administrator">Administrador/a</option>
                            <option value="Cook">Cocinero/a</option>
                            <option value="Maintenance">Mantenimiento</option>
                        </select>
                        {errors.Position && <p className="text-red-500 text-xs mt-1">{errors.Position.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Salario</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('Salary')}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cuenta Bancaria</label>
                        <input
                            {...register('BankAccount')}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto Emergencia *</label>
                        <input
                            {...register('EmergencyContact', { required: 'Contacto requerido' })}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.EmergencyContact && <p className="text-red-500 text-xs mt-1">{errors.EmergencyContact.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono Emergencia *</label>
                        <input
                            {...register('EmergencyPhone', { 
                                required: 'Teléfono requerido',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Debe ser 10 dígitos'
                                }
                            })}
                            maxLength={10}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                        {errors.EmergencyPhone && <p className="text-red-500 text-xs mt-1">{errors.EmergencyPhone.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha Contratación</label>
                        <input
                            type="date"
                            {...register('HireDate')}
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
                        {employee ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
