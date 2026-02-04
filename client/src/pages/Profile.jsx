    import React, { useState, useEffect, useRef } from 'react';
    import Layout from '../components/layout/Layout';
    import { useAuth } from '../context/AuthContext';
    import { crudApi } from '../api/crud';
    import { supabase } from '../config/supabase';
    import { User, Mail, Phone, MapPin, Calendar, Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Camera, Upload } from 'lucide-react';
    import toast from 'react-hot-toast';

    export default function Profile() {
        const { user, profile, loading, updateProfile } = useAuth();
        const [isEditing, setIsEditing] = useState(false);
        const [isChangingPassword, setIsChangingPassword] = useState(false);
        const [showCurrentPassword, setShowCurrentPassword] = useState(false);
        const [showNewPassword, setShowNewPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [passwordError, setPasswordError] = useState('');
        const [passwordSuccess, setPasswordSuccess] = useState('');
        const [uploadingPhoto, setUploadingPhoto] = useState(false);
        const [profilePhoto, setProfilePhoto] = useState(null);
        const [isDragging, setIsDragging] = useState(false);
        const fileInputRef = useRef(null);
        
        const [formData, setFormData] = useState({
            FirstName: '',
            LastName: '',
            Email: '',
            Phone: '',
            Address: '',
            ProfilePhotoURL: ''
        });

        const [passwordData, setPasswordData] = useState({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });

        useEffect(() => {
            if (profile) {
                setFormData({
                    FirstName: profile.FirstName || '',
                    LastName: profile.LastName || '',
                    Email: profile.Email || user?.email || '',
                    Phone: profile.Phone || '',
                    Address: profile.Address || '',
                    ProfilePhotoURL: profile.ProfilePhotoURL || ''
                });
                setProfilePhoto(profile.ProfilePhotoURL || null);
            }
        }, [profile, user]);

        const handlePhotoUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            await uploadPhoto(file);
        };

        const uploadPhoto = async (file) => {
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor selecciona una imagen válida');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen debe ser menor a 5MB');
                return;
            }

            try {
                setUploadingPhoto(true);

                const fileExt = file.name.split('.').pop();
                const fileName = `${profile.UserID}_${Date.now()}.${fileExt}`;
                const filePath = `profile-photos/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Error subiendo foto:', uploadError);
                    
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Image = reader.result;
                        setProfilePhoto(base64Image);
                        
                        await crudApi.update('user', profile.UserID, {
                            ProfilePhotoURL: base64Image
                        });
                        
                        toast.success('Foto de perfil actualizada');
                        window.location.reload();
                    };
                    reader.readAsDataURL(file);
                    return;
                }

                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                const photoURL = publicUrlData.publicUrl;
                setProfilePhoto(photoURL);

                await crudApi.update('user', profile.UserID, {
                    ProfilePhotoURL: photoURL
                });

                updateProfile({ ProfilePhotoURL: photoURL });
                
                setFormData(prev => ({ ...prev, ProfilePhotoURL: photoURL }));
                
                toast.success('Foto de perfil actualizada');

            } catch (error) {
                console.error('Error actualizando foto:', error);
                toast.error('Error al subir la foto');
            } finally {
                setUploadingPhoto(false);
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files && files[0]) {
                uploadPhoto(files[0]);
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                
                if (formData.Email !== profile.Email && user?.email) {
                    const { error: emailError } = await supabase.auth.updateUser({
                        email: formData.Email
                    });
                    
                    if (emailError) {
                        toast.error('Error al actualizar email en autenticación: ' + emailError.message);
                        return;
                    }
                    
                    toast.info('Se ha enviado un correo de verificación a ' + formData.Email);
                }
                
                
                const updateData = {
                    FirstName: formData.FirstName,
                    LastName: formData.LastName,
                    Email: formData.Email,
                    Phone: formData.Phone,
                    Address: formData.Address
                };
                
                
                if (formData.ProfilePhotoURL) {
                    updateData.ProfilePhotoURL = formData.ProfilePhotoURL;
                }
                
                const response = await crudApi.update('user', profile.UserID, updateData);
                
                
                updateProfile(updateData);
                
                
                setFormData({
                    FirstName: updateData.FirstName || '',
                    LastName: updateData.LastName || '',
                    Email: updateData.Email || user?.email || '',
                    Phone: updateData.Phone || '',
                    Address: updateData.Address || '',
                    ProfilePhotoURL: updateData.ProfilePhotoURL || ''
                });
                
                toast.success('✅ Perfil actualizado exitosamente');
                setIsEditing(false);
                
                
                if (formData.Email !== profile.Email) {
                    toast.info('Por favor, verifica tu nuevo email y vuelve a iniciar sesión');
                }
            } catch (error) {
                console.error("Error actualizando perfil:", error);
                toast.error('❌ Error al actualizar perfil: ' + (error.response?.data?.error || error.message || 'Error desconocido'));
            }
        };

        const handlePasswordChange = async (e) => {
            e.preventDefault();
            setPasswordError('');
            setPasswordSuccess('');

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setPasswordError('Las contraseñas no coinciden');
                return;
            }

            if (passwordData.newPassword.length < 8) {
                setPasswordError('La contraseña debe tener al menos 8 caracteres');
                return;
            }

            if (passwordData.currentPassword === passwordData.newPassword) {
                setPasswordError('La nueva contraseña debe ser diferente a la actual');
                return;
            }

            try {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: passwordData.currentPassword
                });

                if (signInError) {
                    setPasswordError('La contraseña actual es incorrecta');
                    return;
                }

                const { error: updateError } = await supabase.auth.updateUser({
                    password: passwordData.newPassword
                });

                if (updateError) {
                    setPasswordError('Error al actualizar la contraseña: ' + updateError.message);
                    return;
                }

                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });

                setPasswordSuccess('Contraseña actualizada exitosamente');
                toast.success('Contraseña actualizada correctamente');
                
                setTimeout(() => {
                    setIsChangingPassword(false);
                    setPasswordSuccess('');
                }, 2000);

            } catch (error) {
                console.error("Error cambiando contraseña:", error);
                setPasswordError('Error inesperado al cambiar la contraseña');
            }
        };

        if (loading || !profile) {
            return (
                <Layout>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Cargando perfil...</div>
                    </div>
                </Layout>
            );
        }

        return (
            <Layout>
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
                        <div className="flex gap-2">
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <Lock size={18} />
                                    Cambiar Contraseña
                                </button>
                            )}
                            {!isEditing && !isChangingPassword && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Editar Perfil
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                            <div className="flex items-center gap-4">
                                <div 
                                    className="relative group"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className={`w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden border-4 shadow-lg transition-all ${
                                        isDragging ? 'border-green-400 scale-105' : 'border-white'
                                    }`}>
                                        {uploadingPhoto ? (
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                                                <span className="text-xs mt-2">Subiendo...</span>
                                            </div>
                                        ) : profilePhoto ? (
                                            <img 
                                                src={profilePhoto} 
                                                alt="Foto de perfil" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{formData.FirstName?.charAt(0)}{formData.LastName?.charAt(0)}</span>
                                        )}
                                    </div>
                                    {!uploadingPhoto && (
                                        <>
                                            <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity ${
                                                isDragging ? 'bg-green-500 bg-opacity-80 opacity-100' : 'bg-black bg-opacity-0 opacity-0 group-hover:bg-opacity-50 group-hover:opacity-100'
                                            }`}>
                                                <div className="text-white text-center">
                                                    {isDragging ? (
                                                        <Upload size={24} className="mx-auto animate-bounce" />
                                                    ) : (
                                                        <Camera size={24} className="mx-auto" />
                                                    )}
                                                    <p className="text-xs mt-1">
                                                        {isDragging ? 'Suelta aquí' : 'Cambiar'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingPhoto}
                                                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all group-hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Haz clic o arrastra una imagen"
                                            >
                                                <Camera size={16} />
                                            </button>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {formData.FirstName} {formData.LastName}
                                    </h3>
                                    <p className="text-blue-100">{formData.Email}</p>
                                    <p className="text-blue-200 text-sm mt-1 flex items-center gap-1">
                                        <Upload size={14} />
                                        Arrastra una imagen sobre el avatar para cambiar la foto
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {profile?.roles?.map((role, idx) => (
                                            <span key={idx} className="bg-blue-500 px-3 py-1 rounded-full text-sm">
                                                Rol ID: {role.RoleID}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                            <input
                                                type="text"
                                                value={formData.FirstName}
                                                onChange={(e) => setFormData({...formData, FirstName: e.target.value})}
                                                className="w-full border rounded-lg px-4 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                                            <input
                                                type="text"
                                                value={formData.LastName}
                                                onChange={(e) => setFormData({...formData, LastName: e.target.value})}
                                                className="w-full border rounded-lg px-4 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={formData.Email}
                                                onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                                className="w-full border rounded-lg px-4 py-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                            <input
                                                type="tel"
                                                value={formData.Phone}
                                                onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                                                className="w-full border rounded-lg px-4 py-2"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                                        <textarea
                                            value={formData.Address}
                                            onChange={(e) => setFormData({...formData, Address: e.target.value})}
                                            className="w-full border rounded-lg px-4 py-2"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                            Guardar Cambios
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start gap-3">
                                            <User className="text-gray-400 mt-1" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Nombre Completo</p>
                                                <p className="font-medium text-gray-800">{formData.FirstName} {formData.LastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Mail className="text-gray-400 mt-1" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-gray-800">{formData.Email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Phone className="text-gray-400 mt-1" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Teléfono</p>
                                                <p className="font-medium text-gray-800">{formData.Phone || 'No especificado'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Shield className="text-gray-400 mt-1" size={20} />
                                            <div>
                                                <p className="text-sm text-gray-500">Usuario</p>
                                                <p className="font-medium text-gray-800">{profile?.UserName || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-gray-400 mt-1" size={20} />
                                        <div>
                                            <p className="text-sm text-gray-500">Dirección</p>
                                            <p className="font-medium text-gray-800">{formData.Address || 'No especificada'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {}
                    {isChangingPassword && (
                        <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Lock size={24} className="text-purple-600" />
                                    Cambiar Contraseña
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsChangingPassword(false);
                                        setPasswordError('');
                                        setPasswordSuccess('');
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {passwordError && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-red-700">{passwordError}</p>
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                                    <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-green-700">{passwordSuccess}</p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña Actual
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                            placeholder="Ingresa tu contraseña actual"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                            placeholder="Mínimo 8 caracteres"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        La contraseña debe tener al menos 8 caracteres
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                            placeholder="Repite la nueva contraseña"
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
                                    >
                                        <Lock size={18} />
                                        Actualizar Contraseña
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordError('');
                                            setPasswordSuccess('');
                                            setPasswordData({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            });
                                        }}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Tu contraseña se almacena de forma segura en Supabase Auth. 
                                    Después de cambiarla, la nueva contraseña se aplicará inmediatamente y podrás usarla 
                                    en tu próximo inicio de sesión.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }