-- ====================================================================
-- Gestión Citas - Script Completo: RESETEAR Y CREAR DESDE CERO (SQL EDITOR)
-- ====================================================================
-- Este script borra la información anterior y reconstruye todas las tablas
-- con aislamiento Multi-Tenant (RLS) y restricciones Anti-Solapamiento.
-- ====================================================================

-- --------------------------------------------------------------------
-- PASO 1: ELIMINAR TABLAS EXISTENTES
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.working_hours CASCADE;
DROP TABLE IF EXISTS public.staff_services CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

DROP FUNCTION IF EXISTS public.get_current_tenant_id() CASCADE;

-- --------------------------------------------------------------------
-- PASO 2: HABILITAR EXTENSIONES
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- --------------------------------------------------------------------
-- PASO 3: CREAR NUEVAS TABLAS
-- --------------------------------------------------------------------

-- 1. Tabla TENANTS (Negocios)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Bogota',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON public.tenants (slug);

-- 2. Tabla PROFILES (Usuarios Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_tenant_id ON public.profiles (tenant_id);

-- 3. Tabla SERVICES (Catálogo de Servicios)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  buffer_time_minutes INTEGER NOT NULL DEFAULT 0 CHECK (buffer_time_minutes >= 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_tenant ON public.services (tenant_id) WHERE is_active = true;

-- 4. Tabla STAFF (Especialistas / Personal)
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_tenant ON public.staff (tenant_id) WHERE is_active = true;

-- 5. Tabla STAFF_SERVICES (Relación Personal - Servicios)
CREATE TABLE public.staff_services (
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- 6. Tabla WORKING_HOURS (Horarios Semanales)
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  is_day_off BOOLEAN NOT NULL DEFAULT false,
  break_start TIME,
  break_end TIME,
  CONSTRAINT valid_break CHECK (
    (break_start IS NULL AND break_end IS NULL) OR 
    (break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)
  )
);

CREATE INDEX idx_working_hours_lookup ON public.working_hours (tenant_id, staff_id, day_of_week);

-- 7. Tabla CLIENTS (Clientes)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, email)
);

CREATE INDEX idx_clients_tenant ON public.clients (tenant_id);

-- 8. Tabla APPOINTMENTS (Citas Agendadas)
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL CHECK (end_time > start_time),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  total_price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_lookup ON public.appointments (tenant_id, staff_id, start_time, end_time) WHERE status != 'cancelled';

-- Restricción Anti-Solapamiento PostgreSQL
ALTER TABLE public.appointments
ADD CONSTRAINT no_overlapping_staff_appointments
EXCLUDE USING gist (
  staff_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
) WHERE (status != 'cancelled');

-- --------------------------------------------------------------------
-- PASO 4: ACTIVAR POLÍTICAS DE SEGURIDAD (RLS)
-- --------------------------------------------------------------------
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Políticas Públicas
CREATE POLICY "Public tenants lookup by slug" ON public.tenants FOR SELECT USING (is_active = true);
CREATE POLICY "Public services read" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Public staff read" ON public.staff FOR SELECT USING (is_active = true);
CREATE POLICY "Public staff_services read" ON public.staff_services FOR SELECT USING (true);
CREATE POLICY "Public working_hours read" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Public clients insert" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public clients read minimal" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Public appointments insert" ON public.appointments FOR INSERT WITH CHECK (status IN ('pending', 'confirmed'));
CREATE POLICY "Public appointments read for availability" ON public.appointments FOR SELECT USING (status != 'cancelled');

-- Políticas Privadas (Dashboard)
CREATE POLICY "Tenant admin/staff full access profiles" ON public.profiles FOR ALL USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Tenant staff full access services" ON public.services FOR ALL USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Tenant staff full access staff" ON public.staff FOR ALL USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Tenant staff full access working_hours" ON public.working_hours FOR ALL USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Tenant staff full access clients" ON public.clients FOR ALL USING (tenant_id = public.get_current_tenant_id());
CREATE POLICY "Tenant staff full access appointments" ON public.appointments FOR ALL USING (tenant_id = public.get_current_tenant_id());
