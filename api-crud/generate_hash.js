import bcrypt from 'bcrypt';

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error al hashear:', err);
        return;
    }
    
    console.log('\n=== HASH GENERADO ===');
    console.log('Contraseña original:', password);
    console.log('Hash bcrypt:', hash);
    console.log('\n=== SQL PARA SUPABASE ===');
    console.log(`
UPDATE public."user" 
SET "PasswordHash" = '${hash}',
    "MustChangePassword" = 0
WHERE "Email" = 'andrade.dval@gmail.com';
    `);
    console.log('\n✅ Copia el SQL de arriba y ejecútalo en Supabase SQL Editor\n');
});
