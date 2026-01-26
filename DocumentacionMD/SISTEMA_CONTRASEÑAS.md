# 🔐 Sistema de Contraseñas - Documentación

## ¿De dónde salen las contraseñas?

Las contraseñas **NO se guardan en tu base de datos PostgreSQL**. Se almacenan de forma segura en **Supabase Auth**, que es un sistema de autenticación separado y encriptado.

### Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                            │
│  - Almacena contraseñas encriptadas                         │
│  - Genera tokens JWT                                        │
│  - Maneja login/logout                                      │
│  - Campos: email, password (hash), user_metadata            │
└─────────────────────────────────────────────────────────────┘
                          ↕ (AuthUserID vincula ambos)
┌─────────────────────────────────────────────────────────────┐
│                 TU BASE DE DATOS (public.user)              │
│  - Almacena información del perfil                          │
│  - Campos: UserID, FirstName, LastName, Email, Phone, etc   │
│  - NO almacena contraseñas (por seguridad)                  │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Tabla `public.user` (PostgreSQL)

```sql
CREATE TABLE public."user" (
  "UserID" integer PRIMARY KEY,
  "UserName" varchar(50) NOT NULL,
  "PasswordHash" varchar(255),  -- ⚠️ OBSOLETO - No se usa
  "Email" varchar(100) NOT NULL,
  "FirstName" varchar(50),
  "LastName" varchar(50),
  "Phone" varchar(20),
  "Address" varchar(255),
  "IsActive" smallint DEFAULT 1,
  "AuthUserID" uuid UNIQUE,  -- 🔗 Vincula con Supabase Auth
  "CreatedAt" timestamp DEFAULT now(),
  "UpdatedAt" timestamp
);
```

**Nota Importante:** El campo `PasswordHash` existe por compatibilidad pero **NO se usa**. Las contraseñas están en Supabase Auth.

## 🔑 Proceso de Creación de Usuario

### 1. Provisionar Usuario (Admin Panel)

Cuando un administrador crea un usuario nuevo:

```javascript
// api-business/src/controllers/authController.js - provisionUser()

// A. Crear usuario en Supabase Auth
const tempPassword = "NiceKids" + Math.floor(1000 + Math.random() * 9000);
const { data: authUser } = await supabase.auth.admin.createUser({
    email: "usuario@ejemplo.com",
    password: tempPassword,  // ← Contraseña temporal
    email_confirm: true,
    user_metadata: { 
        first_name: "Juan", 
        last_name: "Pérez",
        must_change_password: true  // ← Usuario debe cambiar contraseña
    }
});

// B. Crear registro en tabla 'user'
await supabase.from('user').insert({
    AuthUserID: authUser.user.id,  // ← Vincula con Auth
    FirstName: "Juan",
    LastName: "Pérez",
    Email: "usuario@ejemplo.com",
    UserName: "jperez",
    IsActive: 1
});

// C. Asignar rol
await supabase.from('user_role').insert({
    UserID: newUserId,
    RoleID: roleId
});
```

**Resultado:**
- Usuario recibe: `Email: usuario@ejemplo.com` + `Password: NiceKids1234` (ejemplo)
- Contraseña está en Supabase Auth (encriptada)
- Perfil está en tabla `user` (sin contraseña)

### 2. Login con Google OAuth

```javascript
// client/src/context/AuthContext.jsx

const loginWithGoogle = () => supabase.auth.signInWithOAuth({ 
    provider: 'google' 
});

// Después del login:
await businessApi.auth.syncGoogle(); // Crea usuario en BD si no existe
```

**Resultado:**
- No hay contraseña (login por Google)
- Supabase Auth maneja todo automáticamente
- Se crea registro en tabla `user` vinculado con `AuthUserID`

## 🔄 Cambio de Contraseña

### Implementación Actual

El componente **Profile.jsx** permite cambiar contraseña:

```jsx
// client/src/pages/Profile.jsx

const handlePasswordChange = async (e) => {
    e.preventDefault();

    // 1. Verificar contraseña actual
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
    });

    if (signInError) {
        setPasswordError('La contraseña actual es incorrecta');
        return;
    }

    // 2. Actualizar contraseña en Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
    });

    if (updateError) {
        setPasswordError('Error al actualizar la contraseña');
        return;
    }

    // ✅ Contraseña actualizada exitosamente
    toast.success('🔒 Contraseña actualizada correctamente');
};
```

### Flujo del Cambio de Contraseña

```
1. Usuario ingresa:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña

2. Frontend valida:
   ✓ Contraseñas coinciden
   ✓ Mínimo 8 caracteres
   ✓ Diferente a la actual

3. Verificar contraseña actual:
   supabase.auth.signInWithPassword(email, currentPassword)
   
4. Actualizar en Supabase Auth:
   supabase.auth.updateUser({ password: newPassword })
   
5. ✅ Contraseña guardada en Supabase Auth (encriptada)
```

## 🛡️ Seguridad

### ¿Por qué usar Supabase Auth?

✅ **Ventajas:**
- Contraseñas encriptadas con bcrypt
- Tokens JWT seguros
- Protección contra ataques de fuerza bruta
- OAuth integrado (Google, GitHub, etc.)
- No necesitas manejar hashes manualmente
- Actualización automática de sesiones

