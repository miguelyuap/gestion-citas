-- ====================================================================
-- OmniCitas / GST-SOFTWARE - Fix Client Registration Trigger & Separation
-- Migration: 20260820400000_fix_client_registration_trigger.sql
-- ====================================================================

-- 1. Actualizar el trigger de auth.users para que IGNORE a los clientes finales (role = 'client')
CREATE OR REPLACE FUNCTION public.handle_new_user_tenant()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_tenant_id UUID;
  v_staff_id UUID;
  v_slug TEXT;
  v_business_name TEXT;
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  -- Extraer el rol del usuario registrado
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', '');

  -- CRUCIAL: Si el usuario registrado es un cliente final (role = 'client'),
  -- OMITIR totalmente la creación de Tenant, Profile de dueño y Staff.
  -- Los clientes pertenecen únicamente a public.clients.
  IF v_role = 'client' THEN
    RETURN NEW;
  END IF;

  -- Si el usuario ya tiene un perfil en profiles, omitir
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Extraer metadatos pasados en signUp para registros de administradores / dueños de negocio
  v_business_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'business_name', ''), 'Mi Negocio');
  v_slug := COALESCE(NULLIF(NEW.raw_user_meta_data->>'slug', ''), 'negocio-' || substr(NEW.id::text, 1, 8));
  v_full_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), SPLIT_PART(NEW.email, '@', 1));
  v_phone := NEW.raw_user_meta_data->>'phone';

  -- Limpiar y formatear slug
  v_slug := LOWER(TRIM(v_slug));
  v_slug := REGEXP_REPLACE(v_slug, '[^a-z0-9-]', '-', 'g');
  v_slug := REGEXP_REPLACE(v_slug, '-+', '-', 'g');
  v_slug := TRIM(BOTH '-' FROM v_slug);

  -- Si el slug ya existe, agregar sufijo aleatorio
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || FLOOR(RANDOM() * 1000)::text;
  END IF;

  -- A) Insertar Tenant
  INSERT INTO public.tenants (name, slug, email, phone, is_active)
  VALUES (v_business_name, v_slug, NEW.email, v_phone, true)
  RETURNING id INTO v_tenant_id;

  -- B) Insertar Profile vinculado al usuario y al tenant como 'owner'
  INSERT INTO public.profiles (id, tenant_id, full_name, role)
  VALUES (NEW.id, v_tenant_id, v_full_name, 'owner');

  -- C) Insertar Staff inicial (Propietario del negocio)
  INSERT INTO public.staff (tenant_id, profile_id, name, email, phone, color, is_active)
  VALUES (v_tenant_id, NEW.id, v_full_name, NEW.email, v_phone, '#4f46e5', true)
  RETURNING id INTO v_staff_id;

  -- D) Insertar Horarios Semanales por Defecto
  INSERT INTO public.working_hours (tenant_id, staff_id, day_of_week, start_time, end_time, break_start, break_end, is_day_off)
  VALUES
    (v_tenant_id, v_staff_id, 1, '09:00:00', '18:00:00', '13:00:00', '14:00:00', false),
    (v_tenant_id, v_staff_id, 2, '09:00:00', '18:00:00', '13:00:00', '14:00:00', false),
    (v_tenant_id, v_staff_id, 3, '09:00:00', '18:00:00', '13:00:00', '14:00:00', false),
    (v_tenant_id, v_staff_id, 4, '09:00:00', '18:00:00', '13:00:00', '14:00:00', false),
    (v_tenant_id, v_staff_id, 5, '09:00:00', '18:00:00', '13:00:00', '14:00:00', false),
    (v_tenant_id, v_staff_id, 6, '09:00:00', '18:00:00', '13:00:00', '14:00:00', false),
    (v_tenant_id, v_staff_id, 0, '09:00:00', '18:00:00', NULL, NULL, true);

  -- E) Insertar Configuraciones Iniciales de Apariencia
  INSERT INTO public.tenant_settings (tenant_id) VALUES (v_tenant_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.tenant_theme (tenant_id) VALUES (v_tenant_id) ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error en handle_new_user_tenant: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Limpieza preventiva de staff creados erróneamente por el trigger para usuarios con role = 'client'
DELETE FROM public.staff
WHERE profile_id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.raw_user_meta_data->>'role' = 'client'
);

-- Limpiar también perfiles creados por error para clientes finales
DELETE FROM public.profiles
WHERE id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.raw_user_meta_data->>'role' = 'client'
);
