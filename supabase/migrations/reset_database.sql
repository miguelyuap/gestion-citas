-- ====================================================================
-- OmniCitas / Gestión Citas - Script para Limpiar / Resetear la Base de Datos
-- ====================================================================
-- ADVERTENCIA: Este script eliminará TODAS las tablas, tipos, vistas y
-- políticas existentes en el esquema 'public' de tu proyecto Supabase.
-- ====================================================================

-- 1. Eliminar tablas en orden por dependencias (CASCADE)
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.working_hours CASCADE;
DROP TABLE IF EXISTS public.staff_services CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- 2. Eliminar funciones auxiliares
DROP FUNCTION IF EXISTS public.get_current_tenant_id() CASCADE;

-- 3. Limpiar extensión btree_gist si es necesario (opcional)
-- DROP EXTENSION IF EXISTS btree_gist CASCADE;
