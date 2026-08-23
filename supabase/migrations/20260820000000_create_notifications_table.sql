-- ====================================================================
-- OmniCitas / GST-SOFTWARE - Sistema de Notificaciones Persistentes
-- Migration: 20260820000000_create_notifications_table.sql
-- ====================================================================

-- 1. Crear tabla NOTIFICATIONS si no existe
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'appointment_created',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_completed',
    'reservation_changed'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices de rendimiento para búsquedas rápidas por tenant, lectura y fecha
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON public.notifications (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (tenant_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment ON public.notifications (appointment_id);

-- 3. Habilitar RLS en NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS idempotentes (Evita error ERROR 42710 si ya existen)
DROP POLICY IF EXISTS "Tenant staff access notifications" ON public.notifications;
CREATE POLICY "Tenant staff access notifications" ON public.notifications
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

DROP POLICY IF EXISTS "Public insert notifications" ON public.notifications;
CREATE POLICY "Public insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
