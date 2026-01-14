import React from 'react';
import { useForm } from 'react-hook-form';
import { businessApi } from '../api/business';
import { toast } from 'react-hot-toast';
import Layout from '../components/layout/Layout';

export default function Intake() {
    const { register, handleSubmit, watch, reset } = useForm();
    const withGuardian = watch('withGuardian');

    const onSubmit = async (data) => {
        try {
            const payload = {
                student: {
                    FirstName: data.stuFirst,
                    LastName: data.stuLast,
                    BirthDate: data.stuBirth,
                    // GradeID se puede agregar aquí
                },
                guardian: withGuardian ? {
                    FirstName: data.guaFirst,
                    LastName: data.guaLast,
                    Email: data.guaEmail,
                    DocumentNumber: data.guaDoc,
                    relationship: data.guaRel
                } : null
            };

            await businessApi.students.intake(payload);
            toast.success('Alta creada exitosamente');
            reset();
        } catch (error) {
            toast.error('Error al procesar el alta');
            console.error(error);
        }
    };

    return (
        <Layout>
            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Alta Rápida</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Estudiante */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-700 mb-4">Datos del Estudiante</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input {...register("stuFirst", {required: true})} placeholder="Nombre" className="p-2 border rounded" />
                            <input {...register("stuLast", {required: true})} placeholder="Apellido" className="p-2 border rounded" />
                            <input type="date" {...register("stuBirth")} className="p-2 border rounded" />
                        </div>
                    </div>

                    {/* Guardián */}
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <label className="flex items-center gap-2 font-semibold text-purple-700 mb-4">
                            <input type="checkbox" {...register("withGuardian")} />
                            Incluir Responsable
                        </label>
                        
                        {withGuardian && (
                            <div className="grid grid-cols-2 gap-4">
                                <input {...register("guaFirst")} placeholder="Nombre" className="p-2 border rounded" />
                                <input {...register("guaLast")} placeholder="Apellido" className="p-2 border rounded" />
                                <input {...register("guaDoc")} placeholder="Cédula/Documento" className="p-2 border rounded" />
                                <input {...register("guaEmail")} type="email" placeholder="Email" className="p-2 border rounded" />
                                <input {...register("guaRel")} placeholder="Relación (Padre/Madre)" className="p-2 border rounded" />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full font-semibold">
                        Registrar
                    </button>
                </form>
            </div>
        </Layout>
    );
}