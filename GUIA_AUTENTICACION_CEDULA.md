# 🔐 Sistema de Autenticación con Cédula - Guía de Implementación

## 📋 Cambios Implementados

### Backend (API CRUD)

#### 1. **Instalación de bcrypt**
```bash
cd api-crud
npm install
```

#### 2. **Nuevos Archivos Creados**

- **`src/controllers/userController.js`**: Controlador especializado para usuarios
  - `createUser()`: Crea usuario con cédula como contraseña inicial (hasheada)
  - `updateUser()`: Actualiza usuario con hash de contraseña
  - `login()`: Autenticación con usuario/cédula y contraseña
  - `changePassword()`: Cambio de contraseña con validaciones

#### 3. **Rutas Actualizadas**
- `POST /api/auth/login` - Login sin authCheck
- `POST /api/auth/change-password` - Cambiar contraseña
- `POST /api/user` - Crear usuario (usa userController)
- `PUT /api/user/:id` - Actualizar usuario (usa userController)

#### 4. **Configuración de Supabase**
- `supabaseAdmin` - Cliente con SERVICE_ROLE_KEY para bypassear RLS
- Usado en operaciones de usuarios para evitar problemas de permisos

### Frontend (Cliente React)

#### 1. **Componentes Nuevos**
- **`ChangePasswordModal.jsx`**: Modal obligatorio para cambiar contraseña en primer login
  - Validaciones de seguridad
  - No permite usar cédula como contraseña
  - Confirmar nueva contraseña

#### 2. **Actualizaciones en Componentes Existentes**

**`Users.jsx`**:
- ✅ Campo de **cédula** (10 dígitos)
- ❌ Removido campo de contraseña manual
- 📝 La contraseña inicial es automáticamente la cédula
- 🔒 Cédula no se puede editar después de crear el usuario

**`AuthContext.jsx`**:
- Nuevo método `loginWithCredentials()` para login con usuario/cédula
- Estado `mustChangePassword` para detectar primer login
- Método `onPasswordChanged()` para actualizar estado

**`Login.jsx`**:
- Soporte para login con usuario o cédula
- Campos dinámicos según tipo de login

**`App.jsx`**:
- Modal de cambio de contraseña se muestra automáticamente
- No se puede cerrar hasta cambiar la contraseña

### Base de Datos

#### Campos Agregados a la tabla `user`:

```sql
"IDNumber" varchar(10) UNIQUE         -- Cédula de identidad
"MustChangePassword" smallint DEFAULT 0  -- 1 = Debe cambiar, 0 = No
```

## 🚀 Pasos para Implementar

### 1️⃣ Actualizar Base de Datos en Supabase

Ejecuta el script SQL en Supabase:

1. Ve a **Supabase Dashboard** → Tu proyecto
2. Abre el **SQL Editor**
3. Ejecuta el contenido de `add_user_fields.sql`:

```sql
ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "IDNumber" varchar(10);

ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "MustChangePassword" smallint NOT NULL DEFAULT 0;

ALTER TABLE public."user" 
ADD CONSTRAINT "user_IDNumber_key" UNIQUE ("IDNumber");
```

### 2️⃣ Instalar Dependencias del Backend

```bash
cd api-crud
npm install
```

Esto instalará `bcrypt` para el hashing de contraseñas.

### 3️⃣ Reiniciar el Servidor Backend

```bash
npm run dev
```

### 4️⃣ El Frontend Ya Está Listo

No necesita instalación adicional, los cambios ya están aplicados.

## 📝 Cómo Usar el Sistema

### Crear un Nuevo Usuario

1. Ve a **Gestión de Usuarios**
2. Click en **Nuevo Usuario**
3. Completa el formulario:
   - Usuario (nick)
   - Email
   - **Cédula** (10 dígitos) ⭐
   - Nombre
   - Apellido
   - Teléfono (opcional)
   - Dirección (opcional)
   - Estado (Activo/Inactivo)
