import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Error: No se leyeron las variables del .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURA AQUÍ TU USUARIO DE PRUEBA ---
const EMAIL = 'andrade.dval@gmail.com';
const PASSWORD = 'admin123'; // Mínimo 6 caracteres
// -------------------------------------------

async function getAccessToken() {
    console.log(`🔄 Intentando autenticar a: ${EMAIL}...`);

    // 1. Intentar Iniciar Sesión
    let { data, error } = await supabase.auth.signInWithPassword({
        email: EMAIL,
        password: PASSWORD
    });

    // 2. Si falla porque no existe, intentar Registrarlo
    if (error && error.message.includes('Invalid login credentials')) {
        console.log("⚠️ Usuario no encontrado. Intentando registrarlo...");
        
        const signUp = await supabase.auth.signUp({
            email: EMAIL,
            password: PASSWORD
        });

        if (signUp.error) {
            console.error("❌ Error al registrar:", signUp.error.message);
            return;
        }
        
        console.log("✅ Usuario registrado exitosamente.");
        data = signUp.data;
    } else if (error) {
        console.error("❌ Error de login:", error.message);
        return;
    }

    if (data.session) {
        console.log("\n==================================================");
        console.log("🔑 TU TOKEN DE ACCESO (Cópialo todo):");
        console.log("==================================================\n");
        console.log(data.session.access_token);
        console.log("\n==================================================");
        console.log(`🆔 ID DE USUARIO (AuthUserID): ${data.user.id}`);
        console.log("==================================================\n");
        console.log("⚠️ IMPORTANTE: Para que funcione en 'api-business', debes insertar este ID en tu tabla 'user' manualmente en Supabase SQL.");
    }
}

getAccessToken();