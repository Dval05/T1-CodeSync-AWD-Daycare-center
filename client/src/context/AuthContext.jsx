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

    useEffect(() => {
        // Verificar si hay usuario guardado en localStorage (para login con usuario/contraseña)
        const savedUser = localStorage.getItem('user-profile');
        const savedToken = localStorage.getItem('sb-access-token');
        
        if (savedUser && savedToken) {
            const userData = JSON.parse(savedUser);
            setProfile(userData);
            setUser({ email: userData.Email });
            setMustChangePassword(userData.MustChangePassword === 1);
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
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('user-profile');
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
            } else {
                setProfile({ 
                    FirstName: session.user.user_metadata?.name?.split(' ')[0] || '',
                    LastName: session.user.user_metadata?.name?.split(' ')[1] || '',
                    Email: session.user.email,
                    roles: [] 
                });
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
            setProfile({ 
                FirstName: session.user.user_metadata?.name || '',
                Email: session.user.email,
                roles: [] 
            });
        } finally {
            setLoading(false);
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
        setUser(null);
        setProfile(null);
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