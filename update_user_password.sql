-- Script para actualizar la contraseña del usuario andrade.dval@gmail.com
-- Contraseña: admin123 (hasheada con bcrypt)

UPDATE public."user" 
SET "PasswordHash" = '$2b$10$hgHxT480Wh6XVb5j3BlrGe.aZ3vxdFvplO6YpxG8SgkI//YJ0KpXm',
    "MustChangePassword" = 0
WHERE "Email" = 'andrade.dval@gmail.com';

-- Verificar que se actualizó correctamente
SELECT "UserID", "Email", "FirstName", "LastName", "PasswordHash", "MustChangePassword", "IsActive"
FROM public."user"
WHERE "Email" = 'andrade.dval@gmail.com';
