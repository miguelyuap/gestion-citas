-- ====================================================================
-- OmniCitas - Campos de Configuración del Negocio, Agenda y Notificaciones
-- Migration: 20260822000000_configuracion_schema.sql
-- ====================================================================

-- 0.1. Asegurar la existencia de la tabla TENANTS
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Bogota',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 0.2. Asegurar la existencia de la tabla TENANT_SETTINGS
CREATE TABLE IF NOT EXISTS public.tenant_settings (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  template TEXT NOT NULL DEFAULT 'modern',
  hero_title TEXT DEFAULT 'TU ESTILO. TU MOMENTO.',
  hero_subtitle TEXT DEFAULT 'Reserva tu próxima cita de manera rápida, sencilla y sin llamadas.',
  hero_image_url TEXT,
  hero_badge TEXT DEFAULT 'RESERVA ONLINE 24/7',
  hero_cta_text TEXT DEFAULT 'Reservar Cita',
  hero_secondary_cta_text TEXT DEFAULT 'Ver Servicios',
  about_title TEXT DEFAULT 'Sobre Nosotros',
  about_text TEXT DEFAULT 'Nos dedicamos a ofrecer experiencias de la más alta calidad con profesionales apasionados por su trabajo.',
  about_image_url TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1. Añadir columnas de configuración a TENANT_SETTINGS
ALTER TABLE public.tenant_settings
ADD COLUMN IF NOT EXISTS cancellation_hours_notice INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS min_booking_notice_hours INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS default_slot_duration INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS start_work_time TEXT DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS end_work_time TEXT DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS notification_toggles JSONB DEFAULT '{"email": true, "whatsapp": false, "recordatorio24h": true, "recordatorio1h": true, "confirmacion": true, "cancelacion": true}'::jsonb,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Asegurar la existencia de todas las columnas en TENANTS
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Políticas RLS Resilientes para la Configuración del Negocio
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access tenants" ON public.tenants;
CREATE POLICY "Authenticated users full access tenants" ON public.tenants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read active tenants" ON public.tenants;
CREATE POLICY "Public read active tenants" ON public.tenants
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users full access tenant_settings" ON public.tenant_settings;
CREATE POLICY "Authenticated users full access tenant_settings" ON public.tenant_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read tenant_settings" ON public.tenant_settings;
CREATE POLICY "Public read tenant_settings" ON public.tenant_settings
  FOR SELECT
  TO public
  USING (true);
