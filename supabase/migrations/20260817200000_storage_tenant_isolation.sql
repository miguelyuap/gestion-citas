-- ====================================================================
-- OmniCitas - Migration para Aislamiento de Storage Multi-Tenant
-- Migration: 20260817200000_storage_tenant_isolation.sql
-- ====================================================================

-- 1. Eliminar políticas inseguras anteriores de storage si existen
DROP POLICY IF EXISTS "Public Access for tenant assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant Admin upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant Admin manage assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant assets public select" ON storage.objects;
DROP POLICY IF EXISTS "Tenant assets insert own tenant" ON storage.objects;
DROP POLICY IF EXISTS "Tenant assets update own tenant" ON storage.objects;
DROP POLICY IF EXISTS "Tenant assets delete own tenant" ON storage.objects;

-- 2. Asegurar que el bucket exista y sea público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Política de LECTURA PÚBLICA (para que el sitio público pueda mostrar logos, galería y avatares)
CREATE POLICY "Tenant assets public select" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-assets');

-- 4. Política de INSERCIÓN aislada por Tenant (el primer segmento de carpeta debe ser el tenant_id del usuario)
CREATE POLICY "Tenant assets insert own tenant" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tenant-assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1]::uuid = public.get_current_tenant_id()
  );

-- 5. Política de ACTUALIZACIÓN aislada por Tenant
CREATE POLICY "Tenant assets update own tenant" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tenant-assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1]::uuid = public.get_current_tenant_id()
  ) WITH CHECK (
    bucket_id = 'tenant-assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1]::uuid = public.get_current_tenant_id()
  );

-- 6. Política de ELIMINACIÓN aislada por Tenant
CREATE POLICY "Tenant assets delete own tenant" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'tenant-assets' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1]::uuid = public.get_current_tenant_id()
  );
