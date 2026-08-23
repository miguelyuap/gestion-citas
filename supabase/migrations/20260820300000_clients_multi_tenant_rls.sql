-- ====================================================================
-- OmniCitas / GST-SOFTWARE - Clients Multi-Tenant RLS & Performance
-- Migration: 20260820300000_clients_multi_tenant_rls.sql
-- ====================================================================

-- 1. Asegurar índice para búsquedas por tenant_id y correo electrónico (insensible a mayúsculas)
CREATE INDEX IF NOT EXISTS idx_clients_tenant_email_lower ON public.clients (tenant_id, lower(email));

-- 2. Reforzar políticas RLS en public.clients para personal y administradores del tenant
DO $$
BEGIN
  -- Política para que el personal del tenant tenga acceso total a sus clientes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Tenant staff full access clients'
  ) THEN
    CREATE POLICY "Tenant staff full access clients" ON public.clients
      FOR ALL USING (tenant_id = public.get_current_tenant_id());
  END IF;
END $$;
