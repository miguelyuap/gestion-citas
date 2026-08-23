-- ====================================================================
-- OmniCitas - Añadir columnas de redes sociales adicionales a TENANT_SOCIALS
-- Migration: 20260820100000_add_social_columns_to_tenant_socials.sql
-- ====================================================================

ALTER TABLE public.tenant_socials
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS youtube TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS telegram TEXT;
