-- ====================================================================
-- OmniCitas / GST-SOFTWARE - Client Portal Enhancements
-- Migration: 20260820200000_client_portal_enhancements.sql
-- ====================================================================

-- 1. Agregar columna user_id a la tabla clients para vincular clientes autenticados vía Supabase Auth
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients (user_id);

-- 2. Agregar columna branch_id a la tabla appointments si no existe
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_branch ON public.appointments (branch_id);

-- 3. Habilitar política de lectura pública para sucursales activas en el portal del cliente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'branches' AND policyname = 'Public branches read'
  ) THEN
    CREATE POLICY "Public branches read" ON public.branches
      FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- 4. Políticas RLS en CLIENTS para clientes autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Client read own profile'
  ) THEN
    CREATE POLICY "Client read own profile" ON public.clients
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'clients' AND policyname = 'Client update own profile'
  ) THEN
    CREATE POLICY "Client update own profile" ON public.clients
      FOR UPDATE USING (user_id = auth.uid());
  END IF;
END $$;

-- 5. Políticas RLS en APPOINTMENTS para clientes autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' AND policyname = 'Client read own appointments'
  ) THEN
    CREATE POLICY "Client read own appointments" ON public.appointments
      FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'appointments' AND policyname = 'Client update own appointments'
  ) THEN
    CREATE POLICY "Client update own appointments" ON public.appointments
      FOR UPDATE USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- 6. Políticas RLS en NOTIFICATIONS para clientes autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Client read own notifications'
  ) THEN
    CREATE POLICY "Client read own notifications" ON public.notifications
      FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Client update own notifications'
  ) THEN
    CREATE POLICY "Client update own notifications" ON public.notifications
      FOR UPDATE USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
      );
  END IF;
END $$;
