-- Migration: Agregar columna category a la tabla public.services si no existe
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
