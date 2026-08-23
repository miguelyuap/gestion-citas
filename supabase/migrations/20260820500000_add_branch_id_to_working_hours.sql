-- Migration: Agregar columna branch_id a la tabla public.working_hours si no existe
ALTER TABLE public.working_hours 
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_working_hours_branch ON public.working_hours (branch_id);
