-- Migration: Agregar columna branch_id a la tabla public.staff si no existe
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;
