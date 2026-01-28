import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';
import { supabase } from '../config/supabase';
import axios from 'axios';

const API_CRUD_URL = import.meta.env.VITE_API_CRUD_URL || 'http://localhost:3001';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [profile, setProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [mustChangePassword, setMustChangePassword] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    const sessionProcessingRef = useRef(false);

    useEffect(() => {
        const lastActivity = localStorage.getItem('lastActivity');
        const sessionTimeout = 5 * 60 * 1000; // 5 min
        
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > sessionTimeout) {
                console.log('Sesión expirada por inactividad previa');
                localStorage.clear();
                setSessionExpired(true);
                setLoading(false);
                return;
            }
        }

        const savedUser = localStorage.getItem('user-profile');
        const savedToken = localStorage.getItem('sb-access-token');
        const savedPermissions = localStorage.getItem('user-permissions');
        
        if (savedUser && savedToken) {
            const userData = JSON.parse(savedUser);
            setProfile(userData);
            setUser({ email: userData.Email });
            setMustChangePassword(userData.MustChangePassword === 1);
            
            if (savedPermissions) {
                setPermissions(JSON.parse(savedPermissions));
                setPermissionsLoaded(true);
            }
            
            localStorage.setItem('lastActivity', Date.now().toString());
            
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSession = async (session) => {
        console.log('handleSession llamado', { session, hasUser: !!session?.user });
        
        if (!session) {
            sessionProcessingRef.current = false;
            setUser(null);
            setProfile(null);
            setPermissions([]);
            setPermissionsLoaded(false);
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('user-profile');
            localStorage.removeItem('user-permissions');
            localStorage.removeItem('current-user-id');
            setLoading(false);
            return;
        }

        // Prevenir procesamiento múltiple
        const currentUserId = localStorage.getItem('current-user-id');
        if (currentUserId === session.user.id && permissionsLoaded && sessionProcessingRef.current) {
            console.log('AuthContext: Sesión ya procesada, saltando');
            setLoading(false);
            return;
        }
        
        // Marcar como procesando
        sessionProcessingRef.current = true;
        localStorage.setItem('current-user-id', session.user.id);

        try {
            const token = session.access_token;
            localStorage.setItem('sb-access-token', token);
            localStorage.setItem('lastActivity', Date.now().toString()); // Registrar actividad
            setUser(session.user);
            setSessionExpired(false);         

            console.log('Sincronizando con backend...');
            try {
                await businessApi.auth.syncGoogle();
            } catch (syncError) {
                console.warn('Error en sincronización (no crítico):', syncError);
            }

            const { data: users } = await crudApi.getAll('user', { AuthUserID: session.user.id });
            const currentUser = users?.[0];

            if (currentUser) {
                const { data: roles } = await crudApi.getAll('user_role', { UserID: currentUser.UserID });
                
                const userData = { ...currentUser, roles: roles || [] };
                setProfile(userData);
                setMustChangePassword(false); 
                    if (!permissionsLoaded) {
                    await loadUserPermissions(currentUser.UserID);
                }
                console.log('Usuario cargado exitosamente:', userData);
            } else {
                console.log('Usuario no encontrado en BD, creando perfil temporal');
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
            sessionProcessingRef.current = false; // Resetear en caso de error
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

    const loadUserPermissions = async (userId) => {
        if (permissionsLoaded) {
            console.log('AuthContext: Permisos ya cargados, saltando carga');
            return;
        }

        try {
            console.log('AuthContext: Cargando permisos para UserID:', userId);
            
            const { data: userRoles } = await crudApi.getAll('user_role', { UserID: userId });

            if (!userRoles || userRoles.length === 0) {
                console.warn('AuthContext: Usuario no tiene roles asignados');
                setPermissions([]);
                setPermissionsLoaded(true);
                return;
            }

            const roleIds = userRoles.map(ur => ur.RoleID);
            const permissionsPromises = roleIds.map(roleId =>
                crudApi.getAll('role_permission', { RoleID: roleId })
            );

            const rolePermissionsResults = await Promise.all(permissionsPromises);
            
            const permissionIds = [
                ...new Set(
                    rolePermissionsResults
                        .flatMap(result => result.data || [])
                        .map(rp => rp.PermissionID)
                )
            ];

            if (permissionIds.length > 0) {
                const permissionsDetails = await Promise.all(
                    permissionIds.map(id => crudApi.getById('permission', id))
                );

                const loadedPermissions = permissionsDetails
                    .map(result => result.data)
                    .filter(Boolean);

                console.log('AuthContext: Permisos cargados:', loadedPermissions.length, 'permisos');
                setPermissions(loadedPermissions);
                setPermissionsLoaded(true);
                
                localStorage.setItem('user-permissions', JSON.stringify(loadedPermissions));
            } else {
                console.warn('AuthContext: No se encontraron permisos');
                setPermissions([]);
                setPermissionsLoaded(true);
            }
        } catch (error) {
            console.error('AuthContext: Error cargando permisos:', error);
            setPermissions([]);
            setPermissionsLoaded(true);
        }
    };

    const loginWithCredentials = async (email, password) => {
        try {
            const response = await axios.post(`${API_CRUD_URL}/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const userData = response.data.user;
                const token = 'custom-auth-token'; 

                localStorage.setItem('sb-access-token', token);
                localStorage.setItem('user-profile', JSON.stringify(userData));
                localStorage.setItem('lastActivity', Date.now().toString()); // Registrar actividad
                
                setUser({ email: userData.Email });
                setProfile(userData);
                setMustChangePassword(response.data.mustChangePassword);
                setSessionExpired(false);         
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
    const loginWithGoogle = async () => {
        const redirectUrl = `${window.location.origin}/`;
        console.log('OAuth redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({ 
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                skipBrowserRedirect: false
            }
        });
        
        if (error) {
            console.error('Error en OAuth:', error);
            throw error;
        }
        
        return { data, error };
    };
    
    const logout = () => {
        sessionProcessingRef.current = false;
        supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        setProfile(null);
        setPermissions([]);
        setPermissionsLoaded(false);
        setMustChangePassword(false);
        setSessionExpired(false);
    };

    const logoutDueToInactivity = () => {
        console.log('🔒 Cerrando sesión por inactividad...');
        sessionProcessingRef.current = false;
        supabase.auth.signOut();
        localStorage.clear();
        setUser(null);
        setProfile(null);
        setPermissions([]);
        setPermissionsLoaded(false);
        setMustChangePassword(false);
        setSessionExpired(true);
    };

    const onPasswordChanged = () => {
        setMustChangePassword(false);
        if (profile) {
            const updatedProfile = { ...profile, MustChangePassword: 0 };
            setProfile(updatedProfile);
            localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
        }
    };

    const updateProfile = (updatedData) => {
        const updatedProfile = { ...profile, ...updatedData };
        setProfile(updatedProfile);
        localStorage.setItem('user-profile', JSON.stringify(updatedProfile));
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            profile, 
            loading, 
            mustChangePassword,
            permissions,
            permissionsLoaded,
            sessionExpired,
            loginWithCredentials,
            loginWithPassword, 
            loginWithGoogle, 
            logout,
            logoutDueToInactivity,
            onPasswordChanged,
            updateProfile
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);