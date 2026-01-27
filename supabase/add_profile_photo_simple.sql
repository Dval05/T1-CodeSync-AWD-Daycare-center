-- Script simple para agregar columna ProfilePhotoURL
-- Ejecuta esto en el SQL Editor de Supabase

ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "ProfilePhotoURL" TEXT;
