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
    const [user, setUser] = useState(null); 
    const [profile, setProfile] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                
                setProfile({ ...currentUser, roles: roles || [] });
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