❌ **Si guardas contraseñas en tu BD:**
- Riesgo de exposición si la BD es comprometida
- Debes manejar bcrypt/scrypt manualmente
- No tienes OAuth integrado
- Más código para mantener

## 📍 Ubicación de Archivos

### Frontend
- **`client/src/pages/Profile.jsx`** - Interfaz de cambio de contraseña
- **`client/src/pages/Login.jsx`** - Login con contraseña
- **`client/src/context/AuthContext.jsx`** - Manejo de sesiones

### Backend
- **`api-business/src/controllers/authController.js`** - Provisionar usuarios
- **`api-business/src/middleware/authMiddleware.js`** - Validar tokens

### Base de Datos
- **`supabase/schema.sql`** - Esquema de tablas
- **Tabla: `auth.users`** - Contraseñas (en Supabase, no visible directamente)
- **Tabla: `public.user`** - Perfiles de usuario

## 🔍 Cómo Verificar que Funciona

### 1. Ver Usuario en Supabase Auth

```sql
-- En Supabase Dashboard > Authentication > Users
-- Verás: email, created_at, last_sign_in_at
-- NO verás la contraseña (está encriptada internamente)
```

### 2. Ver Usuario en Tu Base de Datos

```sql
SELECT "UserID", "Email", "FirstName", "LastName", "AuthUserID"
FROM public."user"
WHERE "Email" = 'usuario@ejemplo.com';

-- Resultado:
-- UserID | Email              | FirstName | LastName | AuthUserID (UUID)
-- 5      | usuario@ejemplo.com| Juan      | Pérez    | abc-123-def-456
```

### 3. Probar Cambio de Contraseña

1. Login con usuario y contraseña actual
2. Ir a **Profile** > Botón **"Cambiar Contraseña"**
3. Completar formulario:
   - Contraseña actual: `NiceKids1234`
   - Nueva contraseña: `MiPassword123!`
   - Confirmar: `MiPassword123!`
4. Click **"Actualizar Contraseña"**
5. ✅ Ver mensaje: "Contraseña actualizada correctamente"
6. Logout y login con la nueva contraseña

## 🚨 Errores Comunes

### Error: "La contraseña actual es incorrecta"
**Causa:** El usuario ingresó mal su contraseña actual.
**Solución:** Verificar que no tenga Caps Lock activado.

### Error: "Invalid login credentials"
**Causa:** El email o contraseña son incorrectos.
**Solución:** Verificar que el usuario existe en Supabase Auth.

### Error: "Token faltante"
**Causa:** No hay sesión activa.
**Solución:** El usuario debe hacer login primero.

### Error: "User not found in database"
**Causa:** El usuario existe en Auth pero no en tabla `user`.
**Solución:** Ejecutar `businessApi.auth.syncGoogle()` para crear el registro.

## 📱 Casos de Uso

### Caso 1: Nuevo Empleado
1. Admin va a **Staff** > **"Agregar Personal"**
2. Completa formulario (nombre, email, puesto, etc.)
3. Sistema llama `businessApi.auth.provision()`
4. Se crea usuario en Auth con contraseña temporal: `NiceKids1234`
5. Empleado recibe email: `Email: empleado@guarderia.com, Password: NiceKids1234`
6. Empleado hace login y cambia contraseña en Profile

### Caso 2: Usuario Existente Cambia Contraseña
1. Usuario hace login
2. Va a **Profile** > **"Cambiar Contraseña"**
3. Ingresa contraseña actual y nueva
4. Sistema actualiza en Supabase Auth
5. ✅ Nueva contraseña aplicada inmediatamente

### Caso 3: Login con Google
1. Usuario click **"Continuar con Google"**
2. Autentica con cuenta Google
3. Sistema crea registro en tabla `user` automáticamente
4. No hay contraseña (login siempre por Google)

## 🔧 Mantenimiento

### ¿Cómo ver todos los usuarios con Auth?

```sql
SELECT 
    u."UserID",
    u."Email",
    u."FirstName",
    u."LastName",
    u."AuthUserID",
    u."IsActive",
    CASE 
        WHEN u."AuthUserID" IS NOT NULL THEN 'Tiene Auth'
        ELSE 'Sin Auth'
    END as "EstadoAuth"
FROM public."user" u
ORDER BY u."CreatedAt" DESC;
```

### ¿Cómo resetear contraseña manualmente?

```javascript
// Desde Supabase Dashboard > Authentication > Users
// 1. Click en usuario
// 2. Click "Send Password Reset Email"
// 3. Usuario recibe email con link para cambiar contraseña

// O desde código (api-business):
const { error } = await supabase.auth.admin.updateUserById(
    authUserId,
    { password: 'NuevaContraseña123!' }
);
```

## 📊 Resumen

| Componente | Función | Almacena Contraseña |
|------------|---------|---------------------|
| **Supabase Auth** | Sistema de autenticación | ✅ SÍ (encriptada) |
| **Tabla `public.user`** | Perfil de usuario | ❌ NO |
| **Campo `PasswordHash`** | Obsoleto | ❌ NO se usa |
| **Campo `AuthUserID`** | Vincula Auth con BD | - |

**Conclusión:** Las contraseñas están seguras en Supabase Auth. Tu base de datos solo guarda información de perfil. El sistema funciona correctamente y cumple con mejores prácticas de seguridad. ✅
