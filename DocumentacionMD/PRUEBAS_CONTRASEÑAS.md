# 🧪 Pruebas del Sistema de Contraseñas

## ✅ Lista de Verificación

### 1. Verificar Configuración

```bash
# En el terminal de client:
cd client
cat .env | grep SUPABASE
```

**Resultado esperado:**
```
VITE_SUPABASE_URL=https://dkfissjbxaevmxcqvpai.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. Probar Login

1. Abrir `http://localhost:5173` (o tu puerto del cliente)
2. Intentar login con:
   - Email: `andrade.dval@gmail.com` (o tu admin email)
   - Password: Tu contraseña actual

**Resultado esperado:** ✅ Redirect a dashboard

### 3. Probar Cambio de Contraseña

**Pasos:**

1. Login exitoso → Dashboard
2. Click en **"Profile"** en la barra lateral
3. Click en botón **"Cambiar Contraseña"** (morado)
4. Completar formulario:
   - Contraseña actual: `tu_password_actual`
   - Nueva contraseña: `TestPassword123!`
   - Confirmar: `TestPassword123!`
5. Click **"Actualizar Contraseña"**

**Resultado esperado:**
- ✅ Mensaje verde: "Contraseña actualizada correctamente"
- Panel se cierra automáticamente después de 2 segundos
- Toast notification: "🔒 Contraseña actualizada correctamente"

### 4. Verificar que la Contraseña se Guardó

**Pasos:**

1. Click en **"Logout"**
2. Volver a la página de login
3. Intentar login con la **NUEVA** contraseña: `TestPassword123!`

**Resultado esperado:** ✅ Login exitoso con nueva contraseña

### 5. Verificar Error de Contraseña Incorrecta

**Pasos:**

1. Login
2. Profile → Cambiar Contraseña
3. Ingresar contraseña actual **incorrecta**
4. Click "Actualizar Contraseña"

**Resultado esperado:**
- ❌ Mensaje rojo: "La contraseña actual es incorrecta"
- Formulario NO se limpia
- NO hay redirección

### 6. Verificar Validaciones

**A. Contraseñas no coinciden:**

```
Contraseña actual: TestPassword123!
Nueva contraseña: NuevaPass123
Confirmar: OtraPass456  ← Diferente
```

**Resultado:** ❌ "Las contraseñas no coinciden"

**B. Contraseña muy corta:**

```
Nueva contraseña: 1234567  ← Menos de 8 caracteres
```

**Resultado:** ❌ "La contraseña debe tener al menos 8 caracteres"

**C. Contraseña igual a la actual:**

```
Contraseña actual: TestPassword123!
Nueva contraseña: TestPassword123!  ← Misma
```

**Resultado:** ❌ "La nueva contraseña debe ser diferente a la actual"

## 🔍 Debugging

### Ver Usuario en Supabase Dashboard

1. Ir a: https://supabase.com/dashboard/project/dkfissjbxaevmxcqvpai
2. Authentication → Users
3. Buscar tu usuario por email
4. Ver: `last_sign_in_at` (debe actualizarse después de cada login)

### Ver Usuario en la Base de Datos

```sql
-- En Supabase Dashboard > SQL Editor:

SELECT 
    "UserID",
    "Email",
    "FirstName",
    "LastName",
    "AuthUserID",
    "IsActive"
FROM public."user"
WHERE "Email" = 'TU_EMAIL_AQUI';
```

**Resultado esperado:**
```
UserID | Email              | FirstName | LastName | AuthUserID          | IsActive
1      | tu@email.com       | Nombre    | Apellido | abc-123-def-456-... | 1
```

### Ver Logs en Consola del Navegador

1. Abrir DevTools (F12)
2. Tab "Console"
3. Durante cambio de contraseña, buscar:

```
✅ Sin errores: Todo OK
❌ "Error cambiando contraseña": Revisar mensaje de error
```

## 🐛 Solución de Problemas

### Problema: "Token faltante"

**Causa:** No hay sesión activa.

**Solución:**
1. Hacer logout
2. Hacer login nuevamente
3. Verificar que `localStorage` tenga el token:
   ```javascript
   console.log(localStorage.getItem('sb-access-token'));
   ```

### Problema: "La contraseña actual es incorrecta" (pero estás seguro que es correcta)

**Causa:** El usuario puede tener login con Google (sin contraseña).

**Solución:**
1. Ir a Supabase Dashboard → Authentication → Users
2. Ver si el usuario tiene `provider: google`
3. Si es así, necesitas resetear la contraseña:
   ```javascript
   // Enviar email de reset:
   await supabase.auth.resetPasswordForEmail('email@ejemplo.com');
   ```

### Problema: "Error al actualizar la contraseña"

**Causa:** El token JWT puede haber expirado.

**Solución:**
1. Hacer logout
2. Hacer login nuevamente
3. Intentar cambiar contraseña de nuevo

### Problema: Los cambios no se reflejan

**Causa 1:** El servidor del cliente no se reinició.

**Solución:**
```bash
# En terminal de client:
# Ctrl+C para detener
npm run dev
```

**Causa 2:** Caché del navegador.

**Solución:**
1. Abrir DevTools (F12)
2. Click derecho en botón de refresh
3. "Empty Cache and Hard Reload"

## 📝 Checklist Final

- [ ] ✅ Login funciona con contraseña existente
- [ ] ✅ Página Profile se carga correctamente
- [ ] ✅ Botón "Cambiar Contraseña" aparece
- [ ] ✅ Formulario de cambio de contraseña se muestra al hacer click
- [ ] ✅ Validaciones funcionan (contraseñas no coinciden, muy corta, etc.)
- [ ] ✅ Contraseña se actualiza en Supabase Auth
- [ ] ✅ Login con nueva contraseña funciona
- [ ] ✅ Mensaje de éxito aparece
- [ ] ✅ Formulario se cierra automáticamente
- [ ] ✅ No hay errores en consola

## 🎉 Si todo funciona...

¡Perfecto! Tu sistema de contraseñas está completamente operativo. Las contraseñas se guardan de forma segura en Supabase Auth y los usuarios pueden cambiarlas fácilmente desde su perfil.

### Funcionalidades Implementadas:

✅ **Login con contraseña**
✅ **Cambio de contraseña con validación**
✅ **Verificación de contraseña actual**
✅ **Mensajes de error descriptivos**
✅ **Almacenamiento seguro en Supabase Auth**
✅ **Interfaz intuitiva con iconos**
✅ **Mostrar/ocultar contraseña**
✅ **Validación de longitud mínima**
✅ **Confirmación de nueva contraseña**

## 📞 Soporte

Si algo no funciona:

1. Revisar logs en consola del navegador
2. Verificar que los servidores estén corriendo:
   - `client`: puerto 5173
   - `api-crud`: puerto 3001
   - `api-business`: puerto 3002
3. Verificar conexión a Supabase:
   ```javascript
   // En consola del navegador:
   const { data, error } = await supabase.auth.getSession();
   console.log('Session:', data);
   ```

---

**Última actualización:** Enero 2026
