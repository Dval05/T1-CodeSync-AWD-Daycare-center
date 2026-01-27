
-- Agregar columna ProfilePhotoURL a la tabla user para almacenar fotos de perfil
-- Este script es seguro para ejecutar múltiples veces (idempotente)

-- Agregar la columna si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'ProfilePhotoURL'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "ProfilePhotoURL" TEXT;
        RAISE NOTICE 'Columna ProfilePhotoURL agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna ProfilePhotoURL ya existe';
    END IF;
END $$;

-- Agregar comentario a la columna
COMMENT ON COLUMN "user"."ProfilePhotoURL" IS 'URL de la foto de perfil del usuario (puede ser URL de Supabase Storage o base64)';

-- Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user' AND column_name = 'ProfilePhotoURL';
