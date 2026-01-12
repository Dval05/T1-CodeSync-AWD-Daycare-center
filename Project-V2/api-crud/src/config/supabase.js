import 'dotenv/config'; 
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR CRÍTICO DE CONFIGURACIÓN:");
    console.error("No se encontraron SUPABASE_URL o SUPABASE_ANON_KEY.");
}

export const supabasePublic = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const getAuthenticatedClient = (token) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};