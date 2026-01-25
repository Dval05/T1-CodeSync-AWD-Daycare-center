import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import axios from 'axios';

const API_CRUD_URL = import.meta.env.VITE_API_CRUD_URL || 'http://localhost:3001';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [profile, setProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    useEffect(() => {
        // Verificar si hay usuario guardado en localStorage (para login con usuario/contraseña)
        const savedUser = localStorage.getItem('user-profile');
        const savedToken = localStorage.getItem('sb-access-token');
        const savedPermissions = localStorage.getItem('user-permissions');
        
        if (savedUser && savedToken) {
            const userData = JSON.parse(savedUser);
            setProfile(userData);
            setUser({ email: userData.Email });
            setMustChangePassword(userData.MustChangePassword === 1);
            
            // Cargar permisos desde localStorage si existen
            if (savedPermissions) {
                setPermissions(JSON.parse(savedPermissions));
                setPermissionsLoaded(true);
            }
            
            setLoading(false);
            return;
        }

        // Si no hay usuario guardado, verificar sesión de Supabase (Google)
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSession = async (session) => {
        if (!session) {
            setUser(null);
            setProfile(null);
            setPermissions([]);
            setPermissionsLoaded(false);
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('user-profile');
            localStorage.removeItem('user-permissions');
            setLoading(false);
            return;
        }

        // Evitar procesar la misma sesión múltiples veces
        if (user && session.user.id === user.id) {
            console.log('⏭️ AuthContext: Sesión ya procesada, saltando');
            setLoading(false);
            return;
        }

        try {
            const token = session.access_token;
            localStorage.setItem('sb-access-token', token);
            setUser(session.user);

            await businessApi.auth.syncGoogle();

            const { data: users } = await crudApi.getAll('user', { AuthUserID: session.user.id });
            const currentUser = users?.[0];

            if (currentUser) {
                const { data: roles } = await crudApi.getAll('user_role', { UserID: currentUser.UserID });
                
                const userData = { ...currentUser, roles: roles || [] };
                setProfile(userData);
                setMustChangePassword(false); // Google login no requiere cambio de contraseña
                
                // Cargar permisos del usuario solo si no están cargados
                if (!permissionsLoaded) {
                    await loadUserPermissions(currentUser.UserID);
                }
            } else {
                setProfile({ 
                    FirstName: session.user.user_metadata?.name?.split(' ')[0] || '',
                    LastName: session.user.user_metadata?.name?.split(' ')[1] || '',
                    Email: session.user.email,
                    roles: [] 
                });
                setPermissions([]);
                setPermissionsLoaded(true);
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
            setProfile({ 
                FirstName: session.user.user_metadata?.name || '',
                Email: session.user.email,
                roles: [] 
            });
            setPermissions([]);
            setPermissionsLoaded(true);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar permisos del usuario
    const loadUserPermissions = async (userId) => {
        // Evitar cargas duplicadas
        if (permissionsLoaded) {
            console.log('⏭️ AuthContext: Permisos ya cargados, saltando carga');
            return;
        }

        try {
            console.log('🔍 AuthContext: Cargando permisos para UserID:', userId);
            
            // 1. Obtener roles del usuario
            const { data: userRoles } = await crudApi.getAll('user_role', { UserID: userId });

            if (!userRoles || userRoles.length === 0) {
                console.warn('⚠️ AuthContext: Usuario no tiene roles asignados');
                setPermissions([]);
                setPermissionsLoaded(true);
                return;
            }

            // 2. Obtener permisos de cada rol
            const roleIds = userRoles.map(ur => ur.RoleID);
            const permissionsPromises = roleIds.map(roleId =>
                crudApi.getAll('role_permission', { RoleID: roleId })
            );

            const rolePermissionsResults = await Promise.all(permissionsPromises);
            
            // 3. Extraer IDs de permisos únicos
            const permissionIds = [
                ...new Set(
                    rolePermissionsResults
                        .flatMap(result => result.data || [])
                        .map(rp => rp.PermissionID)
                )
            ];

            // 4. Obtener detalles de los permisos
            if (permissionIds.length > 0) {
                const permissionsDetails = await Promise.all(
                    permissionIds.map(id => crudApi.getById('permission', id))
                );

                const loadedPermissions = permissionsDetails
                    .map(result => result.data)
                    .filter(Boolean);

                console.log('✅ AuthContext: Permisos cargados:', loadedPermissions.length, 'permisos');
                setPermissions(loadedPermissions);
                setPermissionsLoaded(true);
                
                // Guardar en localStorage para persistencia
                localStorage.setItem('user-permissions', JSON.stringify(loadedPermissions));
            } else {
                console.warn('⚠️ AuthContext: No se encontraron permisos');
                setPermissions([]);
                setPermissionsLoaded(true);
            }
        } catch (error) {
            console.error('❌ AuthContext: Error cargando permisos:', error);
            setPermissions([]);
            setPermissionsLoaded(true);
        }
    };

    // Login con email y contraseña (sistema propio)
    const loginWithCredentials = async (email, password) => {
        try {
            const response = await axios.post(`${API_CRUD_URL}/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const userData = response.data.user;
                const token = 'custom-auth-token'; // Podrías generar un JWT real aquí
                
                localStorage.setItem('sb-access-token', token);
                localStorage.setItem('user-profile', JSON.stringify(userData));
                
                setUser({ email: userData.Email });
                setProfile(userData);
                setMustChangePassword(response.data.mustChangePassword);
                
                // Cargar permisos al iniciar sesión solo si no están cargados
                if (userData.UserID && !permissionsLoaded) {
                    await loadUserPermissions(userData.UserID);
                }
                
                return { success: true, mustChangePassword: response.data.mustChangePassword };
            }
        } catch (error) {
            throw error;
        }
    };

    const loginWithPassword = (email, password) => supabase.auth.signInWithPassword({ email, password });
    const loginWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' });
    
    const logout = () => {
        supabase.auth.signOut();
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('user-profile');
        localStorage.removeItem('user-permissions');
        setUser(null);
        setProfile(null);
        setPermissions([]);
        setPermissionsLoaded(false);
        setMustChangePassword(false);
    };

    const onPasswordChanged = () => {
        setMustChangePassword(false);
        // Actualizar el perfil en localStorage
        if (profile) {
            const updatedProfile = { ...profile, MustChangePassword: 0 };
            setProfile(updatedProfile);
            localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            profile, 
            loading, 
            mustChangePassword,
            permissions,
            permissionsLoaded,
            loginWithCredentials,
            loginWithPassword, 
            loginWithGoogle, 
            logout,
            onPasswordChanged
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);