-- Script para agregar campos necesarios a la tabla user

-- 1. Agregar campo de cédula (IDNumber)
ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "IDNumber" varchar(10);

-- 2. Agregar campo para indicar si debe cambiar contraseña
ALTER TABLE public."user" 
ADD COLUMN IF NOT EXISTS "MustChangePassword" smallint NOT NULL DEFAULT 0;

-- 3. Agregar constraint de unicidad para la cédula
ALTER TABLE public."user" 
ADD CONSTRAINT "user_IDNumber_key" UNIQUE ("IDNumber");

-- 4. Agregar comentarios a las columnas
COMMENT ON COLUMN public."user"."IDNumber" IS 'Cédula de identidad ecuatoriana (10 dígitos)';
COMMENT ON COLUMN public."user"."MustChangePassword" IS 'Indica si el usuario debe cambiar su contraseña (1 = Sí, 0 = No)';

-- 5. Actualizar usuarios existentes que no tengan cédula (opcional)
-- UPDATE public."user" SET "MustChangePassword" = 0 WHERE "IDNumber" IS NULL;

COMMENT ON TABLE public."user" IS 'Tabla de usuarios del sistema. MustChangePassword=1 obliga cambio de contraseña en primer login.';
