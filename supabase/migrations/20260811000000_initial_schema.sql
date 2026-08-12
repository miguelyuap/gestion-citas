-- ====================================================================
-- OmniCitas - Schema de Base de Datos para Supabase (Multi-Tenant SaaS)
-- Migration: 20260811000000_initial_schema.sql
-- ====================================================================

-- 1. Habilitar extensión btree_gist para restricciones de exclusión temporal (anti-solapamiento)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Tabla TENANTS (Negocios / Organizaciones)
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

-- Índice para búsquedas rápidas por Slug de negocio (para páginas públicas de reserva /[slug]/book)
CREATE INDEX idx_tenants_slug ON public.tenants (slug);

-- 3. Tabla PROFILES (Usuarios asociados a auth.users de Supabase)
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

-- 4. Tabla SERVICES (Catálogo de Servicios)
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

-- 5. Tabla STAFF (Personal / Empleados)
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_tenant ON public.staff (tenant_id) WHERE is_active = true;

-- 6. Tabla STAFF_SERVICES (Relación Muchos a Muchos: Personal - Servicios)
CREATE TABLE public.staff_services (
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- 7. Tabla WORKING_HOURS (Horarios Semanales de Atención)
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE, -- NULL = Horario General del Negocio
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, ...
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

-- 8. Tabla CLIENTS (Clientes del Negocio)
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

-- 9. Tabla APPOINTMENTS (Citas Agendadas)
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

-- Índices clave para consultas por rango de tiempo y estado
CREATE INDEX idx_appointments_lookup ON public.appointments (tenant_id, staff_id, start_time, end_time) WHERE status != 'cancelled';

-- ====================================================================
-- CONTROL DE ANTI-SOLAPAMIENTO A NIVEL DE BASE DE DATOS (CRUCIAL)
-- ====================================================================
-- Esta restricción usa btree_gist para asegurar que NO existan 2 citas
-- para el mismo miembro del personal en intervalos de tiempo superpuestos.
ALTER TABLE public.appointments
ADD CONSTRAINT no_overlapping_staff_appointments
EXCLUDE USING gist (
  staff_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
) WHERE (status != 'cancelled');

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACCESO MULTI-TENANT
-- ====================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener el tenant_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- POLÍTICAS PÚBLICAS (Para la página de reservas online /[slug]/book)
CREATE POLICY "Public tenants lookup by slug" ON public.tenants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public services read" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public staff read" ON public.staff
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public staff_services read" ON public.staff_services
  FOR SELECT USING (true);

CREATE POLICY "Public working_hours read" ON public.working_hours
  FOR SELECT USING (true);

-- Permite a clientes anónimos crear/buscar su perfil de cliente al agendar
CREATE POLICY "Public clients insert" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public clients read minimal" ON public.clients
  FOR SELECT USING (true);

-- Permite a clientes agendar citas en estado 'pending' o 'confirmed'
CREATE POLICY "Public appointments insert" ON public.appointments
  FOR INSERT WITH CHECK (status IN ('pending', 'confirmed'));

-- Permite consultar citas públicas existentes solo para calcular slots libres (start_time, end_time, staff_id)
CREATE POLICY "Public appointments read for availability" ON public.appointments
  FOR SELECT USING (status != 'cancelled');

-- POLÍTICAS PRIVADAS PARA USUARIOS AUTENTICADOS DEL DASHBOARD
CREATE POLICY "Tenant admin/staff full access profiles" ON public.profiles
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant staff full access services" ON public.services
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant staff full access staff" ON public.staff
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant staff full access working_hours" ON public.working_hours
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant staff full access clients" ON public.clients
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant staff full access appointments" ON public.appointments
  FOR ALL USING (tenant_id = public.get_current_tenant_id());
