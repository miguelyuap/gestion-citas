-- ====================================================================
-- OmniCitas - Campos de Cancelación de Citas y Registro de Notificaciones
-- Migration: 20260817400000_appointment_cancellation_fields.sql
-- ====================================================================

-- 1. Añadir columnas a la tabla APPOINTMENTS para motivo de cancelación y reprogramación
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS can_reschedule BOOLEAN DEFAULT true;

-- 2. Tabla APPOINTMENT_NOTIFICATIONS (Para encolar notificaciones de la Fase 4)
CREATE TABLE IF NOT EXISTS public.appointment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'cancellation', 'reminder', 'status_change')),
  channel TEXT NOT NULL DEFAULT 'system' CHECK (channel IN ('system', 'email', 'whatsapp', 'sms')),
  recipient_name TEXT,
  recipient_contact TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_tenant ON public.appointment_notifications (tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment ON public.appointment_notifications (appointment_id);

-- 3. Habilitar RLS en APPOINTMENT_NOTIFICATIONS
ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;

-- Política RLS para usuarios autenticados del Dashboard
CREATE POLICY "Tenant staff access notifications" ON public.appointment_notifications
  FOR ALL USING (tenant_id = public.get_current_tenant_id());
