-- ====================================================================
-- OmniCitas - Corrección de Políticas RLS para Apariencia & Perfiles
-- Migration: 20260817300000_fix_appearance_rls_policies.sql
-- ====================================================================

-- 1. CORRECCIÓN EN TABLA PROFILES
-- Asegura que cualquier usuario autenticado pueda leer, crear y actualizar su propio perfil sin bloqueos circulares
DROP POLICY IF EXISTS "Tenant admin/staff full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow user manage own profile" ON public.profiles;

CREATE POLICY "Allow user manage own profile" ON public.profiles
  FOR ALL
  USING (id = auth.uid() OR tenant_id = public.get_current_tenant_id())
  WITH CHECK (id = auth.uid());

-- 2. CORRECCIÓN EN TABLA TENANTS
DROP POLICY IF EXISTS "Allow authenticated insert tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owner manage own tenant" ON public.tenants;

CREATE POLICY "Tenant owner manage own tenant" ON public.tenants
  FOR ALL
  USING (id = public.get_current_tenant_id() OR email = (auth.jwt() ->> 'email'))
  WITH CHECK (true);

-- 3. CORRECCIÓN EN TABLAS DE APARIENCIA (tenant_settings, tenant_theme, tenant_sections, tenant_socials, tenant_gallery, tenant_testimonials)

-- 3.1 tenant_settings
DROP POLICY IF EXISTS "Tenant admin full access tenant_settings" ON public.tenant_settings;
CREATE POLICY "Tenant admin full access tenant_settings" ON public.tenant_settings
  FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3.2 tenant_theme
DROP POLICY IF EXISTS "Tenant admin full access tenant_theme" ON public.tenant_theme;
CREATE POLICY "Tenant admin full access tenant_theme" ON public.tenant_theme
  FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3.3 tenant_sections
DROP POLICY IF EXISTS "Tenant admin full access tenant_sections" ON public.tenant_sections;
CREATE POLICY "Tenant admin full access tenant_sections" ON public.tenant_sections
  FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3.4 tenant_socials
DROP POLICY IF EXISTS "Tenant admin full access tenant_socials" ON public.tenant_socials;
CREATE POLICY "Tenant admin full access tenant_socials" ON public.tenant_socials
  FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3.5 tenant_gallery
DROP POLICY IF EXISTS "Tenant admin full access tenant_gallery" ON public.tenant_gallery;
CREATE POLICY "Tenant admin full access tenant_gallery" ON public.tenant_gallery
  FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 3.6 tenant_testimonials
DROP POLICY IF EXISTS "Tenant admin full access tenant_testimonials" ON public.tenant_testimonials;
CREATE POLICY "Tenant admin full access tenant_testimonials" ON public.tenant_testimonials
  FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
