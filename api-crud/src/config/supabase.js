import 'dotenv/config'; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR CRÍTICO DE CONFIGURACIÓN:");
    console.error("No se encontraron SUPABASE_URL o SUPABASE_ANON_KEY.");
}

export const supabasePublic = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Cliente administrativo que bypasea RLS (usar solo para operaciones admin)
export const supabaseAdmin = createClient(
    supabaseUrl || '', 
    supabaseServiceRoleKey || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export const getAuthenticatedClient = (token) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};