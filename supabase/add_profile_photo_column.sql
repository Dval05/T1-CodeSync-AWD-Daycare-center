
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "ProfilePhotoURL" TEXT;

COMMENT ON COLUMN "user"."ProfilePhotoURL" IS 'URL de la foto de perfil del usuario (puede ser URL de Supabase Storage o base64)';

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user' AND column_name = 'ProfilePhotoURL';
