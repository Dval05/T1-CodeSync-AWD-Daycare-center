import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { crudApi } from '../api/crud';
import { businessApi } from '../api/business';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Usuario Auth de Supabase
    const [profile, setProfile] = useState(null); // Perfil interno (user + roles)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Escuchar cambios
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
            setLoading(false);
            return;
        }

        const token = session.access_token;
        localStorage.setItem('sb-access-token', token);
        setUser(session.user);

        try {
            // 1. Sincronizar con backend (por si es login nuevo de Google)
            await businessApi.auth.syncGoogle();

            // 2. Obtener perfil interno + roles desde api-crud
            // Buscamos en la tabla 'user' filtrando por AuthUserID
            const { data: users } = await crudApi.getAll('user', { AuthUserID: session.user.id });
            const currentUser = users?.[0];

            if (currentUser) {
                // Obtener roles
                const { data: roles } = await crudApi.getAll('user_role', { UserID: currentUser.UserID });
                
                // Mapear IDs de rol a nombres (opcional, si necesitas nombres en el front)
                // Por ahora guardamos el perfil crudo
                setProfile({ ...currentUser, roles: roles || [] });
            }
        } catch (error) {
            console.error("Error cargando perfil:", error);
        } finally {
            setLoading(false);
        }
    };

    const loginWithPassword = (email, password) => supabase.auth.signInWithPassword({ email, password });
    const loginWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' });
    const logout = () => supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{ user, profile, loading, loginWithPassword, loginWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);