4. Click en **Crear Usuario**

✅ **La contraseña inicial será automáticamente la cédula** (hasheada en la BD)

### Primer Login de un Usuario Nuevo

1. El usuario ingresa en el login:
   - **Usuario**: Su nombre de usuario o cédula
   - **Contraseña**: Su cédula (misma que usaste al crearlo)

2. **Automáticamente** aparecerá un modal obligatorio:
   - Solicita contraseña actual (su cédula)
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña

3. **Validaciones**:
   - ❌ La nueva contraseña NO puede ser la cédula
   - ❌ La nueva contraseña NO puede ser igual a la actual
   - ✅ Debe tener mínimo 6 caracteres
   - ✅ Ambas contraseñas deben coincidir

4. Después de cambiar la contraseña:
   - El modal se cierra
   - El usuario puede usar el sistema normalmente
   - Ya no se le pedirá cambiar contraseña

### Logins Posteriores

El usuario usará:
- **Usuario**: Su nombre de usuario o cédula
- **Contraseña**: La nueva contraseña que configuró

## 🔒 Seguridad Implementada

1. **Hashing con bcrypt**: Todas las contraseñas se almacenan hasheadas (10 salt rounds)
2. **Validación de cédula**: 10 dígitos requeridos
3. **Cambio obligatorio**: Usuarios nuevos deben cambiar contraseña
4. **No reutilización**: No permite usar cédula como contraseña definitiva
5. **Cliente administrativo**: Operaciones de usuario usan SERVICE_ROLE_KEY

## 🧪 Prueba del Sistema

### Crear Usuario de Prueba

```
Usuario: jperez
Email: jperez@test.com
Cédula: 1234567890
Nombre: Juan
Apellido: Pérez
```

### Primer Login

```
Usuario: jperez (o 1234567890)
Contraseña: 1234567890
```

→ Aparecerá modal para cambiar contraseña

### Cambiar Contraseña

```
Contraseña actual: 1234567890
Nueva contraseña: MiPassword123
Confirmar: MiPassword123
```

### Login Normal

```
Usuario: jperez
Contraseña: MiPassword123
```

## ⚠️ Notas Importantes

1. **Cédula única**: No se pueden crear dos usuarios con la misma cédula
2. **Email único**: No se pueden crear dos usuarios con el mismo email
3. **No editar cédula**: Una vez creado el usuario, la cédula no se puede cambiar
4. **Google Login**: Los usuarios que ingresan con Google NO necesitan cambiar contraseña
5. **Modal obligatorio**: El usuario NO puede cerrar el modal hasta cambiar su contraseña

## 🐛 Solución de Problemas

### Error: "La cédula es requerida"
- Asegúrate de completar el campo de cédula al crear el usuario

### Error: "new row violates row-level security policy"
- Verifica que el script SQL se haya ejecutado correctamente
- Reinicia el servidor api-crud

### El modal no aparece
- Verifica que el campo `MustChangePassword` esté en 1 en la BD
- Revisa la consola del navegador para errores

### No puedo hacer login
- Verifica que estés usando la cédula correcta como contraseña inicial
- Asegúrate de que el usuario esté activo (`IsActive = 1`)

## 📊 Estructura de Campos en BD

```sql
UserID: integer (PK, auto)
UserName: varchar(50) UNIQUE
PasswordHash: varchar(255)  -- Hash bcrypt
Email: varchar(100) UNIQUE
IDNumber: varchar(10) UNIQUE ⭐ NUEVO
FirstName: varchar(50)
LastName: varchar(50)
Phone: varchar(20)
Address: varchar(255)
IsActive: smallint (1/0)
MustChangePassword: smallint (1/0) ⭐ NUEVO
LastLogin: timestamp
CreatedAt: timestamp
UpdatedAt: timestamp
```

---

**Equipo CodeSync** - Enero 2026
