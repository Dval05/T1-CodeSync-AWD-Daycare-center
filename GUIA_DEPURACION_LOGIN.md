# 🔍 Guía de Depuración - Problema de Login

## 📋 Resumen del Problema
No se puede iniciar sesión con ningún usuario. Necesitamos verificar que:
1. La tabla `user` tiene las columnas necesarias (`PasswordHash`, `IDNumber`, `MustChangePassword`)
2. El usuario tiene una contraseña hasheada en la base de datos
3. El proceso de comparación de contraseñas funciona correctamente

---

## ✅ Paso 1: Agregar columnas a la tabla user

### 1.1 Ve a Supabase Dashboard
- Abre https://supabase.com
- Selecciona tu proyecto
- Ve a **SQL Editor** (en el menú lateral izquierdo)

### 1.2 Ejecuta este SQL
```sql
-- Script para agregar campos necesarios a la tabla user

-- 1. Agregar campo de cédula (IDNumber)
ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "IDNumber" varchar(10);

-- 2. Agregar campo para indicar si debe cambiar contraseña
ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "MustChangePassword" smallint NOT NULL DEFAULT 0;

-- 3. Agregar constraint de unicidad para la cédula
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_IDNumber_key'
    ) THEN
        ALTER TABLE public."user" 
        ADD CONSTRAINT "user_IDNumber_key" UNIQUE ("IDNumber");
    END IF;
END $$;

-- 4. Agregar comentarios a las columnas
COMMENT ON COLUMN public."user"."IDNumber" IS 'Cédula de identidad ecuatoriana (10 dígitos)';
COMMENT ON COLUMN public."user"."MustChangePassword" IS 'Indica si el usuario debe cambiar su contraseña (1 = Sí, 0 = No)';
COMMENT ON TABLE public."user" IS 'Tabla de usuarios del sistema. MustChangePassword=1 obliga cambio de contraseña en primer login.';
```

### 1.3 Verifica que se ejecutó correctamente
Deberías ver un mensaje de éxito en Supabase.

---

## ✅ Paso 2: Actualizar usuario con contraseña hasheada

### 2.1 Ejecuta este SQL en Supabase
```sql
UPDATE public."user" 
SET 
    "PasswordHash" = '$2b$10$hgHxT480Wh6XVb5j3BlrGe.aZ3vxdFvplO6YpxG8SgkI//YJ0KpXm',
    "MustChangePassword" = 0
WHERE "Email" = 'andrade.dval@gmail.com';
```

Este SQL actualiza el usuario `andrade.dval@gmail.com` con:
- **Contraseña**: `admin123` (hasheada con bcrypt)
- **MustChangePassword**: `0` (no requiere cambio forzado)

### 2.2 Verifica la actualización
```sql
SELECT "Email", "PasswordHash", "MustChangePassword", "IsActive"
FROM public."user"
WHERE "Email" = 'andrade.dval@gmail.com';
```

Deberías ver:
- `PasswordHash` con el hash largo
- `MustChangePassword` = 0
- `IsActive` = 1

---

## ✅ Paso 3: Verificar las credenciales de login

### Credenciales para probar:
```
Email: andrade.dval@gmail.com
Contraseña: admin123
```

---

## 🔧 Paso 4: Depurar con logs del servidor

### 4.1 Reinicia el servidor api-crud
Si el servidor está corriendo, ciérralo con `Ctrl+C` y vuélvelo a iniciar:

```powershell
npm run dev
```

### 4.2 Intenta iniciar sesión desde el frontend

Ve a la página de login e intenta ingresar con:
- **Email**: `andrade.dval@gmail.com`
- **Contraseña**: `admin123`

### 4.3 Revisa los logs en la terminal del api-crud

Deberías ver algo como:
```
🔐 Intento de login: { email: 'andrade.dval@gmail.com' }
👤 Usuario encontrado: Sí
❌ Error de búsqueda: Ninguno
🔑 PasswordHash presente: Sí
✅ Contraseña válida: true
```

---

## ❌ Posibles Problemas y Soluciones

### Problema 1: "Usuario encontrado: No"
**Causa**: El usuario no existe o está inactivo.

**Solución**: Verifica en Supabase:
```sql
SELECT "UserID", "Email", "IsActive" 
FROM public."user" 
WHERE "Email" = 'andrade.dval@gmail.com';
```

Si `IsActive` = 0, actualízalo:
```sql
UPDATE public."user" SET "IsActive" = 1 
WHERE "Email" = 'andrade.dval@gmail.com';
```

---

### Problema 2: "PasswordHash presente: No"
**Causa**: La columna `PasswordHash` no existe o está vacía.

**Solución**: 
1. Verifica que ejecutaste el Paso 1 correctamente
2. Ejecuta el Paso 2 para agregar el hash

---

### Problema 3: "Contraseña válida: false"
**Causa**: La contraseña ingresada no coincide con el hash.

**Solución**:
1. Verifica que estás usando `admin123` como contraseña
2. Asegúrate de que el hash en la DB es exactamente:
   ```
   $2b$10$hgHxT480Wh6XVb5j3BlrGe.aZ3vxdFvplO6YpxG8SgkI//YJ0KpXm
   ```
3. Si el hash es diferente, vuelve a ejecutar el UPDATE del Paso 2

---

### Problema 4: Error "column PasswordHash does not exist"
**Causa**: La tabla `user` no tiene la columna `PasswordHash`.

**Solución**: Verifica la estructura de tu tabla:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user' AND table_schema = 'public';
```

Si falta la columna, agrégala:
```sql
ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "PasswordHash" varchar(255);
```

---

## 🧪 Paso 5: Prueba de hash manual (opcional)

Si quieres verificar que bcrypt funciona correctamente, puedes ejecutar:

```bash
node api-crud/generate_hash.js
```

Esto generará un nuevo hash para `admin123`. Puedes compararlo con el que está en la base de datos.

---

## 📊 Verificación Final

Una vez completados todos los pasos:

1. ✅ Tabla `user` tiene columnas: `PasswordHash`, `IDNumber`, `MustChangePassword`
2. ✅ Usuario `andrade.dval@gmail.com` tiene hash en `PasswordHash`
3. ✅ Servidor api-crud está corriendo sin errores
4. ✅ Login desde frontend muestra logs correctos en terminal
5. ✅ Login exitoso redirige al dashboard

---

## 🆘 Si aún no funciona

Comparte en el chat:
1. Los logs completos de la terminal api-crud
2. El resultado del siguiente SQL:
   ```sql
   SELECT "Email", "PasswordHash", "IsActive", "MustChangePassword"
   FROM public."user"
   WHERE "Email" = 'andrade.dval@gmail.com';
   ```
3. Los errores que aparecen en la consola del navegador (F12 > Console)
